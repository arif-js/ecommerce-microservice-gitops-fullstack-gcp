FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy root configs
COPY package.json package-lock.json ./
COPY packages/ ./packages/
COPY apps/payment-service/package.json ./apps/payment-service/

# Install dependencies including workspaces
RUN npm install

# Copy application source
COPY apps/payment-service/ ./apps/payment-service/

# Build shared packages first
RUN npm run build --workspace=@repo/database
RUN npm run build --workspace=@repo/otel

# Build the app
WORKDIR /app/apps/payment-service
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy dependencies and shared packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/payment-service/package.json ./package.json

# Copy built application
COPY --from=builder /app/apps/payment-service/dist ./dist

EXPOSE 8080
CMD ["node", "dist/main.js"]
