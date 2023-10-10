# Symmetrical Potato

NextJS + API Platform.

## Content

- [Symmetrical Potato](#symmetrical-potato)
  - [Content](#content)
  - [Installation](#installation)
  - [Hosts](#hosts)
  - [Services](#services)
  - [Generating TypeScript types from the API](#generating-typescript-types-from-the-api)
  - [Authentication](#authentication)
  - [Structure](#structure)

## Installation

1. Clone the repository
2. Add the required hosts to your `/etc/hosts` file (see [#hosts](#hosts))
3. (Optional) Add `.env.local` files to override the various default environment variables
4. (Optional) Add `compose.override.yml` to override the default compose configuration
5. Run `make start`
6. Go to [http://symmetrical-potato.com](http://symmetrical-potato.com) to access the NextJS app

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

Which will allow you to access the different services for the project.

| Service             | URL                                                                      |
| ------------------- | ------------------------------------------------------------------------ |
| NextJS app (front)  | [symmetrical-potato.com](symmetrical-potato.com)                         |
| API Platform (back) | [api.symmetrical-potato.com](api.symmetrical-potato.com)                 |
| phpMyAdmin          | [pmp.symmetrical-potato.com](pmp.symmetrical-potato.com)                 |
| MailCatcher         | [mailcatcher.symmetrical-potato.com](mailcatcher.symmetrical-potato.com) |
| RabbitMQ            | [rabbitmq.symmetrical-potato.com](rabbitmq.symmetrical-potato.com)       |

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
The types will be generated in the `src/lib/api/interfaces` folder.

> [!NOTE]  
> For convenience, this folder is ignored by ESLint and Prettier.

## Authentication

We use simple username/password for development purposes.

| Service                 | Username | Password |
| ----------------------- | -------- | -------- |
| `phpmyadmin`, `mariadb` | `root`   | `root`   |
| `rabbitmq`              | `guest`  | `guest`  |

## Structure

> [!NOTE]  
> The API uses the classic Symfony structure. This will only describe the NextJS app structure.

The NextJS app uses the `app` folder for routing, along with the following structure :

| Path                     | Alias                 | Description                                                                                     |
| ------------------------ | --------------------- | ----------------------------------------------------------------------------------------------- |
| `src/`                   | `@/`                  | The base `src` folder where all the files for the app are contained.                            |
| `src/lib/`               | `@lib/`               | The `lib` folder which contains all reusable code (such as utils, API calls, etc...).           |
| `src/lib/api/`           | `@api/`               | The `lib/api` folder which contains calls to the API (for reusability) and the generated types. |
| `src/components/client/` | `@client-components/` | The `components` folder for client-side components.                                             |
| `src/components/server/` | `@server-components/` | The `components` folder for server-side components.                                             |
