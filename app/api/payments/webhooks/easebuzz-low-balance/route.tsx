import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json();
        console.log("Received Webhook:", body);

        // Validate payload structure
        if (!body.event || body.event !== "LOW_BALANCE_ALERT" || !body.data) {
            return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
        }

        const { balance_amount, threshold_amount, virtual_ifsc_number, virtual_account_number } = body.data;

        // Construct Google Chat message
        const messageText = `🚨 *Low Balance Alert* 🚨\n\n` +
            `*Balance Amount:* ₹${balance_amount}\n` +
            `*Threshold Amount:* ₹${threshold_amount}\n` +
            `*Virtual IFSC:* ${virtual_ifsc_number}\n` +
            `*Virtual Account:* ${virtual_account_number}`;

        // Google Chat Webhook URL (Move to env for security)
        const googleChatWebhookUrl = "https://chat.googleapis.com/v1/spaces/AAAAsJNgbeg/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=hPu2K-farnv5b5orFO5rIqMXUzPfHNjjlXQSIAPR288";

        // Webhook payload
        const payload = { text: messageText };

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

        return NextResponse.json({ message: "Webhook processed and Google Chat notified!", response: result });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
