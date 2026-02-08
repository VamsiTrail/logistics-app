# Authentication System Guide

## Overview

The application now has a complete authentication system with:
- **User Registration** - Users can create accounts with username, email, and password
- **Login** - Users can sign in with username/password
- **Google Sign-In/Sign-Up** - Users can authenticate using Google OAuth

## User Registration

### Registration Page
- **URL**: `/register`
- **Fields Required**:
  - Username (minimum 3 characters, must be unique)
  - Email (valid email format, must be unique)
  - Password (minimum 6 characters)
  - Confirm Password (must match password)

### Registration Process

1. User fills out the registration form
2. System validates:
   - All fields are filled
   - Email format is valid
   - Password is at least 6 characters
   - Passwords match
   - Username is unique
   - Email is unique
3. Password is hashed using bcrypt (10 rounds)
4. User is created in the `Users` table in SQL Server
5. User is redirected to login page with success message

### API Endpoint

**POST** `/api/auth/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Username already exists"
}
```

## Login

### Login Page
- **URL**: `/login`
- **Fields Required**:
  - Username
  - Password

### Login Process

1. User enters username and password
2. System looks up user by username in database
3. Password is verified against stored hash
4. If valid, JWT session is created
5. User is redirected to dashboard

### Google Sign-In

1. User clicks "Sign in with Google"
2. Google OAuth flow is initiated
3. After Google authentication:
   - If user exists in database (by email), they are logged in
   - If user doesn't exist, a new account is created automatically (Google Sign-Up)
4. User is redirected to dashboard

## Database Schema

### Users Table

```sql
CREATE TABLE [MyApp].[dbo].[Users] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [username] NVARCHAR(50) NOT NULL UNIQUE,
    [email] NVARCHAR(255) NOT NULL UNIQUE,
    [password_hash] NVARCHAR(255) NOT NULL,
    [role] NVARCHAR(50) NOT NULL DEFAULT 'user',
    [created_at] DATETIME NOT NULL DEFAULT GETDATE()
);
```

### User Roles

- `user` - Regular user (default)
- `admin` - Administrator (can be set manually in database)

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with 10 rounds
2. **OAuth Users**: Google OAuth users have a placeholder password hash (they never use password authentication)
3. **Unique Constraints**: Username and email must be unique
4. **Input Validation**: All inputs are validated on both client and server
5. **SQL Injection Protection**: All queries use parameterized statements
6. **JWT Sessions**: Secure session management with JWT tokens

## Testing the System

### Test Registration

1. Navigate to `http://localhost:3000/register`
2. Fill in the form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `test123`
   - Confirm Password: `test123`
3. Click "Create Account"
4. You should be redirected to login page

### Test Login

1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Username: `testuser`
   - Password: `test123`
3. Click "Sign In"
4. You should be redirected to dashboard

### Test Google Sign-In

1. Navigate to `http://localhost:3000/login` or `/register`
2. Click "Sign in with Google"
3. Complete Google OAuth flow
4. If first time, account is created automatically
5. You should be redirected to dashboard

## Troubleshooting

### Registration Fails

**Error: "Username already exists"**
- The username is already taken. Choose a different username.

**Error: "Email already exists"**
- The email is already registered. Use a different email or try logging in.

**Error: "Password must be at least 6 characters"**
- Use a password with at least 6 characters.

**Error: "Passwords do not match"**
- Make sure both password fields match exactly.

### Login Fails

**Error: "Invalid username or password"**
- Check that username and password are correct
- Verify user exists in database
- Check that password hash in database is correct

### Google Sign-In Issues

**Error: "Configuration"**
- Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env.local`
- Verify Google OAuth credentials are correct
- Check redirect URI matches: `http://localhost:3000/api/auth/callback/google`

### Database Issues

**Error: "Failed to create user"**
- Check database connection
- Verify Users table exists
- Check database permissions
- Look at server logs for detailed error messages

## Admin User Setup

To create an admin user, you can:

1. **Use the Node.js script:**
   ```bash
   node scripts/create-admin-user.js
   ```
   When prompted, enter role as `admin`

2. **Manually update in database:**
   ```sql
   UPDATE [MyApp].[dbo].[Users]
   SET role = 'admin'
   WHERE username = 'your_username';
   ```

## Next Steps

After setting up authentication:

1. Create your first admin user
2. Test registration and login
3. Test Google Sign-In (if configured)
4. Verify all routes are protected
5. Test logout functionality

## API Reference

### Registration API

- **Endpoint**: `POST /api/auth/register`
- **Authentication**: Not required
- **Body**: `{ username, email, password }`
- **Returns**: User object or error message

### Login API

- **Endpoint**: `POST /api/auth/signin` (handled by NextAuth)
- **Authentication**: Not required
- **Body**: `{ username, password }` (via NextAuth credentials provider)
- **Returns**: JWT session token

### Google OAuth

- **Endpoint**: `GET /api/auth/signin/google` (handled by NextAuth)
- **Authentication**: Not required
- **Flow**: OAuth 2.0 redirect flow
- **Returns**: JWT session token



