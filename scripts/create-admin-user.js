/**
 * Script to create an admin user in the database
 * Run with: node scripts/create-admin-user.js
 * 
 * This script will prompt for username, email, and password
 * and create a user in the database with hashed password
 */

require('dotenv').config({ path: '.env.local' });
const readline = require('readline');
const { createUser } = require('../lib/auth');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log('=== Create Admin User ===\n');

  const username = await question('Username: ');
  const email = await question('Email: ');
  const password = await question('Password: ');
  const role = await question('Role (default: admin): ') || 'admin';

  console.log('\nCreating user...');

  try {
    const user = await createUser(username, email, password, role);

    if (user) {
      console.log('\n✅ User created successfully!');
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
    } else {
      console.log('\n❌ Failed to create user');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

main();

