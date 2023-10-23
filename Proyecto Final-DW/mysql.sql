use usersmysql;

CREATE TABLE perfiles  (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(24) NOT NULL,
  full_name VARCHAR(255),
  date_of_birth DATE,
  profile_picture VARCHAR(255)
);
