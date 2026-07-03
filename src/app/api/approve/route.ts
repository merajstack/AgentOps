import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    params.append(key, value);
  });

  const n8nUrl = `https://workflow.ccbp.in/webhook/client-invoice-approve?${params.toString()}`;
  
  try {
    const response = await fetch(n8nUrl, { method: "GET" });
    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }
  } catch (e: any) {
    console.error("Error invoking webhook:", e);
    
    // Return error UI if the webhook fails
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <body style='font-family:Arial,sans-serif;text-align:center;padding:40px;background-color:#ffffff;'>
          <img src="https://i.pinimg.com/originals/25/e2/a4/25e2a496c8204acd1e5c459d86d905e4.gif" alt="Error" style="max-width:300px;margin-bottom:20px;" />
          <h2 style='color:#e74c3c;font-weight:600;margin-top:0;'>error occured in n8n</h2>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Return success UI if the webhook is successful
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
