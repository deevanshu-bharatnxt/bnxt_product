"use client";
import { ChangeEvent, useState } from "react";

const bankNames = [
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
  const [selectedBankName, setSelectedBankName] = useState("");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [userId, setUserId] = useState("");
  const [response, setResponse] = useState<any | null>(null); // Type 'response' as needed
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [billMarkedAsPaid, setBillMarkedAsPaid] = useState(false);
  const [loginMobile, setLoginMobile] = useState(false);

  const handleBankNameChange = (e: ChangeEvent<HTMLSelectElement>) => {
    // Correct event type
    setSelectedBankName(e.target.value);
  };
  const handleLoginMobileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginMobile(e.target.checked);
  };
  const handleBillMarkedAsPaidChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBillMarkedAsPaid(e.target.checked);
  };

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    // Correct event type
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/getCcBill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firestoreBankName: selectedBankName,
          lastFourDigitOfCard: lastFourDigits,
          mobileNumber,
          userId,
          loginMobile,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch bill details");
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      // Type 'err' as 'any' or a custom error type if needed
      if (err instanceof Error) {
        setError(err.message);
        console.error("API Error:", err);
      } else if (typeof err === "string") {
        // Check if err is a string
        setError(err);
        console.error("API Error (string):", err);
      } else {
        setError("An unknown error occurred.");
        console.error("An unknown error occurred:", err);
      }
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
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setLastFourDigits(e.target.value)
          }
          required
        />
        <br />

        <label htmlFor="mobileNumber">Mobile Number:</label>
        <input
          type="tel"
          id="mobileNumber"
          value={mobileNumber}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setMobileNumber(e.target.value)
          }
          required
        />
        <br />

        <label htmlFor="userId">User ID:</label>
        <input
          type="text"
          id="userId"
          value={userId}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setUserId(e.target.value)
          }
          required
        />
        <br />
        <label htmlFor="loginMobile">Login with Mobile:</label>
        <input
          type="checkbox"
          id="loginMobile"
          checked={loginMobile}
          onChange={handleLoginMobileChange}
        />
        <br />
        <label htmlFor="billMarkedAsPaid">Bill Marked As Paid:</label>
        <input
          type="checkbox"
          id="billMarkedAsPaid"
          checked={billMarkedAsPaid}
          onChange={handleBillMarkedAsPaidChange}
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
