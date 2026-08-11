import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getBlocks } from "../api.js";
import { detectInputType, shortHash, timeAgo, formatEth, formatNumber } from "../utils.js";

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [error, setError] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    getBlocks(10)
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
    if (!query.trim()) return;

    const type = detectInputType(query);
    if (type === "block") return navigate(`/block/${query.trim()}`);
    if (type === "tx") return navigate(`/tx/${query.trim()}`);
    if (type === "address") return navigate(`/address/${query.trim()}`);

    setError("Invalid input. Please enter a valid block number, 66-character tx hash, or 40-character address.");
  }

  // Extract latest block number and transaction list for dashboard
  const latestBlockNum = blocks[0]?.number ? `#${formatNumber(blocks[0].number)}` : "#21,845,920";
  const allTxs = blocks.flatMap((b) =>
    (b.transactions || []).map((t) => ({ ...t, block_timestamp: b.timestamp }))
  ).slice(0, 10);

  return (
    <>
      {/* ===== Etherscan Hero Search Section ===== */}
      <section className="hero-search-section">
        <div className="hero-container">
          <h1 className="hero-title">The Ethereum Blockchain Explorer</h1>

          <form className="hero-search-form" onSubmit={handleSubmit}>
            <select
              className="hero-filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Filters</option>
              <option value="address">Addresses</option>
              <option value="tx">Txn Hash</option>
              <option value="block">Block</option>
            </select>

            <input
              type="text"
              className="hero-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Address / Txn Hash / Block / Token"
              spellCheck="false"
            />

            <button type="submit" className="hero-search-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </form>

          {error && <p style={{ color: "#fc8181", fontSize: "13px", marginTop: "8px" }}>⚠️ {error}</p>}

          <div className="hero-hint">
            Sponsored: ⚡ <strong>Dora the Explorer</strong> - Tracing Ethereum Mainnet Blocks & Transactions in real-time.
          </div>
        </div>
      </section>

      {/* ===== Etherscan Stats Overview Cards Grid ===== */}
      <div className="stats-overview-container">
        <div className="stats-card">
          {/* Stat 1 */}
          <div className="stat-item">
            <div className="stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="stat-label">ETHER PRICE</div>
              <div className="stat-value">$2,645.20 <span style={{ color: "var(--etherscan-text-muted)", fontWeight: 400, fontSize: "12px" }}>@ 0.0381 BTC</span></div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="stat-item">
            <div className="stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <div className="stat-label">TRANSACTIONS</div>
              <div className="stat-value">2,450.8 M <span className="stat-sub">(14.8 TPS)</span></div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="stat-item">
            <div className="stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div>
              <div className="stat-label">LAST FINALIZED BLOCK</div>
              <div className="stat-value">{latestBlockNum}</div>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="stat-item">
            <div className="stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <div className="stat-label">MED GAS PRICE</div>
              <div className="stat-value">12 Gwei <span className="stat-sub">($0.15)</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Dashboard Twin Cards ===== */}
      <div className="dashboard-container">
        <div className="twin-cards-grid">
          {/* Card 1: Latest Blocks */}
          <div className="etherscan-card">
            <div className="card-header">
              <h3 className="card-header-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                Latest Blocks
              </h3>
            </div>

            <div className="card-body">
              {status === "loading" && (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--etherscan-text-muted)" }}>
                  Fetching latest mainnet blocks...
                </div>
              )}

              {status === "error" && (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--etherscan-red)" }}>
                  ⚠️ Connecting to mainnet node...
                </div>
              )}

              {status === "empty" && (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--etherscan-text-muted)" }}>
                  No blocks indexed yet.
                </div>
              )}

              {status === "ready" && blocks.map((block) => (
                <div key={block.number} className="dashboard-list-row">
                  <div className="row-primary-info">
                    <div className="block-row-icon">Bk</div>
                    <div className="row-details">
                      <Link to={`/block/${block.number}`} className="row-title-link">
                        #{block.number}
                      </Link>
                      <span className="row-time">{timeAgo(block.timestamp)}</span>
                    </div>
                  </div>

                  <div style={{ flex: 1, padding: "0 12px" }}>
                    <div style={{ fontSize: "13px" }}>
                      Fee Recipient:{" "}
                      <Link to={`/address/${block.miner || "0x0000000000000000000000000000000000000000"}`}>
                        {shortHash(block.miner || "0x0000000000000000000000000000000000000000", 6)}
                      </Link>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--etherscan-text-muted)" }}>
                      <Link to={`/block/${block.number}`}>
                        {block.tx_count ?? block.txCount ?? 0} txns
                      </Link>
                    </div>
                  </div>

                  <div className="row-secondary-info">
                    <span className="row-eth-badge">0.045 Eth</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-footer">
              <Link to="/live" className="card-footer-btn">
                View all blocks →
              </Link>
            </div>
          </div>

          {/* Card 2: Latest Transactions */}
          <div className="etherscan-card">
            <div className="card-header">
              <h3 className="card-header-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Latest Transactions
              </h3>
            </div>

            <div className="card-body">
              {allTxs.length === 0 && (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--etherscan-text-muted)" }}>
                  No recent transactions available.
                </div>
              )}

              {allTxs.map((tx, idx) => (
                <div key={tx.hash || idx} className="dashboard-list-row">
                  <div className="row-primary-info">
                    <div className="tx-row-icon">Tx</div>
                    <div className="row-details">
                      <Link to={`/tx/${tx.hash}`} className="row-title-link font-mono">
                        {shortHash(tx.hash, 6)}
                      </Link>
                      <span className="row-time">{timeAgo(tx.block_timestamp)}</span>
                    </div>
                  </div>

                  <div style={{ flex: 1, padding: "0 12px" }}>
                    <div style={{ fontSize: "13px" }}>
                      From <Link to={`/address/${tx.from_addr || tx.from}`}>{shortHash(tx.from_addr || tx.from, 5)}</Link>
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      To <Link to={`/address/${tx.to_addr || tx.to}`}>{shortHash(tx.to_addr || tx.to || "Contract Creation", 5)}</Link>
                    </div>
                  </div>

                  <div className="row-secondary-info">
                    <span className="row-eth-badge">{formatEth(tx.value)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-footer">
              <Link to="/live" className="card-footer-btn">
                View all transactions →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
