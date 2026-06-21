import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET /api/notifications - Get all notifications for the user
export async function GET() {
  try {
    const db = getDb();
    const userId = 'user_demo_id'; // Default to demo user

    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(userId);

    return NextResponse.json({
      success: true,
      notifications
    });
  } catch (error: any) {
    console.error('Notifications fetching error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/notifications - Mark as read
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id } = body;
    const db = getDb();
    const userId = 'user_demo_id';

    if (action === 'mark_read') {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, userId);
    } else if (action === 'mark_all_read') {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Notification action error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Helper to create a notification (not an exported route field)
async function createNotification(userId: string, title: string, message: string, type: string = 'info', link?: string) {
  const db = getDb();
  const id = uuidv4();
  db.prepare('INSERT INTO notifications (id, user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, userId, title, message, type, link || null);
  return id;
}
