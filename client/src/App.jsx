import React from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import Search from "./pages/Search.jsx";
import BlockDetail from "./pages/BlockDetail.jsx";
import TxDetail from "./pages/TxDetail.jsx";
import Live from "./pages/Live.jsx";
import AddressDetail from "./pages/AddressDetail.jsx";

const navLinkStyle = ({ isActive }) => ({
  fontFamily: "var(--body)",
  fontSize: "0.85rem",
  fontWeight: 600,
  textDecoration: "none",
  color: isActive ? "var(--blue)" : "var(--text-dim)",
  borderBottom: isActive ? "2px solid var(--blue)" : "2px solid transparent",
  paddingBottom: "4px",
});

export default function App() {
  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand">
          Dora <span className="brand-mark">the Explorer</span>
        </Link>
        <nav style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <NavLink to="/" end style={navLinkStyle}>Search</NavLink>
          <NavLink to="/live" style={navLinkStyle}>Live</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/live" element={<Live />} />
        <Route path="/block/:number" element={<BlockDetail />} />
        <Route path="/tx/:hash" element={<TxDetail />} />
        <Route path="/address/:addr" element={<AddressDetail />} />
        <Route
          path="*"
          element={
            <div className="state-block">
              <strong>No trail here</strong>
              That page doesn't exist. Head back and search again.
            </div>
          }
        />
      </Routes>
    </div>
  );
}
