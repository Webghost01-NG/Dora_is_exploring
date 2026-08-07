require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const { pool, initSchema } = require("./db");
const { compileContract } = require("./compile");

const PORT = process.env.PORT || 3002;
const RPC_URL = process.env.RPC_HTTP_URL; // plain https RPC is fine here, no subscriptions needed

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" })); // contract source can be a few hundred KB

const provider = RPC_URL ? new ethers.JsonRpcProvider(RPC_URL) : null;

// POST /verify
// body: { address, sourceCode, contractName?, optimizerEnabled?, optimizerRuns? }
app.post("/verify", async (req, res) => {
  const { address, sourceCode, contractName, optimizerEnabled, optimizerRuns } = req.body;

  if (!address || !sourceCode) {
    return res.status(400).json({ error: "address and sourceCode are required" });
  }
  if (!ethers.isAddress(address)) {
    return res.status(400).json({ error: "Invalid address format" });
  }
  if (!provider) {
    return res.status(500).json({
      error: "RPC_HTTP_URL is not configured on this service - can't fetch on-chain bytecode to compare against.",
    });
  }

  try {
    const compiled = compileContract(sourceCode, contractName, { optimizerEnabled, optimizerRuns });

    if (compiled.errors) {
      return res.status(422).json({ error: "Compilation failed", details: compiled.errors });
    }

    const onChainBytecode = await provider.getCode(address);

    if (onChainBytecode === "0x") {
      return res.status(404).json({ error: "No contract found at this address on the connected network" });
    }

    // Compare deployed (runtime) bytecode - constructor code isn't present on-chain post-deploy.
    // Exact string match is intentionally strict; metadata hash differences (compiler build
    // details) can cause false negatives even for genuinely matching source - a known limitation.
    const bytecodeMatch = onChainBytecode.toLowerCase() === compiled.deployedBytecode.toLowerCase();

    await pool.query(
      `INSERT INTO contracts (address, source_code, compiler_version, contract_name, abi, bytecode_match, verified_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())
       ON CONFLICT (address) DO UPDATE SET
         source_code = EXCLUDED.source_code,
         compiler_version = EXCLUDED.compiler_version,
         contract_name = EXCLUDED.contract_name,
         abi = EXCLUDED.abi,
         bytecode_match = EXCLUDED.bytecode_match,
         verified_at = now()`,
      [
        address.toLowerCase(),
        sourceCode,
        require("solc").version(),
        compiled.matchedName,
        JSON.stringify(compiled.abi),
        bytecodeMatch,
      ]
    );

    res.json({
      address,
      contractName: compiled.matchedName,
      bytecodeMatch,
      abi: compiled.abi,
      message: bytecodeMatch
        ? "Verified - compiled bytecode matches on-chain bytecode."
        : "Saved, but bytecode did NOT match on-chain code. Check compiler version/optimizer settings, or the source may not match what's deployed.",
    });
  } catch (err) {
    console.error("[POST /verify]", err.message);
    res.status(500).json({ error: "Verification failed", details: err.message });
  }
});

// GET /contract/:address -> fetch verified source/ABI, used by frontends to show "Verified" badges
app.get("/contract/:address", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM contracts WHERE address = $1`,
      [req.params.address.toLowerCase()]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Not verified" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("[GET /contract/:address]", err.message);
    res.status(500).json({ error: "Failed to fetch contract" });
  }
});

// POST /decode-log
// body: { address, topics: [], data: "0x..." }
// Uses a verified contract's ABI to turn a raw log into a readable event.
// Useful for the indexer or server to enrich transaction data once a contract is verified.
app.post("/decode-log", async (req, res) => {
  const { address, topics, data } = req.body;

  if (!address || !Array.isArray(topics) || !data) {
    return res.status(400).json({ error: "address, topics[], and data are required" });
  }

  try {
    const { rows } = await pool.query(`SELECT abi FROM contracts WHERE address = $1`, [address.toLowerCase()]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Contract not verified - no ABI available to decode with" });
    }

    const iface = new ethers.Interface(rows[0].abi);
    const decoded = iface.parseLog({ topics, data });

    if (!decoded) {
      return res.status(422).json({ error: "Log doesn't match any event in this contract's ABI" });
    }

    res.json({
      eventName: decoded.name,
      args: decoded.args.map((arg) => (typeof arg === "bigint" ? arg.toString() : arg)),
    });
  } catch (err) {
    console.error("[POST /decode-log]", err.message);
    res.status(500).json({ error: "Failed to decode log", details: err.message });
  }
});

app.get("/", (req, res) => {
  res.json({
    service: "Dora the Explorer - Contract Verifier",
    endpoints: ["POST /verify", "GET /contract/:address", "POST /decode-log", "GET /health"],
  });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

initSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[verifier] listening on :${PORT}`);
      if (!provider) {
        console.warn("[verifier] RPC_HTTP_URL not set - /verify will fail until it's configured in .env");
      }
    });
  })
  .catch((err) => {
    console.error("[verifier] fatal error during schema init:", err);
    process.exit(1);
  });
