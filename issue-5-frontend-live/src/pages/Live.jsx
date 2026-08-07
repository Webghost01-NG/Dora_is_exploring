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
        <div className="trail">
          {blocks.map((block, i) => (
            <a
              key={`${block.number}-${i}`}
              href={`/block/${block.number}`}
              className={`waypoint ${block._fresh && i === 0 ? "is-fresh" : ""}`}
              onClick={(e) => e.preventDefault()}
            >
              <div className="waypoint-row">
                <span className="waypoint-number">#{block.number}</span>
                <span className="waypoint-meta">{timeAgo(block.timestamp)} · {block.tx_count ?? block.txCount ?? 0} txs</span>
              </div>
              <div className="waypoint-sub">{shortHash(block.hash, 10)}</div>
            </a>
          ))}
        </div>
      )}

      <p className="search-hint" style={{ marginTop: "24px" }}>
        Block detail pages live in the search/browse build (Person 4's part) — this view streams the feed only.
      </p>
    </>
  );
}
