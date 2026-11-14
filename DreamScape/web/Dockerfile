# Dockerfile for web service
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.json vite.config.ts ./
RUN npm install
COPY src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json ./
RUN npm install --production
EXPOSE 5173
CMD ["npx","vite","preview","--host"]

