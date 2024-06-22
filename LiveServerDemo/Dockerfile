FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install

RUN apk add --no-cache ffmpeg

COPY . .

EXPOSE 8000
EXPOSE 1935

CMD ["node", "server.js"]