import { prisma } from '../../index.js'
import { hashPassword, comparePassword } from '../../utils/password.js'
import { generateToken } from '../../utils/token.js'

export async function signupUser(
  email: string,
  username: string,
  displayName: string,
  password: string
) {
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  })

  if (existingUser) {
    throw new Error('Email or username already exists')
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      displayName,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
    },
  })

  // Generate JWT
  const token = generateToken(user.id)

  return { token, user }
}

export async function loginUser(email: string, password: string) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new Error('Invalid email or password')
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password)
  if (!isPasswordValid) {
    throw new Error('Invalid email or password')
  }

  // Generate JWT
  const token = generateToken(user.id)

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
    },
  }
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}
