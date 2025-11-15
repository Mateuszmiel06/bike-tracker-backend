# Bike Tracker - Backend (with Auth + WebSocket)

## Setup (local)
1. Copy `.env.example` to `.env` and fill DB credentials and JWT_SECRET.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize DB:
   ```bash
   psql -U <db_user> -d <db_name> -f init_db.sql
   ```
4. Start server:
   ```bash
   npm start
   ```

## Endpoints
- POST /auth/register { username, password }
- POST /auth/login { username, password } -> { token }
- GET /me (Authorization: Bearer <token>)
- POST /ride (Authorization: Bearer <token>) -> save ride, emits socket 'newRide'
- GET /rides -> recent rides
