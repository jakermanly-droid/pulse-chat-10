FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 4000
CMD ["node", "dist/index.js"]
