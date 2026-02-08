import sql from 'mssql';

// Connection pool (singleton pattern)
let pool: sql.ConnectionPool | null = null;

/**
 * Get or create database connection pool
 * Uses SQL Authentication (username & password)
 */
export async function getDbConnection(): Promise<sql.ConnectionPool> {

  // If pool already exists and is connected, return it
  if (pool && pool.connected) {
    return pool;
  }

  // Create new connection pool using SQL Authentication
  const config: sql.config = {
    server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
    database: process.env.DB_DATABASE || 'MyApp',

    // SQL Authentication credentials
    user: process.env.DB_USER || 'logistics_user',
    password: process.env.DB_PASSWORD || 'Logistics@123',

    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  };

  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();

    console.log('Database connection pool created successfully using SQL Authentication');

    return pool;

  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

/**
 * Execute a query and return results
 */
export async function executeQuery<T = any>(
  query: string,
  params?: Record<string, any>
): Promise<T[]> {

  const connection = await getDbConnection();

  try {
    const request = connection.request();

    // Add parameters if provided
    if (params) {
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });
    }

    const result = await request.query(query);
    return result.recordset as T[];

  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
}

/**
 * Close the database connection pool
 */
export async function closeDbConnection(): Promise<void> {
  if (pool && pool.connected) {
    await pool.close();
    pool = null;
    console.log('Database connection pool closed');
  }
}
