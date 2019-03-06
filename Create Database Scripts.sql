CREATE DATABASE IF NOT EXISTS Scribe;

USE Scribe;

CREATE TABLE IF NOT EXISTS school(
    id tinyint UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS course(
    id int UNSIGNED NOT NULL AUTO_INCREMENT,
    school_id tinyint UNSIGNED NOT NULL,
    name varchar(10) NOT NULL,
    number int UNSIGNED NOT NULL,
    PRIMARY KEY(id, school_id),
    FOREIGN KEY(school_id) REFERENCES school(id) ON DELETE CASCADE,
    UNIQUE KEY(school_id, name, number)
);

CREATE TABLE IF NOT EXISTS user(
	id int UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    picture_path varchar(255),
    sex varchar(6) NOT NULL,
    user_type varchar(10) NOT NULL
    fb_id int UNSIGNED NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS email_user(
	id int UNSIGNED NOT NULL PRIMARY KEY,
    email varchar(254) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    FOREIGN KEY(id) REFERENCES user(id) ON DELETE CASCADE
);

-- CREATE TABLE IF NOT EXISTS fb_user(
-- 	id int UNSIGNED NOT NULL PRIMARY KEY,
--     fb_id int UNSIGNED NOT NULL UNIQUE,
-- 	FOREIGN KEY(id) REFERENCES user(id) ON DELETE CASCADE
-- );

CREATE TABLE IF NOT EXISTS note(
    id int UNSIGNED NOT NULL AUTO_INCREMENT,
    course_id int UNSIGNED NOT NULL,
    user_id int UNSIGNED NOT NULL,
    votes int NOT NULL DEFAULT 0,
    date DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY(id, course_id),
    FOREIGN KEY(course_id) REFERENCES course(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post(
    id int UNSIGNED NOT NULL AUTO_INCREMENT,
    course_id int UNSIGNED NOT NULL,
    user_id int UNSIGNED NOT NULL,
    content VARCHAR(1000) NOT NULL,
    votes int NOT NULL DEFAULT 0,
    comments, int UNSIGNED NOT NULL DEFAULT 0,
	date DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY(id),
    FOREIGN KEY(course_id) REFERENCES course(id) ON DELETE CASCADE,
	FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comment(
    id int UNSIGNED NOT NULL AUTO_INCREMENT,
    post_id int UNSIGNED NOT NULL,
    user_id int UNSIGNED NOT NULL,
    content VARCHAR(1000) NOT NULL,
    votes int NOT NULL DEFAULT 0,
	date DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY(id),
    FOREIGN KEY(post_id) REFERENCES post(id) ON DELETE CASCADE,
	FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subscribed(
	user_id int UNSIGNED NOT NULL,
    course_id int UNSIGNED NOT NULL,
    date DATETIME NOT NULL DEFAULT NOW(),
    PRIMARY KEY(user_id, course_id),
	FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY(course_id) REFERENCES course(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS note_likes(
	note_id int UNSIGNED NOT NULL,
    user_id int UNSIGNED NOT NULL,
    value int NOT NULL DEFAULT 0,
    PRIMARY KEY(note_id, user_id),
    FOREIGN KEY(note_id) REFERENCES note(id) ON DELETE CASCADE,
	FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_likes(
	post_id int UNSIGNED NOT NULL,
    user_id int UNSIGNED NOT NULL,
    value int NOT NULL DEFAULT 0,
    PRIMARY KEY(post_id, user_id),
	FOREIGN KEY(post_id) REFERENCES post(id) ON DELETE CASCADE,
	FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comment_likes(
	comment_id int UNSIGNED NOT NULL,
    user_id int UNSIGNED NOT NULL,
    value int NOT NULL DEFAULT 0,
    PRIMARY KEY(comment_id, user_id),
	FOREIGN KEY(comment_id) REFERENCES comment(id) ON DELETE CASCADE,
	FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS file_path(
	note_id int UNSIGNED NOT NULL,
    file_path varchar(255) NOT NULL,
    ext varchar(16) NOT NULL,
    PRIMARY KEY(note_id, file_path),
    FOREIGN KEY(note_id) REFERENCES note(id) ON DELETE CASCADE
);