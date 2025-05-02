# First stage: Install dependencies and generate pnpm cache
FROM node:23-slim AS cache

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Second stage: Use the cached pnpm store
FROM cache AS final

RUN apt-get update -y && \
    apt-get install -y openssl postgresql-client && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
    
WORKDIR /app

COPY --from=cache /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate

RUN pnpm run build

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE ${PORT}

RUN chmod +x ./scripts/init-db.sh

ENTRYPOINT ["./scripts/init-db.sh"]

CMD ["node", "dist/src/main"]

