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
    const data = await response.json();
    
    if (data.success) {
      return new NextResponse(
        `<!DOCTYPE html><html><body style='font-family:Arial;text-align:center;padding:60px;'>
        <h1 style='color:#27ae60;'>✅ Proposal Accepted!</h1>
        <p>Your invoice has been generated and sent to your email.</p>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }
  } catch (e) {
    console.error(e);
  }

  return new NextResponse(
    `<!DOCTYPE html><html><body style='font-family:Arial;text-align:center;padding:60px;'>
    <h1 style='color:#e74c3c;'>❌ Something went wrong</h1>
    <p>Please try again or contact support.</p>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
