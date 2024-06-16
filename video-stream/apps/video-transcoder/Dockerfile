# Base stage
FROM ubuntu:focal as base

RUN /usr/bin/apt-get update && \
    /usr/bin/apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    /usr/bin/apt-get update && \
    /usr/bin/apt-get upgrade -y && \
    /usr/bin/apt-get install -y nodejs ffmpeg

WORKDIR /home/app/video-transcoder
COPY package.json ./
RUN npm install

COPY apps/video-transcoder apps/video-transcoder
COPY libs libs
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

# Development stage
FROM base as development
RUN cd apps/video-transcoder && npm install
CMD [ "npm", "run", "start:dev", "video-transcoder" ]