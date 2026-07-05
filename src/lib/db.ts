// In-memory storage - no native modules, works everywhere including Vercel
interface User {
  id: string;
  email: string;
  name: string;
  is_admin: number;
  password_hash?: string;
  created_at?: string;
}
interface Subscription {
  id: string;
  user_id: string;
  tier: string;
  status: string;
}
interface AdminCode {
  code: string;
  tier: string;
  max_uses: number;
  uses: number;
  description?: string;
  is_gift?: number;
}
interface Session {
  token: string;
  userId: string;
  createdAt: number;
}
interface StorefrontProduct {
  id: string;
  user_id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image_url?: string;
  variant?: string;
  created_at?: string;
  updated_at?: string;
}

const store = {
  users: [] as User[],
  subscriptions: [] as Subscription[],
  sessions: [] as Session[],
  storefront_products: [] as StorefrontProduct[],
  adminCodes: [
    { code: 'AUREA2026', tier: 'unlimited', max_uses: 9999, uses: 0, description: 'Owner registration code - grants admin access', is_gift: 0 }
  ] as AdminCode[],
  ownerCodes: [] as any[],
};

let initialized = false;
function init() {
  if (initialized) return;
  initialized = true;
  const id = 'ceo_' + Math.random().toString(36).substring(2, 11);
  store.users.push({ id, email: 'owner@axelai.app', name: 'Aurea', is_admin: 1, created_at: new Date().toISOString() });
  store.subscriptions.push({ id: 'sub_' + id, user_id: id, tier: 'unlimited', status: 'active' });
}

export function generateSessionToken(): string {
  return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 15);
}

export function createSession(userId: string): Session {
  const token = generateSessionToken();
  const session: Session = { token, userId, createdAt: Date.now() };
  store.sessions.push(session);
  // Clean old sessions (keep max 100)
  if (store.sessions.length > 100) {
    store.sessions = store.sessions.slice(-100);
  }
  return session;
}

export function getSession(token: string): Session | undefined {
  return store.sessions.find(s => s.token === token);
}

export function getDb() {
  init();
  return {
    prepare(sql: string) {
      return {
        get: (...params: any[]) => {
          if (sql.includes('admin_codes')) {
            return store.adminCodes.find(c => c.code === params[0] && (c.uses < c.max_uses || c.max_uses === -1)) || null;
          }
          if (sql.includes('storefront_products WHERE id') && sql.includes('user_id')) {
            return store.storefront_products.find(p => p.id === params[0] && p.user_id === params[1]) || null;
          }
          if (sql.includes('storefront_products WHERE id')) {
            // Just filter by id
            const id = params[0];
            if (params[1] !== undefined) {
              return store.storefront_products.find(p => p.id === params[0] && p.user_id === params[1]) || null;
            }
            return store.storefront_products.find(p => p.id === params[0]) || null;
          }
          if (sql.includes('users WHERE email')) return store.users.find(u => u.email === params[0]) || null;
          if (sql.includes('users WHERE id')) return store.users.find(u => u.id === params[0]) || null;
          if (sql.includes('users WHERE is_admin')) return store.users.find(u => u.is_admin === 1) || null;
          if (sql.includes('subscriptions WHERE user_id')) return store.subscriptions.find(s => s.user_id === params[0]) || null;
          if (sql.includes('owner_codes WHERE code')) return store.ownerCodes.find(c => c.code === params[0]) || null;
          return null;
        },
        all: (...params: any[]) => {
          if (sql.includes('admin_codes')) return store.adminCodes;
          if (sql.includes('owner_codes')) return store.ownerCodes;
          if (sql.includes('storefront_products')) {
            // Filter by user_id if provided
            const userId = params[0];
            if (sql.includes('WHERE user_id')) {
              return store.storefront_products.filter(p => p.user_id === userId);
            }
            return store.storefront_products;
          }
          if (sql.includes('users')) return store.users;
          if (sql.includes('subscriptions')) return store.subscriptions;
          return [];
        },
        run: (...params: any[]) => {
          if (sql.includes('INSERT INTO storefront_products')) {
            const now = new Date().toISOString();
            store.storefront_products.push({
              id: params[0], user_id: params[1], name: params[2],
              price: params[3], category: params[4],
              description: params[5] || '', image_url: params[6] || '',
              variant: params[7] || 'standard',
              created_at: now, updated_at: now
            });
          } else if (sql.includes('UPDATE storefront_products SET')) {
            const idx = store.storefront_products.findIndex(p => p.id === params[7] && p.user_id === params[8]);
            if (idx >= 0) {
              const p = store.storefront_products[idx];
              if (params[0] !== undefined) p.name = params[0];
              if (params[1] !== undefined) p.price = params[1];
              if (params[2] !== undefined) p.category = params[2];
              if (params[3] !== undefined) p.description = params[3];
              if (params[4] !== undefined) p.image_url = params[4];
              if (params[5] !== undefined) p.variant = params[5];
              p.updated_at = new Date().toISOString();
            }
          } else if (sql.includes('DELETE FROM storefront_products')) {
            const idx = store.storefront_products.findIndex(p => p.id === params[0] && p.user_id === params[1]);
            if (idx >= 0) store.storefront_products.splice(idx, 1);
          } else if (sql.includes('INSERT INTO users') && sql.includes('password_hash')) {
            store.users.push({ id: params[0], email: params[1], name: params[2], password_hash: params[3], is_admin: params[4] || 0, created_at: new Date().toISOString() });
          } else if (sql.includes('INSERT INTO users')) {
            store.users.push({ id: params[0], email: params[1], name: params[2], is_admin: params[3] || 0, created_at: new Date().toISOString() });
          } else if (sql.includes('INSERT INTO subscriptions')) {
            store.subscriptions.push({ id: params[0], user_id: params[1], tier: params[2], status: params[3] });
          } else if (sql.includes('UPDATE subscriptions SET tier')) {
            const sub = store.subscriptions.find(s => s.user_id === params[1]);
            if (sub) sub.tier = params[0];
          } else if (sql.includes('UPDATE users SET is_admin')) {
            const user = store.users.find(u => u.id === params[0]);
            if (user) user.is_admin = 1;
          } else if (sql.includes('UPDATE admin_codes SET uses')) {
            const code = store.adminCodes.find(c => c.code === params[0]);
            if (code) code.uses++;
          } else if (sql.includes('CREATE TABLE')) {
            // Silently ignore - in-memory
          } else if (sql.includes('INSERT OR IGNORE INTO owner_codes') || sql.includes('INSERT INTO owner_codes')) {
            const existing = store.ownerCodes.find((c: any) => c.code === params[1]);
            if (!existing) {
              store.ownerCodes.push({ id: params[0], code: params[1], description: params[2], is_gift: params[3] || 0, max_uses: params[4] || 1, used: 0, created_at: new Date().toISOString() });
            }
          }
          return {};
        },
      };
    },
  };
}
