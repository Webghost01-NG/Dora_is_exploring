import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTransaction } from "../api.js";
import { shortHash, formatEth } from "../utils.js";

export default function TxDetail() {
  const { hash } = useParams();
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
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-header-title">
          Transaction Details
        </h1>
      </div>

      {status === "loading" && (
        <div className="detail-card" style={{ textAlign: "center", color: "var(--etherscan-text-muted)", padding: "40px" }}>
          Loading transaction details...
        </div>
      )}

      {status === "notfound" && (
        <div className="detail-card" style={{ textAlign: "center", color: "var(--etherscan-red)", padding: "40px" }}>
          ⚠️ Transaction hash not found in indexer database.
        </div>
      )}

      {status === "error" && (
        <div className="detail-card" style={{ textAlign: "center", color: "var(--etherscan-red)", padding: "40px" }}>
          ⚠️ Failed to connect to API server.
        </div>
      )}

      {status === "ready" && tx && (
        <div className="detail-card">
          <div className="detail-row">
            <div className="detail-label-title">Transaction Hash:</div>
            <div className="detail-value-content font-mono" style={{ fontWeight: 600 }}>
              {tx.hash}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label-title">Status:</div>
            <div className="detail-value-content">
              <span className="badge-success">
                ✓ Success
              </span>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label-title">Block:</div>
            <div className="detail-value-content">
              <Link to={`/block/${tx.block_number ?? tx.blockNumber}`} className="font-mono">
                #{tx.block_number ?? tx.blockNumber}
              </Link>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label-title">From:</div>
            <div className="detail-value-content font-mono">
              <Link to={`/address/${tx.from_addr || tx.from}`}>{tx.from_addr || tx.from}</Link>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label-title">To:</div>
            <div className="detail-value-content font-mono">
              {tx.to_addr || tx.to ? (
                <Link to={`/address/${tx.to_addr || tx.to}`}>{tx.to_addr || tx.to}</Link>
              ) : (
                <span style={{ color: "var(--etherscan-green)", fontWeight: 600 }}>Contract Creation</span>
              )}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label-title">Value:</div>
            <div className="detail-value-content font-mono" style={{ fontWeight: 600 }}>
              {formatEth(tx.value)} ({tx.value} wei)
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label-title">Gas Limit:</div>
            <div className="detail-value-content font-mono">
              {tx.gas_limit || tx.gasLimit || "21,000"}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label-title">Nonce:</div>
            <div className="detail-value-content font-mono">
              {tx.nonce ?? "0"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
