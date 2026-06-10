# DEPLOY.md — Putting RIIMS live on the Hostinger VPS (safely)

This guides you through deploying the RIIMS website to **riimshospitals.com** on your
Hostinger VPS, **in its own isolated folder + its own web-server site block**, without
touching the 6–7 apps already running there.

> The site is **fully static** (plain HTML/CSS/JS). It handles **1000+ concurrent visitors**
> trivially — the only "scaling" work is the caching/compression/HTTP-2 already written into
> the provided web-server config. No Node, PHP, or database runs in production.

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
