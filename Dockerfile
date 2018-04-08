FROM node:carbon

WORKDIR /usr/src/app

COPY package.json ./
COPY ./src ./src

RUN npm install

EXPOSE 8080
CMD [ "npm", "start" ]