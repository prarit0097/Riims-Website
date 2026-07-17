# DEPLOY.md — Putting RIIMS live on the Hostinger VPS (safely)

This guides you through deploying the RIIMS website to **riimshospitals.com** on your
Hostinger VPS, **fully isolated** from the apps already running there.

> The site is **fully static** (plain HTML/CSS/JS). It handles **1000+ concurrent visitors**
> trivially. No Node, PHP, or database runs in production.

> **Your VPS runs Docker + Traefik** (projects: `nirogidhara-command`, `postzyo`,
> `hermes-agent`, `traefik-*`). So the **recommended path is Section A — deploy RIIMS as its
> own Docker container** routed by your existing Traefik (auto-SSL, fully isolated). The
> system-level nginx/Apache steps further down are only an alternative if you ever stop using
> Docker. **VPS IP: `187.127.132.106`** (from your panel; confirm it matches).

---

## A0. ⭐ THIS VPS: add a site to the existing host nginx (no Docker needed)

Diagnostics showed a **host nginx** already on `:80`/`:443` (it reverse-proxies your other apps;
Traefik is dormant). RIIMS is static, so the simplest, most consistent path is to **add one new
nginx server block** that serves the files directly, then certbot for SSL. Your other sites are
untouched (a failed `nginx -t` blocks the reload).

### A0.1 — GoDaddy DNS (do first; certbot needs it)
GoDaddy → riimshospitals.com → **DNS → Manage Zones**: set `A @` and `A www` →
`187.127.132.106` (TTL 600). Edit GoDaddy's existing default `A @` (no duplicates); remove any
root **Forwarding**. Verify: `ping riimshospitals.com` → `187.127.132.106`.

### A0.2 — Confirm the nginx layout + certbot (read-only, safe)
```bash
echo "== host nginx? =="; systemctl is-active nginx; nginx -v 2>&1
echo "== any CONTAINER owns 80/443? =="; docker ps --format '{{.Names}} -> {{.Ports}}' | grep -E ':80->|:443->' || echo "none -> it is HOST nginx (good)"
echo "== config dir =="; ls /etc/nginx/sites-enabled/ 2>/dev/null && echo "(uses sites-enabled)"; ls /etc/nginx/conf.d/ 2>/dev/null && echo "(uses conf.d)"
echo "== certbot? =="; which certbot || ls /etc/letsencrypt/live 2>/dev/null || echo "NO certbot — install: apt-get install -y certbot python3-certbot-nginx"
```

### A0.3 — Clone the site + install the server block
```bash
mkdir -p /opt/riims && cd /opt/riims
git clone https://github.com/prarit0097/Riims-Website.git .

# If nginx uses sites-enabled:
sudo cp deploy/nginx-riims-bootstrap.conf /etc/nginx/sites-available/riimshospitals
sudo ln -s /etc/nginx/sites-available/riimshospitals /etc/nginx/sites-enabled/
# If it uses conf.d instead:
# sudo cp deploy/nginx-riims-bootstrap.conf /etc/nginx/conf.d/riimshospitals.conf

sudo nginx -t                 # MUST say "test is successful" (protects other sites)
sudo systemctl reload nginx
```

### A0.4 — SSL (certbot adds the 443 block + http→https redirect to THIS site only)
```bash
sudo certbot --nginx -d riimshospitals.com -d www.riimshospitals.com
sudo nginx -t && sudo systemctl reload nginx
```

### A0.5 — Verify
```bash
curl -I https://riimshospitals.com/                 # 200 + headers
curl -I https://www.riimshospitals.com/             # 301 -> https://riimshospitals.com/
curl -s -o /dev/null -w "%{http_code}\n" https://riimshospitals.com/conditions/ckd.html  # 200
```

### A0.6 — Update later
```bash
cd /opt/riims && git pull        # static files — served instantly, no reload needed
# If the admin panel is in use, rebuild so admin content is re-applied:
docker run --rm -v /opt/riims:/app -w /app node:24-alpine node build/generate.mjs
# (or just run deploy/update.sh, which does both)
```

### A0.7 — Admin panel (leads + content management)

The admin panel lives at **`/admin/`** (lead management, Pages/SEO editing,
doctors/reels/stories/FAQs/blogs editing, phone-number settings). One-time setup:

