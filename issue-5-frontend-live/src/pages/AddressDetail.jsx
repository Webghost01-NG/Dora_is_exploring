import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAddress } from "../api.js";
import { shortHash, timeAgo } from "../utils.js";

export default function AddressDetail() {
  const { addr } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    getAddress(addr)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err.message === "Not found" ? "notfound" : "error");
      });

    return () => {
      cancelled = true;
    };
  }, [addr]);

  return (
    <>
      <Link to="/" className="back-link">← Back to live trail</Link>

      {status === "loading" && (
        <div className="state-block">
          <strong>Scouting this address…</strong>
        </div>
      )}

      {status === "notfound" && (
        <div className="state-block is-error">
          <strong>No activity found</strong>
          This address hasn't sent or received anything the indexer has picked up.
        </div>
      )}

      {status === "error" && (
        <div className="state-block is-error">
          <strong>Trail's gone cold</strong>
          Couldn't reach the backend API for this address.
        </div>
      )}

      {status === "ready" && data && (
        <div className="detail-card">
          <span className="detail-badge">Address</span>
          <h1 className="detail-title">{addr}</h1>

          <div className="balance-hero">
            <span className="balance-value">{data.balance ?? "0"}</span>
            <span className="balance-unit">wei</span>
          </div>

          <div className="section-eyebrow">Transaction history</div>

          {(!data.transactions || data.transactions.length === 0) && (
            <p className="search-hint">No transactions recorded yet for this address.</p>
          )}

          {data.transactions && data.transactions.length > 0 && (
            <div className="trail">
              {data.transactions.map((tx) => {
                const isOutgoing = (tx.from_addr || tx.from)?.toLowerCase() === addr.toLowerCase();
                return (
                  <div key={tx.hash} className="waypoint">
                    <div className="waypoint-row">
                      <span>
                        <span className={`tx-direction ${isOutgoing ? "out" : "in"}`}>
                          {isOutgoing ? "Out" : "In"}
                        </span>
                        <span className="waypoint-number">{shortHash(tx.hash)}</span>
                      </span>
                      <span className="waypoint-meta">{timeAgo(tx.timestamp)}</span>
                    </div>
                    <div className="waypoint-sub">{tx.value} wei</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
