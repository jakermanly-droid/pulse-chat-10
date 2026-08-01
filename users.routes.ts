import { FastifyInstance } from 'fastify'
import { searchUsers, getUserProfile } from './users.service.js'

export default async function usersRoutes(app: FastifyInstance) {
  // Search users
  app.get('/search', { onRequest: [async (req) => { await req.jwtVerify() }] }, async (request, reply) => {
    try {
      const { q } = request.query as any
      const users = await searchUsers(q || '')
      return reply.status(200).send(users)
    } catch (error: any) {
      return reply.status(400).send({ error: error.message })
    }
  })

  // Get user profile by ID
  app.get('/:userId', { onRequest: [async (req) => { await req.jwtVerify() }] }, async (request, reply) => {
    try {
      const { userId } = request.params as any
      const user = await getUserProfile(userId)
      return reply.status(200).send(user)
    } catch (error: any) {
      return reply.status(404).send({ error: error.message })
    }
  })
}
