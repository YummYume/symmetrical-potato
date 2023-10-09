# Symmetrical Potato

NextJS + API Platform.

## Content

- [Symmetrical Potato](#symmetrical-potato)
  - [Content](#content)
  - [Installation](#installation)
  - [Hosts](#hosts)
  - [Services](#services)
  - [Generating TypeScript types from the API](#generating-typescript-types-from-the-api)

## Installation

- 1. Clone the repository
- 2. Add the required hosts to your `/etc/hosts` file (see [#hosts](#hosts))
- 3. (Optional) Add `.env.local` files to override the various default environment variables
- 4. (Optional) Add `compose.override.yml` to override the default compose configuration
- 5. Run `make start`
- 6. Go to [http://symmetrical-potato.com](http://symmetrical-potato.com)

After the first run, you can use `make stop` & `make up` to quickly stop and start the containers.
All the available commands are listed in the `Makefile`.

## Hosts

Add the following to your `/etc/hosts` file:

```bash
127.0.0.1 symmetrical-potato.com
127.0.0.1 api.symmetrical-potato.com
127.0.0.1 pmp.symmetrical-potato.com
127.0.0.1 mailcatcher.symmetrical-potato.com
127.0.0.1 rabbitmq.symmetrical-potato.com
```

## Services

All the services used by the project.

> [!NOTE]  
> Some services are only available in dev. They will never by used in production or even test environments.

| Service name  | Host                                                                 | Aliases           | Ports       | Description                                                                                                  |
| ------------- | -------------------------------------------------------------------- | ----------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `caddy`       |                                                                      | `sp-caddy`, `api` | `80`, `443` | Caddy is used as the proxy entry to any of the running services. It also services static files from the API. |
| `front`       | `symmetrical-potato.com`                                             | `sp-front`        |             | The NextJS app.                                                                                              |
| `php`         | `api.symmetrical-potato.com`, `api:9000` (within the Docker network) | `sp-php`          |             | Symfony API with API Platform.                                                                               |
| `mariadb`     |                                                                      | `sp-mariadb`      |             | The database used by the API.                                                                                |
| `phpmyadmin`  | `pmp.symmetrical-potato.com`                                         | `sp-phpmyadmin`   |             | Used to manage MariaDB easily. Only available in dev.                                                        |
| `mailcatcher` | `mailcatcher.symmetrical-potato.com`                                 | `sp-mailcatcher`  |             | Catches all mails sent by the API. Only available in dev.                                                    |
| `rabbitmq`    | `rabbitmq.symmetrical-potato.com`                                    | `sp-rabbitmq`     |             | Queue system for the API (such as mails).                                                                    |

## Generating TypeScript types from the API

Use the `make generate-types` command to generate the TypeScript types from the API.
The types will be generated in the `src/lib/interfaces` folder.

> [!NOTE]  
> For convenience, this folder is ignored by ESLint and Prettier.
