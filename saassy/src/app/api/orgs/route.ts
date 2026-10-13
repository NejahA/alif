import { NextResponse } from 'next/server';

export async function GET() {
  const orgs = [
    { id: 'org_acme', name: 'Acme Corp (Prod)', plan: 'Enterprise', membersCount: 42, region: 'us-east-1', status: 'active' },
    { id: 'org_fintech', name: 'Fintech Global (Staging)', plan: 'Pro Scale', membersCount: 18, region: 'eu-central-1', status: 'active' },
    { id: 'org_indie', name: 'Indie AI Lab (Dev)', plan: 'Developer', membersCount: 3, region: 'ap-southeast-1', status: 'active' },
  ];

  return NextResponse.json({ success: true, count: orgs.length, data: orgs });
}