```bash
cd /opt/riims && git pull
docker run --rm -v /opt/riims:/app -w /app node:24-alpine node admin/set-password.mjs 'STRONG-PASSWORD'
docker compose -f docker-compose.admin.yml up -d         # admin server on 127.0.0.1:5500
cp deploy/nginx-riims-bootstrap.conf /etc/nginx/sites-available/riimshospitals   # adds /admin + /api proxy
certbot --nginx -d riimshospitals.com -d www.riimshospitals.com --redirect --non-interactive --reinstall
nginx -t && systemctl reload nginx
```
Then open **https://riimshospitals.com/admin/** and log in. Form leads from the website are
stored via `/api/lead` and appear in the Leads tab.

**Two logins.** The command above sets the **owner** password (full panel, including patient
Leads). To give an outside SEO contractor access to everything *except* Leads:

```bash
docker run --rm -v /opt/riims:/app -w /app node:24-alpine node admin/set-password.mjs --seo 'STRONG-SEO-PASSWORD'
```

Hand over only that password. Leads are refused for the SEO role **server-side** (403), not
merely hidden. Passwords apply immediately — no restart. A change to `admin/server.mjs` itself
does need `docker compose -f docker-compose.admin.yml restart`. Details: RIIMS.md §23.

> Permissions: nginx (user `www-data`) must be able to read `/opt/riims/site`. If you get 403,
> run `sudo chmod -R a+rX /opt/riims`.

---

## A. Alternative: deploy RIIMS as its own Docker container

This adds ONE new container (`riims-web`) and does **not** modify any existing project.

> **Which compose file?** A `docker network ls` + label check on this VPS showed **no running
> Traefik** (per-app networks: `hermes-agent-fdph_default`, `nirogidhara_network`,
> `postzyo_default`). So use **`docker-compose.caddy.yml`** — a standalone **Caddy** container
> that serves the static site and gets **automatic Let's Encrypt HTTPS** itself (no Traefik, no
> certbot). It just needs host ports **80 + 443 free**.
>
> `docker-compose.yml` (Traefik-label version) is only for if you later run a shared Traefik.
> Trying Caddy is **safe**: if 80/443 are already taken, `up -d` errors with "port already
> allocated" and nothing else is affected — then tell me and we route via that proxy instead.

### A1. First — GoDaddy DNS (do this now; it propagates while you set up)

In **GoDaddy → My Products → riimshospitals.com → DNS → Manage Zones**:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@`   | `187.127.132.106` | 600 |
| A | `www` | `187.127.132.106` | 600 |

- **Edit GoDaddy's existing default records** rather than adding duplicates: GoDaddy ships a
  parked `A @ → <parking IP>` and often a `CNAME www → @`. Change the `A @` value to your VPS
  IP. For `www`, either an `A www → 187.127.132.106` **or** keep `CNAME www → @` (both work —
  Traefik redirects www → apex anyway).
- Remove any GoDaddy **Domain Forwarding** on the root (it overrides A records).
- Ensure the domain uses **GoDaddy nameservers** (default). If its nameservers point elsewhere,
  make the A records there instead.
- Verify after a few minutes: `ping riimshospitals.com` → `187.127.132.106`.

### A2. Discover your Traefik network + cert resolver (so we match what already works)

Open the Hostinger **Terminal** (or SSH `ssh root@187.127.132.106`) and run — then send me the
output, or read it yourself:

```bash
# 1) all docker networks (look for the one Traefik + your apps share, e.g. *_default or 'web')
docker network ls

# 2) copy the EXACT traefik labels an already-working app uses (network, entrypoint, certresolver)
for c in $(docker ps --format '{{.Names}}'); do
  echo "=== $c ==="; docker inspect "$c" --format '{{json .Config.Labels}}' | tr ',' '\n' | grep -i traefik
done

