import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventType = 'user.signup', targetUrl = 'https://api.yourcompany.com/webhooks' } = body;

    const deliveryId = `evt_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    const mockHmacSignature = `sha256=${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    return NextResponse.json({
      success: true,
      deliveryId,
      eventType,
      targetUrl,
      httpStatus: 200,
      responseTimeMs: Math.floor(18 + Math.random() * 15),
      headers: {
        'X-Saassy-Signature': mockHmacSignature,
        'X-Saassy-Delivery': deliveryId,
        'Content-Type': 'application/json',
      },
      payload: {
        id: deliveryId,
        event: eventType,
        created_at: timestamp,
        data: {
          account_id: 'acc_994182',
          status: 'verified',
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
