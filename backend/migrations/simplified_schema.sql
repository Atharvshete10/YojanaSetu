-- Simplified MySQL Schema for YojanaSetu

CREATE DATABASE IF NOT EXISTS yojanasetu;
USE yojanasetu;

-- Schemes Table
CREATE TABLE IF NOT EXISTS schemes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    link VARCHAR(500) NOT NULL UNIQUE,
    date VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenders Table
CREATE TABLE IF NOT EXISTS tenders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    link VARCHAR(500) NOT NULL UNIQUE,
    date VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recruitments Table
CREATE TABLE IF NOT EXISTS recruitments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    link VARCHAR(500) NOT NULL UNIQUE,
    date VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Table (Optional for login)
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Default Admin
INSERT IGNORE INTO admins (username, password) VALUES ('admin', 'admin123');
