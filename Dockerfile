FROM caddy:2.11.7-alpine
COPY --chown=1001:1001 Caddyfile /etc/caddy/Caddyfile
COPY --chown=1001:1001 site/ /srv/
EXPOSE 80
