import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "bikeapp",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});

export default pool;
