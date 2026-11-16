
from urllib.parse import urlparse
import re
import ipaddress


def analyze_url_risk(url, prediction):
    """
    Explainable URL risk analysis.
    ML prediction and heuristic indicators are combined,
    but the resulting score is not a probability of phishing.
    """

    parsed = urlparse(url)
    hostname = (parsed.hostname or "").lower()

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

    # 1. HTTP connection
    if parsed.scheme.lower() == "http":
        add_indicator(
            "Unencrypted HTTP connection",
            "LOW",
            10,
            "The URL uses HTTP instead of HTTPS."
        )

    # 2. Suspicious keywords
    suspicious_keywords = [
        "login", "verify", "account", "password",
        "secure", "banking", "update", "signin",
        "confirm", "wallet"
    ]

    found_keywords = [
        word for word in suspicious_keywords
        if word in url.lower()
    ]

    if found_keywords:
        add_indicator(
            "Suspicious URL keywords",
            "MEDIUM",
            15,
            "Potentially sensitive keywords found: "
            + ", ".join(found_keywords)
        )

    # 3. Unusually long URL
    if len(url) > 100:
        add_indicator(
            "Unusually long URL",
            "MEDIUM",
            10,
            "The URL contains more than 100 characters."
        )

    # 4. Multiple subdomains
    try:
        ipaddress.ip_address(hostname)
        is_ip = True
    except ValueError:
        is_ip = False

    if not is_ip and hostname.count(".") >= 4:
        add_indicator(
            "Multiple subdomains",
            "MEDIUM",
            15,
            "The hostname contains several subdomain levels."
        )

    # 5. IP address as hostname
    if is_ip:
        add_indicator(
            "IP address used as hostname",
            "HIGH",
            25,
            "The URL uses an IP address instead of a domain name."
        )

    # 6. URL shortener
    shorteners = {
        "bit.ly", "tinyurl.com", "t.co",
        "is.gd", "cutt.ly", "shorturl.at"
    }

    if hostname in shorteners:
        add_indicator(
            "URL shortener detected",
            "MEDIUM",
            15,
            "The destination is hidden behind a URL shortening service."
        )

    # 7. @ symbol in URL
    if "@" in url:
        add_indicator(
            "At-sign in URL",
            "HIGH",
            20,
            "The URL contains an @ symbol, which can make the actual hostname confusing."
        )

    # 8. Punycode domain
    if any(label.startswith("xn--") for label in hostname.split(".")):
        add_indicator(
            "Punycode domain detected",
            "MEDIUM",
            20,
            "The hostname contains an encoded internationalized domain label."
        )

    # 9. Unusual port
    try:
        port = parsed.port
    except ValueError:
        port = None

    if port is not None and port not in (80, 443):
        add_indicator(
            "Unusual port number",
            "MEDIUM",
            15,
            f"The URL uses port {port} instead of the common HTTP/HTTPS ports."
        )

    # 10. Excessive hyphens
    if hostname.count("-") >= 3:
        add_indicator(
            "Excessive hyphens in hostname",
            "LOW",
            10,
            "The hostname contains three or more hyphens."
        )

    # 11. ML prediction
    if prediction == "PHISHING":
        add_indicator(
            "ML model flagged the URL",
            "HIGH",
            40,
            "The trained URL detection model classified this URL as potentially phishing."
        )

    # Cap score at 100
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

    # Recommendations
    recommendations = {
        "CRITICAL": (
            "Avoid visiting this URL or entering personal information. "
            "Verify the website through its official source."
        ),
        "HIGH": (
            "Exercise extreme caution. Avoid entering passwords "
            "or financial information."
        ),
        "MEDIUM": (
            "Review the website address carefully before interacting with it."
        ),
        "LOW": (
            "No major risk indicators were detected by this analysis. "
            "Still verify the website before trusting it."
        )
    }

    return {
    "risk_score": score,
    "risk_level": risk_level,
    "indicator_count": len(indicators),
    "risk_summary": (
        f"{risk_level} risk detected with "
        f"{len(indicators)} indicators."
    ),
    "model_prediction": prediction,
    "indicators": indicators,
    "recommendation": recommendations[risk_level]
}




if __name__ == "__main__":

    test_urls = [
        "http://secure-bank-login-example.com",
        "https://bit.ly/example",
        "http://192.168.1.10/login",
        "https://example.com:8080/account",
        "https://xn--pple-43d.com"
    ]

    for url in test_urls:

        result = analyze_url_risk(
            url,
            prediction="BENIGN"
        )

        print("\n" + "=" * 55)
        print("URL:", url)
        print("Risk Score:", result["risk_score"])
        print("Risk Level:", result["risk_level"])
        print("Indicator Count:", result["indicator_count"])
        print("Risk Summary:", result["risk_summary"])
        print("ML Prediction:", result["model_prediction"])

        print("\nIndicators:")

        if not result["indicators"]:
            print("No indicators detected.")
        else:
            for item in result["indicators"]:
                print(
                    f"- {item['name']} "
                    f"({item['severity']}, +{item['points']})"
                )

        print("\nRecommendation:")
        print(result["recommendation"])
