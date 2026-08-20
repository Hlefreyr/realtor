FROM node:20-alpine

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src ./src

EXPOSE 4000

CMD ["npm", "start"]
