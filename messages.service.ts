import { prisma } from '../../index.js'

export async function getConversation(userId: string, otherUserId: string) {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      content: true,
      senderId: true,
      recipientId: true,
      read: true,
      createdAt: true,
    },
  })

  return messages
}

export async function sendMessage(senderId: string, recipientId: string, content: string) {
  if (!content.trim()) {
    throw new Error('Message content cannot be empty')
  }

  const message = await prisma.message.create({
    data: {
      content,
      senderId,
      recipientId,
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

  return message
}

export async function markAsRead(messageId: string) {
  const message = await prisma.message.update({
    where: { id: messageId },
    data: { read: true },
    select: {
      id: true,
      content: true,
      senderId: true,
      recipientId: true,
      read: true,
      createdAt: true,
    },
  })

  return message
}
