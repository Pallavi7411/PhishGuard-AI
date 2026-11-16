
import { useState } from "react";
import {
  Mail,
  ShieldCheck,
  ShieldAlert,
  Search,
  LoaderCircle,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Lightbulb
} from "lucide-react";

function EmailScanner() {
  const [subject, setSubject] = useState("");
  const [emailText, setEmailText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleScan = async (e) => {
    e.preventDefault();

    if (!subject.trim() && !emailText.trim()) {
      setError("Please enter an email subject or message.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const combinedEmail = [
      subject.trim() ? `Subject: ${subject.trim()}` : "",
      emailText.trim()
    ].filter(Boolean).join("\n\n");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/scan-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email_text: combinedEmail
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to analyze this email."
        );
      }

      setResult(data);

    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to PhishGuard server. Please make sure the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubject("");
    setEmailText("");
    setResult(null);
    setError("");
  };

  const risk = result?.risk_analysis;
  const riskClass = risk?.risk_level?.toLowerCase() || "low";

  return (
    <div className="email-scanner-page">
      <div className="email-scanner-container">

        <div className="scanner-back">
          <a href="/#scanners">← Back to Scanners</a>
        </div>

        <div className="email-heading">
          <div className="email-heading-icon">
            <Mail size={30} />
          </div>

          <span className="eyebrow">
            EMAIL SECURITY ANALYSIS
          </span>

          <h1>
            Email <span className="gradient-text">Scanner</span>
          </h1>

          <p>
            Analyze suspicious email messages using machine
            learning and intelligent risk assessment.
          </p>
        </div>

        <div className="email-scan-card">
          <div className="email-card-title">
            <ShieldCheck size={22} />
            <h2>Analyze an Email</h2>
          </div>

          <p className="email-card-description">
            Enter the subject and content of the email you want
            PhishGuard to analyze.
          </p>

          <form onSubmit={handleScan}>

            <label htmlFor="email-subject">
              Email Subject
            </label>

            <input
              id="email-subject"
              className="email-subject-input"
              type="text"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
            />

            <label htmlFor="email-content">
              Email Message
            </label>

            <textarea
              id="email-content"
              className="email-content-input"
              placeholder="Paste the email message here..."
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              disabled={loading}
              rows={9}
            />

            <button
              type="submit"
              className="email-scan-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle className="spin" size={19} />
                  Analyzing Email...
                </>
              ) : (
                <>
                  <Search size={19} />
                  Analyze Email
                </>
              )}
            </button>

          </form>

          {error && (
            <div className="email-error">
              <AlertCircle size={19} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {result && (
          <div className={`email-result-card ${
            result.prediction === "PHISHING" ? "danger" : "safe"
          }`}>

            {/* ML CLASSIFICATION */}

            <div className="email-result-heading">
              {result.prediction === "PHISHING" ? (
                <ShieldAlert size={30} />
              ) : (
                <ShieldCheck size={30} />
              )}

              <div>
                <span>ML SCAN COMPLETED</span>
                <h2>
                  {result.prediction === "PHISHING"
                    ? "Potential Phishing Email Detected"
                    : "Email Classified as Legitimate"}
                </h2>
              </div>
            </div>

            <div className="email-result-details">
              <div>
                <span>Email Subject</span>
                <strong>{subject.trim() || "Not provided"}</strong>
              </div>

              <div>
                <span>Detection Result</span>
                <strong>{result.prediction}</strong>
              </div>

              <div>
                <span>Model Confidence</span>
                <strong>
                  {result.confidence !== null
                    ? `${result.confidence}%`
                    : "Not available"}
                </strong>
              </div>
            </div>

            {result.confidence !== null && (
              <div className="email-confidence-section">
                <div className="email-confidence-label">
                  <span>Model confidence</span>
                  <strong>{result.confidence}%</strong>
                </div>

                <div className="email-confidence-track">
                  <div
                    className="email-confidence-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, Number(result.confidence) || 0)
                      )}%`
                    }}
                  />
                </div>
              </div>
            )}

            <p className="email-result-message">
              {result.prediction === "PHISHING"
                ? "Caution: This email was classified as potentially phishing. Avoid clicking suspicious links or sharing passwords and financial information."
                : "This email was classified as legitimate by the machine learning model. Still verify the sender and any links before taking action."}
            </p>

            <div className="email-result-note">
              <AlertCircle size={17} />
              Model confidence is not a guarantee of email safety.
            </div>

            {/* INTELLIGENT EMAIL RISK ANALYSIS */}

            {risk && (
              <div className={`email-risk-section risk-${riskClass}`}>

                <div className="risk-section-heading">
                  <div className="risk-heading-icon">
                    <Activity size={23} />
                  </div>

                  <div>
                    <span>INTELLIGENT SECURITY ENGINE</span>
                    <h2>Email Risk Analysis</h2>
                  </div>
                </div>

                <div className="risk-overview">
                  <div className="risk-score">
                    <span>Risk Score</span>
                    <strong>
                      {risk.risk_score}
                      <small>/100</small>
                    </strong>
                  </div>

                  <div className="risk-level">
                    <span>Risk Classification</span>

                    <strong className={`risk-badge ${riskClass}`}>
                      {risk.risk_level}
                    </strong>

                    <p>{risk.risk_summary}</p>
                  </div>
                </div>

                <div className="risk-progress-section">
                  <div className="risk-progress-label">
                    <span>Overall risk score</span>
                    <strong>{risk.risk_score}/100</strong>
                  </div>

                  <div className="risk-progress-track">
                    <div
                      className="risk-progress-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, Number(risk.risk_score) || 0)
                        )}%`
                      }}
                    />
                  </div>
                </div>

                <div className="risk-stats">
                  <div>
                    <Activity size={19} />
                    <span>Indicators detected</span>
                    <strong>{risk.indicator_count}</strong>
                  </div>

                  <div>
                    <ShieldCheck size={19} />
                    <span>ML prediction</span>
                    <strong>{risk.model_prediction}</strong>
                  </div>
                </div>

                {/* SECURITY INDICATORS */}

                <div className="risk-indicators-section">
                  <h3>
                    <AlertTriangle size={19} />
                    Detected Email Threats
                  </h3>

                  {risk.indicators?.length > 0 ? (
                    <div className="risk-indicator-list">
                      {risk.indicators.map((indicator, index) => (
                        <div
                          className="risk-indicator-item"
                          key={`${indicator.name}-${index}`}
                        >
                          <div className="indicator-top">
                            <strong>{indicator.name}</strong>

                            <span className={`indicator-severity ${
                              indicator.severity.toLowerCase()
                            }`}>
                              {indicator.severity}
                            </span>
                          </div>

                          <p>{indicator.description}</p>

                          <span className="indicator-points">
                            +{indicator.points} risk points
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No risk indicators were detected.</p>
                  )}
                </div>

                {/* RECOMMENDATION */}

                <div className="risk-recommendation">
                  <h3>
                    <Lightbulb size={20} />
                    Security Recommendation
                  </h3>

                  <p>{risk.recommendation}</p>
                </div>

                <div className="risk-disclaimer">
                  This score is a rule-based assessment, not a
                  probability of phishing. Legitimate emails may
                  also contain some of these indicators. Verify
                  important messages independently.
                </div>

              </div>
            )}

            <button
              className="email-reset-button"
              onClick={handleReset}
            >
              <RotateCcw size={17} />
              Analyze Another Email
            </button>

          </div>
        )}

        <div className="email-tips">
          <h3>
            <CheckCircle2 size={19} />
            Email Safety Tips
          </h3>

          <ul>
            <li>Verify the sender's email address.</li>
            <li>Be careful with urgent requests for passwords or payments.</li>
            <li>Avoid opening unexpected attachments and suspicious links.</li>
            <li>Never share sensitive information through unverified emails.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default EmailScanner;
