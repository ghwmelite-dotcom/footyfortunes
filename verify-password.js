// Test bcrypt password verification
const bcrypt = require('bcryptjs');

const password = 'Demo123!@#';
const hash = '$2a$10$LQlgR8nTKN.Lcs3C3YEpqeD6PW3re7jzKXolDNRj4p6qAFMWFdZrC';

console.log('Testing password verification...');
console.log('Password:', password);
console.log('Hash:', hash);

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Match:', result);
  }
});

// Also test sync
const syncResult = bcrypt.compareSync(password, hash);
console.log('Sync Match:', syncResult);
