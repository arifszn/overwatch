FROM node:22-slim

WORKDIR /app

ARG APP_PORT

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${APP_PORT}

CMD ["npm", "run", "start"]