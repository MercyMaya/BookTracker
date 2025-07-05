CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash CHAR(255)    NOT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  google_id   VARCHAR(40)  NOT NULL UNIQUE,
  title       VARCHAR(255) NOT NULL,
  author      VARCHAR(255),
  cover_url   VARCHAR(255),
  description TEXT
);

CREATE TABLE user_books (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  book_id      INT UNSIGNED NOT NULL,
  status       ENUM('want','reading','finished') DEFAULT 'want',
  rating       TINYINT UNSIGNED,
  review       TEXT,
  pages_read   INT UNSIGNED DEFAULT 0,
  started_at   DATE,
  finished_at  DATE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user     FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_book     FOREIGN KEY (book_id)  REFERENCES books(id)  ON DELETE CASCADE,
  UNIQUE KEY ux_user_book (user_id, book_id)
);
