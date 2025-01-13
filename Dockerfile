FROM node:22
WORKDIR /app
COPY . .
RUN corepack enable
RUN yarn install && yarn tsoa
EXPOSE ${APP_API_PORT}
CMD yarn start
