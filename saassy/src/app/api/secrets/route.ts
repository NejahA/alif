import { NextResponse } from 'next/server';

export async function GET() {
  const secrets = [
    { id: 'sec-1', key: 'DATABASE_URL', scope: 'Production', maskedValue: 'postgres://admin:••••••••@db.saassy.internal:5432/prod', lastRotated: '2 days ago' },
    { id: 'sec-2', key: 'STRIPE_SECRET_KEY', scope: 'Production', maskedValue: 'mock_stripe_••••••••••••••••••••••••00', lastRotated: '5 days ago' },
    { id: 'sec-3', key: 'OPENAI_API_KEY', scope: 'Global', maskedValue: 'mock_openai_••••••••••••••••••••••••', lastRotated: '1 day ago' },
    { id: 'sec-4', key: 'JWT_PRIVATE_KEY', scope: 'Production', maskedValue: '-----BEGIN RSA PRIVATE KEY-----\nMIIE...', lastRotated: '12 days ago' },
  ];

  return NextResponse.json({ success: true, count: secrets.length, data: secrets });
}
