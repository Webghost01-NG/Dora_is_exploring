// Determines what kind of thing the user typed into the search bar,
// so we can route them to the right page without them picking a category.
export function detectInputType(raw) {
  const value = raw.trim();

  if (/^0x[a-fA-F0-9]{64}$/.test(value)) return "tx";
  if (/^0x[a-fA-F0-9]{40}$/.test(value)) return "address";
  if (/^\d+$/.test(value)) return "block";

  return "unknown";
}

export function shortHash(hash, chars = 6) {
  if (!hash) return "";
  return `${hash.slice(0, chars + 2)}…${hash.slice(-chars)}`;
}

export function timeAgo(unixTimestamp) {
  if (!unixTimestamp) return "—";
  const seconds = Math.floor(Date.now() / 1000 - Number(unixTimestamp));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
