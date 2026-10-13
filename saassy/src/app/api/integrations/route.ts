import { NextResponse } from 'next/server';

export async function GET() {
  const integrations = [
    { id: 'github', name: 'GitHub Actions', category: 'CI/CD', status: 'connected', latency: '4ms', icon: 'Github' },
    { id: 'stripe', name: 'Stripe Payments', category: 'Payments', status: 'connected', latency: '12ms', icon: 'CreditCard' },
    { id: 'openai', name: 'OpenAI GPT-4o', category: 'AI', status: 'connected', latency: '45ms', icon: 'Sparkles' },
    { id: 'supabase', name: 'Supabase Postgres', category: 'Database', status: 'ready', latency: '8ms', icon: 'Database' },
    { id: 'aws', name: 'AWS Lambda & S3', category: 'Cloud', status: 'ready', latency: '15ms', icon: 'Cloud' },
    { id: 'datadog', name: 'Datadog APM', category: 'Monitoring', status: 'connected', latency: '6ms', icon: 'Activity' },
    { id: 'slack', name: 'Slack Alerts', category: 'Notification', status: 'connected', latency: '18ms', icon: 'MessageSquare' },
    { id: 'vercel', name: 'Vercel Deployments', category: 'Hosting', status: 'ready', latency: '5ms', icon: 'Zap' },
  ];

  return NextResponse.json({ success: true, count: integrations.length, data: integrations });
}
