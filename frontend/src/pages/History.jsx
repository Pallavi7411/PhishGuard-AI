
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  History as HistoryIcon,
  RefreshCw,
  FileText,
  QrCode,
  Globe,
  AlertCircle,
  Trash2,
  Search,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [predictionFilter, setPredictionFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [clearing, setClearing] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/history"
      );

      if (!response.ok) {
        throw new Error("Unable to retrieve scan history.");
      }

      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to PhishGuard server."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const clearHistory = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete all scan history?"
    );

    if (!confirmed) return;

    setClearing(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/history",
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Unable to clear scan history.");
      }

      setHistory([]);
      setTypeFilter("ALL");
      setPredictionFilter("ALL");
      setSearch("");
    } catch (err) {
      setError(err.message);
    } finally {
      setClearing(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter((scan) => {
      const typeMatches =
        typeFilter === "ALL" ||
        (typeFilter === "QR"
          ? scan.scan_type.startsWith("QR")
          : scan.scan_type === typeFilter);

      const predictionMatches =
        predictionFilter === "ALL" ||
        scan.prediction === predictionFilter;

      const searchMatches =
        scan.content.toLowerCase().includes(search.toLowerCase());

      return typeMatches && predictionMatches && searchMatches;
    });
  }, [history, typeFilter, predictionFilter, search]);

  const getScanIcon = (type) => {
    if (type === "URL") return <Globe size={20} />;
    if (type === "EMAIL") return <FileText size={20} />;
    return <QrCode size={20} />;
  };

  const getResultClass = (prediction) => {
    if (prediction === "PHISHING") return "history-danger";
    if (prediction === "BENIGN" || prediction === "LEGITIMATE") {
      return "history-safe";
    }
    return "history-neutral";
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const totalPhishing = history.filter(
    (scan) => scan.prediction === "PHISHING"
  ).length;

  return (
    <div className="history-page">
      <div className="history-container">

        <div className="scanner-back">
          <Link to="/">← Back to Home</Link>
        </div>

        <div className="history-heading">
          <div className="history-heading-icon">
            <HistoryIcon size={30} />
          </div>

          <span className="eyebrow">PHISHGUARD ACTIVITY</span>

          <h1>
            Scan <span className="gradient-text">History</span>
          </h1>

          <p>
            View and review your previous URL, email and QR code scans.
          </p>
        </div>

        <div className="history-stats">
          <div className="history-stat-card">
            <span>Total Scans</span>
            <strong>{history.length}</strong>
          </div>

          <div className="history-stat-card">
            <span>Phishing Detected</span>
            <strong>{totalPhishing}</strong>
          </div>

          <div className="history-stat-card">
            <span>Safe Results</span>
            <strong>
              {history.filter(
                (scan) =>
                  scan.prediction === "BENIGN" ||
                  scan.prediction === "LEGITIMATE"
              ).length}
            </strong>
          </div>
        </div>

        <div className="history-toolbar">
          <div>
            <h2>Previous Scans</h2>
            <p>{filteredHistory.length} records displayed</p>
          </div>

          <div className="history-actions">
            <button
              className="history-refresh-button"
              onClick={fetchHistory}
              disabled={loading || clearing}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              className="history-clear-button"
              onClick={clearHistory}
              disabled={history.length === 0 || clearing}
            >
              <Trash2 size={17} />
              {clearing ? "Clearing..." : "Clear History"}
            </button>
          </div>
        </div>

        <div className="history-filters">

          <div className="history-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search scanned content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="history-filter-group">
            <label>Scan Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="URL">URL</option>
              <option value="EMAIL">Email</option>
              <option value="QR">QR Code</option>
            </select>
          </div>

          <div className="history-filter-group">
            <label>Detection Result</label>
            <select
              value={predictionFilter}
              onChange={(e) => setPredictionFilter(e.target.value)}
            >
              <option value="ALL">All Results</option>
              <option value="BENIGN">Benign</option>
              <option value="PHISHING">Phishing</option>
              <option value="LEGITIMATE">Legitimate</option>
              <option value="NOT_CLASSIFIED">Not Classified</option>
            </select>
          </div>

        </div>

        {loading && (
          <div className="history-message">
            Loading scan history...
          </div>
        )}

        {error && (
          <div className="history-error">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        {!loading && !error && filteredHistory.length === 0 && (
          <div className="history-empty">
            <HistoryIcon size={42} />
            <h3>
              {history.length === 0
                ? "No scan history yet"
                : "No matching scans found"}
            </h3>
            <p>
              {history.length === 0
                ? "Your completed scans will appear here."
                : "Try changing your filters or search term."}
            </p>
            {history.length === 0 && (
              <Link to="/" className="history-home-link">
                Start Scanning
              </Link>
            )}
          </div>
        )}

        {!loading && filteredHistory.length > 0 && (
          <div className="history-list">
            {filteredHistory.map((scan) => (
              <div className="history-card" key={scan.id}>

                <div className="history-card-top">
                  <div className="history-type">
                    {getScanIcon(scan.scan_type)}
                    <span>{scan.scan_type.replace("_", " ")}</span>
                  </div>

                  <span
                    className={`history-prediction ${getResultClass(scan.prediction)}`}
                  >
                    {scan.prediction}
                  </span>
                </div>

                <div className="history-content">
                  <span>Scanned Content</span>
                  <p>{scan.content}</p>
                </div>

                <div className="history-card-bottom">
                  <span>Scan #{scan.id}</span>

                  <span>
                    Confidence:{" "}
                    {scan.confidence !== null
                      ? `${scan.confidence}%`
                      : "Not available"}
                  </span>

                  <span>{formatDate(scan.timestamp)}</span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default History;
