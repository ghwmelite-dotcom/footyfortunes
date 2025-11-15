/**
 * Generate Test Users with Bcrypt Hashed Passwords
 * Run this to create test users with secure password hashes
 */

import bcrypt from 'bcryptjs';

const testUsers = [
  {
    email: 'admin@footyfortunes.com',
    password: 'Admin123!@#',
    username: 'admin',
    fullName: 'Admin User',
    role: 'admin'
  },
  {
    email: 'tipster@footyfortunes.com',
    password: 'Tipster123!@#',
    username: 'protipster',
    fullName: 'Pro Tipster',
    role: 'tipster'
  },
  {
    email: 'user1@example.com',
    password: 'User123!@#',
    username: 'betmaster',
    fullName: 'John Doe',
    role: 'user'
  },
  {
    email: 'user2@example.com',
    password: 'User123!@#',
    username: 'predictor99',
    fullName: 'Jane Smith',
    role: 'user'
  },
  {
    email: 'test@test.com',
    password: 'Test123!@#',
    username: 'testuser',
    fullName: 'Test User',
    role: 'user'
  }
];

async function generateUserInserts() {
  console.log('-- ============================================================================');
  console.log('-- TEST USERS WITH BCRYPT HASHED PASSWORDS');
  console.log('-- ============================================================================\n');

  for (const user of testUsers) {
    const hash = await bcrypt.hash(user.password, 10);

    console.log(`-- User: ${user.email} | Password: ${user.password}`);
    console.log(`INSERT INTO users (email, password_hash, username, full_name, role, status, created_at) VALUES`);
    console.log(`('${user.email}', '${hash}', '${user.username}', '${user.fullName}', '${user.role}', 'active', datetime('now'));\n`);

    // Also output to a SQL file
  }

  console.log('\n-- ============================================================================');
  console.log('-- CREDENTIALS FOR TESTING');
  console.log('-- ============================================================================\n');

  testUsers.forEach(user => {
    console.log(`${user.role.toUpperCase().padEnd(10)} | Email: ${user.email.padEnd(30)} | Password: ${user.password}`);
  });
}

generateUserInserts().catch(console.error);
