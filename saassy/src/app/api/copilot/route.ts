import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message required' }, { status: 400 });
    }

    let reply = `Saassy Assistant: I analyzed your inquiry regarding "${message}". You can easily deploy Next.js API handlers or connect your Postgres database in the live playground above.`;

    if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost')) {
      reply = `Saassy offers 3 transparent tiers: Developer ($29/mo), Pro Scale ($79/mo with unlimited requests), and Enterprise ($249/mo). Annual plans save 20%!`;
    } else if (message.toLowerCase().includes('security') || message.toLowerCase().includes('soc2')) {
      reply = `Saassy operates under Zero-Trust compliance with TLS 1.3 encryption, SOC2 Type II certification, and isolated tenant sandboxing across all 6 edge regions.`;
    } else if (message.toLowerCase().includes('next') || message.toLowerCase().includes('api')) {
      reply = `Next.js App Router API handlers in src/app/api are automatically optimized by Turbopack and deployed near your end users worldwide.`;
    }

    return NextResponse.json({
      success: true,
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
