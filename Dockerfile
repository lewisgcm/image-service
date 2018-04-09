FROM node:carbon

WORKDIR /usr/src/app

COPY package.json ./
COPY ./build ./build
COPY ./config-docker.yaml ./config.yaml

RUN npm install

EXPOSE 8080
CMD [ "npm", "start" ]