import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Live from "./pages/Live.jsx";
import AddressDetail from "./pages/AddressDetail.jsx";

export default function App() {
  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand">
          Dora <span className="brand-mark">the Explorer</span>
        </Link>
        <span className="brand-sub">live feed</span>
      </header>

      <Routes>
        <Route path="/" element={<Live />} />
        <Route path="/address/:addr" element={<AddressDetail />} />
        <Route
          path="*"
          element={
            <div className="state-block">
              <strong>No trail here</strong>
              That page doesn't exist.
            </div>
          }
        />
      </Routes>
    </div>
  );
}
