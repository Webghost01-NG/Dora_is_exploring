import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Search from "./pages/Search.jsx";
import BlockDetail from "./pages/BlockDetail.jsx";
import TxDetail from "./pages/TxDetail.jsx";

export default function App() {
  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand">
          Dora <span className="brand-mark">the Explorer</span>
        </Link>
        <span className="brand-sub">block · tx · address lookup</span>
      </header>

      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/block/:number" element={<BlockDetail />} />
        <Route path="/tx/:hash" element={<TxDetail />} />
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
