FROM node:20-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared-types/package.json packages/shared-types/
COPY apps/admin/package.json apps/admin/

RUN pnpm install --frozen-lockfile

COPY packages/shared-types/ packages/shared-types/
RUN pnpm --filter @ssmp/shared-types build

ARG VITE_API_URL=http://localhost:3005
ENV VITE_API_URL=$VITE_API_URL

COPY apps/admin/ apps/admin/
RUN pnpm --filter @ssmp/admin build

FROM nginx:alpine
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
