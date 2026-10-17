---
name: verify-docker
description: Build and run the website's Docker images locally and check they really work — the production image (Dockerfile.prod, what Kamal deploys) with migrations, start-up, pages without console errors or CSP violations and email to MailHog, plus the docker-compose dev stack with live reload. Use after changing Dockerfiles, docker-compose.yml, .dockerignore, the Node or pnpm version, dependencies with install scripts, or when the user asks to run or verify the Docker images.
---

# Verify Docker

Two things to verify: the **production image** (`Dockerfile.prod`, built by Kamal in CI for
amd64 and run on EC2) and the **dev stack** (`docker-compose.yml`: `pcn-db`, `pcn-mailhog`,
`pcn-web` with the repo mounted). Production builds amd64; a local build is the Mac's native
arch, so say so when reporting.

## 0. Docker must answer

```bash
docker info --format '{{.ServerVersion}}'
```

If it returns `Internal Server Error`, Docker Desktop's VM didn't start. Check
`~/Library/Containers/com.docker.docker/Data/log/` (`vm/*.log`, `host/com.docker.backend.log`).
`no space left on device` means its virtual disk is full: the daemon is down, so `prune` can't
run. Ask the user (raise the disk limit in Settings → Resources, or Troubleshoot → Purge data,
which deletes every image, container and volume). Don't purge without asking.

## 1. Production image

```bash
docker build -f Dockerfile.prod -t pcn-prod:local . 2>&1 | tee <scratchpad>/docker-prod.log
```

Read the log, not just the exit code: no `WARN`, no `Ignored build scripts`, no `DEP0…`, and no
Prisma error during "Generating static pages" (a page querying the DB at build time; CI has no
DB either).

Run it like production, against a throwaway database in the compose Postgres:

1. `docker-compose up -d database mailhog`, then create a database:
   `docker exec pcn-db psql -U <POSTGRES_USER> -d postgres -c "CREATE DATABASE pcn_prodcheck;"`.
2. Write an env file in the scratchpad (never in the repo): `DATABASE_URL`/`DIRECT_URL` pointing
   to `database:5432/pcn_prodcheck`, `SMTP_HOST=mailhog`, `SMTP_PORT=1025`, any 32-byte base64
   `TWO_FACTOR_ENCRYPTION_KEY`, `NEXT_PUBLIC_SITE_URL=http://localhost:3001`, plus the AWS/other
   values from `.env`. `--env-file` keeps quotes literally: strip them.
3. Migrations, as Kamal's pre-deploy hook does (also proves `@prisma/engines` downloaded its
   engine during install):
   `docker run --rm --network pcn-website_default --env-file <env> pcn-prod:local pnpm prisma migrate deploy`
4. Start it: `docker run -d --name pcn-prod-check --network pcn-website_default --env-file <env> -p 3001:3000 pcn-prod:local`,
   wait for `curl localhost:3001/up` → `{"status":"OK","database":"OK"}`.
5. Seed it (`docker exec pcn-prod-check pnpm populate-database`) and run the smoke check:

   ```bash
   node .agents/skills/verify-docker/scripts/smoke.mjs http://localhost:3001 --mail juan.perez@example.com
   ```

   It opens the main pages in Chromium (status, console errors, CSP violations — production
   has the strict CSP) and requests a password reset code, checking it reached MailHog. The
   `--mail` address must belong to an existing user (reset doesn't send to unknown addresses).

6. Clean up: `docker rm -f pcn-prod-check` and drop `pcn_prodcheck`.

## 2. Dev stack

```bash
docker-compose up -d --build
docker logs pcn-web        # migrations applied, then "Ready in"
```

- Smoke it the same way: `make apply-migrations`, `docker exec -i pcn-web sh -c "pnpm populate-database"`,
  then `node .agents/skills/verify-docker/scripts/smoke.mjs http://localhost:3000 --mail maria.garcia@example.com`.
- Live reload: change a visible string in `src/`, `curl` the page until it shows, revert with
  `git checkout <file>`. `docker logs pcn-web` must show no `panicked` and no
  `conflicting effects` (Turbopack). If it does, `docker-compose up -d --force-recreate -V web`
  (fresh `.next` and `node_modules` volumes) and try again before blaming the code.
- Don't run `next dev` on the host into another dist dir while the container runs: the mounted
  repo makes the container's Turbopack watch thousands of new files.

## Notes

- Port 5432 may also be taken by a host Postgres (the e2e and `test:db` suites use it). Docker
  still binds; `localhost:5432` on the host reaches the host one.
- `docker-compose down` deletes the dev database (no named volume). Use `docker-compose stop`.
- Leave the dev stack as you found it (running or stopped) and report what you couldn't verify
  (e.g. the amd64 build).
