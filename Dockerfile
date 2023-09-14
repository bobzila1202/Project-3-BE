FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 443

CMD ["npm", "start"]