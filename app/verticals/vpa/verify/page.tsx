"use client";

import { Button } from "@heroui/react";
import { useState } from "react";

export default function VerifyUpi() {
  const [upiId, setUpiId] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setResponse(null);
    setError(null);

    if (!upiId) {
      alert("Please enter a UPI ID");
      return;
    }

    try {
      const res = await fetch("/api/get-vpa-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upiId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Verify UPI ID</h1>
      <input
        type="text"
        placeholder="Enter UPI ID"
        value={upiId}
        onChange={(e) => setUpiId(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <Button onPress={handleVerify}>Verify</Button>
      {response && (
        <div>
          <h2>Response:</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}
