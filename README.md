# Pulse Chat - Backend

A real-time chat backend built with Fastify, TypeScript, Prisma, and Socket.IO.

## Features

- ✅ User authentication (signup/login with JWT)
- ✅ Real-time messaging with Socket.IO
- ✅ User search & profiles
- ✅ Message delivery & read receipts
- ✅ PostgreSQL database with Prisma ORM
- ✅ Production-ready Docker setup
- ✅ CORS configured for frontend

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis (optional, for caching)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Update .env with your database URL
# DATABASE_URL=postgresql://user:password@host:port/database
# JWT_SECRET=your-secret-key
# CLIENT_ORIGIN=https://your-frontend-url.vercel.app
```

### Database Setup

```bash
# Push schema to database
npm run db:push

# Open Prisma Studio (optional)
npm run db:studio
```

### Development

```bash
npm run dev
```

Server runs at `http://localhost:4000`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile (requires JWT)
- `POST /auth/logout` - Logout user

### Users
- `GET /users/search?q=query` - Search users
- `GET /users/:userId` - Get user profile

### Messages
- `GET /messages/conversation/:userId` - Get conversation with user
- `POST /messages/send` - Send message
- `POST /messages/:messageId/read` - Mark message as read

### Health
- `GET /health` - Server health check

## Socket.IO Events

### Client → Server
- `user:join` - Join user's room
- `message:send` - Send new message
- `message:read` - Mark message as read

### Server → Client
- `message:new` - Receive new message
- `message:read` - Notification of read receipt

## Environment Variables

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=https://your-frontend-url.vercel.app
```

## Deployment on Railway

1. Push code to GitHub
2. Connect GitHub repo to Railway
3. Set environment variables in Railway dashboard
4. Railway auto-deploys on push to main branch

## Project Structure

```
backend/
├── src/
│   ├── index.ts (main entry point)
│   ├── modules/
│   │   ├── auth/ (authentication)
│   │   ├── users/ (user search & profiles)
│   │   └── messages/ (messaging & Socket.IO)
│   └── utils/ (password hashing, JWT)
├── prisma/
│   └── schema.prisma (database schema)
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Frontend Integration

This backend is designed to work with the Pulse Chat frontend. The frontend expects these exact API responses and Socket.IO events.

Make sure `CLIENT_ORIGIN` is set to your Vercel frontend URL for CORS to work!
