# --- Стейдж 1: Prune monorepo ---
FROM node:20-alpine AS pruner
RUN npm install -g turbo
WORKDIR /app
COPY . .
RUN turbo prune frontend --docker

# --- Стейдж 2: Установка зависимостей ---
FROM node:20-alpine AS installer
RUN npm install -g pnpm
WORKDIR /app

# Копируем только json-описания для кэширования слоев
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# --- Стейдж 3: Сборка Next.js ---
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY --from=installer /app .
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Передаем переменные сборки, если они нужны Next.js (например, NEXT_PUBLIC_API_URL)
# ENV NEXT_PUBLIC_API_URL=https://oki.vodka/api
RUN pnpm turbo run build --filter=frontend

# --- Стейдж 4: Продакшн рантайм ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80
ENV HOSTNAME="0.0.0.0"

# Создаем системного пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# В Next.js при output: 'standalone' собирается изолированный сервер.
# Копируем публичные статические файлы и собранный сервер.
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs

EXPOSE 80

# Запускаем автономный сервер Next.js
CMD ["node", "apps/frontend/server.js"]
