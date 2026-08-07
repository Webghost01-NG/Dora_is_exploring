import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBlocks } from "../api.js";
import { detectInputType, shortHash, timeAgo } from "../utils.js";

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | empty | error

  useEffect(() => {
    let cancelled = false;

    getBlocks(15)
      .then((data) => {
        if (cancelled) return;
        setBlocks(data);
        setStatus(data.length ? "ready" : "empty");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const type = detectInputType(query);
    if (type === "block") return navigate(`/block/${query.trim()}`);
    if (type === "tx") return navigate(`/tx/${query.trim()}`);
    if (type === "address") return navigate(`/address/${query.trim()}`);

    setError("Enter a block number, a transaction hash (0x… 66 chars), or an address (0x… 40 chars).");
  }

  return (
    <>
      <form className="compass-search" onSubmit={handleSubmit}>
        <svg className="compass-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <path d="M14.5 9.5 L10.5 10.5 L9.5 14.5 L13.5 13.5 Z" fill="currentColor" stroke="none" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a block number or transaction hash…"
          spellCheck="false"
        />
      </form>
      {error && <p className="search-error">{error}</p>}
      {!error && <p className="search-hint" style={{ marginTop: "-46px", marginBottom: "56px" }}>Try a block number like 4920011</p>}

      <div className="section-eyebrow">Latest waypoints</div>
      <h2 className="section-title">Recently indexed blocks</h2>

      {status === "loading" && (
        <div className="state-block">
          <strong>Scouting ahead…</strong>
          Fetching the latest blocks from the indexer.
        </div>
      )}

      {status === "error" && (
        <div className="state-block is-error">
          <strong>Trail's gone cold</strong>
          Couldn't reach the backend API. Confirm the server is running and VITE_API_URL is set correctly.
        </div>
      )}

      {status === "empty" && (
        <div className="state-block">
          <strong>No blocks indexed yet</strong>
          The indexer hasn't written anything to the database. Start it up and blocks will appear here as they land.
        </div>
      )}

      {status === "ready" && (
        <div className="explorer-table-wrap">
          <table className="explorer-table">
            <thead>
              <tr>
                <th>Block</th>
                <th>Age</th>
                <th>Txns</th>
                <th className="cell-fill">Hash</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((block) => (
                <tr
                  key={block.number}
                  onClick={() => navigate(`/block/${block.number}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td><a href={`/block/${block.number}`} className="cell-link" onClick={(e) => { e.preventDefault(); navigate(`/block/${block.number}`); }}>#{block.number}</a></td>
                  <td className="cell-dim">{timeAgo(block.timestamp)}</td>
                  <td className="cell-dim">{block.tx_count ?? block.txCount ?? 0}</td>
                  <td className="cell-mono cell-fill">{shortHash(block.hash, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
