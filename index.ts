import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'
import fastifySocketIO from '@fastify/socket.io'
import { PrismaClient } from '@prisma/client'
import authRoutes from './modules/auth/auth.routes.js'
import usersRoutes from './modules/users/users.routes.js'
import messagesRoutes from './modules/messages/messages.routes.js'
import { setupMessageSocket } from './modules/messages/messages.socket.js'
import dotenv from 'dotenv'

dotenv.config()

const app = Fastify({ logger: true })
export const prisma = new PrismaClient()

const PORT = parseInt(process.env.PORT || '4000', 10)
const HOST = '0.0.0.0'
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Register CORS
app.register(fastifyCors, {
  origin: CLIENT_ORIGIN,
  credentials: true,
})

// Register JWT
app.register(fastifyJwt, {
  secret: JWT_SECRET,
})

// Register Socket.IO
app.register(fastifySocketIO, {
  cors: {
    origin: CLIENT_ORIGIN,
    credentials: true,
  },
})

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Register auth routes
app.register(authRoutes, { prefix: '/auth' })

// Register users routes
app.register(usersRoutes, { prefix: '/users' })

// Register messages routes
app.register(messagesRoutes, { prefix: '/messages' })

// Setup Socket.IO handlers
app.ready(() => {
  setupMessageSocket(app)
})

// Start server
const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST })
    console.log(`✅ Server running at http://${HOST}:${PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
