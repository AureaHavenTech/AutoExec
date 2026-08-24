import { NextRequest, NextResponse } from 'next/server';
import { getDb, createSession, getSession } from '@/lib/db';
import { rateLimit, clientKey } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';

// POST /api/auth - Sign in / Sign up with email + password
export async function POST(request: Request) {
  try {
    // Rate limit: 20 auth attempts per 10 minutes per IP
    const rl = rateLimit(clientKey(request, 'auth'), 20, 10 * 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

    const body = await request.json();
    const { email, password, name, adminCode } = body;
    const db = getDb();

    // CODE-ONLY LOGIN: database-backed access codes (see src/lib/db.ts adminCodes seed)
    if (adminCode && !email) {
      const codeConfig = db.prepare(
        "SELECT * FROM admin_codes WHERE code = ? AND (uses < max_uses OR max_uses = -1)"
      ).get(adminCode) as any;

      if (codeConfig) {
        // Find or create the owner user for admin codes, or a dedicated user for other codes
        let targetUser: any;
        if (codeConfig.is_admin) {
          targetUser = db.prepare('SELECT * FROM users WHERE is_admin = 1 LIMIT 1').get() as any;
          if (!targetUser) {
            const userId = 'user_ceo_' + Math.random().toString(36).substring(2, 11);
            db.prepare('INSERT OR IGNORE INTO users (id, email, name, is_admin) VALUES (?, ?, ?, ?)').run(userId, 'owner@axelai.app', 'Aurea', 1);
            targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
          }
          db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(targetUser.id);
        } else {
          // Non-admin code: create a dedicated access-code user
          const userId = 'user_code_' + Math.random().toString(36).substring(2, 11);
          db.prepare('INSERT INTO users (id, email, name, is_admin) VALUES (?, ?, ?, ?)').run(userId, `access-${adminCode.toLowerCase()}@axelai.app`, 'Axel AI Member', 0);
          targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        }

        // Increment usage
        db.prepare('UPDATE admin_codes SET uses = uses + 1 WHERE code = ?').run(adminCode);

        // Create session
        const session = createSession(targetUser.id);

        const response = NextResponse.json({
          success: true,
          message: 'Access granted',
          user: { id: targetUser.id, email: targetUser.email, name: targetUser.name, is_admin: codeConfig.is_admin ? 1 : 0, plan: codeConfig.tier }
        });

        response.cookies.set('session_token', session.token, {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
          sameSite: 'lax',
        });

        return response;
      }
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

    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      // Create new user (Sign up)
      const userId = 'user_' + Math.random().toString(36).substring(2, 11);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Check if this is the owner
      const isOwner = email.toLowerCase() === 'aurahaventech@gmail.com' || email.toLowerCase() === 'aurahaven@gmail.com' || email.toLowerCase() === 'owner@aurahaven.com';
      
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

    // Create session
    const session = createSession(user.id);

    const sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(user.id) as any;

    const response = NextResponse.json({
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
      } : null,
      session_token: session.token,
    });

    response.cookies.set('session_token', session.token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Authentication error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET /api/auth - Get current session user
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    
    // Check for session token in cookies
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (sessionToken) {
      const session = getSession(sessionToken);
      if (session) {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.userId) as any;
        if (user) {
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
        }
      }
    }

    // Fallback: return the admin (owner) user if one exists (used by code-login sessions)
    const ceoUser = db.prepare('SELECT * FROM users WHERE is_admin = 1 LIMIT 1').get() as any;
    if (ceoUser) {
      const sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(ceoUser.id) as any;
      return NextResponse.json({
        success: true,
        user: {
          id: ceoUser.id,
          email: ceoUser.email,
          name: ceoUser.name,
          is_admin: ceoUser.is_admin || 0,
          subscription: sub ? {
            tier: sub.tier,
            status: sub.status,
          } : null
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
  } catch (error: any) {
    console.error('Session fetching error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
