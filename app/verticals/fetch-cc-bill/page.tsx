"use client";
// pages/get-bill.js (or .tsx)
import { useState } from "react";

const bankNames = [
  // Directly use the BBPS bank names
  "AU SMALL FINANCE BANK",
  "AXIS BANK",
  "BANK OF BARODA",
  "CANARA BANK",
  "DBS BANK",
  "THE FEDERAL BANK",
  "HDFC BANK",
  "HSBC BANK",
  "ICICI BANK",
  "IDBI BANK",
  "IDFC FIRST BANK",
  "INDIAN BANK",
  "INDUSIND BANK",
  "KOTAK MAHINDRA BANK",
  "PUNJAB NATIONAL BANK",
  "RBL BANK",
  "SARASWAT BANK",
  "STATE BANK OF INDIA",
  "SOUTH INDIAN BANK",
  "UNION BANK OF INDIA",
  "YES BANK",
];

export default function GetBill() {
  const [selectedBankName, setSelectedBankName] = useState(""); // Directly store the selected bank name
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [userId, setUserId] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBankNameChange = (e) => {
    setSelectedBankName(e.target.value); // Update selected bank name
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/getCcBill", {
        // Your API route
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firestore_bank_name: selectedBankName, // Send the selected bank name directly
          lastFourDigitOfCard: lastFourDigits,
          mobileNumber,
          userId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch bill details");
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Get Bill Details</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="bankName">Bank Name:</label>
        <select
          id="bankName"
          value={selectedBankName}
          onChange={handleBankNameChange}
          required
        >
          <option value="">Select Bank</option>
          {bankNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <br />

        <label htmlFor="lastFourDigits">Last 4 Digits:</label>
        <input
          type="text"
          id="lastFourDigits"
          value={lastFourDigits}
          onChange={(e) => setLastFourDigits(e.target.value)}
          required
        />
        <br />

        <label htmlFor="mobileNumber">Mobile Number:</label>
        <input
          type="tel"
          id="mobileNumber"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          required
        />
        <br />

        <label htmlFor="userId">User ID:</label>
        <input
          type="text"
          id="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Get Bill"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {response && (
        <div>
          <h2>Response:</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
