import { prisma } from './index.js'

export async function getConversation(user1Id: string, user2Id: string) {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user1Id, recipientId: user2Id },
        { senderId: user2Id, recipientId: user1Id },
      ],
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return messages
}

export async function sendMessage(senderId: string, recipientId: string, content: string) {
  const message = await prisma.message.create({
    data: {
      senderId,
      recipientId,
      content,
    },
  })

  return message
}

export async function markAsRead(messageId: string) {
  const message = await prisma.message.update({
    where: { id: messageId },
    data: { read: true },
  })

  return message
}
