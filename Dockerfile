FROM node:20-alpine

WORKDIR /app

# copy from server folder specifically
COPY server/package*.json ./
RUN npm install

COPY server/ .

EXPOSE 3000

CMD ["node", "index.js"]