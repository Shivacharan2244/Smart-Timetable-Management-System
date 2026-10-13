# Multi-stage build for React + Vite Frontend
FROM node:22-alpine AS build
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
RUN npm ci

# Copy frontend source and build assets
COPY . .
RUN npm run build

# Lightweight Nginx production server
FROM nginx:alpine

# Copy built static assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
