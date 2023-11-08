FROM php:8.2-fpm-alpine

WORKDIR /www/app

ENV APP_ENV=prod

COPY docker/prod/php/install-php-extensions /usr/local/bin/

RUN apk add --update \
  icu-dev supervisor && \
  chmod +x /usr/local/bin/install-php-extensions && \
  install-php-extensions amqp intl pdo_mysql pcntl && \
  deluser www-data && \
  adduser -DH -h /home/www-data -s /sbin/nologin -u 1000 www-data && \
  rm -rf /usr/local/bin/install-php-extensions

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY docker/prod/php/overrides.ini /usr/local/etc/php/conf.d/overrides.ini

COPY docker/prod/php/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

COPY docker/prod/php/php-fpm-override.conf /usr/local/etc/php-fpm.d/php-fpm-override.conf

COPY api ./

RUN composer install --no-cache --no-dev --optimize-autoloader

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
