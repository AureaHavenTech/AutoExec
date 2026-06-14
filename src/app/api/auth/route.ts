import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// POST /api/auth - Mock sign in / sign up
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const db = getDb();
    
    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      // Create new user (Sign up)
      const userId = 'user_' + Math.random().toString(36).substring(2, 11);
      const insertUser = db.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)');
      insertUser.run(userId, email, name || email.split('@')[0]);
      
      // Give them a free/starter tier active subscription by default
      const subId = 'sub_' + Math.random().toString(36).substring(2, 11);
      const insertSub = db.prepare('INSERT INTO subscriptions (id, user_id, tier, status) VALUES (?, ?, ?, ?)');
      insertSub.run(subId, userId, 'starter', 'active');
      
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }

    // Return the authenticated user info
    return NextResponse.json({
      success: true,
      message: 'Authenticated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error: any) {
    console.error('Authentication error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET /api/auth - Get current session user
export async function GET() {
  try {
    const db = getDb();
    // Default logged-in user is 'user_demo_id'
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get('user_demo_id') as any;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    const sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get('user_demo_id') as any;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: sub ? {
          tier: sub.tier,
          status: sub.status,
          current_period_end: sub.current_period_end,
        } : null
      }
    });
  } catch (error: any) {
    console.error('Session fetching error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
