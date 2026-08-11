import React from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import Search from "./pages/Search.jsx";
import BlockDetail from "./pages/BlockDetail.jsx";
import TxDetail from "./pages/TxDetail.jsx";
import Live from "./pages/Live.jsx";
import AddressDetail from "./pages/AddressDetail.jsx";
import VerifyContract from "./pages/VerifyContract.jsx";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ===== Etherscan Top Ticker Bar ===== */}
      <div className="top-ticker-bar">
        <div className="top-ticker-container">
          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", alignItems: "center" }}>
            <div className="ticker-item">
              <span>ETH Price:</span>
              <span className="ticker-val">$2,645.20</span>
              <span style={{ color: "var(--etherscan-green)", fontSize: "11px", fontWeight: 600 }}>(+1.42%)</span>
            </div>
            <div className="ticker-item">
              <span>Gas:</span>
              <span className="ticker-val">12 Gwei</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <span className="network-badge">
              <span className="dot" /> Ethereum Mainnet
            </span>
          </div>
        </div>
      </div>

      {/* ===== Etherscan Header Nav ===== */}
      <header className="etherscan-navbar">
        <div className="navbar-container">
          <Link to="/" className="dora-brand">
            <div className="dora-logo-icon">D</div>
            <div className="dora-brand-text">
              Dora <span>the Explorer</span>
            </div>
            <span className="dora-badge">ETH MAINNET</span>
          </Link>

          <nav>
            <ul className="nav-links">
              <li>
                <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/live" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                  Live Ticker
                </NavLink>
              </li>
              <li>
                <NavLink to="/verify" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                  Verify Contract
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* ===== Main Content Area ===== */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/live" element={<Live />} />
          <Route path="/block/:number" element={<BlockDetail />} />
          <Route path="/tx/:hash" element={<TxDetail />} />
          <Route path="/address/:addr" element={<AddressDetail />} />
          <Route path="/verify" element={<VerifyContract />} />
          <Route
            path="*"
            element={
              <div className="page-container" style={{ textAlign: "center", padding: "60px 20px" }}>
                <h2>Page Not Found</h2>
                <p style={{ color: "var(--etherscan-text-muted)" }}>The requested page could not be located.</p>
                <Link to="/" className="btn-primary" style={{ display: "inline-block", marginTop: "16px" }}>Back to Home</Link>
              </div>
            }
          />
        </Routes>
      </main>

      {/* ===== Etherscan Footer ===== */}
      <footer className="etherscan-footer">
        <div className="footer-container">
          <div>
            <div className="footer-brand">
              Dora <span>the Explorer</span>
            </div>
            <div style={{ marginTop: "4px" }}>
              Powered by Ethereum Mainnet • Real-time Block & Contract Analytics
            </div>
          </div>
          <div>
            Dora the Explorer © {new Date().getFullYear()} • Built for EVM Blockchain Tracing
          </div>
        </div>
      </footer>
    </div>
  );
}
