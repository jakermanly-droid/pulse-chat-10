import { FastifyInstance } from 'fastify'
import { prisma } from './index.js'

export async function setupMessageSocket(app: FastifyInstance) {
  const io = (app as any).io

  if (!io) {
    console.error('Socket.IO is not initialized on Fastify instance')
    return
  }

  io.on('connection', (socket: any) => {
    console.log(`User connected: ${socket.id}`)

    // Join user to their own room
    socket.on('user:join', (userId: string) => {
      socket.join(`user:${userId}`)
      console.log(`User ${userId} joined room`)
    })

    // Handle new messages
    socket.on('message:send', async (data: { recipientId: string; content: string }) => {
      try {
        const userId = (socket.handshake.auth as any)?.userId
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
        io.to(`user:${userId}`).emit('message:new', message)
        io.to(`user:${data.recipientId}`).emit('message:new', message)
      } catch (error) {
        console.error('Error sending message:', error)
      }
    })

    // Handle message read
    socket.on('message:read', async (messageId: string) => {
      try {
        await prisma.message.update({
          where: { id: messageId },
          data: { read: true },
        })

        io.emit('message:read', { messageId, read: true })
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
