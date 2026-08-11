import { useEffect, useRef, useState } from "react";
import { getBlocks } from "./api.js";

// Connects to the backend's WebSocket feed or falls back to live HTTP polling
// on serverless environments (like Vercel) where persistent WebSockets aren't supported.
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001";

export function useLiveBlocks(maxItems = 20) {
  const [blocks, setBlocks] = useState([]);
  const [connectionState, setConnectionState] = useState("connecting"); // connecting | connected | down
  const socketRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let wsFailed = false;

    // Helper to start HTTP polling fallback when WebSocket is unavailable (e.g. Vercel deployment)
    function startHttpPolling() {
      if (cancelled) return;
      setConnectionState("connected");

      async function poll() {
        if (cancelled) return;
        try {
          const freshBlocks = await getBlocks(maxItems);
          if (!cancelled && freshBlocks && freshBlocks.length > 0) {
            setBlocks((prev) => {
              if (prev.length === 0) return freshBlocks;
              // Check if latest block is newer
              if (freshBlocks[0].number > prev[0].number) {
                return freshBlocks.map((b, idx) => (idx === 0 ? { ...b, _fresh: true } : b));
              }
              return freshBlocks;
            });
            setConnectionState("connected");
          }
        } catch (err) {
          if (!cancelled) setConnectionState("down");
        }
      }

      poll();
      pollIntervalRef.current = setInterval(poll, 3000);
    }

    // Try WebSocket connection first
    try {
      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      const wsTimeout = setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          wsFailed = true;
          socket.close();
          startHttpPolling();
        }
      }, 2500);

      socket.onopen = () => {
        clearTimeout(wsTimeout);
        if (!cancelled) setConnectionState("connected");
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "block" && payload.data) {
            setBlocks((prev) => [{ ...payload.data, _fresh: true }, ...prev].slice(0, maxItems));
          }
        } catch {
          // ignore
        }
      };

      socket.onerror = () => {
        clearTimeout(wsTimeout);
        if (!wsFailed) {
          wsFailed = true;
          startHttpPolling();
        }
      };

      socket.onclose = () => {
        if (cancelled) return;
        if (!wsFailed) {
          wsFailed = true;
          startHttpPolling();
        }
      };
    } catch (e) {
      startHttpPolling();
    }

    return () => {
      cancelled = true;
      if (socketRef.current) socketRef.current.close();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [maxItems]);

  return { blocks, connectionState };
}
