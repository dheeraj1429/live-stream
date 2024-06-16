# Base stage
FROM node:18 as base
WORKDIR /app
COPY package.json ./
RUN npm install

COPY apps/video-stream-io apps/video-stream-io
COPY libs libs
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

# Development stage
FROM base as development
RUN cd apps/video-stream-io && npm install
EXPOSE 9090
CMD [ "npm", "run", "start:dev", "video-stream-io" ]