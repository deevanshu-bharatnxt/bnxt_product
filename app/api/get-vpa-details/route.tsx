import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { upiId } = body;

    if (!upiId) {
      return NextResponse.json({ error: "UPI ID is required" }, { status: 400 });
    }

    const apiKey = "9FE7FA87CA"; // Replace with actual API key
    const key = "9FE7FA87CA"; // Replace with your key
    const salt = "2E97961010"; // Replace with your salt

    // Generate SHA-512 hash for authorization header
    const hashString = `${key}|${upiId}|${salt}`;
    const hashHex = crypto.createHash("sha512").update(hashString).digest("hex");

    const payload = {
      key,
      vpa: upiId,
      unique_request_number: Date.now().toString(),
    };

    const apiResponse = await fetch(
      "https://wire.easebuzz.in/api/v1/beneficiaries/vpa/verify/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: hashHex,
          "WIRE-API-KEY": apiKey,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: data.message || "API request failed" },
        { status: apiResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
