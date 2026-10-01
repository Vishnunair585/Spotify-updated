-- ============================================================================
-- Spotify Web Application - Basic Database Schema (User Credentials)
-- Database: spotify_db
-- Compatible with MySQL 8.0 / MySQL Workbench
-- ============================================================================

DROP DATABASE IF EXISTS spotify_db;
CREATE DATABASE spotify_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE spotify_db;

-- ----------------------------------------------------------------------------
-- Table: users (Stores user credentials and profile details)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- Seed Initial User Credentials
-- ----------------------------------------------------------------------------
INSERT INTO users (id, full_name, username, email, password) VALUES
(1, 'Vishnu Nair', 'vishnu', 'vishnu@example.com', 'password123'),
(2, 'Demo User', 'demouser', 'demo@spotify.com', 'demo123');

-- ============================================================================
-- BASIC SQL QUERIES (SIGN UP, SIGN IN & FETCH DETAILS)
-- ============================================================================

-- 1. Sign Up (Store new user credentials in the database):
-- INSERT INTO users (full_name, username, email, password) 
-- VALUES ('Your Name', 'yourusername', 'you@example.com', 'yourpassword');

-- 2. Sign In (Authenticate user against database credentials):
-- SELECT id, full_name, username, email, created_at 
-- FROM users 
-- WHERE (email = 'you@example.com' OR username = 'yourusername') AND password = 'yourpassword';

-- 3. Fetch User Details by ID or Email:
-- SELECT id, full_name, username, email, created_at 
-- FROM users 
-- WHERE id = 1;

-- 4. Check All Stored User Credentials in MySQL Workbench:
-- SELECT * FROM users ORDER BY id DESC;
