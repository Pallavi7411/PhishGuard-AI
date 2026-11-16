
import {
  ShieldCheck,
  Shield,
  Globe,
  Mail,
  QrCode,
  ArrowRight,
  Lock,
  Zap,
  Activity,
  Menu,
  X,
  CheckCircle2,
  ScanSearch,
  Eye,

} from "lucide-react";

import { useState } from "react";
import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import URLScanner from "./pages/URLScanner";

import EmailScanner from "./pages/EmailScanner";

import QRScanner from "./pages/QRScanner";

import History from "./pages/History";

import Dashboard from "./pages/Dashboard";

import { Link } from "react-router-dom";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scanners = [



  {
    icon: Globe,
    title: "URL Scanner",
    description:
      "Analyze website links and identify suspicious URLs using machine learning.",
    color: "blue",
    tag: "Website protection",
    path: "/url-scanner",
  },
  {
    icon: Mail,
    title: "Email Scanner",
    description:
      "Examine email content and detect phishing messages before they cause harm.",
    color: "purple",
    tag: "Email protection",
     path: "/email-scanner",
  },
  {
    icon: QrCode,
    title: "QR Code Scanner",
    description:
      "Decode QR codes and analyze embedded website links for potential threats.",
    color: "cyan",
    tag: "QR protection",
    path: "/qr-scanner",
  },
];


  const features = [
    {
      icon: Zap,
      title: "AI-Powered Detection",
      description:
        "Machine learning models analyze suspicious patterns across multiple channels.",
    },
    {
      icon: Activity,
      title: "Instant Analysis",
      description:
        "Get detection results and model confidence immediately after scanning.",
    },
    {
      icon: Lock,
      title: "Multi-Channel Security",
      description:
        "One platform to analyze URLs, emails, and QR codes.",
    },
  ];

  return (
    <div className="app">
      <nav className="navbar">
        <a href="#home" className="brand">
          <div className="brand-icon">
            <ShieldCheck size={25} />
          </div>
          <span>Phish<span className="brand-highlight">Guard</span></span>
        </a>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>



<div className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
  <a href="/#home" onClick={() => setMenuOpen(false)}>
    Home
  </a>

  <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
    Dashboard
  </Link>

  <a href="/#scanners" onClick={() => setMenuOpen(false)}>
    Scanners
  </a>

  <Link to="/history" onClick={() => setMenuOpen(false)}>
    History
  </Link>

  <a href="/#features" onClick={() => setMenuOpen(false)}>
    Features
  </a>

  <a href="/#about" onClick={() => setMenuOpen(false)}>
    About
  </a>

  <a
    href="/#scanners"
    className="nav-button"
    onClick={() => setMenuOpen(false)}
  >
    Start Scanning <ArrowRight size={16} />
  </a>
</div>



      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="status-pill">
              <span className="status-dot"></span>
              AI-POWERED MULTI-CHANNEL PROTECTION
            </div>

            <h1>
              Stay Ahead of
              <br />
              <span className="gradient-text">Phishing Threats.</span>
            </h1>

            <p className="hero-description">
              Protect yourself from digital threats with PhishGuard.
              Analyze suspicious URLs, emails, and QR codes using
              intelligent machine learning technology.
            </p>

            <div className="hero-actions">
              <a href="#scanners" className="primary-button">
                Start Scanning <ArrowRight size={18} />
              </a>
              <a href="#features" className="secondary-button">
                Explore Features
              </a>
            </div>

            <div className="trust-points">
              <span><CheckCircle2 size={16} /> Multi-channel detection</span>
              <span><CheckCircle2 size={16} /> ML-powered analysis</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="glow-circle"></div>
            <div className="shield-card">
              <div className="shield-orbit orbit-one"></div>
              <div className="shield-orbit orbit-two"></div>
              <div className="main-shield">
                <ShieldCheck size={104} strokeWidth={1.3} />
              </div>
              <div className="floating-card floating-top">
                <span className="floating-icon green">
                  <CheckCircle2 size={19} />
                </span>
                <div>
                  <strong>Threat Monitoring</strong>
                  <small>Protection enabled</small>
                </div>
              </div>
              <div className="floating-card floating-bottom">
                <span className="floating-icon blue">
                  <ScanSearch size={19} />
                </span>
                <div>
                  <strong>AI Analysis</strong>
                  <small>Multiple scan channels</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-strip">
          <div>
            <strong>03</strong>
            <span>Detection Channels</span>
          </div>
          <div>
            <strong>AI</strong>
            <span>Machine Learning</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>On-demand Scanning</span>
          </div>
          <div>
            <strong>1</strong>
            <span>Unified Platform</span>
          </div>
        </section>

        <section className="scanner-section section" id="scanners">
          <div className="section-heading">
            <span className="eyebrow">OUR DETECTION TOOLS</span>
            <h2>Choose Your <span className="gradient-text">Scanner</span></h2>
            <p>
              Select the type of content you want to analyze.
              PhishGuard helps identify suspicious digital content.
            </p>
          </div>

          <div className="scanner-grid">
            {scanners.map((scanner) => {
              const Icon = scanner.icon;
              return (
                <div className="scanner-card" key={scanner.title}>
                  <div className={`scanner-icon ${scanner.color}`}>
                    <Icon size={27} />
                  </div>
                  <span className="scanner-tag">{scanner.tag}</span>
                  <h3>{scanner.title}</h3>
                  <p>{scanner.description}</p>
                  <a href={scanner.path} className="card-link">
                    Explore Scanner <ArrowRight size={17} />
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        <section className="features-section section" id="features">
          <div className="section-heading">
            <span className="eyebrow">WHY PHISHGUARD?</span>
            <h2>Security Made <span className="gradient-text">Smarter</span></h2>
            <p>
              Intelligent detection technology designed to help you
              recognize potential phishing threats.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div className="feature-card" key={feature.title}>
                  <div className="feature-icon">
                    <Icon size={25} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="cta-section" id="about">
          <div className="cta-icon"><Eye size={30} /></div>
          <h2>Think Before You Click.</h2>
          <p>
            Stay informed, stay alert, and use intelligent detection
            to make safer decisions online.
          </p>
          <a href="#scanners" className="primary-button">
            Scan Something Now <ArrowRight size={18} />
          </a>
        </section>
      </main>

      <footer className="footer">
        <a href="#home" className="brand">
          <div className="brand-icon"><ShieldCheck size={22} /></div>
          <span>Phish<span className="brand-highlight">Guard</span></span>
        </a>
        <p>AI-powered multi-channel phishing detection.</p>
        <span className="copyright">
          © 2026 PhishGuard. Built for a safer digital world.
        </span>
      </footer>
    </div>
  );
}



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/url-scanner" element={<URLScanner />} />
        <Route path="/email-scanner" element={<EmailScanner />} />
        <Route path="/qr-scanner" element={<QRScanner />} />
        <Route path="/history" element={<History />} />
         <Route path="/Dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
