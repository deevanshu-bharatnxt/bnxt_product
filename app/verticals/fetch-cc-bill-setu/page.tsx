'use client';
import { useState } from "react";

export default function GetCCBill() {
  const [formData, setFormData] = useState({
    bankName: "ICICI Credit card",
    lastFourDigitOfCard: "",
    mobileNumber: "",
    userId: ""
  });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const bankOptions = [
    "AU Bank Credit Card",
    "Axis Bank Credit Card",
    "BoB Credit Card",
    "Canara Credit Card",
    "DBS Bank Credit Card",
    "Federal Bank Credit Card",
    "HDFC Credit Card",
    "HSBC Credit Card",
    "ICICI Credit card",
    "IDBI Bank Credit Card",
    "IDFC FIRST Bank Credit Card",
    "Indian bank credit card",
    "IndusInd Credit Card",
    "Kotak Mahindra Bank Credit Card",
    "Punjab National Bank Credit Card",
    "RBL Bank Credit Card",
    "Saraswat Co-Operative Bank Ltd",
    "STATE BANK OF INDIA",
    "One Card - South Indian",
    "Union Bank of India Credit Card",
    "Yes Bank Credit Card"
  ];

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("https://staging.bharatnxt.in/bnxt_util/setu/v1/getCCBillOfUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      setResponse(data);
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-md">
      <h1 className="text-xl font-bold mb-4">Get Credit Card Bill</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Bank Name</label>
          <select name="bankName" value={formData.bankName} onChange={handleChange} className="w-full p-2 border rounded">
            {bankOptions.map((bank) => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Last 4 Digits of Card</label>
          <input type="text" name="lastFourDigitOfCard" value={formData.lastFourDigitOfCard} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Mobile Number</label>
          <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium">User ID</label>
          <input type="text" name="userId" value={formData.userId} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded" disabled={loading}>
          {loading ? "Fetching..." : "Submit"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">Error: {error}</p>}
      {response && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold">Response:</h2>
          <pre className="text-sm break-words">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
