# IDOLY PRIDE English Patch landing page

A one-page static site that points people at the latest APKs from
`tokanada/ipr-patcher-en`. No framework, no build step, no external CDNs.
The only network call is to the GitHub API (latest release).

## Files

- `site/` the website (index.html, styles.css, app.js, favicon.svg)
- `Caddyfile` the in-container static server config (port 80, security headers)
- `Dockerfile`, `docker-compose.yml`, `.dockerignore`

## Build and run

```sh
docker build -t ipr-en-website .
docker run -d --name ipr-en-website -p 8080:80 ipr-en-website
curl -I http://localhost:8080
# stop: docker rm -f ipr-en-website
```

## Deploy behind your existing Caddy

With compose (the service joins an external network called `proxy`):

```sh
docker network create proxy   # once, if it doesn't exist
docker compose up -d --build
```

Your outer Caddy must be on the same `proxy` network. Then in its Caddyfile:

```
example.com {
	reverse_proxy ipr-en-website:80
}
```

If your outer Caddy is not in a container, uncomment the `ports` lines in
`docker-compose.yml` (`127.0.0.1:8080:80` is a good choice) and use:

```
example.com {
	reverse_proxy localhost:8080
}
```

## Notes

- The page shows only the four `*_embedded` APKs. Matching uses anchored regexes
  (`_lite_embedded\.apk$` etc.) because `_lite_embedded` is also a prefix of the
  `_cloned` file name.
- Without JavaScript, or if GitHub's API is rate-limited (60 requests/hour per
  visitor IP), every button falls back to the GitHub releases page.
- The Content-Security-Policy forbids inline scripts and styles. Keep it that way.
