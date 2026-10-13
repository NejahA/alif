import { NextResponse } from 'next/server';

export async function GET() {
  const services = [
    { id: 'gateway', name: 'API Gateway', rps: 4200, latencyMs: 3, status: 'healthy', downstream: ['auth-service', 'ai-agent-engine'] },
    { id: 'auth-service', name: 'Auth & JWT Shield', rps: 1800, latencyMs: 1, status: 'healthy', downstream: ['redis-cache'] },
    { id: 'ai-agent-engine', name: 'Autonomous Agent Engine', rps: 940, latencyMs: 14, status: 'healthy', downstream: ['vector-db', 'postgres-primary'] },
    { id: 'redis-cache', name: 'Redis Edge Cache', rps: 3200, latencyMs: 0.8, status: 'healthy', downstream: [] },
    { id: 'vector-db', name: 'pgvector Vector Store', rps: 620, latencyMs: 4, status: 'healthy', downstream: [] },
    { id: 'postgres-primary', name: 'PostgreSQL Primary', rps: 1100, latencyMs: 2, status: 'healthy', downstream: [] },
  ];

  return NextResponse.json({
    success: true,
    totalServices: services.length,
    meshHealth: '100% Operational',
    services,
  });
}
