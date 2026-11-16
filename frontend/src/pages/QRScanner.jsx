
import { useState } from "react";
import {
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Search,
  LoaderCircle,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  Activity,
  Lightbulb
} from "lucide-react";

function QRScanner() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    setError("");
    setResult(null);

    if (!selectedFile) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/bmp"
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFile(null);
      setPreview("");
      setError("Please upload a PNG, JPG, JPEG, or BMP image.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null);
      setPreview("");
      setError("Image size must not exceed 5 MB.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleScan = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a QR code image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:8000/api/scan-qr",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to analyze this QR code."
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
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    setResult(null);
    setError("");

    const input = document.getElementById("qr-file");
    if (input) input.value = "";
  };

  const isPhishing = result?.prediction === "PHISHING";
  const hasPrediction = Boolean(
    result?.prediction &&
    result.prediction !== "NOT_CLASSIFIED"
  );

  const risk = result?.risk_analysis;
  const riskClass = risk?.risk_level?.toLowerCase() || "low";

  const isNonUrl = result?.type === "QR_NON_URL";

  return (
    <div className="qr-scanner-page">
      <div className="qr-scanner-container">

        <div className="scanner-back">
          <a href="/#scanners">← Back to Scanners</a>
        </div>

        <div className="qr-heading">
          <div className="qr-heading-icon">
            <QrCode size={30} />
          </div>

          <span className="eyebrow">
            QR CODE SECURITY ANALYSIS
          </span>

          <h1>
            QR Code <span className="gradient-text">Scanner</span>
          </h1>

          <p>
            Upload a QR code image to decode its contents and
            analyze embedded website links or suspicious text.
          </p>
        </div>

        <div className="qr-scan-card">

          <div className="qr-card-title">
            <ShieldCheck size={22} />
            <h2>Analyze a QR Code</h2>
          </div>

          <p className="qr-card-description">
            Select a QR code image from your device.
            PhishGuard will decode and inspect its contents.
          </p>

          <form onSubmit={handleScan}>

            <label htmlFor="qr-file">
              Upload QR Code Image
            </label>

            <div className="qr-upload-area">
              <input
                id="qr-file"
                type="file"
                accept="image/png,image/jpeg,image/bmp"
                onChange={handleFileChange}
                disabled={loading}
              />

              <label
                htmlFor="qr-file"
                className="qr-upload-label"
              >
                <Upload size={28} />
                <strong>Choose QR Code Image</strong>
                <span>PNG, JPG, JPEG or BMP · Maximum 5 MB</span>
              </label>
            </div>

            {preview && (
              <div className="qr-preview">
                <span>Selected Image</span>
                <img src={preview} alt="Selected QR code" />
                <strong>{file?.name}</strong>
              </div>
            )}

            <button
              type="submit"
              className="qr-scan-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle className="spin" size={19} />
                  Analyzing QR Code...
                </>
              ) : (
                <>
                  <Search size={19} />
                  Scan QR Code
                </>
              )}
            </button>

          </form>

          {error && (
            <div className="qr-error">
              <AlertCircle size={19} />
              <span>{error}</span>
            </div>
          )}

        </div>

        {result && (
          <div className={`qr-result-card ${
            isPhishing ? "danger" : hasPrediction ? "safe" : "neutral"
          }`}>

            <div className="qr-result-heading">

              {isPhishing ? (
                <ShieldAlert size={30} />
              ) : (
                <ShieldCheck size={30} />
              )}

              <div>
                <span>SCAN COMPLETED</span>
                <h2>
                  {isNonUrl
                    ? "QR Content Analyzed"
                    : isPhishing
                    ? "Potential Phishing Detected"
                    : "QR URL Classified as Benign"}
                </h2>
              </div>

            </div>

            {/* DECODED QR INFORMATION */}

            <div className="qr-result-details">

              <div>
                <span>QR Code Type</span>
                <strong>{result.type}</strong>
              </div>

              <div>
                <span>Decoded Content</span>
                <strong className="qr-decoded-content">
                  {result.decoded_content || result.input || "Not available"}
                </strong>
              </div>

              <div>
                <span>Detection Result</span>
                <strong>{result.prediction}</strong>
              </div>

              <div>
                <span>Model Confidence</span>
                <strong>
                  {result.confidence !== null &&
                  result.confidence !== undefined
                    ? `${result.confidence}%`
                    : "Not available"}
                </strong>
              </div>

            </div>

            {hasPrediction &&
              result.confidence !== null &&
              result.confidence !== undefined && (
                <div className="qr-confidence-section">
                  <div className="qr-confidence-label">
                    <span>Model confidence</span>
                    <strong>{result.confidence}%</strong>
                  </div>

                  <div className="qr-confidence-track">
                    <div
                      className="qr-confidence-fill"
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

            <p className="qr-result-message">
              {isNonUrl
                ? "This QR code contains non-URL content. It was decoded and analyzed using content-based security checks, not the URL ML model."
                : isPhishing
                ? "The decoded website URL was flagged as potentially phishing. Avoid opening suspicious links."
                : "The decoded website URL was classified as benign by the ML model. Always verify links before opening them."}
            </p>

            {/* INTELLIGENT QR RISK ANALYSIS */}

            {risk && (
              <div className={`qr-risk-section risk-${riskClass}`}>

                <div className="risk-section-heading">
                  <div className="risk-heading-icon">
                    <Activity size={23} />
                  </div>

                  <div>
                    <span>INTELLIGENT SECURITY ENGINE</span>
                    <h2>QR Risk Analysis</h2>
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
                    Detected QR Threats
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

                {/* SECURITY RECOMMENDATION */}

                <div className="risk-recommendation">
                  <h3>
                    <Lightbulb size={20} />
                    Security Recommendation
                  </h3>

                  <p>{risk.recommendation}</p>
                </div>

                <div className="risk-disclaimer">
                  This score is a rule-based assessment, not a
                  probability of phishing. Legitimate QR content
                  may also contain some of these indicators.
                  Always verify destinations independently.
                </div>

              </div>
            )}

            <div className="qr-result-note">
              <AlertCircle size={17} />
              {isNonUrl
                ? "Non-URL QR content is not classified by the URL ML model."
                : "Model confidence does not guarantee website safety."}
            </div>

            <button
              className="qr-reset-button"
              onClick={handleReset}
            >
              <RotateCcw size={17} />
              Scan Another QR Code
            </button>

          </div>
        )}

        <div className="qr-tips">
          <h3>
            <CheckCircle2 size={19} />
            QR Code Safety Tips
          </h3>

          <ul>
            <li>Check the destination before opening a QR code link.</li>
            <li>Avoid scanning QR codes from untrusted sources.</li>
            <li>Be careful with QR codes requesting payments or personal details.</li>
            <li>Remember that decoding a QR code does not guarantee its safety.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default QRScanner;
