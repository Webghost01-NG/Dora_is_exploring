import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBlock } from "../api.js";
import { shortHash, timeAgo, formatNumber } from "../utils.js";

export default function BlockDetail() {
  const { number } = useParams();
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
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-header-title">
          Block <span className="font-mono" style={{ color: "var(--etherscan-text-muted)" }}>#{number}</span>
        </h1>
      </div>

      {status === "loading" && (
        <div className="detail-card" style={{ textAlign: "center", color: "var(--etherscan-text-muted)", padding: "40px" }}>
          Loading block details...
        </div>
      )}

      {status === "notfound" && (
        <div className="detail-card" style={{ textAlign: "center", color: "var(--etherscan-red)", padding: "40px" }}>
          ⚠️ Block #{number} has not been indexed yet.
        </div>
      )}

      {status === "error" && (
        <div className="detail-card" style={{ textAlign: "center", color: "var(--etherscan-red)", padding: "40px" }}>
          ⚠️ Failed to reach API server.
        </div>
      )}

      {status === "ready" && block && (
        <div className="detail-card">
          <div className="detail-row">
            <div className="detail-label-title">Block Height:</div>
            <div className="detail-value-content font-mono" style={{ fontWeight: 600 }}>
              #{formatNumber(block.number)}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label-title">Status:</div>
            <div className="detail-value-content">
              <span className="badge-success">
                ✓ Finalized
              </span>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label-title">Timestamp:</div>
            <div className="detail-value-content">
              ⏱ {timeAgo(block.timestamp)} ({new Date((block.timestamp || 0) * 1000).toUTCString()})
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label-title">Transactions:</div>
            <div className="detail-value-content">
              <span className="row-eth-badge" style={{ fontSize: "12px" }}>
                {block.tx_count ?? block.txCount ?? 0} transactions
              </span>{" "}
              in this block
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label-title">Fee Recipient:</div>
            <div className="detail-value-content font-mono">
              {block.miner ? (
                <Link to={`/address/${block.miner}`}>{block.miner}</Link>
              ) : (
                "0x0000000000000000000000000000000000000000"
              )}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label-title">Block Hash:</div>
            <div className="detail-value-content font-mono" style={{ fontSize: "13px" }}>
              {block.hash}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label-title">Parent Hash:</div>
            <div className="detail-value-content font-mono" style={{ fontSize: "13px" }}>
              <Link to={`/block/${Number(block.number) - 1}`}>{block.parent_hash || block.parentHash || "—"}</Link>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label-title">Gas Used:</div>
            <div className="detail-value-content font-mono">
              {block.gas_used || block.gasUsed || "0"}
            </div>
          </div>

          {Array.isArray(block.transactions) && block.transactions.length > 0 && (
            <div style={{ marginTop: "30px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Transactions in Block #{block.number}</h3>
              <div className="etherscan-table-wrap">
                <table className="etherscan-table">
                  <thead>
                    <tr>
                      <th>Txn Hash</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.transactions.map((tx) => (
                      <tr key={tx.hash}>
                        <td>
                          <Link to={`/tx/${tx.hash}`} className="font-mono">
                            {shortHash(tx.hash, 8)}
                          </Link>
                        </td>
                        <td>
                          <Link to={`/address/${tx.from_addr || tx.from}`} className="font-mono">
                            {shortHash(tx.from_addr || tx.from, 6)}
                          </Link>
                        </td>
                        <td>
                          <Link to={`/address/${tx.to_addr || tx.to}`} className="font-mono">
                            {shortHash(tx.to_addr || tx.to || "Contract Creation", 6)}
                          </Link>
                        </td>
                        <td className="font-mono">{tx.value} wei</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
