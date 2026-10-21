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
docker run -d --name ipr-en-website -p 127.0.0.1:3007:80 ipr-en-website
curl -I http://127.0.0.1:3007
# stop: docker rm -f ipr-en-website
```

## Deploy behind a reverse proxy

The published port is bound to loopback only, so it is not reachable from the
network. Point the reverse proxy on the same host at it:

```sh
docker compose up -d --build
```

```caddyfile
ipr.example.com {
	reverse_proxy 127.0.0.1:3007
}
```

Set `IPR_PORT` to publish a different loopback port. TLS is terminated by the
outer proxy, which also obtains the certificate (DNS-01 in the reference setup).

### Updating

```sh
git pull --ff-only
docker compose up -d --build
```

The container has no persistent state. The image can be rebuilt at any time.

## Notes

- The page shows only the four `*_embedded` APKs. Matching uses anchored regexes
  (`_lite_embedded\.apk$` etc.) because `_lite_embedded` is also a prefix of the
  `_cloned` file name.
- Without JavaScript, or if GitHub's API is rate-limited (60 requests/hour per
  visitor IP), every button falls back to the GitHub releases page.
- The Content-Security-Policy forbids inline scripts and styles. Keep it that way.
  Do not enable Cloudflare Rocket Loader for this hostname; it injects inline JS.
