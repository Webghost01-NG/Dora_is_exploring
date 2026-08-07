// Base URL of the backend API (Person 2's Express server).
// Falls back to localhost:3001 if VITE_API_URL isn't set in .env
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    const message = res.status === 404 ? "Not found" : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

export function getBlocks(limit = 15) {
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
