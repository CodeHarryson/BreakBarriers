FROM node:24-slim

WORKDIR /app

# tsx (the runtime) is a devDependency, so install everything
COPY package*.json ./
RUN npm ci

COPY prisma.config.ts tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate

ENV PORT=8787
EXPOSE 8787

CMD ["npx", "tsx", "src/index.ts"]
