# Container Data Entry App with Authentication

A modern web application built with Next.js that allows authenticated logistics users to view records from a SQL Server database and manually enter missing Container_Id values.

## Features

- **Authentication System**: Secure login with username/password and Google Sign-In
- **Protected Routes**: All pages and API endpoints require authentication
- **View Records**: Display all records from `Container_List` table where `Container_Id IS NULL`
- **Inline Editing**: Click Edit button to enter Container_Id directly in the table
- **Data Validation**: Ensures Container_Id is not empty before saving
- **Auto-Refresh**: Updated records are automatically removed from the list after successful save
- **Session Management**: JWT-based sessions with secure cookies
- **Modern UI**: Clean, professional design built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Database Driver**: mssql (Microsoft SQL Server)
- **Password Hashing**: bcryptjs
- **Icons**: Lucide React

## Database Configuration

### SQL Server Setup

- **Instance**: `localhost\SQLEXPRESS`
- **Database**: `MyApp`
- **Table**: `[MyApp].[dbo].[Container_List]`
- **Authentication**: SQL Authentication (username & password)

### Required Tables

1. **Container_List** (existing table)
   - `Inv_Number` (varchar/nvarchar, primary key)
   - `Container_Id` (varchar/nvarchar, nullable)
   - `Delivery_Notes` (varchar/nvarchar, nullable)
   - `Shippining_Line` (varchar/nvarchar, nullable)

2. **Users** (new table for authentication)
   - `id` (int, primary key, identity)
   - `username` (nvarchar(50), unique)
   - `email` (nvarchar(255), unique)
   - `password_hash` (nvarchar(255))
   - `role` (nvarchar(50), default 'user')
   - `created_at` (datetime)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- SQL Server with `localhost\SQLEXPRESS` instance
- Database `MyApp` with `Container_List` table
- Google OAuth credentials (for Google Sign-In - optional)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create the Users table in SQL Server:
```sql
-- Run the script in database/create-users-table.sql
```

3. Set up environment variables in `.env.local`:
```env
# Database Configuration
DB_SERVER=localhost\SQLEXPRESS
DB_DATABASE=MyApp
DB_USER=logistics_user
DB_PASSWORD=Logistics@123
DB_ENCRYPT=false

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# Google OAuth (Optional - for Google Sign-In)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

4. Generate NextAuth secret:
```bash
openssl rand -base64 32
```

5. Create an admin user:
```bash
# Option 1: Use the Node.js script
node scripts/create-admin-user.js

# Option 2: Use SQL script (requires manual password hash generation)
# See database/seed-admin-user.sql
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DB_SERVER` | SQL Server instance | No | `localhost\SQLEXPRESS` |
| `DB_DATABASE` | Database name | No | `MyApp` |
| `DB_USER` | Database username | No | `logistics_user` |
| `DB_PASSWORD` | Database password | No | `Logistics@123` |
| `DB_ENCRYPT` | Enable encryption | No | `false` |
| `NEXTAUTH_URL` | Application URL | Yes | - |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Yes | - |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | No* | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | No* | - |

*Required only if using Google Sign-In

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

## Usage

### Login

1. Navigate to `/login` (or you'll be redirected automatically)
2. Sign in using:
   - **Username/Password**: Enter your credentials
   - **Google Sign-In**: Click "Sign in with Google" button

### Using the Application

1. **View Records**: After login, the table automatically displays all records where `Container_Id IS NULL`
2. **Edit Container_Id**: Click the "Edit" button in the Actions column
3. **Enter Container_Id**: Type the container ID value in the input field
4. **Save**: Click the checkmark (✓) to save, or X to cancel
5. **Auto-Removal**: After successful save, the record is automatically removed from the list

### Logout

Click the "Sign Out" button in the top right corner.

## Security

- **Password Hashing**: All passwords are hashed using bcrypt (10 rounds)
- **JWT Sessions**: Secure session management with JWT tokens
- **Protected Routes**: Middleware protects all routes except login
- **Parameterized Queries**: All database queries use parameters to prevent SQL injection
- **Secure Cookies**: Session cookies are httpOnly and secure

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts      # NextAuth configuration
│   │   └── logistics/
│   │       └── route.ts          # Protected API endpoints
│   ├── login/
│   │   └── page.tsx               # Login page
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main dashboard (protected)
├── components/
│   ├── LoginForm.tsx              # Login form component
│   ├── GoogleSignInButton.tsx    # Google sign-in button
│   ├── LogoutButton.tsx          # Logout button
│   └── LogisticsTable.tsx        # Main data table component
├── lib/
│   ├── auth.ts                    # Authentication utilities
│   └── db.ts                      # Database connection utility
├── middleware.ts                  # Route protection middleware
├── types/
│   └── next-auth.d.ts            # NextAuth TypeScript types
└── database/
    ├── create-users-table.sql    # SQL script to create Users table
    └── seed-admin-user.sql       # SQL script to seed admin user
```

## API Endpoints

### GET /api/logistics

Fetches all records from `Container_List` where `Container_Id IS NULL`.

**Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "Inv_Number": "INV-001",
      "Container_Id": null,
      "Delivery_Notes": "Notes here",
      "Shippining_Line": "Line name"
    }
  ]
}
```

### PUT /api/logistics

Updates `Container_Id` for a specific record identified by `Inv_Number`.

**Authentication**: Required

**Request Body:**
```json
{
  "Inv_Number": "INV-001",
  "Container_Id": "CONT-12345"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "Inv_Number": "INV-001",
    "Container_Id": "CONT-12345",
    "Delivery_Notes": "Notes here",
    "Shippining_Line": "Line name"
  }
}
```

## Troubleshooting

### Authentication Issues

1. **"Unauthorized" errors**: Make sure you're logged in and session is valid
2. **Login not working**: Check database connection and Users table exists
3. **Google Sign-In not working**: Verify Google OAuth credentials in `.env.local`

### Database Issues

1. **Connection errors**: Verify SQL Server is running and credentials are correct
2. **Table not found**: Run the `create-users-table.sql` script
3. **User creation fails**: Check database permissions

### Common Errors

- **"Invalid credentials"**: Username or password is incorrect
- **"Session expired"**: Log out and log back in
- **"Database connection error"**: Check database server and credentials

## Development

### Building for Production

```bash
npm run build
npm start
```

### Creating Users

Use the provided script:
```bash
node scripts/create-admin-user.js
```

Or create users programmatically using the `createUser` function from `lib/auth.ts`.

## License

Private - Internal Use Only
