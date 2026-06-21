import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET /api/organizer - Get all organizer data for the user
export async function GET() {
  try {
    const db = getDb();
    const userId = 'user_demo_id'; // Default to demo user

    const folders = db.prepare('SELECT * FROM folders WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    const jobs = db.prepare('SELECT * FROM jobs WHERE user_id = ? ORDER BY updated_at DESC').all(userId);
    const invoices = db.prepare('SELECT * FROM invoices WHERE user_id = ? ORDER BY updated_at DESC').all(userId);
    const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC').all(userId);
    const deliverables = db.prepare('SELECT d.*, j.title as job_title FROM deliverables d JOIN jobs j ON d.job_id = j.id WHERE j.user_id = ? ORDER BY d.due_date ASC').all(userId);

    return NextResponse.json({
      success: true,
      data: {
        folders,
        jobs,
        invoices,
        transactions,
        deliverables
      }
    });
  } catch (error: any) {
    console.error('Organizer fetching error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/organizer - Handle CRUD actions
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
      // Folders
      case 'create_folder':
        const folderId = uuidv4();
        db.prepare('INSERT INTO folders (id, user_id, name) VALUES (?, ?, ?)')
          .run(folderId, userId, data.name);
        return NextResponse.json({ success: true, data: { id: folderId } });

      case 'delete_folder':
        db.prepare('DELETE FROM folders WHERE id = ? AND user_id = ?').run(data.id, userId);
        return NextResponse.json({ success: true });

      // Jobs
      case 'create_job':
        const jobId = uuidv4();
        db.prepare('INSERT INTO jobs (id, user_id, folder_id, title, description, status) VALUES (?, ?, ?, ?, ?, ?)')
          .run(jobId, userId, data.folder_id || null, data.title, data.description || '', data.status || 'active');
        return NextResponse.json({ success: true, data: { id: jobId } });

      case 'update_job':
        db.prepare('UPDATE jobs SET folder_id = ?, title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?')
          .run(data.folder_id || null, data.title, data.description || '', data.status, data.id, userId);
        return NextResponse.json({ success: true });

      case 'delete_job':
        db.prepare('DELETE FROM jobs WHERE id = ? AND user_id = ?').run(data.id, userId);
        return NextResponse.json({ success: true });

      // Invoices
      case 'create_invoice':
        const invoiceId = uuidv4();
        db.prepare('INSERT INTO invoices (id, user_id, job_id, client_name, client_email, amount, currency, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .run(invoiceId, userId, data.job_id || null, data.client_name, data.client_email || '', data.amount, data.currency || 'USD', data.status || 'draft', data.due_date);
        return NextResponse.json({ success: true, data: { id: invoiceId } });

      case 'update_invoice':
        db.prepare('UPDATE invoices SET job_id = ?, client_name = ?, client_email = ?, amount = ?, currency = ?, status = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?')
          .run(data.job_id || null, data.client_name, data.client_email || '', data.amount, data.currency || 'USD', data.status, data.due_date, data.id, userId);
        return NextResponse.json({ success: true });

      case 'mark_invoice_paid':
        const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND user_id = ?').get(data.id, userId) as any;
        if (invoice) {
          db.prepare('UPDATE invoices SET status = "paid", updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(data.id);
          // Auto-create an income transaction
          const transId = uuidv4();
          db.prepare('INSERT INTO transactions (id, user_id, invoice_id, type, amount, category, description) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .run(transId, userId, invoice.id, 'income', invoice.amount, 'client-payment', `Payment for invoice ${invoice.id} from ${invoice.client_name}`);
        }
        return NextResponse.json({ success: true });

      // Transactions
      case 'create_transaction':
        const tId = uuidv4();
        db.prepare('INSERT INTO transactions (id, user_id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(tId, userId, data.type, data.amount, data.category || '', data.description || '', data.date || new Date().toISOString());
        return NextResponse.json({ success: true, data: { id: tId } });

      // Deliverables
      case 'create_deliverable':
        const delId = uuidv4();
        db.prepare('INSERT INTO deliverables (id, job_id, title, status, due_date) VALUES (?, ?, ?, ?, ?)')
          .run(delId, data.job_id, data.title, data.status || 'pending', data.due_date);
        return NextResponse.json({ success: true, data: { id: delId } });

      case 'update_deliverable':
        db.prepare('UPDATE deliverables SET title = ?, status = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(data.title, data.status, data.due_date, data.id);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Organizer action error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
