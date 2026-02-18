# The TShirt Comedian (OffendHop) Facebook Marketplace Catalog

Starter feed: `offendhop-facebook-marketplace-catalog.csv`

Setup guide: `facebook-marketplace-storefront-setup.md`

Paste-ready About/Policies copy: `storefront-copy.md`

## What to edit first

- `link`: change to your real product page URL for each item.
- `image_link`: change to your real product mockup URL for each item.

The current URLs use `https://offendhop.com/...` as placeholders.
This starter CSV points at placeholder images in `assets/products/*.png`.

## Upload path (typical)

Commerce Manager → Catalog → Data Sources → Add Items → Data Feed

## Variants (sizes/colors)

This starter CSV is one row per listing. If you want size/color variants:

- Create one row per variant SKU.
- Add `item_group_id` (same for all variants of the same design/product).
- Keep `id` unique per variant (ex: `OH-TEE-WHIPITOUT-BLK-M`).
- Set `size` and `color` per row.
