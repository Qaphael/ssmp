FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root workspace config
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy shared-types first (needed by api)
COPY packages/shared-types/package.json packages/shared-types/
COPY apps/api/package.json apps/api/

# Install deps
RUN pnpm install --frozen-lockfile

# Copy shared-types source and build
COPY packages/shared-types/ packages/shared-types/
RUN pnpm --filter @ssmp/shared-types build

# Copy API source
COPY apps/api/ apps/api/

# Copy migrations and seed
COPY apps/api/src/db/ apps/api/src/db/

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "src/server.js"]
