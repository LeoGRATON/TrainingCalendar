FROM php:8.3-fpm-alpine

# Extensions nécessaires
RUN apk add --no-cache \
    git curl unzip libpq-dev icu-dev \
    && docker-php-ext-install pdo pdo_pgsql intl opcache

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/symfony