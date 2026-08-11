# syntax=docker/dockerfile:1.7

FROM node:20.19-alpine AS build

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20.19-alpine AS runtime

RUN apk add --no-cache dumb-init openssl

WORKDIR /app
ENV NODE_ENV=production

# The worker currently runs through vite-node, which is installed with the
# build dependencies. Keep the generated dependency tree in the runtime image
# so the web process and the BullMQ worker can use the same immutable image.
COPY --from=build --chown=node:node /app /app

# vite-node loads the React Router config for the BullMQ worker and creates
# generated files here at runtime. Prepare the excluded directory while still
# root so the non-root runtime user can write to it.
RUN mkdir -p /app/.react-router \
    && chown node:node /app/.react-router

USER node

EXPOSE 5000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]
