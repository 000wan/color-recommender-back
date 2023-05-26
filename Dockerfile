# Write server Dockerfile here
# For instructions, see https://github.com/SnowSuno/wheel-assignment-solution#1-dockerfile-%EC%9E%91%EC%84%B1

FROM node:16-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8000
ENV PORT=8000
ENTRYPOINT [ "npm", "run", "start" ]
