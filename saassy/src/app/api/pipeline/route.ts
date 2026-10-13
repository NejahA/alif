import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pipelineName = 'Default Pipeline', nodes = [] } = body;

    const steps = [
      { id: 'node-1', name: 'Webhook Listener', type: 'trigger', status: 'completed', durationMs: 4, output: 'Received event: order.created' },
      { id: 'node-2', name: 'AI Payload Sanitizer', type: 'agent', status: 'completed', durationMs: 12, output: 'Sanitized 14 schema attributes' },
      { id: 'node-3', name: 'Vector DB Indexer', type: 'database', status: 'completed', durationMs: 18, output: 'Indexed in pgvector namespace' },
      { id: 'node-4', name: 'Slack Notification', type: 'action', status: 'completed', durationMs: 9, output: 'Message posted to #engineering-prod' },
    ];

    return NextResponse.json({
      success: true,
      pipelineName,
      executionId: `exec_${Math.random().toString(36).substr(2, 9)}`,
      totalTimeMs: steps.reduce((acc, s) => acc + s.durationMs, 0),
      steps,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
