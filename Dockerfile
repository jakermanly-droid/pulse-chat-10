# --- Stage 1: Build Stage ---
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL (required by Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma schema directly from root and generate client
COPY schema.prisma ./
RUN npx prisma generate

# Copy tsconfig and all TypeScript source files
COPY tsconfig.json ./
COPY *.ts ./
RUN npm run build


# --- Stage 2: Production Stage ---
FROM node:20-slim AS runner

WORKDIR /app

# Install OpenSSL in runner stage
RUN apt-get update -y && apt-get install -y openssl

ENV NODE_ENV=production
ENV PORT=4000

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy generated Prisma Client and compiled JavaScript code
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY schema.prisma ./

EXPOSE 4000

# Sync database schema and start app
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
