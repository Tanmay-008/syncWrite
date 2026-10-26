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

RUN pnpm install

COPY . .

ENV ENVIRONMENT=production
ENV NODE_ENV=production

RUN pnpm run build:prod


FROM nginx:alpine

ENV ENVIRONMENT=production
ENV PORT=3000

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]