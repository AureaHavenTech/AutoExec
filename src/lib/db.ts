// In-memory storage - no native modules, works everywhere including Vercel
interface User {
  id: string;
  email: string;
  name: string;
  is_admin: number;
  password_hash?: string;
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
}

const store = {
  users: [] as User[],
  subscriptions: [] as Subscription[],
  adminCodes: [
    { code: 'AUREA2026', tier: 'unlimited', max_uses: 9999, uses: 0 }
  ] as AdminCode[],
};

let initialized = false;
function init() {
  if (initialized) return;
  initialized = true;
  const id = 'ceo_' + Math.random().toString(36).substring(2, 11);
  store.users.push({ id, email: 'owner@axelai.app', name: 'Aurea', is_admin: 1 });
  store.subscriptions.push({ id: 'sub_' + id, user_id: id, tier: 'unlimited', status: 'active' });
}

export function getDb() {
  init();
  return {
    prepare(sql: string) {
      return {
        get: (...params: any[]) => {
          if (sql.includes('admin_codes')) {
            return store.adminCodes.find(c => c.code === params[0] && (c.uses < c.max_uses || c.max_uses === -1));
          }
          if (sql.includes('users WHERE email')) return store.users.find(u => u.email === params[0]) || null;
          if (sql.includes('users WHERE id')) return store.users.find(u => u.id === params[0]) || null;
          if (sql.includes('users WHERE is_admin')) return store.users.find(u => u.is_admin === 1) || null;
          if (sql.includes('subscriptions WHERE user_id')) return store.subscriptions.find(s => s.user_id === params[0]) || null;
          return null;
        },
        all: (...params: any[]) => {
          if (sql.includes('admin_codes')) return store.adminCodes;
          if (sql.includes('users')) return store.users;
          if (sql.includes('subscriptions')) return store.subscriptions;
          return [];
        },
        run: (...params: any[]) => {
          if (sql.includes('INSERT INTO users') && sql.includes('password_hash')) {
            store.users.push({ id: params[0], email: params[1], name: params[2], password_hash: params[3], is_admin: params[4] || 0 });
          } else if (sql.includes('INSERT INTO users')) {
            store.users.push({ id: params[0], email: params[1], name: params[2], is_admin: params[3] || 0 });
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
          }
          return {};
        },
      };
    },
  };
}