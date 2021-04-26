FROM node

WORKDIR /usr/app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run server

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]