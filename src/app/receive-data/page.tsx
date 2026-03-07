"use client";

import { useEffect, useState } from "react";

export default function ReceiveDataPage() {
  const [status, setStatus] = useState("Waiting for scrying data...");

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Only accept messages with our expected shape
      if (!event.data?.token || !event.data?.profile) return;

      setStatus("Sending data...");

      fetch("/api/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: event.data.token,
          profile: event.data.profile,
        }),
      })
        .then((res) => {
          if (res.ok) {
            setStatus("Scrying complete! This window will close shortly.");
            // Notify the opener that we received the data
            if (window.opener) {
              window.opener.postMessage("xdnd_received", "*");
            }
          } else {
            setStatus("Failed to send data. Please try again.");
          }
        })
        .catch(() => {
          setStatus("Network error. Please try again.");
        });
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#08080f",
        color: "#c9a84c",
        fontFamily: "serif",
        fontSize: "18px",
      }}
    >
      {status}
    </div>
  );
}
