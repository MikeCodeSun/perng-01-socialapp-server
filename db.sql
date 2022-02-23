CREATE DATABASE social_app_01;

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(50) NOT NULL CHECK(length(password) >= 6),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_email CHECK(email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

INSERT INTO users(name, email, password) VALUES('jim', 'jim@gmail.com', '123456');

ALTER TABLE users ADD COLUMN image VARCHAR(255); 

INSERT INTO users(name, email, password, image) VALUES('kevin', 'kevin@gmail.com', '123456', "https://images.pexels.com/photos/3608263/pexels-photo-3608263.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500");

ALTER TABLE users ALTER COLUMN image TYPE VARCHAR(500);
ALTER TABLE users ALTER COLUMN imgae DEFAULT "https://images.pexels.com/photos/3608263/pexels-photo-3608263.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"

ALTER TABLE users ADD DEFAULT './user.jpg' FOR users;

ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(50);


CREATE TABLE posts(
  id SERIAL PRIMARY KEY,
  body VARCHAR(255) NOT NULL,
  creator_id INT NOT NULL REFERENCES users(id),
  creator VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments(
  id SERIAL PRIMARY KEY,
  body VARCHAR(255) NOT NULL,
  creator_id INT NOT NULL REFERENCES users(id),
  creator VARCHAR(100) NOT NULL,
  post_id INT NOT NULL REFERENCES posts(id),
  created_at TIMESTAMP DEFAULT NOW()
)

CREATE TABLE likes(
  id SERIAL PRIMARY KEY,
  creator_id INT NOT NULL REFERENCES users(id),
  post_id INT NOT NULL REFERENCES posts(id),
  created_at TIMESTAMP DEFAULT NOW()
);

SELECT * FROM posts LEFT JOIN (SELECT COUNT(post_id) AS commentsLength FROM comments GROUP BY post_id) comments ON posts.id=comments.post_id;