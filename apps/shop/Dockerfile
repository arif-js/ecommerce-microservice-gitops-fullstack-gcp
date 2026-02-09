FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy root configs
COPY package.json package-lock.json ./
COPY packages/ ./packages/
COPY apps/shop/package.json ./apps/shop/

# Install dependencies
RUN npm install

# Copy application source
COPY apps/shop/ ./apps/shop/

# Build shared packages
RUN npm run build --workspace=@repo/otel
RUN npm run build --workspace=@repo/database

# Build the app
WORKDIR /app/apps/shop
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG PAYMENT_SERVICE_URL
ENV PAYMENT_SERVICE_URL=$PAYMENT_SERVICE_URL
ARG ORDER_SERVICE_URL
ENV ORDER_SERVICE_URL=$ORDER_SERVICE_URL
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy dependencies and shared packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/shop ./apps/shop

# Run from the shop app directory
WORKDIR /app/apps/shop
EXPOSE 3000

# Use npx to find the binary in the monorepo root node_modules
CMD ["npx", "next", "start"]
