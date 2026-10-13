import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Welcome aboard! Access instructions have been sent to ${email}.`,
      subscriptionId: `sub_${Math.random().toString(36).substr(2, 9)}`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
