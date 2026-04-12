# ── Builder stage ────────────────────────────────────────────────────────────
FROM node:22.11.0-slim AS builder

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for the build).
# No --mount=type=cache to avoid EBUSY lock contention on /app/node_modules/.cache.
RUN npm ci

# Copy source and build the frontend
COPY . .
RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:22.11.0-slim AS runtime

WORKDIR /app

# Copy dependency manifests and install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the compiled frontend assets from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the server source (tsx compiles it at runtime)
COPY server ./server

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "--import", "tsx", "server/index.ts"]
