FROM node:20.19-alpine
WORKDIR /app/
COPY package*.json .
COPY tsconfig.json .
RUN npm ci
COPY src src
RUN npx tsc
CMD ["node", "dist/index.js"]
