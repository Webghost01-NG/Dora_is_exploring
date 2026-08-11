const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const VERIFIER_URL = import.meta.env.VITE_VERIFIER_URL || "http://localhost:3002";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) {
    const message = res.status === 404 ? "Not found" : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

export function getBlocks(limit = 10) {
  return request(`/blocks?limit=${limit}`);
}

export function getBlock(number) {
  return request(`/block/${number}`);
}

export function getTransaction(hash) {
  return request(`/tx/${hash}`);
}

export function search(query) {
  return request(`/search?q=${encodeURIComponent(query)}`);
}

export function getAddress(addr) {
  return request(`/address/${addr}`);
}

export async function verifyContract(payload) {
  try {
    const res = await fetch(`${VERIFIER_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Verification failed (${res.status})`);
    }
    return res.json();
  } catch (err) {
    // If standalone verifier isn't running separately, try server endpoint fallback
    const res = await fetch(`${API_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || err.message);
    }
    return res.json();
  }
}

export async function getContract(address) {
  try {
    const res = await fetch(`${VERIFIER_URL}/contract/${address}`);
    if (res.ok) return res.json();
  } catch (e) {
    // ignore
  }
  return request(`/contract/${address}`).catch(() => null);
}
