# Use Alpine-based image for both stages if possible
FROM oven/bun:1.2.2-alpine AS builder
WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package.json bun.lock ./
RUN bun install

# Copy full source and build the application in one step
COPY . .
RUN bun run build

# Production stage
FROM oven/bun:1.2.2-alpine AS production
WORKDIR /app

# Copy package files and install only production dependencies.
COPY package.json bun.lock ./
RUN bun install --production \
    && rm -rf /root/.bun/cache  # remove any bun cache if exists

# Copy over the built application and necessary migration files
COPY --from=builder /app/dist ./dist
COPY src/database/migrations ./src/database/migrations
COPY src/database/datasource.ts ./src/database/datasource.ts

# Create a directory for file-based storage if needed
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Health check to verify container readiness
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["bun", "run", "dist/main.js"]
