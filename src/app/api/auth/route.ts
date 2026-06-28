import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

// POST /api/auth - Sign in / Sign up with email + password
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, adminCode } = body;

    // CODE-ONLY LOGIN: If only adminCode is provided, log in as CEO directly
    if (adminCode && !email) {
      const code = db.prepare('SELECT * FROM admin_codes WHERE code = ? AND (uses < max_uses OR max_uses = -1) AND (expires_at IS NULL OR expires_at > datetime(\'now\'))').get(adminCode) as any;
      if (!code) {
        return NextResponse.json({ success: false, error: 'Invalid or expired access code' }, { status: 401 });
      }
      // Find or create CEO user
      let ceoUser = db.prepare('SELECT * FROM users WHERE is_admin = 1 LIMIT 1').get() as any;
      if (!ceoUser) {
        const userId = 'user_ceo_' + Math.random().toString(36).substring(2, 11);
        db.prepare('INSERT INTO users (id, email, name, is_admin) VALUES (?, ?, ?, ?)').run(userId, 'owner@axelai.app', 'Aurea', 1);
        ceoUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      }
      // Increment code usage
      db.prepare('UPDATE admin_codes SET uses = uses + 1 WHERE code = ?').run(adminCode);
      // Upgrade subscription
      db.prepare('UPDATE subscriptions SET tier = ? WHERE user_id = ?').run(code.tier || 'unlimited', ceoUser.id);
      db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(ceoUser.id);
      
      return NextResponse.json({
        success: true,
        message: 'CEO access granted',
        user: { id: ceoUser.id, email: ceoUser.email, name: ceoUser.name, is_admin: 1 }
      });
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const db = getDb();
    
    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      // Create new user (Sign up)
      const userId = 'user_' + Math.random().toString(36).substring(2, 11);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Check if this is the owner (aurahaven@gmail.com)
      const isOwner = email.toLowerCase() === 'aurahaven@gmail.com' || email.toLowerCase() === 'owner@aurahaven.com';
      
      const insertUser = db.prepare('INSERT INTO users (id, email, name, password_hash, is_admin) VALUES (?, ?, ?, ?, ?)');
      insertUser.run(userId, email, name || email.split('@')[0], hashedPassword, isOwner ? 1 : 0);
      
      // Give them a free/starter tier active subscription by default
      const subId = 'sub_' + Math.random().toString(36).substring(2, 11);
      const insertSub = db.prepare('INSERT INTO subscriptions (id, user_id, tier, status) VALUES (?, ?, ?, ?)');
      insertSub.run(subId, userId, 'starter', 'active');
      
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    } else {
      // Existing user - verify password
      if (user.password_hash) {
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
          return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
        }
      }
    }

    // Handle admin code redemption
    if (adminCode) {
      const code = db.prepare('SELECT * FROM admin_codes WHERE code = ? AND (uses < max_uses OR max_uses = -1) AND (expires_at IS NULL OR expires_at > datetime(\'now\'))').get(adminCode) as any;
      if (code) {
        db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(user.id);
        db.prepare('UPDATE admin_codes SET uses = uses + 1 WHERE code = ?').run(adminCode);
        // Upgrade subscription
        db.prepare('UPDATE subscriptions SET tier = ? WHERE user_id = ?').run(code.tier || 'pro', user.id);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      }
    }

    const sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(user.id) as any;

    return NextResponse.json({
      success: true,
      message: 'Authenticated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin || 0,
      },
      subscription: sub ? {
        tier: sub.tier,
        status: sub.status,
      } : null
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
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get('aurahaven@gmail.com') as any;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    const sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(user.id) as any;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin || 0,
        subscription: sub ? {
          tier: sub.tier,
          status: sub.status,
        } : null
      }
    });
  } catch (error: any) {
    console.error('Session fetching error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}