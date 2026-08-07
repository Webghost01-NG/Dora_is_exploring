import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTransaction } from "../api.js";

export default function TxDetail() {
  const { hash } = useParams();
  const navigate = useNavigate();
  const [tx, setTx] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    getTransaction(hash)
      .then((data) => {
        if (cancelled) return;
        setTx(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err.message === "Not found" ? "notfound" : "error");
      });

    return () => {
      cancelled = true;
    };
  }, [hash]);

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
          <strong>Transaction not found</strong>
          This hash hasn't been indexed yet.
        </div>
      )}

      {status === "error" && (
        <div className="state-block is-error">
          <strong>Trail's gone cold</strong>
          Couldn't reach the backend API for this transaction.
        </div>
      )}

      {status === "ready" && tx && (
        <div className="detail-card">
          <span className="detail-badge">Transaction</span>
          <h1 className="detail-title">{tx.hash}</h1>

          <div className="detail-grid">
            <span className="detail-label">Block</span>
            <span className="detail-value">
              <a
                href={`/block/${tx.block_number ?? tx.blockNumber}`}
                onClick={(e) => { e.preventDefault(); navigate(`/block/${tx.block_number ?? tx.blockNumber}`); }}
                style={{ color: "var(--blue)" }}
              >
                #{tx.block_number ?? tx.blockNumber}
              </a>
            </span>

            <span className="detail-label">From</span>
            <span className="detail-value">{tx.from_addr || tx.from}</span>

            <span className="detail-label">To</span>
            <span className="detail-value">{tx.to_addr || tx.to || "Contract creation"}</span>

            <span className="detail-label">Value</span>
            <span className="detail-value">{tx.value} wei</span>

            <span className="detail-label">Gas limit</span>
            <span className="detail-value">{tx.gas_limit || tx.gasLimit || "—"}</span>

            <span className="detail-label">Nonce</span>
            <span className="detail-value">{tx.nonce ?? "—"}</span>
          </div>
        </div>
      )}
    </>
  );
}
