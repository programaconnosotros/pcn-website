FROM node:21
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install
EXPOSE 3000

# Valida la existencia de la variable de entorno antes de proceder con la migración y el arranque
CMD sh -c 'if [ -z "$DATABASE_URL" ]; then echo "ERROR: DATABASE_URL is not set"; exit 1; fi; pnpm apply-migrations && pnpm dev'