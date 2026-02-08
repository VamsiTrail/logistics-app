# Authentication Setup Guide

This guide will help you set up the authentication system for the Container Data Entry application.

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- `next-auth` - Authentication library
- `bcryptjs` - Password hashing
- All other required dependencies

## Step 2: Create Users Table

Run the SQL script to create the Users table:

1. Open SQL Server Management Studio
2. Connect to your `localhost\SQLEXPRESS` instance
3. Open the database `MyApp`
4. Run the script: `database/create-users-table.sql`

This will create:
- `Users` table with proper indexes
- Columns: id, username, email, password_hash, role, created_at

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DB_SERVER=localhost\SQLEXPRESS
DB_DATABASE=MyApp
DB_USER=logistics_user
DB_PASSWORD=Logistics@123
DB_ENCRYPT=false

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as `NEXTAUTH_SECRET` in `.env.local`.

## Step 4: Create Admin User

### Option 1: Using Node.js Script (Recommended)

```bash
node scripts/create-admin-user.js
```

Follow the prompts to enter:
- Username
- Email
- Password
- Role (default: admin)

### Option 2: Manual SQL Insert

1. Generate a password hash using bcrypt
2. Insert into Users table manually

**Note**: The password hash must be generated using bcrypt with 10 rounds.

## Step 5: Google OAuth Setup (Optional)

If you want to enable Google Sign-In:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure OAuth consent screen (if not done)
6. Application type: Web application
7. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
8. Copy Client ID and Client Secret to `.env.local`

## Step 6: Start the Application

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

## Step 7: Test Login

1. Navigate to `http://localhost:3000`
2. You should be redirected to `/login`
3. Sign in with your admin credentials
4. You should be redirected to the dashboard

## Troubleshooting

### "Unauthorized" Error

- Check that you're logged in
- Verify session is valid (check browser cookies)
- Ensure `NEXTAUTH_SECRET` is set correctly

### "Invalid credentials"

- Verify username and password are correct
- Check that user exists in the database
- Ensure password hash was generated correctly

### Google Sign-In Not Working

- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check redirect URI matches exactly: `http://localhost:3000/api/auth/callback/google`
- Ensure OAuth consent screen is configured

### Database Connection Issues

- Verify SQL Server is running
- Check database credentials in `.env.local`
- Ensure `Users` table exists
- Test connection using SQL Server Management Studio

## Security Notes

1. **Change Default Passwords**: After first login, change the default admin password
2. **Use Strong Secrets**: Generate strong `NEXTAUTH_SECRET` using openssl
3. **Environment Variables**: Never commit `.env.local` to version control
4. **HTTPS in Production**: Use HTTPS in production environments
5. **Password Policy**: Enforce strong password policies for users

## Next Steps

After setup:
1. Create additional users as needed
2. Configure user roles (admin, user, etc.)
3. Set up production environment variables
4. Configure production database connection
5. Set up SSL/TLS certificates for HTTPS


