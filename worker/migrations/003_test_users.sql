-- ============================================================================
-- TEST USERS WITH BCRYPT HASHED PASSWORDS
-- ============================================================================

-- User: admin@footyfortunes.com | Password: Admin123!@#
INSERT INTO users (email, password_hash, username, full_name, role, status, created_at) VALUES
('admin@footyfortunes.com', '$2a$10$720ujNO.HgnQjlAznVDIDeBscSJD/JZFw.jf3NyJ/Qf/V9gT2fTXu', 'admin', 'Admin User', 'admin', 'active', datetime('now'));

-- User: tipster@footyfortunes.com | Password: Tipster123!@#
INSERT INTO users (email, password_hash, username, full_name, role, status, created_at) VALUES
('tipster@footyfortunes.com', '$2a$10$rYvCc3CgvARnkIfQLt9iN.91u.sfduet6hKCPSLaagJCdlv6831P.', 'protipster', 'Pro Tipster', 'tipster', 'active', datetime('now'));

-- User: user1@example.com | Password: User123!@#
INSERT INTO users (email, password_hash, username, full_name, role, status, created_at) VALUES
('user1@example.com', '$2a$10$kwTLi6rAZFsQVZW.Otmmn.ktwO0NJCp1eQQueCKcfz7/7J4ESKp..', 'betmaster', 'John Doe', 'user', 'active', datetime('now'));

-- User: user2@example.com | Password: User123!@#
INSERT INTO users (email, password_hash, username, full_name, role, status, created_at) VALUES
('user2@example.com', '$2a$10$zlyxYs4FYPSIGWPB1TxXfeW05eLdTulm9lPF6Mb.MQPoABvVP/XgO', 'predictor99', 'Jane Smith', 'user', 'active', datetime('now'));

-- User: test@test.com | Password: Test123!@#
INSERT INTO users (email, password_hash, username, full_name, role, status, created_at) VALUES
('test@test.com', '$2a$10$uYZrNHfWpTaeFGHgXbqKoujITxGCCCPeX6NIFUrgsSRs.Yp4ETNqm', 'testuser', 'Test User', 'user', 'active', datetime('now'));


-- ============================================================================
-- CREDENTIALS FOR TESTING
-- ============================================================================

ADMIN      | Email: admin@footyfortunes.com        | Password: Admin123!@#
TIPSTER    | Email: tipster@footyfortunes.com      | Password: Tipster123!@#
USER       | Email: user1@example.com              | Password: User123!@#
USER       | Email: user2@example.com              | Password: User123!@#
USER       | Email: test@test.com                  | Password: Test123!@#
