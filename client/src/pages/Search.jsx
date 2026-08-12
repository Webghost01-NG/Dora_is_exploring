import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getBlocks } from "../api.js";
import { detectInputType, shortHash, timeAgo, formatEth, formatNumber } from "../utils.js";

// Etherscan 14-Day Transaction History Sample Data
const CHART_DATA = [
  { date: "Jul 29", txs: 1142000, gas: 14 },
  { date: "Jul 30", txs: 1180000, gas: 13 },
  { date: "Jul 31", txs: 1215000, gas: 15 },
  { date: "Aug 01", txs: 1190000, gas: 12 },
  { date: "Aug 02", txs: 1240000, gas: 16 },
  { date: "Aug 03", txs: 1210000, gas: 11 },
  { date: "Aug 04", txs: 1285000, gas: 14 },
  { date: "Aug 05", txs: 1310000, gas: 18 },
  { date: "Aug 06", txs: 1260000, gas: 13 },
  { date: "Aug 07", txs: 1290000, gas: 12 },
  { date: "Aug 08", txs: 1340000, gas: 15 },
  { date: "Aug 09", txs: 1315000, gas: 11 },
  { date: "Aug 10", txs: 1380000, gas: 14 },
  { date: "Today", txs: 1410000, gas: 12 },
];

function EtherscanTxChart() {
  const [hovered, setHovered] = useState(null);

  const width = 360;
  const height = 90;
  const minTx = 1000000;
  const maxTx = 1500000;

  const points = CHART_DATA.map((d, idx) => {
    const x = (idx / (CHART_DATA.length - 1)) * width;
    const y = height - ((d.txs - minTx) / (maxTx - minTx)) * height;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--etherscan-text-muted)" }}>
          TRANSACTION HISTORY (14 DAYS)
        </span>
        {hovered ? (
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--etherscan-blue)" }}>
            {hovered.date}: {(hovered.txs / 1000000).toFixed(2)}M txns ({hovered.gas} Gwei)
          </span>
        ) : (
          <span style={{ fontSize: "11px", color: "var(--etherscan-text-muted)" }}>
            Hover point for details
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "75px", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="etherscanGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0784c6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0784c6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1="0" y1="20" x2={width} y2="20" stroke="#e9ecef" strokeDasharray="3 3" />
        <line x1="0" y1="50" x2={width} y2="50" stroke="#e9ecef" strokeDasharray="3 3" />
        <line x1="0" y1="80" x2={width} y2="80" stroke="#e9ecef" strokeDasharray="3 3" />

        {/* Area & Line */}
        <path d={areaD} fill="url(#etherscanGradient)" />
        <path d={pathD} fill="none" stroke="#0784c6" strokeWidth="2" />

        {/* Interactive Points */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={hovered?.date === p.date ? 5 : 3}
            fill="#0784c6"
            stroke="#ffffff"
            strokeWidth="1.5"
            style={{ cursor: "pointer", transition: "r 0.15s ease" }}
            onMouseEnter={() => setHovered(p)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--etherscan-text-muted)", marginTop: "2px" }}>
        <span>Jul 29</span>
        <span>Aug 04</span>
        <span>Aug 10</span>
        <span>Today</span>
      </div>
    </div>
  );
}

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

      {/* ===== Etherscan Stats Overview Cards Grid & Interactive Chart ===== */}
      <div className="stats-overview-container">
        <div className="stats-card" style={{ gridTemplateColumns: "1.2fr 1.2fr 1fr" }}>
          {/* Column 1: Price & Market Cap */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingRight: "15px", borderRight: "1px solid var(--etherscan-border)" }}>
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

            <div className="stat-item">
              <div className="stat-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div>
                <div className="stat-label">MARKET CAP</div>
                <div className="stat-value">$318,120,450,200</div>
              </div>
            </div>
          </div>

          {/* Column 2: Transactions & Gas */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingRight: "15px", borderRight: "1px solid var(--etherscan-border)" }}>
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

          {/* Column 3: Etherscan Daily Transaction Chart */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <EtherscanTxChart />
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
                      <Link to={`/address/${block.miner || "0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5"}`}>
                        {shortHash(block.miner || "0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5", 6)}
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
