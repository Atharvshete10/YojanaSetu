-- SQLite Schema for YojanaSetu

-- Table: schemes
CREATE TABLE IF NOT EXISTS schemes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    eligibility TEXT,
    benefits TEXT,
    state TEXT,
    category TEXT,
    launch_date TEXT,
    deadline TEXT,
    official_link TEXT,
    source TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(title, source)
);

-- Table: tenders
CREATE TABLE IF NOT EXISTS tenders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    department TEXT,
    state TEXT,
    location TEXT,
    budget TEXT,
    publish_date TEXT,
    deadline TEXT,
    official_link TEXT,
    source TEXT,
    UNIQUE(title, source)
);

-- Table: jobs
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    department TEXT,
    state TEXT,
    qualification TEXT,
    salary TEXT,
    deadline TEXT,
    apply_link TEXT,
    source TEXT,
    UNIQUE(title, source)
);
