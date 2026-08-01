import { prisma } from '../../index.js'

export async function searchUsers(query: string) {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { displayName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
    },
    take: 20,
  })

  return users
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}
