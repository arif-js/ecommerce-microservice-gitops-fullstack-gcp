FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/ ./packages/
COPY apps/shop/package.json ./apps/shop/
RUN npm install

COPY apps/shop/ ./apps/shop/
RUN npm run build --workspace=@repo/otel
RUN npm run build --workspace=@repo/database

WORKDIR /app/apps/shop
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG PAYMENT_SERVICE_URL
ENV PAYMENT_SERVICE_URL=$PAYMENT_SERVICE_URL
ARG ORDER_SERVICE_URL
ENV ORDER_SERVICE_URL=$ORDER_SERVICE_URL
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build and static files
COPY --from=builder /app/apps/shop/public ./apps/shop/public
COPY --from=builder /app/apps/shop/.next/standalone ./
COPY --from=builder /app/apps/shop/.next/static ./apps/shop/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Main entrypoint for standalone mode
CMD ["node", "apps/shop/server.js"]
