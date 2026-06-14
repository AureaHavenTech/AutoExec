import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

// GET /api/tasks - Retrieve all tasks for the logged-in user
export async function GET() {
  try {
    const db = getDb();
    // In a real app, we would get the user ID from the session/JWT
    const userId = 'user_demo_id'; 
    
    const tasks = db.prepare('SELECT * FROM app_tasks WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    
    // Parse result string back to JSON if it exists
    const formattedTasks = tasks.map((task: any) => ({
      ...task,
      result: task.result ? JSON.parse(task.result) : null,
    }));

    return NextResponse.json({ success: true, tasks: formattedTasks });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/tasks - Create a new autonomous task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description } = body;

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ success: false, error: 'Description is required' }, { status: 400 });
    }

    const db = getDb();
    const userId = 'user_demo_id';
    const taskId = 'task_' + crypto.randomBytes(8).toString('hex');

    // Insert task into SQLite
    const insertStmt = db.prepare(
      'INSERT INTO app_tasks (id, user_id, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const now = new Date().toISOString();
    insertStmt.run(taskId, userId, description, 'pending', now, now);

    // Simulate task process in background
    // Since this is a scaffold/mock engine, we'll simulate a mock completed response or keep it running.
    // In a real app, this would trigger an asynchronous worker/agent.
    setTimeout(() => {
      try {
        const bgDb = getDb();
        // Update task to running first
        bgDb.prepare('UPDATE app_tasks SET status = ?, updated_at = ? WHERE id = ?').run('running', new Date().toISOString(), taskId);
        
        // After 5 more seconds, update to completed with mock data
        setTimeout(() => {
          try {
            const finalDb = getDb();
            const mockResult = {
              summary: `Successfully executed: "${description}"`,
              details: "Analyzed request, queried target databases, retrieved contact info, and prepared automated email draft campaigns.",
              items_count: 15,
              execution_time: "8s",
              status: "success",
              logs: [
                "Initializing web browser daemon...",
                "Searching directory sources for query targets...",
                "Found 15 matching leads with validated contacts.",
                "Generated personalized email template pitches.",
                "AutoExec agent execution finished."
              ],
              results_preview: [
                { name: "Segment", domain: "segment.com", status: "Validated", email: "founders@segment.com" },
                { name: "Figma", domain: "figma.com", status: "Validated", email: "growth@figma.com" }
              ]
            };
            finalDb.prepare('UPDATE app_tasks SET status = ?, result = ?, updated_at = ? WHERE id = ?').run(
              'completed',
              JSON.stringify(mockResult),
              new Date().toISOString(),
              taskId
            );
          } catch (e) {
            console.error("BG Task completion error:", e);
          }
        }, 5000);
      } catch (e) {
        console.error("BG Task running error:", e);
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      message: 'Task successfully queued for AutoExec execution',
      taskId,
    });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
