import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAddress, getContract } from "../api.js";
import { shortHash, timeAgo, formatEth } from "../utils.js";

export default function AddressDetail() {
  const { addr } = useParams();
  const [data, setData] = useState(null);
  const [contractInfo, setContractInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("txs"); // txs | contract
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    Promise.all([
      getAddress(addr).catch(() => null),
      getContract(addr).catch(() => null),
    ]).then(([addrData, contractData]) => {
      if (cancelled) return;
      if (contractData) setContractInfo(contractData);

      if (addrData) {
        setData(addrData);
        setStatus("ready");
      } else {
        setData({ address: addr, balance: "0", transactions: [] });
        setStatus("ready");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [addr]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-header-title">
          <span>Address</span>
          <span className="font-mono" style={{ fontSize: "16px", color: "var(--etherscan-text-muted)" }}>{addr}</span>
        </h1>
      </div>

      {status === "loading" && (
        <div className="detail-card" style={{ textAlign: "center", color: "var(--etherscan-text-muted)", padding: "40px" }}>
          Loading address details...
        </div>
      )}

      {status === "ready" && data && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
            <div className="detail-card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--etherscan-text-muted)", marginBottom: "8px" }}>
                Overview
              </div>
              <div style={{ fontSize: "13px", color: "var(--etherscan-text-muted)", marginBottom: "4px" }}>ETH BALANCE</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--etherscan-text-main)" }}>
                {formatEth(data.balance)}
              </div>
              <div style={{ fontSize: "13px", color: "var(--etherscan-text-muted)", marginTop: "12px" }}>ETH VALUE</div>
              <div style={{ fontSize: "15px", fontWeight: 600 }}>
                $0.00 <span style={{ fontSize: "12px", color: "var(--etherscan-text-muted)" }}>(@ $2,645.20/ETH)</span>
              </div>
            </div>

            <div className="detail-card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--etherscan-text-muted)", marginBottom: "8px" }}>
                More Info
              </div>
              <div style={{ fontSize: "13px", color: "var(--etherscan-text-muted)", marginBottom: "4px" }}>PRIVATE NAME TAG</div>
              <div style={{ fontSize: "14px" }}>Not Available</div>
              <div style={{ fontSize: "13px", color: "var(--etherscan-text-muted)", marginTop: "12px" }}>CONTRACT STATUS</div>
              <div>
                {contractInfo ? (
                  <span className="badge-success">✓ Verified Contract ({contractInfo.contract_name || "Smart Contract"})</span>
                ) : (
                  <span style={{ fontSize: "13px", color: "var(--etherscan-text-muted)" }}>Standard Externally Owned Account (EOA)</span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--etherscan-border)", marginBottom: "20px" }}>
            <button
              onClick={() => setActiveTab("txs")}
              className={`nav-item ${activeTab === "txs" ? "active" : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: "10px 16px" }}
            >
              Transactions ({data.transactions?.length || 0})
            </button>
            {contractInfo && (
              <button
                onClick={() => setActiveTab("contract")}
                className={`nav-item ${activeTab === "contract" ? "active" : ""}`}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: "10px 16px" }}
              >
                Verified Code & ABI
              </button>
            )}
          </div>

          {activeTab === "txs" && (
            <div className="etherscan-table-wrap">
              <table className="etherscan-table">
                <thead>
                  <tr>
                    <th>Txn Hash</th>
                    <th>Method / Direction</th>
                    <th>Block</th>
                    <th>Age</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {(!data.transactions || data.transactions.length === 0) && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", color: "var(--etherscan-text-muted)", padding: "30px" }}>
                        No transactions recorded for this address.
                      </td>
                    </tr>
                  )}

                  {data.transactions && data.transactions.map((tx) => {
                    const isOutgoing = (tx.from_addr || tx.from)?.toLowerCase() === addr.toLowerCase();
                    return (
                      <tr key={tx.hash}>
                        <td>
                          <Link to={`/tx/${tx.hash}`} className="font-mono">
                            {shortHash(tx.hash, 6)}
                          </Link>
                        </td>
                        <td>
                          <span className={`badge-direction ${isOutgoing ? "out" : "in"}`}>
                            {isOutgoing ? "OUT" : "IN"}
                          </span>
                        </td>
                        <td>
                          <Link to={`/block/${tx.block_number ?? tx.blockNumber}`} className="font-mono">
                            #{tx.block_number ?? tx.blockNumber}
                          </Link>
                        </td>
                        <td style={{ color: "var(--etherscan-text-muted)", fontSize: "12.5px" }}>
                          {timeAgo(tx.timestamp)}
                        </td>
                        <td>
                          <Link to={`/address/${tx.from_addr || tx.from}`} className="font-mono">
                            {shortHash(tx.from_addr || tx.from, 5)}
                          </Link>
                        </td>
                        <td>
                          <Link to={`/address/${tx.to_addr || tx.to}`} className="font-mono">
                            {shortHash(tx.to_addr || tx.to || "Contract Creation", 5)}
                          </Link>
                        </td>
                        <td className="font-mono" style={{ fontWeight: 600 }}>
                          {formatEth(tx.value)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "contract" && contractInfo && (
            <div className="detail-card">
              <h3 style={{ marginTop: 0 }}>Contract Source Code (Verified)</h3>
              <pre style={{ backgroundColor: "#1e293b", color: "#f8fafc", padding: "16px", borderRadius: "6px", overflowX: "auto", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                <code>{contractInfo.source_code || contractInfo.sourceCode}</code>
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
