
import re
from urllib.parse import urlparse


def analyze_email_risk(email_text, prediction):

    text = email_text.lower()
    indicators = []
    score = 0

    def add_indicator(name, severity, points, description):
        nonlocal score

        indicators.append({
            "name": name,
            "severity": severity,
            "points": points,
            "description": description
        })

        score += points

    # 1. Urgency and pressure language
    urgency_keywords = [
        "act immediately",
        "urgent",
        "immediately",
        "account suspended",
        "account blocked",
        "verify now",
        "limited time",
        "within 24 hours",
        "action required",
        "final warning"
    ]

    found_urgency = [
        word for word in urgency_keywords if word in text
    ]

    if found_urgency:
        add_indicator(
            "Urgency and pressure language",
            "MEDIUM",
            15,
            "Pressure-related phrases detected: "
            + ", ".join(found_urgency)
        )

    # 2. Credential requests
    credential_keywords = [
        "password",
        "otp",
        "one-time password",
        "login credentials",
        "verify your identity",
        "account credentials",
        "pin number",
        "security code"
    ]

    found_credentials = [
        word for word in credential_keywords if word in text
    ]

    if found_credentials:
        add_indicator(
            "Sensitive credential requests",
            "HIGH",
            20,
            "The email contains references to sensitive credentials: "
            + ", ".join(found_credentials)
        )

    # 3. Financial requests
    financial_keywords = [
        "bank account",
        "credit card",
        "debit card",
        "payment required",
        "transfer money",
        "billing information",
        "financial details",
        "refund processing"
    ]

    found_financial = [
        word for word in financial_keywords if word in text
    ]

    if found_financial:
        add_indicator(
            "Financial information requests",
            "HIGH",
            20,
            "Financial-related phrases detected: "
            + ", ".join(found_financial)
        )

    # 4. Extract URLs
    urls = re.findall(
        r'https?://[^\s<>"\']+',
        email_text,
        re.IGNORECASE
    )

    # 5. Suspicious links
    if urls:
        suspicious_urls = []

        for url in urls:
            hostname = (urlparse(url).hostname or "").lower()

            if (
                "@" in url
                or hostname.startswith("xn--")
                or hostname.count(".") >= 4
            ):
                suspicious_urls.append(url)

        if suspicious_urls:
            add_indicator(
                "Suspicious URL structure",
                "HIGH",
                20,
                f"{len(suspicious_urls)} link(s) contain unusual URL characteristics."
            )

    # 6. URL shorteners
    shorteners = {
        "bit.ly",
        "tinyurl.com",
        "t.co",
        "is.gd",
        "cutt.ly",
        "shorturl.at"
    }

    shortened_urls = []

    for url in urls:
        hostname = (urlparse(url).hostname or "").lower()

        if hostname in shorteners:
            shortened_urls.append(url)

    if shortened_urls:
        add_indicator(
            "Shortened URLs detected",
            "MEDIUM",
            10,
            f"{len(shortened_urls)} shortened link(s) detected. "
            "Their final destinations are not verified."
        )

    # 7. ML model prediction
    if prediction == "PHISHING":
        add_indicator(
            "ML model flagged the email",
            "HIGH",
            40,
            "The trained email detection model classified "
            "this message as potentially phishing."
        )

    # Cap score
    score = min(score, 100)

    # Risk classification
    if score >= 75:
        risk_level = "CRITICAL"
    elif score >= 50:
        risk_level = "HIGH"
    elif score >= 25:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    recommendations = {
        "CRITICAL": (
            "This email shows multiple warning signs. "
            "Do not click its links, share sensitive information "
            "or make payments. Verify through an official channel."
        ),
        "HIGH": (
            "Exercise extreme caution. Do not share passwords, "
            "OTPs or financial information through this email."
        ),
        "MEDIUM": (
            "Review the message and its links carefully. "
            "Verify important requests independently."
        ),
        "LOW": (
            "No major risk indicators were detected by this analysis. "
            "Still verify the sender and links before trusting the email."
        )
    }

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "indicator_count": len(indicators),
        "risk_summary": (
            f"{risk_level} risk detected with "
            f"{len(indicators)} "
            f"{'indicator' if len(indicators) == 1 else 'indicators'}."
        ),
        "model_prediction": prediction,
        "indicators": indicators,
        "recommendation": recommendations[risk_level]
    }


# Standalone testing
if __name__ == "__main__":

    sample_email = """
    Subject: Urgent Account Verification

    Your bank account has been suspended.
    Act immediately to restore access.

    Verify your password and OTP within 24 hours.
    Visit http://bit.ly/example to continue.
    """

    result = analyze_email_risk(
        sample_email,
        prediction="PHISHING"
    )

    print("\nPHISHGUARD EMAIL RISK ANALYSIS")
    print("=" * 50)

    print("Risk Score:", result["risk_score"])
    print("Risk Level:", result["risk_level"])
    print("Indicator Count:", result["indicator_count"])
    print("Risk Summary:", result["risk_summary"])
    print("ML Prediction:", result["model_prediction"])

    print("\nDetected Indicators:")

    for item in result["indicators"]:
        print(
            f"- {item['name']} "
            f"({item['severity']}, +{item['points']})"
        )
        print("  ", item["description"])

    print("\nRecommendation:")
    print(result["recommendation"])
