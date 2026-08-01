import { FastifyInstance } from 'fastify'
import { prisma } from '../../index.js'

export async function setupMessageSocket(app: FastifyInstance) {
  app.io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    // Join user to their own room
    socket.on('user:join', (userId: string) => {
      socket.join(`user:${userId}`)
      console.log(`User ${userId} joined room`)
    })

    // Handle new messages
    socket.on('message:send', async (data: { recipientId: string; content: string }) => {
      try {
        const userId = (socket.handshake.auth as any).userId
        if (!userId) return

        // Save message to database
        const message = await prisma.message.create({
          data: {
            content: data.content,
            senderId: userId,
            recipientId: data.recipientId,
          },
          select: {
            id: true,
            content: true,
            senderId: true,
            recipientId: true,
            read: true,
            createdAt: true,
          },
        })

        // Emit to both sender and recipient
        app.io.to(`user:${userId}`).emit('message:new', message)
        app.io.to(`user:${data.recipientId}`).emit('message:new', message)
      } catch (error) {
        console.error('Error sending message:', error)
      }
    })

    // Handle message read
    socket.on('message:read', async (messageId: string) => {
      try {
        const message = await prisma.message.update({
          where: { id: messageId },
          data: { read: true },
        })

        app.io.emit('message:read', { messageId, read: true })
      } catch (error) {
        console.error('Error marking message as read:', error)
      }
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`)
    })
  })
}
