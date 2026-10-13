import { NextResponse } from 'next/server';

export async function GET() {
  // Simulating real-time server metrics
  const stats = {
    activeUsers: Math.floor(142000 + Math.random() * 500),
    requestsProcessed: "4.8B",
    uptime: "99.99%",
    avgLatencyMs: Math.floor(14 + Math.random() * 5),
    growthPercentage: "+34.2%",
    regions: ["us-east-1", "eu-central-1", "ap-southeast-1", "sa-east-1"],
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({ success: true, data: stats });
}
