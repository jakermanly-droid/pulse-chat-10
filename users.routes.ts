import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { searchUsers, getUserProfile } from './users.service.js'

export default async function usersRoutes(app: FastifyInstance) {
  // Search users endpoint
  app.get<{ Querystring: { q: string } }>(
    '/search',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { q } = request.query
        if (!q || q.length < 2) {
          return reply.send([])
        }
        const users = await searchUsers(q)
        return reply.send(users)
      } catch (error: any) {
        return reply.code(400).send({ message: error.message })
      }
    }
  )

  // Get user profile endpoint
  app.get<{ Params: { userId: string } }>(
    '/:userId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { userId } = request.params
        const user = await getUserProfile(userId)
        return reply.send(user)
      } catch (error: any) {
        return reply.code(404).send({ message: error.message })
      }
    }
  )
}
