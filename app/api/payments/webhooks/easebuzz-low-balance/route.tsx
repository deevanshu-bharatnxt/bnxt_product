import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        console.log("Webhook triggered via browser visit");

        // Google Chat Webhook URL
        const googleChatWebhookUrl = "https://chat.googleapis.com/v1/spaces/AAAAsJNgbeg/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=hPu2K-farnv5b5orFO5rIqMXUzPfHNjjlXQSIAPR288";

        // Webhook payload
        const payload = { text: "Low Balance Alert" };

        // Send webhook request
        const response = await fetch(googleChatWebhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        console.log("Google Chat Webhook Response:", result);

        return NextResponse.json({ message: "Webhook triggered and Google Chat notified!", response: result });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json();
        console.log("Received Webhook:", body);

        // Handle webhook event logic here
        return NextResponse.json({ message: "Webhook received successfully" });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
