import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBlock } from "../api.js";
import { shortHash, timeAgo } from "../utils.js";

export default function BlockDetail() {
  const { number } = useParams();
  const navigate = useNavigate();
  const [block, setBlock] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    getBlock(number)
      .then((data) => {
        if (cancelled) return;
        setBlock(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err.message === "Not found" ? "notfound" : "error");
      });

    return () => {
      cancelled = true;
    };
  }, [number]);

  return (
    <>
      <Link to="/" className="back-link">← Back to trail</Link>

      {status === "loading" && (
        <div className="state-block">
          <strong>Reading the waypoint…</strong>
        </div>
      )}

      {status === "notfound" && (
        <div className="state-block is-error">
          <strong>Block not found</strong>
          Block #{number} hasn't been indexed. It may not exist yet, or the indexer hasn't reached it.
        </div>
      )}

      {status === "error" && (
        <div className="state-block is-error">
          <strong>Trail's gone cold</strong>
          Couldn't reach the backend API for this block.
        </div>
      )}

      {status === "ready" && block && (
        <div className="detail-card">
          <span className="detail-badge">Block</span>
          <h1 className="detail-title">#{block.number}</h1>

          <div className="detail-grid">
            <span className="detail-label">Hash</span>
            <span className="detail-value">{block.hash}</span>

            <span className="detail-label">Parent hash</span>
            <span className="detail-value">{block.parent_hash || block.parentHash}</span>

            <span className="detail-label">Timestamp</span>
            <span className="detail-value">{timeAgo(block.timestamp)}</span>

            <span className="detail-label">Miner</span>
            <span className="detail-value">{block.miner || "—"}</span>

            <span className="detail-label">Gas used</span>
            <span className="detail-value">{block.gas_used || block.gasUsed || "—"}</span>

            <span className="detail-label">Transactions</span>
            <span className="detail-value">{block.tx_count ?? block.txCount ?? 0}</span>
          </div>

          {Array.isArray(block.transactions) && block.transactions.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <div className="section-eyebrow">In this block</div>
              <div className="explorer-table-wrap" style={{ marginTop: "8px" }}>
                <table className="explorer-table">
                  <thead>
                    <tr>
                      <th>Tx hash</th>
                      <th className="cell-fill">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.transactions.map((tx) => (
                      <tr
                        key={tx.hash}
                        onClick={() => navigate(`/tx/${tx.hash}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <td><a href={`/tx/${tx.hash}`} className="cell-mono cell-link" onClick={(e) => { e.preventDefault(); navigate(`/tx/${tx.hash}`); }}>{shortHash(tx.hash)}</a></td>
                        <td className="cell-dim cell-fill">{tx.value} wei</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
