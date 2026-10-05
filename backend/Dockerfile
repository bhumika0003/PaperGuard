FROM node:22-alpine

WORKDIR /DevOps_vap_backend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 7000

CMD ["npm","start"]