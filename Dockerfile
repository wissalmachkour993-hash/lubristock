FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./

RUN npm ci

COPY backend ./

RUN npm run build

EXPOSE 4000

ENV NODE_ENV=production

CMD ["npm", "start"]