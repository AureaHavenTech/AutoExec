# Google Calendar Integration Setup — Axel AI

This document covers setting up Google Calendar API access for the Axel AI assistant.

## Prerequisites

Google Calendar uses the **same Google Cloud project** as Gmail. If you've already set up Gmail, you just need to enable the Calendar API and add its scopes. If not, start from step 1.

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use the existing one from Gmail setup)
3. Navigate to **APIs & Services → Library**
4. Search for "**Google Calendar API**" and enable it

---

## Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** user type (unless you're on Google Workspace)
3. Fill in:
   - App name: `Axel AI`
   - User support email: `aurahaventech@gmail.com`
   - Developer contact: `aurahaventech@gmail.com`
4. Add scopes:
   - `https://www.googleapis.com/auth/calendar` — Read/write access to calendars
   - `https://www.googleapis.com/auth/calendar.events` — Read/write access to events
   - (Also include the existing Gmail scopes if not already added)
5. Add test users (your email for development)
6. Submit for verification if going to production

---

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Choose **Web application**
4. Name: `Axel AI — Calendar`
5. Authorized redirect URIs:
   - Production: `https://axelai-eight.vercel.app/api/auth/google/callback`
   - Development: `http://localhost:3000/api/auth/google/callback`
6. Create and note your **Client ID** and **Client Secret**

---

## Step 4: Environment Variables

Add to your `.env.local` (or Vercel environment variables):

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

These are the same variables used for Gmail — both services share the same OAuth token.

---

## Step 5: OAuth Flow

The OAuth flow is shared with Gmail:

1. User clicks "Connect" on the **Integrations** page
2. Redirected to Google's consent screen (with Calendar + Gmail scopes)
3. User approves — redirected back to `/api/auth/google/callback`
4. Tokens exchanged and stored (in-memory, keyed by user)
5. User redirected to dashboard with success indicator

---

## API Endpoints

### Calendar CRUD

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/calendar?action=status` | Check connection status |
| `GET` | `/api/calendar?action=read&max=10` | Read upcoming events |
| `GET` | `/api/calendar?action=list-calendars` | List available calendars |
| `POST` | `/api/calendar` (body: `{ action: "create", title, startTime, endTime, ... }`) | Create event |
| `POST` | `/api/calendar` (body: `{ action: "update", eventId, ... }`) | Update event |
| `DELETE` | `/api/calendar?eventId=xxx` | Delete specific event |
| `DELETE` | `/api/calendar` | Disconnect Calendar |

---

## File Reference

| File | Purpose |
|------|---------|
| `src/lib/google-auth.ts` | Shared OAuth token management (Gmail + Calendar) |
| `src/lib/google-calendar.ts` | Calendar API client (read, create, update, delete, list) |
| `src/lib/calendar-actions.ts` | Action framework handlers (`calendar_create_event`, `calendar_read_events`) |
| `src/app/api/calendar/route.ts` | Calendar API proxy route |
| `src/app/api/auth/google/route.ts` | OAuth initiation (shared) |
| `src/app/api/auth/google/callback/route.ts` | OAuth callback (shared) |
| `src/components/calendar-connect.tsx` | CalendarConnect UI component |
| `src/app/dashboard/integrations/page.tsx` | Integrations page (includes CalendarConnect) |

---

## Token Storage

Currently uses **in-memory storage** — tokens are lost on server restart. For production:
- Migrate to a persistent database (SQLite/Turso)
- Key tokens by authenticated user ID instead of `"default"`
- Add token encryption at rest

---

## Testing

1. Start the dev server: `npm run dev`
2. Go to `/dashboard/integrations`
3. Click "Connect" on Google Calendar
4. Complete OAuth flow
5. Verify status shows "Connected — Active"
6. Test: "Create a meeting for tomorrow at 2pm"
