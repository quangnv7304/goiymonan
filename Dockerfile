FROM node:18-slim

WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Khi container khởi động -> migrate + seed -> start app
CMD npx prisma migrate deploy && npx prisma db seed && npm run dev
