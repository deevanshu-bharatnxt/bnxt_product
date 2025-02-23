import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const webhookUrl = "https://chat.googleapis.com/v1/spaces/AAAAAlym7NE/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=085jOSTvcbvO_jCJblheFAJwLRiR2v0chHfNlDjyvlY";
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: "Webhook triggered from Next.js API!" }),
    });
    
    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.statusText}`);
    }
    
    return NextResponse.json({ message: "Webhook triggered successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
