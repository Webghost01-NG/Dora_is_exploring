const solc = require("solc");

// Compiles a single Solidity source file and returns { abi, bytecode, errors }.
// Kept deliberately simple - one file, no imports - which covers most hackathon
// contracts. Multi-file projects with imports need a resolver callback, flagged
// below as a known limitation.
function compileContract(sourceCode, contractName, compilerSettings = {}) {
  const input = {
    language: "Solidity",
    sources: {
      "Contract.sol": { content: sourceCode },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"],
        },
      },
      optimizer: {
        enabled: compilerSettings.optimizerEnabled ?? false,
        runs: compilerSettings.optimizerRuns ?? 200,
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  const errors = (output.errors || []).filter((e) => e.severity === "error");
  if (errors.length > 0) {
    return { errors: errors.map((e) => e.formattedMessage) };
  }

  const contractsInFile = output.contracts?.["Contract.sol"];
  if (!contractsInFile) {
    return { errors: ["Compilation produced no output - check the source code."] };
  }

  // If contractName wasn't specified, just take the first (and usually only) contract
  const name = contractName || Object.keys(contractsInFile)[0];
  const compiled = contractsInFile[name];

  if (!compiled) {
    return { errors: [`Contract "${name}" not found in source. Available: ${Object.keys(contractsInFile).join(", ")}`] };
  }

  return {
    abi: compiled.abi,
    bytecode: "0x" + compiled.evm.bytecode.object,
    deployedBytecode: "0x" + compiled.evm.deployedBytecode.object,
    matchedName: name,
  };
}

module.exports = { compileContract };
