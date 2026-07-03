FROM node:20-alpine

ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=password

RUN mkdir -p /home/app

COPY ./app /home/app

# Set default working directory
WORKDIR /home/app

# Runs in /home/app to build node_modules
RUN npm install

# Set the startup command
CMD ["node", "server.js"]
