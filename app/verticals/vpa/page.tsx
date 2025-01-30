"use client";

import { useState } from "react";
import Papa from "papaparse";

export default function VerifyUpi() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    setProcessing(true);
    setResults([]);

    // Parse CSV file
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const rows = result.data;
        setData(rows);

        const updatedResults = [];

        for (const row of rows) {
          const upiId = row.UPI_ID;

          try {
            const response = await fetch("/api/get-vpa-details", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ upiId }),
            });

            const apiData = await response.json();

            const resultRow = {
              ...row,
              vpa_status: apiData.data?.vpa_status || "Invalid",
              vpa_name: apiData.data?.vpa_name || "Unknown",
            };

            updatedResults.push(resultRow);

            // Update table dynamically
            setResults((prevResults) => [...prevResults, resultRow]);
          } catch (err) {
            const resultRow = { ...row, vpa_status: "Error", vpa_name: "Error" };
            updatedResults.push(resultRow);
            setResults((prevResults) => [...prevResults, resultRow]);
          }
        }

        setProcessing(false);
      },
    });
  };

  const handleDownload = () => {
    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "processed_upi_ids.csv";
    a.click();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Verify UPI IDs</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <button onClick={handleProcess} disabled={processing} style={{ marginLeft: "10px" }}>
        {processing ? "Processing..." : "Start Verification"}
      </button>

      {results.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Verification Results</h2>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>UPI ID</th>
                <th>VPA Status</th>
                <th>VPA Name</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td>{result.UPI_ID}</td>
                  <td>{result.vpa_status}</td>
                  <td>{result.vpa_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleDownload} style={{ marginTop: "20px" }}>
            Download CSV
          </button>
        </div>
      )}
    </div>
  );
}
