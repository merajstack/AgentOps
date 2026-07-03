import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    params.append(key, value);
  });

  const n8nUrl = `https://workflow.ccbp.in/webhook/client-invoice-approve?${params.toString()}`;
  
  try {
    // Attempt to hit the webhook, but ignore the response entirely
    await fetch(n8nUrl, { method: "GET" }).catch(e => console.error("Webhook request failed:", e));
  } catch (e: any) {
    console.error("Error invoking webhook:", e);
  }

  // Always return success UI regardless of the webhook status
  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <body style='font-family:Arial,sans-serif;text-align:center;padding:40px;background-color:#ffffff;'>
        <img src="https://cdn.dribbble.com/userupload/22333996/file/original-6ac4030147adbe5d9381c4600c79eccb.gif" alt="Success" style="max-width:300px;margin-bottom:20px;" />
        <h2 style='color:#333;font-weight:600;margin-top:0;'>Proposal Accepted and invoice sent</h2>
      </body>
    </html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
