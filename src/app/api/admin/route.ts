import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET /api/admin - Get admin dashboard data (users, stats, codes)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }

    const db = getDb();

    // Check if user is admin
    const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as any;
    if (!user || !user.is_admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Get all users
    const users = db.prepare('SELECT id, email, name, is_admin, created_at FROM users ORDER BY created_at DESC').all();

    // Get all subscriptions
    const subscriptions = db.prepare(`
      SELECT s.*, u.name as user_name, u.email as user_email 
      FROM subscriptions s 
      JOIN users u ON u.id = s.user_id 
      ORDER BY s.created_at DESC
    `).all();

    // Get all owner codes
    const codes = db.prepare(`
      SELECT oc.*, u.name as claimed_by_name, u.email as claimed_by_email 
      FROM owner_codes oc 
      LEFT JOIN users u ON u.id = oc.user_id 
      ORDER BY oc.created_at DESC
    `).all();

    // Get task stats
    const totalTasks = db.prepare('SELECT COUNT(*) as count FROM app_tasks').get() as any;
    const tasksByStatus = db.prepare('SELECT status, COUNT(*) as count FROM app_tasks GROUP BY status').all();
    const tasksToday = db.prepare("SELECT COUNT(*) as count FROM app_tasks WHERE created_at >= datetime('now', '-1 day')").get() as any;

    return NextResponse.json({
      success: true,
      data: {
        users,
        subscriptions,
        codes,
        stats: {
          total_users: users.length,
          total_tasks: totalTasks?.count || 0,
          tasks_by_status: tasksByStatus,
          tasks_today: tasksToday?.count || 0,
        }
      }
    });
  } catch (error: any) {
    console.error('Admin API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/admin - Redeem owner code or create gift codes
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();

    // Redeem owner code
    if (body.action === 'redeem_owner_code') {
      const { userId, code } = body;

      if (!userId || !code) {
        return NextResponse.json({ success: false, error: 'userId and code required' }, { status: 400 });
      }

      const validCode = db.prepare('SELECT * FROM owner_codes WHERE code = ? AND (user_id IS NULL OR user_id = ?)').get(code, userId) as any;

      if (!validCode) {
        return NextResponse.json({ success: false, error: 'Invalid or already claimed code' }, { status: 400 });
      }

      // Check usage limit
      if (validCode.used >= validCode.max_uses && validCode.max_uses > 0) {
        return NextResponse.json({ success: false, error: 'Code has reached its usage limit' }, { status: 400 });
      }

      // Mark user as admin if this is the AUREA2026 owner code
      if (code === 'AUREA2026') {
        db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(userId);
        db.prepare('UPDATE owner_codes SET user_id = ?, used = used + 1 WHERE id = ?').run(userId, validCode.id);

        // Give them unlimited subscription
        const existingSub = db.prepare('SELECT id FROM subscriptions WHERE user_id = ?').get(userId) as any;
        if (existingSub) {
          db.prepare('UPDATE subscriptions SET tier = ?, status = ? WHERE user_id = ?').run('unlimited', 'active', userId);
        } else {
          const subId = 'sub_' + Math.random().toString(36).substring(2, 11);
          db.prepare('INSERT INTO subscriptions (id, user_id, tier, status) VALUES (?, ?, ?, ?)').run(subId, userId, 'unlimited', 'active');
        }

        return NextResponse.json({
          success: true,
          message: 'Owner verified! You now have admin access with unlimited tasks.',
          isAdmin: true
        });
      }

      // Otherwise it's a gift code
      db.prepare('UPDATE owner_codes SET user_id = ?, used = used + 1 WHERE id = ?').run(userId, validCode.id);

      // Give them unlimited for gift codes
      const existingSub = db.prepare('SELECT id FROM subscriptions WHERE user_id = ?').get(userId) as any;
      if (existingSub) {
        db.prepare('UPDATE subscriptions SET tier = ?, status = ? WHERE user_id = ?').run('unlimited', 'active', userId);
      } else {
        const subId = 'sub_' + Math.random().toString(36).substring(2, 11);
        db.prepare('INSERT INTO subscriptions (id, user_id, tier, status) VALUES (?, ?, ?, ?)').run(subId, userId, 'unlimited', 'active');
      }

      return NextResponse.json({
        success: true,
        message: 'Gift code redeemed! You now have unlimited access.',
        isAdmin: false
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}