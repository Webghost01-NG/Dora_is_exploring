import React from "react";
import { Link } from "react-router-dom";
import { useLiveBlocks } from "../useLiveBlocks.js";
import { shortHash, timeAgo } from "../utils.js";

export default function Live() {
  const { blocks, connectionState } = useLiveBlocks(25);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-header-title">
          <span>Live Blocks Feed</span>
        </h1>
        <div className="network-badge" style={{ fontSize: "13px", padding: "6px 12px" }}>
          <span className="dot" style={{ backgroundColor: connectionState === "connected" ? "var(--etherscan-green)" : "#e53e3e" }} />
          {connectionState === "connected" ? "Live Feed Active" : "Connecting..."}
        </div>
      </div>

      <div className="etherscan-table-wrap">
        <table className="etherscan-table">
          <thead>
            <tr>
              <th>Block</th>
              <th>Age</th>
              <th>Txns</th>
              <th>Fee Recipient</th>
              <th>Block Hash</th>
            </tr>
          </thead>
          <tbody>
            {blocks.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "var(--etherscan-text-muted)", padding: "40px" }}>
                  Fetching live blocks from Ethereum Mainnet indexer feed...
                </td>
              </tr>
            )}

            {blocks.map((block, i) => (
              <tr key={`${block.number}-${i}`} style={{ backgroundColor: block._fresh && i === 0 ? "#f0f9ff" : "transparent" }}>
                <td>
                  <Link to={`/block/${block.number}`} className="font-mono" style={{ fontWeight: 600 }}>
                    #{block.number}
                  </Link>
                </td>
                <td style={{ color: "var(--etherscan-text-muted)" }}>
                  {timeAgo(block.timestamp)}
                </td>
                <td>
                  <Link to={`/block/${block.number}`}>
                    {block.tx_count ?? block.txCount ?? 0} txns
                  </Link>
                </td>
                <td>
                  <Link to={`/address/${block.miner || "0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5"}`} className="font-mono">
                    {shortHash(block.miner || "0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5", 6)}
                  </Link>
                </td>
                <td className="font-mono" style={{ color: "var(--etherscan-text-muted)", fontSize: "13px" }}>
                  {shortHash(block.hash, 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
