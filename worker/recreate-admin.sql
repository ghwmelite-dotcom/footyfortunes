-- Recreate admin user with correct password hash
DELETE FROM users WHERE email = 'admin@footyfortunes.com';

INSERT INTO users (email, password_hash, username, full_name, role, status, created_at) VALUES
('admin@footyfortunes.com', '$2a$10$720ujNO.HgnQjlAznVDIDeBscSJD/JZFw.jf3NyJ/Qf/V9gT2fTXu', 'admin', 'Admin User', 'admin', 'active', datetime('now'));
