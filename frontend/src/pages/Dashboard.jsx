
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  Scan,
  QrCode,
  Globe,
  FileText,
  RefreshCw,
  AlertCircle,
  Clock
} from "lucide-react";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/dashboard/stats"
      );

      if (!response.ok) {
        throw new Error("Unable to load dashboard statistics.");
      }

      const data = await response.json();
      setStats(data);
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

  useEffect(() => {
    fetchStats();
  }, []);

  const getScanIcon = (type) => {
    if (type === "URL") return <Globe size={19} />;
    if (type === "EMAIL") return <FileText size={19} />;
    return <QrCode size={19} />;
  };

  const getPredictionClass = (prediction) => {
    if (prediction === "PHISHING") return "dashboard-danger";
    if (prediction === "BENIGN" || prediction === "LEGITIMATE") {
      return "dashboard-safe";
    }
    return "dashboard-neutral";
  };

  const getDistribution = (count, total) => {
    if (!total) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        <div className="scanner-back">
          <Link to="/">← Back to Home</Link>
        </div>

        <div className="dashboard-heading">
          <div className="dashboard-heading-icon">
            <LayoutDashboard size={30} />
          </div>

          <span className="eyebrow">
            PHISHGUARD SECURITY CENTER
          </span>

          <h1>
            Security <span className="gradient-text">Dashboard</span>
          </h1>

          <p>
            Monitor phishing detection activity and review your security statistics.
          </p>

          <button
            className="dashboard-refresh"
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh Dashboard
          </button>
        </div>

        {loading && (
          <div className="dashboard-message">
            Loading security statistics...
          </div>
        )}

        {error && (
          <div className="dashboard-error">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        {!loading && !error && stats && (
          <>

            {/* STATISTICS CARDS */}

            <div className="dashboard-stats-grid">

              <div className="dashboard-stat-card">
                <div className="dashboard-stat-icon blue">
                  <Scan size={23} />
                </div>
                <span>Total Scans</span>
                <strong>{stats.total_scans}</strong>
                <small>All channels combined</small>
              </div>

              <div className="dashboard-stat-card">
                <div className="dashboard-stat-icon red">
                  <ShieldAlert size={23} />
                </div>
                <span>Phishing Detected</span>
                <strong>{stats.phishing_detected}</strong>
                <small>Flagged by detection models</small>
              </div>

              <div className="dashboard-stat-card">
                <div className="dashboard-stat-icon green">
                  <ShieldCheck size={23} />
                </div>
                <span>Safe Results</span>
                <strong>{stats.safe_scans}</strong>
                <small>Benign or legitimate predictions</small>
              </div>

              <div className="dashboard-stat-card">
                <div className="dashboard-stat-icon yellow">
                  <QrCode size={23} />
                </div>
                <span>Unclassified QR</span>
                <strong>{stats.unclassified_scans}</strong>
                <small>Decoded without URL classification</small>
              </div>

            </div>

            {/* DISTRIBUTION */}

            <div className="dashboard-section">
              <h2>Scan Analytics</h2>
              <p className="dashboard-section-description">
                Distribution of scans and detection results.
              </p>

              <div className="dashboard-analytics-grid">

                <div className="dashboard-panel">
                  <h3>Scan Type Distribution</h3>

                  {stats.scan_distribution.length === 0 ? (
                    <p className="dashboard-empty">
                      No scan data available yet.
                    </p>
                  ) : (
                    stats.scan_distribution.map((item) => (
                      <div className="dashboard-bar-item" key={item.scan_type}>
                        <div className="dashboard-bar-label">
                          <span>{item.scan_type}</span>
                          <strong>{item.count}</strong>
                        </div>

                        <div className="dashboard-bar-track">
                          <div
                            className="dashboard-bar-fill blue-fill"
                            style={{
                              width: `${getDistribution(
                                item.count,
                                stats.total_scans
                              )}%`
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="dashboard-panel">
                  <h3>Detection Distribution</h3>

                  {stats.prediction_distribution.length === 0 ? (
                    <p className="dashboard-empty">
                      No detection data available yet.
                    </p>
                  ) : (
                    stats.prediction_distribution.map((item) => (
                      <div className="dashboard-bar-item" key={item.prediction}>
                        <div className="dashboard-bar-label">
                          <span>{item.prediction}</span>
                          <strong>{item.count}</strong>
                        </div>

                        <div className="dashboard-bar-track">
                          <div
                            className={`dashboard-bar-fill ${
                              item.prediction === "PHISHING"
                                ? "red-fill"
                                : item.prediction === "NOT_CLASSIFIED"
                                ? "yellow-fill"
                                : "green-fill"
                            }`}
                            style={{
                              width: `${getDistribution(
                                item.count,
                                stats.total_scans
                              )}%`
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>

            {/* RECENT ACTIVITY */}

            <div className="dashboard-section">
              <div className="dashboard-section-heading">
                <div>
                  <h2>Recent Scan Activity</h2>
                  <p className="dashboard-section-description">
                    Your five latest scans.
                  </p>
                </div>

                <Link to="/history" className="dashboard-history-link">
                  View All History →
                </Link>
              </div>

              {stats.recent_scans.length === 0 ? (
                <div className="dashboard-empty-panel">
                  <Clock size={35} />
                  <h3>No recent activity</h3>
                  <p>Complete a scan to see activity here.</p>
                </div>
              ) : (
                <div className="dashboard-recent-list">
                  {stats.recent_scans.map((scan) => (
                    <div className="dashboard-recent-card" key={scan.id}>

                      <div className="dashboard-recent-icon">
                        {getScanIcon(scan.scan_type)}
                      </div>

                      <div className="dashboard-recent-content">
                        <strong>{scan.scan_type.replace("_", " ")}</strong>
                        <span>{scan.content}</span>
                      </div>

                      <span className={`dashboard-result ${getPredictionClass(scan.prediction)}`}>
                        {scan.prediction}
                      </span>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
