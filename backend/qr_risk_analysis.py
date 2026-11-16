
def analyze_qr_text_risk(content):

    text = content.lower()
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
        "limited time",
        "account suspended",
        "verify now",
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
            25,
            "Sensitive credential references detected: "
            + ", ".join(found_credentials)
        )

    # 3. Financial requests
    financial_keywords = [
        "bank account",
        "credit card",
        "debit card",
        "payment required",
        "transfer money",
        "send money",
        "upi payment",
        "financial details"
    ]

    found_financial = [
        word for word in financial_keywords if word in text
    ]

    if found_financial:
        add_indicator(
            "Financial information requests",
            "HIGH",
            25,
            "Financial-related phrases detected: "
            + ", ".join(found_financial)
        )

    # 4. Suspicious payment instructions
    payment_phrases = [
        "scan and pay",
        "pay now",
        "claim your reward",
        "claim your prize",
        "free gift"
    ]

    found_payment = [
        phrase for phrase in payment_phrases if phrase in text
    ]

    if found_payment:
        add_indicator(
            "Suspicious payment or reward instructions",
            "MEDIUM",
            15,
            "Potentially suspicious instructions detected: "
            + ", ".join(found_payment)
        )

    score = min(score, 100)

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
            "This QR content contains multiple warning signs. "
            "Do not share credentials or make payments. "
            "Verify the request through an official channel."
        ),
        "HIGH": (
            "Exercise caution. Avoid sharing passwords, OTPs "
            "or financial information."
        ),
        "MEDIUM": (
            "Review this QR content carefully before following "
            "its instructions."
        ),
        "LOW": (
            "No major risk indicators were detected. "
            "Still verify the content before trusting it."
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
        "model_prediction": "NOT_CLASSIFIED",
        "indicators": indicators,
        "recommendation": recommendations[risk_level]
    }
