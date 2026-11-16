
import os
from urllib.parse import urlparse

import sqlite3
from datetime import datetime, timezone

import cv2
import joblib
import numpy as np
import pandas as pd

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from risk_analysis import analyze_url_risk

from email_risk_analysis import analyze_email_risk



from qr_risk_analysis import analyze_qr_text_risk

# --------------------------------------------------
# 1. INITIALIZE FASTAPI
# --------------------------------------------------

app = FastAPI(
    title="PhishGuard API",
    description="AI-powered multi-channel phishing detection",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)


# --------------------------------------------------
# 2. LOAD TRAINED MODELS
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")



# --------------------------------------------------
# SCAN HISTORY DATABASE
# --------------------------------------------------

DB_PATH = os.path.join(BASE_DIR, "scan_history.db")


def initialize_database():
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS scan_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scan_type TEXT NOT NULL,
                content TEXT NOT NULL,
                prediction TEXT NOT NULL,
                confidence REAL,
                timestamp TEXT NOT NULL
            )
        """)



def save_scan(scan_type, content, prediction, confidence):
    timestamp = datetime.now(timezone.utc).isoformat()

    with sqlite3.connect(DB_PATH) as connection:
        cursor = connection.execute("""
            INSERT INTO scan_history
            (scan_type, content, prediction, confidence, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (
            scan_type,
            content,
            prediction,
            confidence,
            timestamp
        ))

        return cursor.lastrowid


# Create the database table when the backend starts.
initialize_database()


try:
    url_model = joblib.load(os.path.join(MODEL_DIR, "url_model.pkl"))
    email_model = joblib.load(os.path.join(MODEL_DIR, "email_model.pkl"))
    email_tfidf = joblib.load(os.path.join(MODEL_DIR, "email_tfidf.pkl"))

    print("All PhishGuard models loaded successfully.")

except Exception as exc:
    raise RuntimeError(f"Could not load trained models: {exc}") from exc


# --------------------------------------------------
# 3. REQUEST SCHEMAS
# --------------------------------------------------

class URLRequest(BaseModel):
    url: str


class EmailRequest(BaseModel):
    email_text: str


# --------------------------------------------------
# 4. CONFIDENCE CALCULATION
# --------------------------------------------------

def get_confidence(model, features, prediction):
    if not hasattr(model, "predict_proba"):
        return None

    try:
        probabilities = model.predict_proba(features)[0]
        classes = list(model.classes_)
        index = classes.index(prediction)

        return round(float(probabilities[index]) * 100, 2)

    except (ValueError, IndexError, AttributeError):
        return None


# --------------------------------------------------
# 5. URL CLASSIFICATION
# --------------------------------------------------

def extract_url_features(url):
    features = {
        "url_length": len(url),
        "dot_count": url.count("."),
        "hyphen_count": url.count("-"),
        "slash_count": url.count("/"),
        "https": 1 if url.startswith("https") else 0,
        "digit_count": sum(char.isdigit() for char in url)
    }

    return pd.DataFrame([features])


def classify_url(url):
    url = url.strip()

    if not url:
        raise ValueError("URL cannot be empty.")

    if any(char.isspace() for char in url):
        raise ValueError("URL cannot contain spaces.")

    if "://" not in url:
        url = "https://" + url

    try:
        parsed = urlparse(url)
        hostname = parsed.hostname
        _ = parsed.port
    except ValueError:
        raise ValueError("Invalid URL format.")

    if parsed.scheme.lower() not in ("http", "https"):
        raise ValueError("Only HTTP and HTTPS URLs are supported.")

    if not hostname or "." not in hostname:
        raise ValueError("Please enter a valid website address.")

    features = extract_url_features(url)
    prediction = url_model.predict(features)[0]

    label = "PHISHING" if int(prediction) == 1 else "BENIGN"

    return {
        "type": "URL",
        "input": url,
        "prediction": label,
        "confidence": get_confidence(url_model, features, prediction),
        "message": (
            "This URL has been classified as potentially phishing."
            if label == "PHISHING"
            else "This URL has been classified as benign by the model."
        )
    }


# --------------------------------------------------
# 6. EMAIL CLASSIFICATION
# --------------------------------------------------

def classify_email(email_text):
    if not email_text or not email_text.strip():
        raise ValueError("Email content cannot be empty.")

    features = email_tfidf.transform([email_text])
    prediction = email_model.predict(features)[0]

    label = "PHISHING" if int(prediction) == 1 else "LEGITIMATE"

    return {
        "type": "EMAIL",
        "prediction": label,
        "confidence": get_confidence(email_model, features, prediction),
        "message": (
            "This email has been classified as potentially phishing."
            if label == "PHISHING"
            else "This email has been classified as legitimate by the model."
        )
    }


# --------------------------------------------------
# 7. BASIC API ROUTES
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Welcome to PhishGuard API",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "models_loaded": True
    }


# --------------------------------------------------
# 8. URL SCANNING API
# --------------------------------------------------


@app.post("/api/scan-url")
async def scan_url(request: URLRequest):

    try:
        url = request.url

        result = classify_url(url)

        risk_analysis = analyze_url_risk(
            result["input"],
            result["prediction"]
        )

        result["risk_analysis"] = risk_analysis

        scan_id = save_scan(
            "URL",
            result["input"],
            result["prediction"],
            result["confidence"]
        )

        result["scan_id"] = scan_id

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --------------------------------------------------
# 9. EMAIL SCANNING API
# --------------------------------------------------



