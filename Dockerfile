# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy configuration files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

RUN mkdir -p /app/db && touch /app/db/local.db

ARG DATABASE_URL=file:/app/db/local.db
ENV DATABASE_URL=$DATABASE_URL
# Build the application
# Note: This requires a SvelteKit adapter (like @sveltejs/adapter-node)
RUN pnpm run build

# Stage 2: Run
FROM node:20-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built application and production dependencies
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/drizzle ./drizzle

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Create volume directories
RUN mkdir -p /app/downloads /app/db

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the application
CMD ["node", "build"]
