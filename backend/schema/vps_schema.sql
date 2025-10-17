-- VPS MySQL Database Schema
-- Heavy tables migrated from Supabase

CREATE DATABASE IF NOT EXISTS project_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE project_manager;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    status VARCHAR(50) DEFAULT 'active',
    color VARCHAR(20) DEFAULT '#3b82f6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Todos table
CREATE TABLE IF NOT EXISTS todos (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium',
    due_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id),
    INDEX idx_completed (completed),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Links table
CREATE TABLE IF NOT EXISTS links (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notes table (160 kB) - Large text content
CREATE TABLE IF NOT EXISTS notes (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    title TEXT NOT NULL,
    content LONGTEXT NOT NULL,
    due_date DATE DEFAULT NULL,
    status_category VARCHAR(50) DEFAULT 'general',
    status_type VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status_category (status_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attachments table (48 kB) - File metadata
CREATE TABLE IF NOT EXISTS attachments (
    id CHAR(36) PRIMARY KEY,
    note_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    name TEXT NOT NULL,
    size INT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_note_id (note_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Meetings table (136 kB)
CREATE TABLE IF NOT EXISTS meetings (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    meeting_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration INT DEFAULT 60,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_meeting_date (meeting_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Meeting Transcripts table (192 kB) - HEAVY - Large text transcripts
CREATE TABLE IF NOT EXISTS meeting_transcripts (
    id CHAR(36) PRIMARY KEY,
    meeting_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    content LONGTEXT NOT NULL,
    speaker TEXT DEFAULT '',
    timestamp_in_meeting TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_meeting_id (meeting_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Meeting Summaries table (112 kB) - Long text summaries
CREATE TABLE IF NOT EXISTS meeting_summaries (
    id CHAR(36) PRIMARY KEY,
    meeting_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    content LONGTEXT NOT NULL,
    key_points TEXT DEFAULT '',
    action_items TEXT DEFAULT '',
    decisions TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_meeting_id (meeting_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Meeting Todos table (120 kB)
CREATE TABLE IF NOT EXISTS meeting_todos (
    id CHAR(36) PRIMARY KEY,
    meeting_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    assigned_to TEXT DEFAULT '',
    due_date DATE DEFAULT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_meeting_id (meeting_id),
    INDEX idx_user_id (user_id),
    INDEX idx_completed (completed),
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Knowledge Topics table
CREATE TABLE IF NOT EXISTS knowledge_topics (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Knowledge Sections table
CREATE TABLE IF NOT EXISTS knowledge_sections (
    id CHAR(36) PRIMARY KEY,
    topic_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    title TEXT NOT NULL,
    content LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_topic_id (topic_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (topic_id) REFERENCES knowledge_topics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Knowledge Tiles table (360 kB) - VERY HEAVY
CREATE TABLE IF NOT EXISTS knowledge_tiles (
    id CHAR(36) PRIMARY KEY,
    section_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    title TEXT NOT NULL,
    content LONGTEXT NOT NULL,
    image_url TEXT DEFAULT NULL,
    image_name TEXT DEFAULT NULL,
    image_size INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_section_id (section_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (section_id) REFERENCES knowledge_sections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project Configurations table (112 kB)
CREATE TABLE IF NOT EXISTS project_configurations (
    id CHAR(36) PRIMARY KEY,
    project_id CHAR(36) NOT NULL UNIQUE,
    user_id CHAR(36) NOT NULL,
    is_master BOOLEAN DEFAULT FALSE,
    brd_content LONGTEXT DEFAULT '',
    business_profile_url TEXT DEFAULT NULL,
    business_map_url TEXT DEFAULT NULL,
    business_profile_name TEXT DEFAULT NULL,
    business_map_name TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_master (is_master)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Configurator Blocks table (104 kB)
CREATE TABLE IF NOT EXISTS configurator_blocks (
    id CHAR(36) PRIMARY KEY,
    configuration_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    block_name TEXT NOT NULL,
    block_order INT NOT NULL,
    image_url TEXT DEFAULT NULL,
    image_name TEXT DEFAULT NULL,
    image_size INT DEFAULT NULL,
    text_content LONGTEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_configuration_id (configuration_id),
    INDEX idx_user_id (user_id),
    INDEX idx_block_order (block_order),
    FOREIGN KEY (configuration_id) REFERENCES project_configurations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
