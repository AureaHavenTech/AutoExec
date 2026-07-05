import { NextRequest, NextResponse } from 'next/server';
import { getDb, getSession } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

function getUserIdFromRequest(request: NextRequest): string | null {
  const sessionToken = request.cookies.get('session_token')?.value;
  if (sessionToken) {
    const session = getSession(sessionToken);
    if (session) return session.userId;
  }
  // Fallback to query param
  const { searchParams } = new URL(request.url);
  return searchParams.get('userId') || null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = getUserIdFromRequest(request) || 'user_demo_id';
    const db = getDb();

    let products;
    if (id) {
      products = db.prepare('SELECT * FROM storefront_products WHERE id = ? AND user_id = ?').all(id, userId);
    } else {
      products = db.prepare('SELECT * FROM storefront_products WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    }

    return NextResponse.json({
      success: true,
      products
    });
  } catch (error: any) {
    console.error('Storefront fetching error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    const userId = getUserIdFromRequest(request) || 'user_demo_id';
    const db = getDb();

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'create_product':
        const productId = uuidv4();
        db.prepare('INSERT INTO storefront_products (id, user_id, name, price, category, description, image_url, variant) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .run(productId, userId, data.name, data.price, data.category, data.description || '', data.image_url || '', data.variant || 'standard');
        return NextResponse.json({ success: true, data: { id: productId } });

      case 'update_product':
        db.prepare('UPDATE storefront_products SET name = ?, price = ?, category = ?, description = ?, image_url = ?, variant = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?')
          .run(data.name, data.price, data.category, data.description, data.image_url, data.variant, data.id, userId);
        return NextResponse.json({ success: true });

      case 'delete_product':
        db.prepare('DELETE FROM storefront_products WHERE id = ? AND user_id = ?').run(data.id, userId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Storefront action error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
