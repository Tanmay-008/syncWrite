FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN printf "packages:\n  - '.'\nallowBuilds:\n  esbuild: true\n" > pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

RUN pnpm prune --prod

FROM node:22-alpine

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

COPY --from=build /app/dist ./dist

USER node

EXPOSE 4000

CMD ["node", "dist/index.mjs"]


