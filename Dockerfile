FROM node:21
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm apply-migrations
EXPOSE 3000
CMD ["pnpm", "dev"]