FROM node:9-stretch

WORKDIR /mumble-bot

# Install all dependencies used for puppeteer and for running the bot.
RUN apt-get -qq update && \
    apt-get -qq install -y gconf-service libasound2 libgconf-2-4 libgtk-3-0 libnspr4 libx11-xcb1 \
      libxss1 libxtst6 fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
      fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils libpango1.0-dev libgif-dev \
      build-essential ffmpeg sox

# Copy all files which will likely change very infrequently.
COPY ./jest-screenshot.json /mumble-bot/jest-screenshot.json
COPY ./tsconfig.json /mumble-bot/tsconfig.json
COPY ./tsconfig-production.json /mumble-bot/tsconfig-production.json
COPY ./tsconfig-webpack.json /mumble-bot/tsconfig-webpack.json
COPY ./webpack.config.js /mumble-bot/webpack.config.js
COPY ./webpack.config-release.js /mumble-bot/webpack.config-release.js
COPY ./Makefile /mumble-bot/Makefile

# Install all dependencies.
COPY ./package.json /mumble-bot/package.json
COPY ./yarn.lock /mumble-bot/yarn.lock
RUN make node_modules

# Copy files changing frequently.
COPY ./typings /mumble-bot/typings
COPY ./jest /mumble-bot/jest
COPY ./integration-test /mumble-bot/integration-test
COPY ./src /mumble-bot/src
