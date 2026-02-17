import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { getUserByUsername, getUserByEmail, verifyPassword, createUser } from '@/lib/auth';

/**
 * Validate environment variables for NextAuth
 */
function validateNextAuthConfig() {
  const errors: string[] = [];

  if (!process.env.NEXTAUTH_SECRET) {
    errors.push('NEXTAUTH_SECRET is not set');
  }

  // NEXTAUTH_URL is optional in development but required in production
  if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_URL) {
    errors.push('NEXTAUTH_URL is required in production');
  }

  if (errors.length > 0) {
    console.warn('NextAuth Configuration Warnings:', errors.join(', '));
  }
}

// Validate configuration on module load
validateNextAuthConfig();

/**
 * Check if Google OAuth is configured
 */
function isGoogleOAuthConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID.trim() !== '' &&
    process.env.GOOGLE_CLIENT_SECRET.trim() !== ''
  );
}

/**
 * Get NEXTAUTH_URL with fallback for development
 */
function getNextAuthUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // Fallback for development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // Production fallback (should not happen if properly configured)
  return 'https://your-domain.com';
}

// Build providers array
const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      username: { label: 'Username', type: 'text' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.username || !credentials?.password) {
        return null;
      }

      try {
        const user = await getUserByUsername(credentials.username);
        if (!user) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password, user.password_hash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          name: user.username,
          email: user.email,
          role: user.role,
        };
      } catch (error) {
        console.error('Credentials authentication error:', error);
        return null;
      }
    },
  }),
];

// Add Google Provider only if credentials are configured
if (isGoogleOAuthConfigured()) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  );
  console.log('✅ Google OAuth provider configured');
} else {
  console.warn('⚠️ Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable.');
}

export const authOptions: NextAuthOptions = {
  providers,
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign-in/sign-up
      if (account?.provider === 'google' && user.email) {
        try {
          // Check if user exists in database
          let dbUser = await getUserByEmail(user.email);

          // If user doesn't exist, create a new one (Google Sign-Up)
          if (!dbUser) {
            // Generate a unique username from email
            let baseUsername = user.email.split('@')[0];
            // Remove special characters and make it valid
            baseUsername = baseUsername.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
            
            let username = baseUsername;
            let counter = 1;
            
            // Ensure username is unique
            while (await getUserByUsername(username)) {
              username = `${baseUsername}${counter}`;
              counter++;
              
              // Prevent infinite loop
              if (counter > 1000) {
                throw new Error('Unable to generate unique username');
              }
            }

            // Create new user in database
            dbUser = await createUser(username, user.email, '', 'user');
            
            if (!dbUser) {
              console.error('Failed to create user from Google OAuth');
              return false;
            }
            
            console.log(`✅ New user created from Google OAuth: ${username} (${user.email})`);
          }

          // Update user object with database user info
          if (dbUser) {
            user.id = dbUser.id.toString();
            user.role = dbUser.role;
            user.name = dbUser.username; // Use database username instead of Google name
          }

          return true;
        } catch (error) {
          console.error('Error handling Google sign-in:', error);
          // Don't block sign-in if there's an error, but log it
          // Return false to prevent sign-in on critical errors
          if (error instanceof Error && error.message.includes('Unable to generate')) {
            return false;
          }
          // For other errors, allow sign-in but log the issue
          return true;
        }
      }

      // Allow all other sign-in methods
      return true;
    },

    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        // Ensure name is set
        if (!session.user.name && token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login', // Redirect errors to login page
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
  
  // Ensure proper URL handling
  debug: process.env.NODE_ENV === 'development',
};
