# Supabase + GitHub Authentication Setup Guide

## Configure GitHub OAuth App

1. Go to your GitHub account settings -> Developer settings -> OAuth Apps -> New OAuth App
2. Fill in the following details:
   - **Application Name**: TaskZen (or your preferred name)
   - **Homepage URL**: `https://hvvmfadfxwighfoebyjr.supabase.co` (your Supabase project URL)
   - **Application Description**: Task management application (optional)
   - **Authorization callback URL**: `https://hvvmfadfxwighfoebyjr.supabase.co/auth/v1/callback`

3. Register the application
4. Once created, you'll see your Client ID
5. Generate a new client secret

## Configure Supabase GitHub Provider

1. Go to your Supabase project dashboard: https://app.supabase.io
2. Navigate to Authentication -> Providers -> GitHub 
3. Toggle GitHub provider to enabled
4. Enter the Client ID and Client Secret from your GitHub OAuth App
5. Under Additional Redirect URLs, add your local development URL:
   ```
   http://localhost:5173/auth/callback
   ```
6. Save changes

## Update Site URL in Supabase

1. In Supabase dashboard, go to Authentication -> URL Configuration
2. Set Site URL to your local development URL: `http://localhost:5173`
3. Add the following to the "Redirect URLs" list:
   ```
   http://localhost:5173/auth/callback
   ```
4. Save changes

## Test Your Authentication

1. Run your application locally with `npm run dev`
2. Navigate to the login page
3. Click "Continue with GitHub"
4. You should be redirected to GitHub for authorization
5. After authorizing, you should be redirected back to your application and logged in

## Troubleshooting

If you still encounter issues:

1. Check browser console for specific error messages
2. Verify that your GitHub OAuth app's callback URL matches exactly with what Supabase expects
3. Make sure your local application URL (localhost:port) is correctly added to the Supabase redirect URLs
4. Try clearing browser cookies and local storage before testing again
