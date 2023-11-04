PWD=$(shell pwd)
COMPOSE=docker compose
COMPOSECI=$(COMPOSE) -f docker-compose.ci.yml
COMPOSEPROD=$(COMPOSE) -f docker-compose.prod.yml --env-file .env.prod
EXECPHP=$(COMPOSE) exec php
EXECFRONT=$(COMPOSE) exec front
EXECMARIA=$(COMPOSE) exec mariadb

ifeq ($(OS), Windows_NT)
	ENVIRONMENT=Windows
else
	ENVIRONMENT=$(shell bash ./scripts/get-env.sh)
endif

# Starting/stopping the project
start: build up-recreate composer db generate-jwt perm

build:
	$(COMPOSE) build --force-rm

up:
	$(COMPOSE) up -d --remove-orphans

up-recreate:
	$(COMPOSE) up -d --remove-orphans --force-recreate

stop:
	$(COMPOSE) stop

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

# SSH
ssh:
	$(EXECPHP) sh

ssh-front:
	$(EXECFRONT) sh

ssh-mariadb:
	$(EXECMARIA) bash

# Perm
perm:
ifeq ($(ENVIRONMENT),Linux)
	sudo chown -R $(USER):$(USER) ./api/
	sudo chown -R www-data:$(USER) ./api/public/
	sudo chmod -R g+rwx ./api/
else
	$(EXECPHP) chown -R www-data:root public/
endif

# Installation
composer:
	$(EXECPHP) composer install

bun:
	$(EXECFRONT) bun install

# Generate types from API
generate-types:
	$(EXECFRONT) bun run generate:types
	$(EXECFRONT) bunx eslint ./app/lib/api/types/index.ts --fix

# DB
db: db-drop db-create schema fixtures

db-create:
	$(EXECPHP) php bin/console d:d:c --if-not-exists

db-drop:
	$(EXECPHP) php bin/console d:d:d --if-exists --force

schema:
	$(EXECPHP) php bin/console d:s:u --force --complete

migration:
	$(EXECPHP) php bin/console d:m:m -n --allow-no-migration --all-or-nothing

migration-diff:
	$(EXECPHP) php bin/console make:migration

fixtures:
	$(EXECPHP) php bin/console d:f:l -n

# JWT
generate-jwt:
	$(EXECPHP) php bin/console lexik:jwt:generate-keypair --skip-if-exists

# Rabbitmq
rabbitmq-consume:
	$(EXECPHP) php bin/console messenger:consume -vv

# Debug
dump:
	$(EXECPHP) php bin/console server:dump

# Build & Preview
build-start: front-build front-start

front-build:
	$(EXECFRONT) bun run build

front-start:
	$(EXECFRONT) bun run start

# Containers
list-containers:
	docker compose ps -a

healthcheck-mariadb:
	docker inspect --format "{{json .State.Health }}" mariadb

healthcheck-php:
	docker inspect --format "{{json .State.Health }}" php

healthcheck-front:
	docker inspect --format "{{json .State.Health }}" front

# Logs
logs:
	$(COMPOSE) logs

logs-php:
	$(COMPOSE) logs php

logs-front:
	$(COMPOSE) logs front

logs-mariadb:
	$(COMPOSE) logs mariadb

logs-caddy:
	$(COMPOSE) logs caddy

# Cache
cc:
	$(EXECPHP) bin/console c:cl --no-warmup
	$(EXECPHP) bin/console c:warmup

# Linting
lint: lint-api lint-front

lint-api:
	$(EXECPHP) sh -c "./vendor/bin/php-cs-fixer fix src -v --dry-run"

lint-front:
	$(EXECFRONT) bun run lint

# Format
format: format-api format-front

format-api:
	$(EXECPHP) sh -c "./vendor/bin/php-cs-fixer fix src"

format-front:
	$(EXECFRONT) bun run format

edit-vault:
	docker run --rm -it -v $(PWD):/app -w /app/ansible/group_vars/prod -e EDITOR=nano uhligit/ansible /bin/sh -c "apk add nano && ansible-vault edit vault.yml && chmod a+rw vault.yml"
