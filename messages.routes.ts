import { FastifyInstance } from 'fastify'
import { getConversation, sendMessage, markAsRead } from './messages.service.js'

export default async function messagesRoutes(app: FastifyInstance) {
  // Get conversation with another user -> Matches GET /messages/:userId
  app.get('/:userId', { onRequest: [async (req) => { await req.jwtVerify() }] }, async (request, reply) => {
    try {
      const { userId } = request.params as any
      const currentUser = request.user as any
      const messages = await getConversation(currentUser.id, userId)
      return reply.status(200).send(messages)
    } catch (error: any) {
      return reply.status(400).send({ error: error.message })
    }
  })

  // Send message -> Matches POST /messages
  app.post('/', { onRequest: [async (req) => { await req.jwtVerify() }] }, async (request, reply) => {
    try {
      const { recipientId, content } = request.body as any
      const currentUser = request.user as any
      const message = await sendMessage(currentUser.id, recipientId, content)
      return reply.status(201).send(message)
    } catch (error: any) {
      return reply.status(400).send({ error: error.message })
    }
  })

  // Mark message as read -> Matches POST /messages/:messageId/read
  app.post('/:messageId/read', { onRequest: [async (req) => { await req.jwtVerify() }] }, async (request, reply) => {
    try {
      const { messageId } = request.params as any
      const result = await markAsRead(messageId)
      return reply.status(200).send(result)
    } catch (error: any) {
      return reply.status(400).send({ error: error.message })
    }
  })
}

