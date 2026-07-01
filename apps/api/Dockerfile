FROM node:20-alpine

WORKDIR /app

# Install pnpm 9 (matches lockfile v9)
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy root workspace config
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy shared-types first (needed by api)
COPY packages/shared-types/package.json packages/shared-types/
COPY apps/api/package.json apps/api/

# Install deps
RUN pnpm install --no-frozen-lockfile

# Copy shared-types source and build
COPY packages/shared-types/ packages/shared-types/
RUN pnpm --filter @ssmp/shared-types build

# Copy API source
COPY apps/api/ apps/api/

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "src/server.js"]