# 3) which network is that working app attached to?
docker inspect nirogidhara-command --format '{{json .NetworkSettings.Networks}}' 2>/dev/null | tr ',' '\n'
```

From the output note two values:
- **`<TRAEFIK_NETWORK>`** — the shared external network name (e.g. `root_default`, `traefik`, `web`).
- **`<CERTRESOLVER>`** — the value after `tls.certresolver=` in a working app's labels
  (e.g. `letsencrypt`, `le`, `myresolver`). Also note the **entrypoint** name (the value after
  `entrypoints=` — usually `websecure`; if it differs, change it in `docker-compose.yml`).

### A3. Clone the repo into a new folder and configure

```bash
mkdir -p /opt/riims && cd /opt/riims
git clone https://github.com/prarit0097/Riims-Website.git .
nano docker-compose.yml      # replace <TRAEFIK_NETWORK> (2 places) and <CERTRESOLVER>
```

### A4. Launch (isolated — only creates the riims-web container)

```bash
cd /opt/riims
docker compose up -d
docker compose logs -f riims-web    # Ctrl-C to exit; check it started cleanly
docker ps | grep riims-web          # should be running
```

Traefik picks up the new labels automatically and requests the SSL certificate on first hit.
Your other containers are untouched.

### A5. Verify

```bash
curl -I https://riimshospitals.com/                         # 200 + headers (after DNS+cert)
curl -I https://www.riimshospitals.com/                     # 301 -> https://riimshospitals.com/
curl -s -o /dev/null -w "%{http_code}\n" https://riimshospitals.com/conditions/ckd.html   # 200
```
Then open it in a browser and test booking modal / search / WhatsApp / map.

### A6. Update later (after any GitHub push)

```bash
cd /opt/riims && git pull        # site/ is bind-mounted → served instantly, no restart
```
(If you ever change `docker-compose.yml` or `nginx.conf`: `docker compose up -d` to re-apply.)

### A7. Safety notes (shared VPS)

- Only `docker compose up -d` from `/opt/riims` — it creates just `riims-web`. It cannot
  affect other projects.
- Use the **same external network + cert resolver** as your other apps (A2) — do **not** create
  a new Traefik or publish host ports 80/443 (those belong to Traefik). The container exposes
  port 80 **inside** the Docker network only; Traefik handles public 80/443 + TLS.
- To remove cleanly later: `cd /opt/riims && docker compose down`.

---

## B. Alternative: system nginx / Apache (only if NOT using Docker)

Use this **only** if you stop using Traefik/Docker for this site. On your current VPS, prefer
Section A.

---

## 0. Before you start — safety rules for the shared VPS

- ✅ Everything below creates a **NEW folder** (`/var/www/riimshospitals`) and a **NEW site
  block**. It does **not** edit any existing vhost, app, or config.
- ✅ **Always run the config test before reloading** (`nginx -t` / `apachectl configtest`).
  If it fails, the reload won't happen and your other sites stay untouched. **Never reload
  on a failed test.**
- ❌ Do **not** edit the global `nginx.conf` / `apache2.conf`. Only add the provided
  per-site file.
- Use a non-conflicting folder + server_name; the only shared thing is ports 80/443, which
  nginx/Apache route by domain (`server_name`/`ServerName`) — so multiple sites coexist.

---

## 1. Point the domain at the VPS (DNS)

In your domain registrar / Hostinger DNS for **riimshospitals.com**:

| Type | Name | Value |
|------|------|-------|
| A    | `@`  | `<your VPS IP>` |
| A    | `www`| `<your VPS IP>` |

Wait for DNS to propagate (a few minutes to a few hours). Verify: `ping riimshospitals.com`
resolves to your VPS IP.

---

## 2. Get the code onto the VPS (git pull method)

SSH into the VPS, then clone the repo into the new folder:

```bash
sudo mkdir -p /var/www/riimshospitals
sudo chown -R "$USER":"$USER" /var/www/riimshospitals
git clone https://github.com/prarit0097/Riims-Website.git /var/www/riimshospitals
```

The deployable website is the **`/var/www/riimshospitals/site`** folder (that is your web
root). Nothing to build on the server — `site/` is already generated and committed.

**To update later** (after any push to GitHub):
```bash
/var/www/riimshospitals/deploy/update.sh
# or:  cd /var/www/riimshospitals && git pull
```
Static content — no web-server reload needed after a content update.

---

## 3. Configure the web server

> You told me you'll confirm nginx vs Apache at deploy time. Use the matching section.
> Both configs serve `…/riimshospitals/site`, force HTTPS, redirect `www → non-www`
> (canonical = `https://riimshospitals.com`), set caching + gzip + security headers + CSP,
> and use the branded `404.html`.

### Option A — nginx (most common on Hostinger VPS)

```bash
sudo cp /var/www/riimshospitals/deploy/nginx-riimshospitals.conf \
        /etc/nginx/sites-available/riimshospitals
# EDIT the file: set `root` to /var/www/riimshospitals/site and the ssl_certificate paths
sudo nano /etc/nginx/sites-available/riimshospitals
sudo ln -s /etc/nginx/sites-available/riimshospitals /etc/nginx/sites-enabled/
sudo nginx -t            # MUST say "syntax is ok / test is successful"
sudo systemctl reload nginx
```

