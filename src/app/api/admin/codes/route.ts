import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET /api/admin/codes - List all gift codes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as any;
    if (!user || !user.is_admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const codes = db.prepare(`
      SELECT oc.*, u.name as claimed_by_name, u.email as claimed_by_email 
      FROM owner_codes oc 
      LEFT JOIN users u ON u.id = oc.user_id 
      ORDER BY oc.created_at DESC
    `).all();

    return NextResponse.json({ success: true, data: codes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/admin/codes - Generate a new gift code
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, description, maxUses } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as any;
    if (!user || !user.is_admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Generate a random gift code (like GIFT-XXXX-XXXX)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomPart = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const code = `GIFT-${randomPart()}-${randomPart()}`;

    const codeId = 'code_' + Math.random().toString(36).substring(2, 11);
    db.prepare('INSERT INTO owner_codes (id, code, description, is_gift, max_uses) VALUES (?, ?, ?, 1, ?)').run(
      codeId, code, description || 'Free gift code', maxUses || 1
    );

    return NextResponse.json({
      success: true,
      message: 'Gift code generated successfully!',
      code: { id: codeId, code, description: description || 'Free gift code', max_uses: maxUses || 1 }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}