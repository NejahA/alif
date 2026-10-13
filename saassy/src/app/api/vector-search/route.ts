import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query = 'customer churn analytics' } = await request.json();

    const matches = [
      { id: 'doc_8841', title: 'Q3 Enterprise Customer Risk Report', similarity: 0.948, category: 'Analytics', vectorSnippet: '[0.0124, -0.0941, 0.4281, ... 1536d]' },
      { id: 'doc_3129', title: 'Subscription Billing Retention Strategy', similarity: 0.912, category: 'Finance', vectorSnippet: '[0.0412, -0.0118, 0.3891, ... 1536d]' },
      { id: 'doc_5502', title: 'Webhook Rate-Limit Optimization Guide', similarity: 0.865, category: 'Engineering', vectorSnippet: '[-0.0192, 0.1248, 0.2910, ... 1536d]' },
    ];

    return NextResponse.json({
      success: true,
      query,
      dimensions: 1536,
      distanceMetric: 'Cosine Similarity',
      executionTimeMs: Math.floor(4 + Math.random() * 4),
      matches,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
