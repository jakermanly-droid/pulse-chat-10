FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npm ci
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/index.js"]
