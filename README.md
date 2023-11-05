# Symmetrical Potato

Payday 3 inspired project to plan your heists in New York City.

Remix + API Platform + GraphQL.

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
6. Go to [http://symmetrical-potato.com](http://symmetrical-potato.com) to access the Remix app

After the first run, you can use `make stop` & `make up` to quickly stop and start the containers.
All the available commands are listed in the `Makefile`.

## Hosts

Add the following to your `/etc/hosts` file:

```bash
127.0.0.1 symmetrical-potato.com
127.0.0.1 api.symmetrical-potato.com
127.0.0.1 pma.symmetrical-potato.com
127.0.0.1 mailcatcher.symmetrical-potato.com
127.0.0.1 rabbitmq.symmetrical-potato.com
```

Which will allow you to access the different services for the project.

| Service             | URL                                                                             |
| ------------------- | ------------------------------------------------------------------------------- |
| Remix app (front)   | [symmetrical-potato.com](http://symmetrical-potato.com)                         |
| API Platform (back) | [api.symmetrical-potato.com](http://api.symmetrical-potato.com)                 |
| phpMyAdmin          | [pma.symmetrical-potato.com](http://pma.symmetrical-potato.com)                 |
| MailCatcher         | [mailcatcher.symmetrical-potato.com](http://mailcatcher.symmetrical-potato.com) |
| RabbitMQ            | [rabbitmq.symmetrical-potato.com](http://rabbitmq.symmetrical-potato.com)       |

## Services

All the services used by the project.

> [!NOTE]  
> Some services are only available in dev. They will never by used in production or even test environments.

| Service name  | Host                                                                 | Aliases           | Ports       | Description                                                                                                  |
| ------------- | -------------------------------------------------------------------- | ----------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `caddy`       |                                                                      | `sp-caddy`, `api` | `80`, `443` | Caddy is used as the proxy entry to any of the running services. It also services static files from the API. |
| `front`       | `symmetrical-potato.com`                                             | `sp-front`        |             | The Remix app.                                                                                               |
| `php`         | `api.symmetrical-potato.com`, `api:9000` (within the Docker network) | `sp-php`          |             | Symfony API with API Platform.                                                                               |
| `mariadb`     |                                                                      | `sp-mariadb`      |             | The database used by the API.                                                                                |
| `phpmyadmin`  | `pma.symmetrical-potato.com`                                         | `sp-phpmyadmin`   |             | Used to manage MariaDB easily. Only available in dev.                                                        |
| `mailcatcher` | `mailcatcher.symmetrical-potato.com`                                 | `sp-mailcatcher`  |             | Catches all mails sent by the API. Only available in dev.                                                    |
| `rabbitmq`    | `rabbitmq.symmetrical-potato.com`                                    | `sp-rabbitmq`     |             | Queue system for the API (such as mails).                                                                    |

## Generating TypeScript types from the API

Use the `make generate-types` command to generate the TypeScript types from the API.
The types will be generated in the `front/app/lib/api/types/index.ts` file.

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
> The API uses the classic Symfony structure. This will only describe the Remix app structure.

The Remix app uses the `app/routes` folder for routing, along with the following structure :

| Path                 | Alias          | Description                                                                                     |
| -------------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| `app/`               | `~/`           | The base `app` folder where all the files for the app are contained.                            |
| `app/styles/`        | `~styles/`     | The `styles` folder which contains all SCSS/CSS style for the app.                              |
| `app/lib/`           | `~lib/`        | The `lib` folder which contains all reusable code (such as utils, API calls, etc...).           |
| `app/lib/api/`       | `~api/`        | The `lib/api` folder which contains calls to the API (for reusability) and the generated types. |
| `app/lib/components` | `~components/` | The `lib/components` folder which contains all the reusable components.                         |
| `app/lib/utils/`     | `~utils/`      | The `lib/utils` folder containing all the reusable utils.                                       |
