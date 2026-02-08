import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { getUserByUsername, getUserByEmail, verifyPassword, createUser } from '@/lib/auth';

// Build providers array conditionally
const providers: any[] = [
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
        console.error('Authentication error:', error);
        return null;
      }
    },
  }),
];

// Only add Google provider if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign-in/sign-up
      if (account?.provider === 'google' && user.email) {
        try {
          // Check if user exists
          let dbUser = await getUserByEmail(user.email);
          
          // If user doesn't exist, create one (Google Sign-Up)
          if (!dbUser) {
            // Generate a unique username from email
            let username = user.email.split('@')[0];
            let counter = 1;
            
            // Ensure username is unique
            while (await getUserByUsername(username)) {
              username = `${user.email.split('@')[0]}${counter}`;
              counter++;
            }
            
            dbUser = await createUser(
              username,
              user.email,
              '', // No password for OAuth users
              'user'
            );
            
            if (!dbUser) {
              console.error('Failed to create user from Google OAuth');
              return false;
            }
          }
          
          // Update user object with database user info
          if (dbUser) {
            user.id = dbUser.id.toString();
            user.role = dbUser.role;
            user.name = dbUser.username; // Use database username
          }
          
          return true;
        } catch (error) {
          console.error('Error handling Google sign-in:', error);
          return false;
        }
      }
      
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

