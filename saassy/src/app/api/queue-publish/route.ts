import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { topic = 'orders.created', payload = { orderId: 'ord_9941', amount: 149.00 } } = await request.json();

    const messageId = `msg_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      messageId,
      topic,
      partition: Math.floor(Math.random() * 4),
      offset: Math.floor(104200 + Math.random() * 500),
      consumerLag: 0,
      deliveredInMs: Math.floor(2 + Math.random() * 3),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