### Option B — Apache

```bash
sudo cp /var/www/riimshospitals/deploy/apache-riimshospitals.conf \
        /etc/apache2/sites-available/riimshospitals.conf
sudo nano /etc/apache2/sites-available/riimshospitals.conf   # set DocumentRoot + cert paths
sudo a2enmod headers rewrite expires deflate ssl
sudo a2ensite riimshospitals
sudo apachectl configtest   # MUST say "Syntax OK"
sudo systemctl reload apache2
```
(The caching/gzip/headers/clean-URLs/404 also come from `site/.htaccess`, which ships in the repo.)

### Option C — Hostinger hPanel managed

If you manage sites through hPanel instead of editing server configs:
1. hPanel → **Websites → Add website** (or add `riimshospitals.com`).
2. Set its **document root** to `…/riimshospitals/site` (or copy the contents of `site/`
   into the website's `public_html`).
3. The bundled **`site/.htaccess`** provides caching, gzip, security headers, clean URLs
   and the 404 automatically (Hostinger uses Apache/LiteSpeed which honor `.htaccess`).
4. Enable **SSL** from hPanel (free Let's Encrypt) and **Force HTTPS**.

---

## 4. SSL certificate (HTTPS)

If using certbot (nginx/Apache):
```bash
sudo certbot --nginx   -d riimshospitals.com -d www.riimshospitals.com   # nginx
# or
sudo certbot --apache  -d riimshospitals.com -d www.riimshospitals.com   # apache
```
On Hostinger hPanel, just enable SSL for the site. **Only enable the HSTS header after HTTPS
works** (it's already in the configs; leave it — certbot sets up HTTPS first).

---

## 5. Verify it's live

```bash
curl -I https://riimshospitals.com/                 # 200, security headers present
curl -I https://www.riimshospitals.com/             # 301 -> https://riimshospitals.com/
curl -s -o /dev/null -w "%{http_code}\n" https://riimshospitals.com/conditions/ckd.html  # 200
curl -s -o /dev/null -w "%{http_code}\n" https://riimshospitals.com/this-does-not-exist   # 404 (branded page)
```
Then open the site in a browser: header/footer, booking modal, disease search, blog filter,
mobile bottom bar, WhatsApp/Call buttons, and the Google map on the contact page.

---

## 6. Post-launch SEO actions (do these to start ranking)

These are **off-site / account actions only you can do** — the site itself is SEO-ready:

1. **Google Search Console** → add `https://riimshospitals.com`, verify, and **submit
   `https://riimshospitals.com/sitemap.xml`**.
2. **Google Business Profile** for the Baraut clinic (category: Nephrologist / Medical clinic),
   with the exact same Name/Address/Phone as the site. This is the #1 lever for local/"near me"
   searches. Get the real clinic coordinates and update `SITE.geo` + `mapsQuery` in
   `build/data.mjs` to match, then rebuild.
3. **Bing Webmaster Tools** → submit the sitemap too.
4. Collect **real Google reviews**; once you have them, replace the demo rating numbers and add
   `aggregateRating` schema (do not add fake ratings).

---

## 7. Performance / 1000+ concurrent — what's already handled

- **Static files only** → nginx/Apache serve them from cache/RAM with negligible CPU; thousands
  of req/s per core. No backend to bottleneck.
- **HTTP/2 + gzip + long-cache** for assets are in the provided config → returning visitors and
  asset re-fetches are near-free; text payloads shrink ~75%.
- **Lucide is self-hosted** and **JS is deferred** → no third-party JS SPOF, no render-blocking.
- **Leads never depend on the server:** the booking form opens a **prefilled WhatsApp message**,
  and Call/WhatsApp are plain links — so enquiries work even with JS disabled or under load.

### Recommended follow-ups (not blockers; documented in RIIMS.md §21)
- Compress images (the 1.46 MB `assets/riims-logo.png` is only used for social cards; the reel
  PNGs ~770 KB) → WebP/AVIF for faster LCP. (No image tool was available locally to do this here.)
- Replace the 9 templated blog articles with full original long-form content for peak SEO.
- Add a real 1200×630 social share image (currently the logo is used for OG).
