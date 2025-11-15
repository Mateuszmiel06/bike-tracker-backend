CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rides (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  distance_km DECIMAL(8,2),
  duration_seconds INT,
  gps_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (username, password_hash) VALUES ('demo', '') ON CONFLICT DO NOTHING;
