# Multi-stage Dockerfile for EduTuition Pro
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Install Backend Dependencies
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev

# Stage 3: Final Production Image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy backend application
COPY backend/ ./backend/
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules

# Copy built frontend assets to frontend/dist for static serving
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "backend/server.js"]
