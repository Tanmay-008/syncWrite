# FROM node:22-alpine AS build

# WORKDIR /app

# RUN corepack enable

# COPY package.json pnpm-lock.yaml ./


# RUN printf "packages:\n  - '.'\nallowBuilds:\n  esbuild: true\n" > pnpm-workspace.yaml

# RUN pnpm install --frozen-lockfile

# COPY . .
# RUN pnpm run build:prod

# FROM node:22-alpine

# WORKDIR /app

# RUN npm install -g serve

# COPY --from=build /app/dist ./dist

# USER node

# EXPOSE 3000

# CMD ["serve", "-s", "dist", "-l", "3000"]

FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

# 1. Faltu pnpm-workspace.yaml banane wali line hata di
# 2. --frozen-lockfile hata diya taaki pnpm Alpine ke hisaab se missing esbuild binaries download kar sake
RUN pnpm install

COPY . .
RUN pnpm run build:prod

FROM node:22-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

USER node

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]


