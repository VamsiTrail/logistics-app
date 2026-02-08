import { executeQuery } from './db';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
}

/**
 * Find user by username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const query = `
      SELECT id, username, email, password_hash, role, created_at
      FROM [MyApp].[dbo].[Users]
      WHERE username = @username
    `;
    
    const result = await executeQuery<User>(query, { username });
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Find user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const query = `
      SELECT id, username, email, password_hash, role, created_at
      FROM [MyApp].[dbo].[Users]
      WHERE email = @email
    `;
    
    const result = await executeQuery<User>(query, { email });
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

/**
 * Verify password
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Create new user
 * If password is empty, sets a placeholder hash for OAuth users
 */
export async function createUser(
  username: string,
  email: string,
  password: string,
  role: string = 'user'
): Promise<User | null> {
  try {
    // For OAuth users (empty password), use a placeholder hash
    // OAuth users will never use password authentication
    let passwordHash: string;
    if (!password || password.trim() === '') {
      // Generate a random hash that will never match any password
      passwordHash = await hashPassword('OAUTH_USER_' + Date.now() + Math.random());
    } else {
      passwordHash = await hashPassword(password);
    }
    
    const query = `
      INSERT INTO [MyApp].[dbo].[Users] (username, email, password_hash, role, created_at)
      OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.password_hash, INSERTED.role, INSERTED.created_at
      VALUES (@username, @email, @password_hash, @role, GETDATE())
    `;
    
    const result = await executeQuery<User>(query, {
      username,
      email,
      password_hash: passwordHash,
      role,
    });
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Check if it's a duplicate key error
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes('unique') || errorMsg.includes('duplicate')) {
        throw new Error('Username or email already exists');
      }
      if (errorMsg.includes('invalid object name') || errorMsg.includes('table')) {
        throw new Error('Users table does not exist. Please run the create-users-table.sql script.');
      }
      if (errorMsg.includes('login failed') || errorMsg.includes('connection')) {
        throw new Error('Database connection failed. Please check your database configuration.');
      }
      // Re-throw with original message for better debugging
      throw error;
    }
    throw new Error('Failed to create user. Unknown error occurred.');
  }
}

