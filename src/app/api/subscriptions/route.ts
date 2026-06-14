import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// POST /api/subscriptions - Manage/Upgrade subscription plans (simulation)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tier } = body; // 'starter', 'pro', 'unlimited'

    if (!tier || !['starter', 'pro', 'unlimited'].includes(tier)) {
      return NextResponse.json({ success: false, error: 'Invalid subscription tier' }, { status: 400 });
    }

    const db = getDb();
    const userId = 'user_demo_id';

    // Simulate database update (Stripe session success simulation)
    const updateSub = db.prepare(
      'UPDATE subscriptions SET tier = ?, status = ?, current_period_end = ?, updated_at = ? WHERE user_id = ?'
    );
    
    // Set expiry as 30 days from now
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    const now = new Date().toISOString();

    updateSub.run(tier, 'active', expiry.toISOString(), now, userId);

    return NextResponse.json({
      success: true,
      message: `Successfully updated plan to ${tier.toUpperCase()}`,
      subscription: {
        tier,
        status: 'active',
        current_period_end: expiry.toISOString(),
      }
    });
  } catch (error: any) {
    console.error('Subscription update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
