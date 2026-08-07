import { useEffect, useRef, useState } from "react";

// Connects to the backend's WebSocket feed and keeps a rolling list of the
// most recent blocks as they arrive. Reconnects automatically if the socket
// drops - a hackathon wifi disconnect shouldn't kill the live view.
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001";

export function useLiveBlocks(maxItems = 20) {
  const [blocks, setBlocks] = useState([]);
  const [connectionState, setConnectionState] = useState("connecting"); // connecting | connected | down
  const socketRef = useRef(null);
  const retryRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      setConnectionState("connecting");

      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!cancelled) setConnectionState("connected");
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "block" && payload.data) {
            setBlocks((prev) => [{ ...payload.data, _fresh: true }, ...prev].slice(0, maxItems));
          }
        } catch {
          // ignore malformed frames rather than crash the live view
        }
      };

      socket.onclose = () => {
        if (cancelled) return;
        setConnectionState("down");
        retryRef.current = setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(retryRef.current);
      socketRef.current?.close();
    };
  }, [maxItems]);

  return { blocks, connectionState };
}
