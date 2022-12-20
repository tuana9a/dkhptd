FROM node:16.16.0

WORKDIR /app

COPY package.json .

RUN npm install --only=production

# placeholder to config.json

COPY dist/ dist/

CMD node dist/index.js