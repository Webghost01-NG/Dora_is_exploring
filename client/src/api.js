// Base URL of the backend API
// If VITE_API_URL is set, use it. Otherwise, use relative path "" (same origin for Vercel deployment)
const API_URL = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : "";

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
  const res = await fetch(`${API_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Verification failed (${res.status})`);
  }
  return res.json();
}

export async function getContract(address) {
  return request(`/contract/${address}`).catch(() => null);
}
