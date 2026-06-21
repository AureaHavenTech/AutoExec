import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = getDb();
    const userId = 'user_demo_id'; // Default to demo user

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;
    const db = getDb();
    const userId = 'user_demo_id';

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
