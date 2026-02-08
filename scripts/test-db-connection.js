/**
 * Test database connection and Users table
 * Run with: node scripts/test-db-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
  database: process.env.DB_DATABASE || 'MyApp',
  user: process.env.DB_USER || 'logistics_user',
  password: process.env.DB_PASSWORD || 'Logistics@123',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function testConnection() {
  let pool;
  
  try {
    console.log('🔍 Testing database connection...');
    console.log(`   Server: ${config.server}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}`);
    
    pool = await sql.connect(config);
    console.log('✅ Database connection successful!\n');

    // Test if Users table exists
    console.log('🔍 Checking if Users table exists...');
    const tableCheck = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'dbo' 
      AND TABLE_NAME = 'Users'
    `);
    
    if (tableCheck.recordset.length > 0) {
      console.log('✅ Users table exists!\n');
      
      // Check table structure
      console.log('🔍 Checking table structure...');
      const columns = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'dbo' 
        AND TABLE_NAME = 'Users'
        ORDER BY ORDINAL_POSITION
      `);
      
      console.log('   Columns:');
      columns.recordset.forEach(col => {
        console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}, ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'})`);
      });
      console.log('');
      
      // Check if we can insert a test record
      console.log('🔍 Testing INSERT query...');
      try {
        const testResult = await pool.request()
          .input('username', sql.NVarChar, 'test_user_' + Date.now())
          .input('email', sql.NVarChar, 'test@example.com')
          .input('password_hash', sql.NVarChar, 'test_hash')
          .input('role', sql.NVarChar, 'user')
          .query(`
            INSERT INTO [MyApp].[dbo].[Users] (username, email, password_hash, role, created_at)
            OUTPUT INSERTED.id, INSERTED.username
            VALUES (@username, @email, @password_hash, @role, GETDATE())
          `);
        
        console.log('✅ INSERT query works!');
        console.log(`   Test record created with ID: ${testResult.recordset[0].id}`);
        
        // Clean up test record
        await pool.request()
          .input('id', sql.Int, testResult.recordset[0].id)
          .query('DELETE FROM [MyApp].[dbo].[Users] WHERE id = @id');
        console.log('✅ Test record cleaned up\n');
        
      } catch (insertError) {
        console.error('❌ INSERT query failed:');
        console.error(`   ${insertError.message}\n`);
      }
      
    } else {
      console.log('❌ Users table does NOT exist!');
      console.log('   Please run: database/create-users-table.sql\n');
    }
    
    // Check existing users
    console.log('🔍 Checking existing users...');
    const users = await pool.request().query(`
      SELECT id, username, email, role, created_at
      FROM [MyApp].[dbo].[Users]
      ORDER BY created_at DESC
    `);
    
    if (users.recordset.length > 0) {
      console.log(`   Found ${users.recordset.length} user(s):`);
      users.recordset.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - Role: ${user.role}`);
      });
    } else {
      console.log('   No users found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:');
    console.error(`   ${error.message}`);
    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n✅ Connection closed');
    }
  }
}

testConnection();