@app.post("/api/scan-email")
def scan_email(request: EmailRequest):
    try:
        result = classify_email(request.email_text)

        # Perform additional email risk analysis
        risk_analysis = analyze_email_risk(
            request.email_text,
            result["prediction"]
        )

        # Attach risk analysis to the ML result
        result["risk_analysis"] = risk_analysis

        # Save scan to existing SQLite history
        result["scan_id"] = save_scan(
            result["type"],
            request.email_text,
            result["prediction"],
            result["confidence"]
        )

        return result

    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))




# --------------------------------------------------
# 10. QR CODE SCANNING API
# --------------------------------------------------


# --------------------------------------------------
# 10. QR CODE SCANNING API
# --------------------------------------------------


@app.post("/api/scan-qr")
async def scan_qr(file: UploadFile = File(...)):

    allowed_types = {"image/png", "image/jpeg", "image/bmp"}

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Upload a PNG, JPEG, or BMP image."
        )

    contents = await file.read(5 * 1024 * 1024 + 1)

    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Image must be 5 MB or smaller."
        )

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Empty image."
        )

    image_array = np.frombuffer(contents, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file."
        )

    detector = cv2.QRCodeDetector()
    decoded_text, points, _ = detector.detectAndDecode(image)

    if not decoded_text:
        raise HTTPException(
            status_code=400,
            detail="No readable QR code found."
        )

    # SCENARIO 1: QR contains a URL
    if decoded_text.lower().startswith(("http://", "https://")):

        try:
            result = classify_url(decoded_text)

            result["type"] = "QR_URL"
            result["decoded_content"] = decoded_text

            # Reuse existing URL risk analyzer
            result["risk_analysis"] = analyze_url_risk(
                result["input"],
                result["prediction"]
            )

            result["scan_id"] = save_scan(
                result["type"],
                decoded_text,
                result["prediction"],
                result["confidence"]
            )

            return result

        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail=str(exc)
            )

    # SCENARIO 2: QR contains plain text
    result = {
        "type": "QR_NON_URL",
        "decoded_content": decoded_text,
        "prediction": "NOT_CLASSIFIED",
        "confidence": None,
        "message": (
            "QR content decoded successfully. "
            "It was not classified by the URL ML model."
        )
    }

    # Analyze the decoded text separately
    result["risk_analysis"] = analyze_qr_text_risk(
        decoded_text
    )

    result["scan_id"] = save_scan(
        result["type"],
        decoded_text,
        result["prediction"],
        result["confidence"]
    )

    return result



# --------------------------------------------------
# 11. SCAN HISTORY API
# --------------------------------------------------

@app.get("/api/history")
def get_scan_history():



    with sqlite3.connect(DB_PATH) as connection:
        connection.row_factory = sqlite3.Row

        rows = connection.execute("""
            SELECT
                id,
                scan_type,
                content,
                prediction,
                confidence,
                timestamp
            FROM scan_history
            ORDER BY id DESC
        """).fetchall()

    return {
        "total_scans": len(rows),
        "history": [dict(row) for row in rows]
    }



# --------------------------------------------------
# 12. CLEAR SCAN HISTORY API
# --------------------------------------------------

@app.delete("/api/history")
def clear_scan_history():

    with sqlite3.connect(DB_PATH) as connection:
        connection.execute("DELETE FROM scan_history")
        connection.execute(
            "DELETE FROM sqlite_sequence WHERE name = 'scan_history'"
        )

    return {
        "message": "Scan history cleared successfully.",
        "total_deleted": "all"
    }



# --------------------------------------------------
# 13. DASHBOARD STATISTICS API
# --------------------------------------------------

@app.get("/api/dashboard/stats")
def get_dashboard_stats():

    with sqlite3.connect(DB_PATH) as connection:
        connection.row_factory = sqlite3.Row

        # Overall scan statistics
        stats = connection.execute("""
            SELECT
                COUNT(*) AS total_scans,

                SUM(CASE
                    WHEN prediction = 'PHISHING' THEN 1
                    ELSE 0
                END) AS phishing_detected,

                SUM(CASE
                    WHEN prediction IN ('BENIGN', 'LEGITIMATE') THEN 1
                    ELSE 0
                END) AS safe_scans,

                SUM(CASE
                    WHEN prediction = 'NOT_CLASSIFIED' THEN 1
                    ELSE 0
                END) AS unclassified_scans

            FROM scan_history
        """).fetchone()

        # Scan type distribution
        scan_distribution = connection.execute("""
            SELECT scan_type, COUNT(*) AS count
            FROM scan_history
            GROUP BY scan_type
            ORDER BY count DESC
        """).fetchall()

        # Prediction distribution
        prediction_distribution = connection.execute("""
            SELECT prediction, COUNT(*) AS count
            FROM scan_history
            GROUP BY prediction
            ORDER BY count DESC
        """).fetchall()

        # Latest five scans
        recent_scans = connection.execute("""
            SELECT
                id,
                scan_type,
                content,
                prediction,
                confidence,
                timestamp
            FROM scan_history
            ORDER BY id DESC
            LIMIT 5
        """).fetchall()

    return {
        "total_scans": stats["total_scans"] or 0,
        "phishing_detected": stats["phishing_detected"] or 0,
        "safe_scans": stats["safe_scans"] or 0,
        "unclassified_scans": stats["unclassified_scans"] or 0,

        "scan_distribution": [
            dict(row) for row in scan_distribution
        ],

        "prediction_distribution": [
            dict(row) for row in prediction_distribution
        ],

        "recent_scans": [
            dict(row) for row in recent_scans
        ]
    }
