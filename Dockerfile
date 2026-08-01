# --- Stage 1: Build Stage ---
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL (required by Prisma on slim images)
RUN apt-get update -y && apt-get install -y openssl

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate the Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code and build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build


# --- Stage 2: Production Stage ---
FROM node:20-slim AS runner

WORKDIR /app

# Install OpenSSL in the production stage as well
RUN apt-get update -y && apt-get install -y openssl

ENV NODE_ENV=production
ENV PORT=4000

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy generated Prisma Client and compiled JavaScript from builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma/

EXPOSE 4000

# Run database push/migrations before launching the backend server
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
