import React from "react";
import { useNavigate } from "react-router-dom";
import { useLiveBlocks } from "../useLiveBlocks.js";
import { shortHash, timeAgo } from "../utils.js";

export default function Live() {
  const navigate = useNavigate();
  const { blocks, connectionState } = useLiveBlocks(20);

  return (
    <>
      <div className="live-status">
        <span className={`live-dot ${connectionState === "connected" ? "is-connected" : connectionState === "down" ? "is-down" : ""}`} />
        {connectionState === "connected" && "Live — connected to indexer feed"}
        {connectionState === "connecting" && "Connecting…"}
        {connectionState === "down" && "Disconnected — retrying every 3s"}
      </div>

      <div className="section-eyebrow">Live trail</div>
      <h2 className="section-title">New blocks as they land</h2>

      {blocks.length === 0 && connectionState === "connected" && (
        <div className="state-block">
          <strong>Waiting on the next block…</strong>
          Connected and listening — new blocks will drop in here as the indexer picks them up.
        </div>
      )}

      {blocks.length === 0 && connectionState !== "connected" && (
        <div className="state-block">
          <strong>Trail's quiet for now</strong>
          Waiting on a connection to the backend's WebSocket feed.
        </div>
      )}

      {blocks.length > 0 && (
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
              {blocks.map((block, i) => (
                <tr
                  key={`${block.number}-${i}`}
                  className={block._fresh && i === 0 ? "is-fresh" : ""}
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
