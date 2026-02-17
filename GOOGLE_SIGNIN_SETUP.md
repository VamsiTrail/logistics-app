# Google Sign-In Setup Guide

## ✅ Implementation Complete

All required changes have been implemented to ensure Google Sign-In works correctly in both local and deployed environments.

## Changes Made

### 1. **lib/auth-options.ts** ✅
- ✅ Properly configured GoogleProvider with environment variable validation
- ✅ Added fallback handling when Google credentials are missing
- ✅ Improved error handling and logging
- ✅ Enhanced user creation logic for Google OAuth users
- ✅ Unique username generation from email
- ✅ Proper NEXTAUTH_URL handling for production

### 2. **app/api/auth/[...nextauth]/route.ts** ✅
- ✅ Clean implementation - only exports GET and POST handlers
- ✅ Imports authOptions from shared configuration file

### 3. **components/GoogleSignInButton.tsx** ✅
- ✅ Correctly calls `signIn('google')`
- ✅ Shows meaningful error messages
- ✅ Proper loading states
- ✅ Error handling and display

## Environment Variables Required

### Required (Always)
```env
NEXTAUTH_SECRET=your-secret-key-here
```

### Required (Production)
```env
NEXTAUTH_URL=https://your-domain.com
```

### Optional (For Google Sign-In)
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## How It Works

### Google Sign-In Flow

1. **User clicks "Sign in with Google"**
   - Button calls `signIn('google')`
   - Redirects to Google OAuth consent screen

2. **Google Authentication**
   - User authenticates with Google
   - Google redirects back to `/api/auth/callback/google`

3. **User Creation (if new)**
   - System checks if email exists in database
   - If not, automatically creates new user:
     - Username: Generated from email (e.g., `john.doe@gmail.com` → `john_doe`)
     - Email: From Google account
     - Password: Placeholder hash (OAuth users don't use passwords)
     - Role: `user` (default)

4. **Session Creation**
   - JWT token created with user info
   - User redirected to dashboard (`/`)

### Error Handling

- **Missing Google Credentials**: App continues to work, Google button won't appear
- **Database Errors**: Logged to console, user sees error message
- **OAuth Errors**: Displayed to user with clear messages

## Testing

### Local Testing

1. Set up environment variables in `.env.local`:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Navigate to `/login` or `/register`
4. Click "Sign in with Google"
5. Complete Google OAuth flow
6. Verify you're redirected to dashboard

### Production Testing (Vercel)

1. Set environment variables in Vercel dashboard:
   - `NEXTAUTH_URL` = Your production URL
   - `NEXTAUTH_SECRET` = Your secret key
   - `GOOGLE_CLIENT_ID` = Your Google Client ID
   - `GOOGLE_CLIENT_SECRET` = Your Google Client Secret

2. Update Google OAuth redirect URI:
   - Go to Google Cloud Console
   - Add: `https://your-domain.com/api/auth/callback/google`

3. Deploy and test

## Google OAuth Setup

### Step 1: Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API" or "Google Identity Services"
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Application type: **Web application**
6. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`

### Step 2: Copy Credentials

- Copy **Client ID** → `GOOGLE_CLIENT_ID`
- Copy **Client Secret** → `GOOGLE_CLIENT_SECRET`

### Step 3: Add to Environment Variables

Add to `.env.local` (development) or Vercel (production):
```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

## Features

### ✅ Automatic User Creation
- New Google users are automatically added to database
- Unique username generated from email
- Default role assigned

### ✅ Error Handling
- Graceful fallback when Google OAuth not configured
- Clear error messages for users
- Detailed logging for debugging

### ✅ Production Ready
- Proper NEXTAUTH_URL handling
- Environment variable validation
- Secure session management

### ✅ User Experience
- Loading states during authentication
- Error messages displayed to user
- Automatic redirect after successful login

## Troubleshooting

### "Configuration error" on login page
- **Cause**: Missing `NEXTAUTH_SECRET`
- **Fix**: Set `NEXTAUTH_SECRET` in environment variables

### Google Sign-In button not appearing
- **Cause**: Google credentials not configured
- **Fix**: Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### "Redirect URI mismatch" error
- **Cause**: Redirect URI in Google Console doesn't match
- **Fix**: Add exact URL to Google OAuth redirect URIs:
  - `http://localhost:3000/api/auth/callback/google` (dev)
  - `https://your-domain.com/api/auth/callback/google` (prod)

### User not created in database
- **Cause**: Database permissions or connection issue
- **Fix**: Check database connection and permissions
- **Verify**: Run `database/grant-permissions.sql`

### Session not persisting
- **Cause**: `NEXTAUTH_URL` mismatch
- **Fix**: Ensure `NEXTAUTH_URL` matches your actual domain

## Security Notes

1. **Never commit** `.env.local` to version control
2. **Use strong** `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
3. **Keep** Google Client Secret secure
4. **Use HTTPS** in production
5. **Validate** all environment variables before deployment

## Next Steps

1. ✅ Google Sign-In is now fully configured
2. ✅ Test locally with your Google credentials
3. ✅ Deploy to Vercel with production environment variables
4. ✅ Verify Google OAuth redirect URI is correct
5. ✅ Test user registration and login flow

## Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Check Google Cloud Console for OAuth configuration
4. Verify database permissions are granted



