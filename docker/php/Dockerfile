FROM php:8.3-fpm-alpine

WORKDIR /www/app

ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN apk add --update \
    icu-dev supervisor && \
    chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions amqp intl pdo_mysql pcntl && \
    deluser www-data && \
    adduser -DH -h /home/www-data -s /sbin/nologin -u 1000 www-data

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
