import express from "express";
import http from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";
import pool from "./db.js";
import dotenv from "dotenv";
import authRouter from "./auth.js";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// simple auth middleware for routes that need user info
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

app.use('/auth', authRouter);

app.get('/', (req, res) => res.json({ ok: true }));

app.post('/ride', auth, async (req, res) => {
  try {
    const { distance_km, duration_seconds, gps_data } = req.body;
    const user_id = req.user.id;
    const result = await pool.query(
      `INSERT INTO rides (user_id, distance_km, duration_seconds, gps_data) VALUES ($1, $2, $3, $4) RETURNING rides.id, rides.user_id, distance_km, duration_seconds, gps_data, rides.created_at, users.username`,
      [user_id, distance_km, duration_seconds, gps_data]
    );
    // join username manually
    const ride = (await pool.query('SELECT rides.*, users.username FROM rides JOIN users ON rides.user_id = users.id WHERE rides.id=$1', [result.rows[0].id])).rows[0];
    io.emit('newRide', ride);
    res.json(ride);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/rides', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rides.id, users.username, rides.distance_km, rides.duration_seconds, rides.created_at
       FROM rides JOIN users ON rides.user_id = users.id
       ORDER BY rides.created_at DESC LIMIT 200`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// simple endpoint to get current user from token
app.get('/me', auth, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Backend działa na porcie ${PORT}`));
