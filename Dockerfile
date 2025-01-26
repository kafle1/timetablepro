FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "build"] 