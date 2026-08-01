# --- Stage 1: Build Stage ---
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL required by Prisma engine
RUN apt-get update -y && apt-get install -y openssl

# Copy package configuration and install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema and generate client
COPY schema.prisma ./
RUN npx prisma generate

# Copy tsconfig and all TypeScript source files
COPY tsconfig.json ./
COPY *.ts ./
RUN npm run build


# --- Stage 2: Production Stage ---
FROM node:20-slim AS runner

WORKDIR /app

# Install OpenSSL in the production runner
RUN apt-get update -y && apt-get install -y openssl

ENV NODE_ENV=production
ENV PORT=4000

# Copy package configuration and install production-only dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled JavaScript output and generated Prisma binaries from builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY schema.prisma ./

EXPOSE 4000

# Apply database schema and start server
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
