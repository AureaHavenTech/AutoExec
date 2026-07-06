import { NextRequest, NextResponse } from 'next/server';
import { getDb, getSession } from '@/lib/db';

// GET /api/auth/profile — Get current user profile
export async function GET(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  const session = getSession(token);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.userId) as any;
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  const sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(user.id) as any;

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      is_admin: user.is_admin,
      created_at: user.created_at,
      subscription: sub ? { tier: sub.tier, status: sub.status } : null,
    },
  });
}

// PUT /api/auth/profile — Update user profile (name)
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const session = getSession(token);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    if (name.trim().length > 100) {
      return NextResponse.json({ success: false, error: 'Name too long (max 100 chars)' }, { status: 400 });
    }

    // In-memory update via the db helper
    // The in-memory store doesn't have a generic "UPDATE users SET name"
    // handler, so we patch directly.
    const db = getDb();

    // Use the mocked prepare to verify the user exists
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.userId) as any;
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Directly update user name in the in-memory store
    user.name = name.trim();

    return NextResponse.json({
      success: true,
      message: 'Profile updated',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}