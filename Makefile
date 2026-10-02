.PHONY: apply-migrations

WEB_CONTAINER := pcn-web

apply-migrations:
	echo "✏️ Applying migrations in $(WEB_CONTAINER) docker container..."
	docker exec -i $(WEB_CONTAINER) /bin/sh -c "pnpm apply-migrations"

