# Facebook Marketplace Storefront (Meta Commerce) Setup

This repo includes a starter catalog feed you can import into Meta Commerce Manager:

- CSV feed: `catalog/offendhop-facebook-marketplace-catalog.csv`

## 1) Create the basics

1. Create a Facebook Page for your store (example: **The TShirt Comedian**).
2. Create / access a Meta Business portfolio (Business Manager).

## 2) Create a catalog + import the feed

1. Open **Commerce Manager**.
2. Create a **Catalog** (type: **Ecommerce**).
3. Add items via **Data Feed** and upload the CSV from this repo.

When your site is live, you can also host the CSV at a public URL (ex:
`https://offendhop.com/catalog/offendhop-facebook-marketplace-catalog.csv`) and schedule refreshes.

## 3) Create the storefront (Shop) and connect channels

1. In Commerce Manager, create a **Shop** for your Page.
2. Choose checkout method:
   - **Checkout on another website** (sends shoppers to your site), or
   - **Checkout on Facebook/Instagram** (if available for your account/region).
3. Connect sales channels you want (Facebook Page, Instagram, Marketplace if available).

## 4) Replace placeholders (required before going live)

Edit the CSV and replace:

- `link`: your real product page URL per item.
- `image_link`: a real, public product image URL per item.

The current `offendhop.com` links are placeholders so the file is importable.

## 5) Upload visuals (optional, but recommended)

Brand assets included:

- Profile/logo: `assets/brand/offendhop-logo.png` (also `.svg`)
- Cover/banner: `assets/brand/offendhop-cover.png` (also `.svg`)
- Paste-ready storefront copy: `catalog/storefront-copy.md`

Export to PNG if Facebook rejects SVG uploads.

### Promo video (optional)

This storefront includes a **Video** section that plays a self-hosted MP4 and
links to your Facebook Reel. Replace the MP4 at:

- `assets/video/offendhop-promo.mp4`

## 6) Content/policy guardrails

Keep jokes aimed at ideas, systems, or public behavior—not protected groups.
Avoid slurs, threats, and harassment so listings survive review and stay sellable.
