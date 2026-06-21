import { getDb } from './db';
import { v4 as uuidv4 } from 'uuid';

export async function createNotification(userId: string, title: string, message: string, type: string = 'info', link?: string) {
  try {
    const db = getDb();
    const id = uuidv4();
    db.prepare('INSERT INTO notifications (id, user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, userId, title, message, type, link || null);
    return id;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
}
