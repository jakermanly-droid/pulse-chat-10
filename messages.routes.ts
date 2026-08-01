import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { getConversation, sendMessage, markAsRead } from './messages.service.js'

export default async function messagesRoutes(app: FastifyInstance) {
  // Get conversation endpoint
  app.get<{ Params: { userId: string } }>(
    '/conversation/:userId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify()
        const { userId } = request.params
        const messages = await getConversation(request.user.id, userId)
        return reply.send(messages)
      } catch (error: any) {
        return reply.code(400).send({ message: error.message })
      }
    }
  )

  // Send message endpoint
  app.post<{ Body: { recipientId: string; content: string } }>(
    '/send',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify()
        const { recipientId, content } = request.body
        const message = await sendMessage(request.user.id, recipientId, content)
        return reply.code(201).send(message)
      } catch (error: any) {
        return reply.code(400).send({ message: error.message })
      }
    }
  )

  // Mark as read endpoint
  app.post<{ Params: { messageId: string } }>(
    '/:messageId/read',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify()
        const { messageId } = request.params
        const message = await markAsRead(messageId)
        return reply.send(message)
      } catch (error: any) {
        return reply.code(400).send({ message: error.message })
      }
    }
  )
}
