import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { signupUser, loginUser, getProfile } from './auth.service.js'

export default async function authRoutes(app: FastifyInstance) {
  // Signup endpoint
  app.post<{ Body: { email: string; username: string; displayName: string; password: string } }>(
    '/signup',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { email, username, displayName, password } = request.body
        const { token, user } = await signupUser(email, username, displayName, password)
        
        return reply.code(201).send({ token, user })
      } catch (error: any) {
        return reply.code(400).send({ message: error.message })
      }
    }
  )

  // Login endpoint
  app.post<{ Body: { email: string; password: string } }>(
    '/login',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { email, password } = request.body
        const { token, user } = await loginUser(email, password)
        
        return reply.send({ token, user })
      } catch (error: any) {
        return reply.code(401).send({ message: error.message })
      }
    }
  )

  // Get profile endpoint (protected)
  app.get(
    '/profile',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify()
        const user = await getProfile(request.user.id)
        return reply.send(user)
      } catch (error: any) {
        return reply.code(401).send({ message: 'Unauthorized' })
      }
    }
  )

  // Logout endpoint
  app.post(
    '/logout',
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({ message: 'Logged out' })
    }
  )
}
