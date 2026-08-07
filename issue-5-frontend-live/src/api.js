const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    const message = res.status === 404 ? "Not found" : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

export function getAddress(addr) {
  return request(`/address/${addr}`);
}
