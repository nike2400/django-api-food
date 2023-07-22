#!/bin/sh

set -e

envsubst < /etc/nginx/default.conf.tpl > /etc/eginx/conf.d/default.conf
nginx -g 'daemon off;'