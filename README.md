# Karma Beauty

Current release: **1.8.0**. English is the first-visit default. A saved language is applied in the head before rendering; the body is revealed immediately after localization, avoiding an Arabic/English flash. The 32px switch shows `ع` in English and `EN` in Arabic. The desktop hero seam follows the text side in both directions; stacked layouts retain a top fade.

Visitors can dismiss the offers bar; this preference persists in their browser. Owners can disable it in WordPress **Appearance → Customize → Karma Beauty — الرئيسية → إظهار شريط العروض أعلى الموقع**. For the local preview, set `announcementEnabled` in `assets/store-content.json` and rebuild. The owner setting and visitor preference are independent. The new startup checks exercise delayed translation loading, first-visit/saved/cookie/storage-denied cases, persistence and direction. The English audit covers all 20 product details, ingredients/directions, policies, account, search, coupon errors and payment choices.

Draft content update (9 October 2026): mobile welcome card reduced to about 82px at a 390px viewport. All 20 demo products include draft ingredients and directions, clearly labeled as illustrative rather than verified formulas. Edit these in `assets/products.json`. Editable draft shipping, returns and privacy content plus delivery estimates are in `assets/store-content.json` (Cairo 2–3 business days; other governorates 3–5). The importer adds a details tab only to marked demo products. Local checks: `scripts/qa-draft-content.mjs`, v1.6 interaction checks, JavaScript syntax and PHP parsing passed.

Latest review (9 October 2026): removed the decorative ribbon below the hero, replaced the ritual caption with gold printing embedded in `assets/ritual-printed.webp`, adjusted its responsive framing, and named the remaining dialogs for assistive technology. Storefront, membership and v1.6 interaction suites passed. Findings and launch requirements: `qa/SITE-REVIEW.md`.

Browser feedback update (9 October 2026): Dew Drops now has an entirely gold cap. Three generated model portraits illustrate skincare, makeup and bodycare; the ritual signature is straight. The preview cart offers individual COD, Visa, Mastercard, Fawry and Paymob choices with local images. Electronic methods remain explicitly unavailable until integration. Generation prompts and asset paths are in `assets/comment-image-prompts.md`; reviewed screenshots are `qa/comment-*.png`. The build, JavaScript syntax, packaged PHP parsing and updated `scripts/qa-v16.mjs` checks pass.

A bespoke English/Arabic pink beauty storefront, delivered as an interactive local preview and an installable WooCommerce theme.

## Preview
Dependencies are already installed in this workspace. Run `npm.cmd run dev` if the preview server is stopped, then open http://127.0.0.1:4173. Run `npm.cmd run build` only after source changes.

The preview includes 20 fictional products, category filters, Arabic search, price sorting, product details, sample lipstick shades, browser-local favorites and a persistent cart. Checkout is explicitly a preview; it neither takes payments nor submits orders.

## WordPress deliverables
Release 1.6.0 includes the latest pink design, Tajawal/Manrope fonts, compact buttons, right sidebar, vision/mission/values, contact section, and local payment logos. The theme screenshot and both ZIP packages were refreshed on 9 October 2026 after visual review.

Phone and WhatsApp now link to the user-provided +20 10 18239900. Email is hidden until a real address is supplied. Payment logos represent proposed providers only. Hostinger deployment and WordPress/WooCommerce runtime verification await suitable access and real store data.

- `release/karma-beauty.zip`: installable custom theme.
- `release/karma-demo-products.zip`: optional idempotent sample catalog importer.
- [Hostinger setup instructions](HOSTINGER-SETUP.md).
- [Verification and limits](QA.md).

`theme/` contains the PHP source templates; the build substitutes asset paths and native customizer fields into `release/karma-beauty/`. Install the release ZIP, not the source template folder. Standard WooCommerce pages run natively; the homepage reads the current published products and adds purchasable simple products with WooCommerce AJAX. Complex products go to their native product page.

## Assets
The illustrated face-and-leaf logo, outlined serif wordmark, and matching favicon are in `assets/`. The new `hero-luxury.webp` shows a complete luxury still life with continuous, gentle zoom in/out, without badges, stars, or playback controls; the original image remains in the ritual section. Campaign images and product photographs were generated with the built-in imagegen tool; prompts are in `assets/image-prompts.md` and `assets/product-image-prompts.md`. Optimized WebP files ship with the theme; original PNGs remain in the workspace. Every one of the 20 fictional products now has a unique image: twenty distinct product photographs, including the revised champagne-cap Dew Drops image. Source PNGs and prompts remain local; optimized WebP assets ship with the theme.

Fonts are bundled locally; license and origin files are under `assets/fonts/`.

## Validation
`npm run check` validates JavaScript syntax. `node scripts/check-php.mjs` parses the packaged PHP source. `node scripts/qa.mjs` checks frontend flows and mobile layout against the running preview with installed Chrome. This does not replace staging tests against WordPress, WooCommerce, Hostinger, or a live payment gateway.

Release 1.4 adds a seamless opening-offers ticker (no unapproved discount amounts) and a readable Arabic footer signoff. The floating contact buttons hide while the footer contact links are visible. The first ticker message is editable in WordPress Customizer.

## Membership and welcome offer
The preview offers local demo registration (name plus email field, or a sample account), 10% off product subtotal with KARMA10, and one free care-sample gift per nonempty preview cart. Only the name and membership/coupon state persist in browser storage; email is neither stored nor sent, and there is no password, server account, email verification, or order creation. First-order eligibility is illustrative only because no orders exist in the preview. Shipping requires a governorate: Cairo is 50 EGP and all other governorates (including Giza) are 120 EGP. There is no free-shipping threshold. Selection persists locally. Cash on delivery is selected by default; choosing other methods reveals their unavailability and an explicit return-to-COD button. The final summary states that the store is not accepting orders; no request is submitted. Invalid codes and guest use are rejected; the discount does not stack. Removing registration clears the coupon.
In WooCommerce mode, account buttons open native My Account, demo reward cards are hidden, and the ticker uses generic copy. Real coupon creation, registration settings, first-order verification and gift fulfillment await staging and merchant configuration. The demo importer refreshes images only on products already marked _karma_demo=yes and never changes real products with matching SKUs.
Validation: node scripts/qa-membership.mjs verifies signup, coupon arithmetic, persistence, empty cart behavior and absence of external writes. All product images are verified distinct and present.

## Revision 1.6
Eight curated products appear initially; load more reveals eight at a time. The importer sets their menu order and featured flags, updating only marked demo products. Search shows six suggested photo cards and filters them as the visitor types. Both ribbons use a deeper pink and loop continuously. Contact buttons are equal circles. Shipping and total labels use normal storefront copy; backend limitations remain in the final summary and membership notice. Tests: node scripts/qa-v16.mjs. Serum edit prompt: assets/serum-image-prompts.md; final: assets/products/dew-drops-luxury.webp, generated with the built-in image_gen tool.
