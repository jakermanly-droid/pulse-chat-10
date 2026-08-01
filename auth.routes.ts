import { FastifyInstance } from 'fastify'
import { signupUser, loginUser, getProfile } from './auth.service.js'

export default async function authRoutes(app: FastifyInstance) {
  // Signup
  app.post('/signup', async (request, reply) => {
    try {
      const { email, username, displayName, password } = request.body as any
      const result = await signupUser(email, username, displayName, password)
      return reply.status(201).send(result)
    } catch (error: any) {
      return reply.status(400).send({ error: error.message })
    }
  })

  // Login
  app.post('/login', async (request, reply) => {
    try {
      const { email, password } = request.body as any
      const result = await loginUser(email, password)
      return reply.status(200).send(result)
    } catch (error: any) {
      return reply.status(400).send({ error: error.message })
    }
  })

  // Get current user profile
  app.get('/me', { onRequest: [async (req) => { await req.jwtVerify() }] }, async (request, reply) => {
    try {
      const user = request.user as any
      const profile = await getProfile(user.id)
      return reply.status(200).send(profile)
    } catch (error: any) {
      return reply.status(404).send({ error: error.message })
    }
  })
}
