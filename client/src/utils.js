// Determines what kind of thing the user typed into the search bar
export function detectInputType(raw) {
  const value = raw ? raw.trim() : "";

  if (/^0x[a-fA-F0-9]{64}$/.test(value)) return "tx";
  if (/^0x[a-fA-F0-9]{40}$/.test(value)) return "address";
  if (/^\d+$/.test(value)) return "block";

  return "unknown";
}

export function shortHash(hash, chars = 6) {
  if (!hash) return "";
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export function timeAgo(unixTimestamp) {
  if (!unixTimestamp) return "—";
  const seconds = Math.floor(Date.now() / 1000 - Number(unixTimestamp));
  if (seconds < 0) return "Just now";
  if (seconds < 60) return `${seconds} secs ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hrs ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export function formatEth(wei) {
  if (!wei || wei === "0") return "0 ETH";
  try {
    const weiBig = BigInt(wei.toString());
    const ethWhole = weiBig / 1000000000000000000n;
    const ethRemainder = weiBig % 1000000000000000000n;
    if (ethRemainder === 0n) return `${ethWhole.toString()} ETH`;
    const fracStr = ethRemainder.toString().padStart(18, "0").slice(0, 5).replace(/0+$/, "");
    return `${ethWhole.toString()}.${fracStr || "0"} ETH`;
  } catch (e) {
    return `${wei} wei`;
  }
}

export function formatNumber(num) {
  if (num === null || num === undefined) return "0";
  return Number(num).toLocaleString();
}
