FROM node:21
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install
EXPOSE 3000
