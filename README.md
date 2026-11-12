# Packgenix static website

Static export of the Packgenix B2B packaging machinery site
(packgenix.com), built from the AllinCMS preview site and deployed to
Cloudflare Pages.

- Live: https://packgenix.pages.dev (packgenix.com once bound)
- 27 pages: home, about, contact, products list, 12 product pages,
  6 category pages, posts list, 3 articles
- `_worker.js` (Cloudflare Pages Advanced mode) serves the inquiry form
  (`POST /api/contact`, via Resend) and the `/home` -> `/` redirect;
  everything else falls through to the static assets.
- `packgenix-form.js` intercepts the site's forms and posts them to
  `/api/contact`; `packgenix-facade.js` turns the YouTube embeds into
  click-to-load thumbnails.
- `robots.txt` / `sitemap.xml` target https://packgenix.com.

Deploy: `~/workspace/.venv-cloudflare/bin/python
~/workspace/custom-connectors/custom.cloudflare/bin/deploy.py`
Re-push after changes: `python3
~/workspace/custom-connectors/custom.github/bin/push.py`
