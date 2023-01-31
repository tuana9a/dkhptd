FROM node:16.19.0-slim as ts-compiler
WORKDIR /app
COPY package.json .
COPY tsconfig.json .
RUN npm install
COPY app app
RUN npx tsc

FROM node:16.19.0-slim
WORKDIR /app
COPY --from=ts-compiler /app/package.json .
RUN npm install --only=production
COPY --from=ts-compiler /app/dist dist
CMD node dist/index.js