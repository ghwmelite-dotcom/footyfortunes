/**
 * Create admin user with fresh password hash
 */

import bcrypt from 'bcryptjs';

async function createAdminSQL() {
  const password = 'Admin123!@#';
  const hash = await bcrypt.hash(password, 10);

  console.log('-- Admin User SQL');
  console.log('-- Email: admin@footyfortunes.com');
  console.log('-- Password: Admin123!@#');
  console.log('');
  console.log(`DELETE FROM users WHERE email = 'admin@footyfortunes.com';`);
  console.log('');
  console.log(`INSERT INTO users (email, password_hash, username, full_name, role, status, created_at) VALUES`);
  console.log(`('admin@footyfortunes.com', '${hash}', 'admin', 'Admin User', 'admin', 'active', datetime('now'));`);
}

createAdminSQL();
