# First stage: Install dependencies and generate pnpm cache
FROM node:23-slim AS cache

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Second stage: Use the cached pnpm store
FROM cache AS final

RUN apt-get update -y && \
apt-get install -y --no-install-recommends openssl ca-certificates && \
apt-get clean && \
rm -rf /var/lib/apt/lists/*
    
WORKDIR /app

COPY --from=cache /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate

RUN pnpm run build

EXPOSE 4000

CMD ["node", "dist/src/main"]

