-- 1️⃣ Catégories de tags
CREATE TABLE IF NOT EXISTS tag_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- 2️⃣ Tags (liés à une catégorie)
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (category_id) REFERENCES tag_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- 3️⃣ Table pivot entre recruteur et tags
CREATE TABLE IF NOT EXISTS recruiter_tag (
    recruiter_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (recruiter_id, tag_id),
    FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);