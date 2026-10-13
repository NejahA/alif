import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { budgetLimit = 2500, currentSpend = 2150 } = await request.json();

    const isNearLimit = currentSpend >= budgetLimit * 0.85;

    return NextResponse.json({
      success: true,
      budgetLimit,
      currentSpend,
      usagePercentage: Math.round((currentSpend / budgetLimit) * 100),
      status: isNearLimit ? 'warning' : 'healthy',
      activeRules: [
        'Auto-scale down idle background workers at 90% budget',
        'Throttle non-priority batch embeddings at 95% budget',
        'Dispatch PagerDuty alert to DevOps team',
      ],
      actionTaken: isNearLimit ? 'Background batch workers throttled by 50%' : 'All workers operating at full capacity',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
