
import { useState } from "react";
import {
  Globe,
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

function URLScanner() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleScan = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("Please enter a website URL.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/scan-url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: url.trim() })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to analyze this URL."
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
    setUrl("");
    setResult(null);
    setError("");
  };

  const risk = result?.risk_analysis;

  const riskClass = risk?.risk_level?.toLowerCase() || "low";

  return (
    <div className="url-scanner-page">
      <div className="url-scanner-container">

        <div className="scanner-back">
          <a href="/#scanners">← Back to Scanners</a>
        </div>

        <div className="url-heading">
          <div className="url-heading-icon">
            <Globe size={30} />
          </div>

          <span className="eyebrow">
            WEBSITE SECURITY ANALYSIS
          </span>

          <h1>
            URL <span className="gradient-text">Scanner</span>
          </h1>

          <p>
            Analyze website URLs using machine learning
            and intelligent risk assessment.
          </p>
        </div>

        <div className="url-scan-card">
          <div className="url-card-title">
            <ShieldCheck size={22} />
            <h2>Analyze a Website</h2>
          </div>

          <p className="url-card-description">
            Enter the website address you want PhishGuard to analyze.
          </p>

          <form onSubmit={handleScan}>
            <label htmlFor="website-url">Website URL</label>

            <div className="url-input-wrapper">
              <Globe size={20} />

              <input
                id="website-url"
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="url-scan-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle className="spin" size={19} />
                  Analyzing URL...
                </>
              ) : (
                <>
                  <Search size={19} />
                  Scan Website
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="url-error">
              <AlertCircle size={19} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {result && (
          <div className={`url-result-card ${
            result.prediction === "PHISHING"
              ? "danger"
              : "safe"
          }`}>

            {/* ML CLASSIFICATION */}

            <div className="url-result-heading">
              {result.prediction === "PHISHING" ? (
                <ShieldAlert size={30} />
              ) : (
                <ShieldCheck size={30} />
              )}

              <div>
                <span>ML SCAN COMPLETED</span>

                <h2>
                  {result.prediction === "PHISHING"
                    ? "Potential Phishing Detected"
                    : "URL Classified as Benign"}
                </h2>
              </div>
            </div>

            <div className="url-result-details">
              <div>
                <span>Analyzed URL</span>
                <strong>{result.input}</strong>
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
              <div className="confidence-section">
                <div className="confidence-label">
                  <span>Model confidence</span>
                  <strong>{result.confidence}%</strong>
                </div>

                <div className="confidence-track">
                  <div
                    className="confidence-fill"
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

            <p className="url-result-message">
              {result.prediction === "PHISHING"
                ? "Caution: This URL was classified as potentially phishing. Avoid entering personal or financial information."
                : "This URL was classified as benign by the machine learning model. Always verify the website before sharing sensitive information."}
            </p>

            <div className="url-result-note">
              <AlertCircle size={17} />
              Model confidence is not a guarantee of website safety.
            </div>

            {/* INTELLIGENT RISK ANALYSIS */}

            {risk && (
              <div className={`risk-analysis-section risk-${riskClass}`}>

                <div className="risk-section-heading">
                  <div className="risk-heading-icon">
                    <Activity size={23} />
                  </div>

                  <div>
                    <span>INTELLIGENT SECURITY ENGINE</span>
                    <h2>URL Risk Analysis</h2>
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

                {/* DETECTED INDICATORS */}

                <div className="risk-indicators-section">
                  <h3>
                    <AlertTriangle size={19} />
                    Detected Security Indicators
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
                  Risk score is a rule-based assessment, not a
                  probability of phishing. Indicators may also
                  occur on legitimate websites. Always verify
                  websites independently.
                </div>

              </div>
            )}

            <button
              className="url-reset-button"
              onClick={handleReset}
            >
              <RotateCcw size={17} />
              Scan Another URL
            </button>

          </div>
        )}

        <div className="url-tips">
          <h3>
            <CheckCircle2 size={19} />
            Stay Safe Online
          </h3>

          <ul>
            <li>Check website addresses carefully before opening links.</li>
            <li>Be cautious of links asking for passwords or banking details.</li>
            <li>Never rely on an automated prediction as a safety guarantee.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default URLScanner;
