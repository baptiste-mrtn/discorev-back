DROP DATABASE IF EXISTS discorev;
CREATE DATABASE discorev;
USE discorev;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    profile_picture VARCHAR(255),
    account_type ENUM('candidate', 'recruiter') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    newsletter BOOLEAN
);
CREATE TABLE candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date_of_birth DATE,
    location VARCHAR(255),
    education TEXT,
    experience TEXT,
    skills TEXT,
    languages TEXT,
    resume VARCHAR(255),
    job_preferences TEXT,
    applications TEXT,
    likes TEXT,
    portfolio TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE recruiters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_name VARCHAR(255),
    siret VARCHAR(20) UNIQUE,
    company_logo VARCHAR(255),
    company_description TEXT,
    location VARCHAR(255),
    website VARCHAR(255),
    sector VARCHAR(100),
    team_size VARCHAR(50),
    contact_person TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NULL,
    sender_type ENUM('candidate', 'recruiter') NOT NULL,
    title VARCHAR(255) NOT NULL,
    type ENUM('cv', 'contract', 'offer_letter', 'other') NOT NULL,
    visibility ENUM('public', 'private', 'shared') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE document_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    receiver_id INT NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE medias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uploader_id INT NOT NULL,
    uploader_type ENUM('candidate', 'recruiter', 'admin', 'user') NOT NULL,
    type ENUM(
        'profile_picture',
        'company_logo',
        'company_banner',
        'company_image',
        'company_video',
        'other'
    ) NOT NULL,
    context ENUM(
        'user_profile',
        'company_page',
        'job_offer',
        'article',
        'other'
    ) NOT NULL,
    target_id INT NULL,
    target_type ENUM(
        'user',
        'recruiter',
        'candidate',
        'job_offer',
        'page',
        'other'
    ) NULL,
    title VARCHAR(255) NULL,
    file_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NULL,
    thumbnail_path VARCHAR(255) NULL,
    visibility ENUM('public', 'private', 'shared') DEFAULT 'public',
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_medias_target ON medias(target_type, target_id);
CREATE INDEX idx_medias_context ON medias(context);
CREATE TABLE media_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    media_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (media_id) REFERENCES medias(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE job_offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    salary_range VARCHAR(50),
    employment_type ENUM('cdi', 'cdd', 'freelance', 'alternance', 'stage'),
    location VARCHAR(255),
    remote BOOLEAN DEFAULT FALSE,
    publication_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiration_date DATETIME,
    status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
    FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE CASCADE
);
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    job_offer_id INT NOT NULL,
    status ENUM(
        'sent',
        'viewed',
        'interview',
        'pending',
        'rejected',
        'accepted'
    ) DEFAULT 'sent',
    date_applied DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_offer_id) REFERENCES job_offers(id) ON DELETE CASCADE
);
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    related_id INT NULL,
    related_type ENUM('document', 'message', 'other') NOT NULL,
    type ENUM('new_document', 'new_message', 'general') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participant1_id INT NOT NULL,
    participant2_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (participant2_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE histories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    related_id INT NULL,
    related_type ENUM(
        'document',
        'message',
        'auth',
        'profile',
        'job_offer',
        'other'
    ) NOT NULL,
    action_type ENUM(
        'create',
        'update',
        'delete',
        'view',
        'login',
        'logout',
        'other'
    ) NOT NULL,
    details TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE `sessions` (
    `id` varchar(255) NOT NULL,
    `user_id` bigint unsigned DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` text,
    `payload` longtext NOT NULL,
    `last_activity` int NOT NULL,
    PRIMARY KEY (`id`),
    KEY `sessions_user_id_index` (`user_id`)
);
CREATE TABLE `cache` (
    `key` varchar(255) NOT NULL,
    `value` mediumtext NOT NULL,
    `expiration` int(11) NOT NULL,
    PRIMARY KEY (`key`)
);