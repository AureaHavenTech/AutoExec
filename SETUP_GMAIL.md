# Gmail OAuth Setup for Axel AI

This guide walks you through setting up Google Cloud credentials so Axel AI can connect to Gmail.

## Overview

Axel AI uses the Gmail REST API with OAuth 2.0 to:
- 📖 **Read** your emails (inbox scanning, context gathering)
- ✏️ **Create drafts** (preview before sending)
- 📤 **Send emails** (with your explicit approval)

Every action requires your consent. You can revoke access at any time.

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top → **New Project**
3. Name it `Axel AI` (or anything you like)
4. Click **Create**

---

## Step 2: Enable the Gmail API

1. In your project, go to **APIs & Services → Library**
2. Search for **Gmail API**
3. Click **Enable**

---

## Step 3: Configure the OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** user type (unless you're a Google Workspace org)
3. Fill in:
   - **App name:** `Axel AI`
   - **User support email:** `aurahaventech@gmail.com`
   - **Developer contact:** `aurahaventech@gmail.com`
4. Click **Save and Continue**
5. On the **Scopes** page, add these scopes:
   - `https://www.googleapis.com/auth/gmail.readonly` (read email)
   - `https://www.googleapis.com/auth/gmail.send` (send email)
   - `https://www.googleapis.com/auth/gmail.compose` (create drafts)
   - `https://www.googleapis.com/auth/userinfo.email` (get email address)
   - `https://www.googleapis.com/auth/userinfo.profile` (get name)
6. Click **Save and Continue**
7. Add test users: `aurahaventech@gmail.com` (and any others who need access)
8. Click **Save and Continue**

---

## Step 4: Create OAuth 2.0 Client ID

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: `Axel AI Web`
5. Add authorized redirect URIs:
   - **Production:** `https://axelai-eight.vercel.app/api/auth/google/callback`
   - **Development:** `http://localhost:3000/api/auth/google/callback`
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

---

## Step 5: Set Environment Variables in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/aureahaventechs-projects)
2. Select the **axelai** project
3. Go to **Settings → Environment Variables**
4. Add these variables (for Production AND Preview):

| Name | Value |
|------|-------|
| `GOOGLE_CLIENT_ID` | Your OAuth Client ID from Step 4 |
| `GOOGLE_CLIENT_SECRET` | Your OAuth Client Secret from Step 4 |

5. Click **Save**
6. **Redeploy** the project to apply the new env vars

---

## Step 6: Publish (if using External user type)

If you chose "External" in Step 3, your app is in **Testing** mode by default. Only test users can connect.

To let everyone connect:
1. Go to **OAuth consent screen**
2. Click **Publish App**

---

## Testing

1. Visit `https://axelai-eight.vercel.app/dashboard`
2. Click **Connect Gmail**
3. You'll be redirected to Google's consent screen
4. After granting permissions, you'll return to the dashboard
5. The Gmail card will show "Connected" with permission badges

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "redirect_uri_mismatch" | Make sure the redirect URI in Google Cloud matches exactly: `https://axelai-eight.vercel.app/api/auth/google/callback` |
| "access_denied" | App may be in Testing mode. Add your email as a test user (Step 3) or publish the app. |
| Gmail card shows "Not connected" | Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in Vercel. Redeploy after adding. |
| "Gmail API not enabled" | Go to APIs & Services → Library and enable the Gmail API. |

---

## Security Notes

- Tokens are stored in-memory (per server process). In production, they should be stored in a database.
- Axel AI never sees your Google password — it uses OAuth tokens.
- You can revoke access anytime at [myaccount.google.com/permissions](https://myaccount.google.com/permissions).
