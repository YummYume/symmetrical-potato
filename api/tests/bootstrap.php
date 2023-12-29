<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

if (file_exists(dirname(__DIR__).'/config/bootstrap.php')) {
    require dirname(__DIR__).'/config/bootstrap.php';
} elseif (method_exists(Dotenv::class, 'bootEnv')) {
    (new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
}

if ($_SERVER['APP_DEBUG']) {
    umask(0000);
}

if ('test' === $_SERVER['APP_ENV']) {
    // Reset the test database
    exec(sprintf(
        'php "%s/../bin/console" doctrine:database:drop --if-exists --force --env=test',
        __DIR__
    ));
    exec(sprintf(
        'php "%s/../bin/console" doctrine:database:create --env=test',
        __DIR__
    ));
    exec(sprintf(
        'php "%s/../bin/console" doctrine:schema:create --env=test',
        __DIR__
    ));
    exec(sprintf(
        'php "%s/../bin/console" doctrine:fixtures:load --env=test --no-interaction',
        __DIR__
    ));
    exec(sprintf(
        'php "%s/../bin/console" lexik:jwt:generate-keypair --skip-if-exists',
        __DIR__
    ));
}
