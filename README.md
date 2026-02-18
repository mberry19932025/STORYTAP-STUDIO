# The TShirt Comedian (OffendHop)

Static storefront page + a Meta Commerce (Facebook Marketplace) catalog feed.

## Key files

- Storefront: `index.html`
- Styles: `css/styles.css`
- Facebook/Meta catalog feed (CSV): `catalog/offendhop-facebook-marketplace-catalog.csv`
- Storefront setup steps: `catalog/facebook-marketplace-storefront-setup.md`
- Paste-ready store copy/policies: `catalog/storefront-copy.md`
- Brand assets: `assets/brand/offendhop-logo.png`, `assets/brand/offendhop-cover.png`

## Local preview

Run:

```sh
npm run serve
```

Then open `http://localhost:8080/`.

## Make a shareable link (for Facebook)

You need a public HTTPS URL. Easiest options:

1. **GitHub Pages** (project site)
2. **Netlify** (drag-and-drop the folder)
3. **Any static host** (S3, Cloudflare Pages, etc.)

Once hosted, use your public base URL in the Marketplace section on the page to
copy:

- Storefront URL
- Feed URL (for scheduled refresh)
- Logo/Cover URLs

If you enable GitHub Pages for the current GitHub remote (`mberry19932025/STORYTAP-STUDIO`)
the URLs typically look like:

- Storefront: `https://mberry19932025.github.io/STORYTAP-STUDIO/`
- Feed: `https://mberry19932025.github.io/STORYTAP-STUDIO/catalog/offendhop-facebook-marketplace-catalog.csv`

## Re-render PNGs (optional)

If you edit the SVGs, regenerate PNGs with:

```sh
npm install
npm run render:png
```
