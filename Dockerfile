FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./

RUN npm ci

COPY backend ./

RUN npm run build

RUN mkdir -p dist/config && cp src/config/swagger.yaml dist/config/swagger.yaml

EXPOSE 4000

ENV NODE_ENV=production

CMD ["npm", "start"]