import React, { useState } from "react";
import { verifyContract } from "../api.js";

export default function VerifyContract() {
  const [address, setAddress] = useState("");
  const [contractName, setContractName] = useState("");
  const [sourceCode, setSourceCode] = useState("");
  const [compilerVersion, setCompilerVersion] = useState("v0.8.20+commit.a1b79de6");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!address || !contractName || !sourceCode) {
      setStatus("error");
      setMessage("Please fill in address, contract name, and source code.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const res = await verifyContract({
        address: address.trim(),
        contractName: contractName.trim(),
        sourceCode,
        optimizerEnabled: false,
        optimizerRuns: 200,
      });

      if (res.match || res.status === "verified" || res.verified) {
        setStatus("success");
        setMessage("Contract verified successfully! Source code and ABI stored.");
      } else {
        setStatus("error");
        setMessage(res.reason || res.error || "Bytecode does not match the deployed contract at this address.");
      }
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Failed to verify contract.");
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-header-title">
          <span>📄 Verify & Publish Contract Source Code</span>
        </h1>
      </div>

      <div className="verifier-card">
        <p style={{ color: "var(--etherscan-text-muted)", marginTop: 0, marginBottom: 24 }}>
          Source code verification provides transparency for users interacting with smart contracts. Pass the compiled code to compare with on-chain bytecode.
        </p>

        {status === "success" && (
          <div style={{ backgroundColor: "var(--etherscan-green-bg)", color: "var(--etherscan-green)", padding: "14px 18px", borderRadius: "6px", marginBottom: "20px", fontWeight: 600 }}>
            ✅ {message}
          </div>
        )}

        {status === "error" && (
          <div style={{ backgroundColor: "var(--etherscan-red-bg)", color: "var(--etherscan-red)", padding: "14px 18px", borderRadius: "6px", marginBottom: "20px", fontWeight: 600 }}>
            ⚠️ {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Contract Address</label>
            <input
              type="text"
              className="form-control"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Contract Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Counter or ERC20"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Compiler Version</label>
              <select
                className="form-control"
                value={compilerVersion}
                onChange={(e) => setCompilerVersion(e.target.value)}
              >
                <option value="v0.8.20+commit.a1b79de6">v0.8.20+commit.a1b79de6</option>
                <option value="v0.8.19+commit.7dd6d404">v0.8.19+commit.7dd6d404</option>
                <option value="v0.8.26+commit.8a97fa7a">v0.8.26+commit.8a97fa7a</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Solidity Source Code (Single File)</label>
            <textarea
              className="form-control"
              placeholder="// SPDX-License-Identifier: MIT&#10;pragma solidity ^0.8.0;&#10;&#10;contract MyContract { ... }"
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Compiling & Verifying..." : "Verify & Publish"}
          </button>
        </form>
      </div>
    </div>
  );
}
