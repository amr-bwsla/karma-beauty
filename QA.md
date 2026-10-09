# Karma Beauty — verification and boundaries

## Checked locally
- Revision 1.1: Tajawal/Manrope fonts, pink/gray palette, compact buttons, category captions moved below photos; vision, mission, values, contact section, right-side menu, floating contact controls, and four locally stored payment logos added.
- Revision 1.5: luxury still-life hero, illustrated face/leaf logo and outlined serif wordmark, continuous gentle zoom without playback controls; seamless offers ticker and readable Arabic footer signoff. Phone and WhatsApp links use +20 10 18239900; missing email is hidden. Link targets are checked without placing calls or sending messages.
- Static production preview built successfully; JavaScript syntax checks passed.
- All 12 packaged PHP files parse as PHP 8 syntax.
- Browser checks with Playwright and installed Chrome: all 20 sample products, category filtering, ascending price sorting, Arabic product search, empty search results, favorites, lipstick shade selection, adding quantities, editing cart quantity, persistence after reload, demo checkout summary, mobile menu.
- The same successful browser run also covered sidebar Escape/aria-expanded reset, sidebar navigation to contact, real phone/WhatsApp hrefs, hidden email, distinct hero/ritual images, visible scale progression of the continuous zoom and ticker movement and removal of hero badge/star/control, four decoded payment logos, Tajawal, and a hero button below 45px. These checks exist in `scripts/qa.mjs`; the saved `qa/results.json` contains a shorter summary.
- No horizontal overflow at 320, 390, 595, 680, 734, 768, and 1440 pixels.
- All page images loaded; no JavaScript page exceptions or HTTP 4xx/5xx responses during the test.
- Desktop and mobile screenshots visually reviewed. Screenshots are in `qa/`.
- Final delivery review on 9 October 2026 includes desktop/mobile sidebars, contact, and payment logos. Presentation captures now disable motion and move the pointer away to avoid partially opened drawers and hover tooltips. Theme screenshot refreshed to 1200×900; both ZIPs rebuilt and their contents compared with the release folders.
- Dependencies audited after updating the image optimizer: zero reported vulnerabilities.
- Images optimized to WebP; fonts hosted locally with license files. No frontend secrets, external checkout calls, customer records, or real payments in the preview.

## Must still be verified on the target installation
- PHP checks are syntax checks, not a running WordPress/WooCommerce integration test. No PHP/MySQL WordPress environment or Hostinger credentials were available here.
- Install the theme and optional demo catalog plugin on staging and verify activation, import, customizer, native product/variation/cart/account/checkout templates, cart fragments, and plugin compatibility.
- The optional sample importer creates simple products; real lipstick shade variations must be configured in WooCommerce.
- Configure real stock, shipping, tax, email delivery, merchant policies, and payment provider settings. Verify provider callbacks and sandbox/live payment lifecycle before launch.
- No site has been deployed to Hostinger, no domain was changed, and no payment gateway was activated.
- The standalone preview stores favorites and cart only in the current browser and does not create orders.

## Reproduce
`npm run build`
`npm run check`
`node scripts/check-php.mjs`
`npm run dev`
In another terminal: `node scripts/qa.mjs` (requires Google Chrome), then `node scripts/capture.mjs` for clean presentation screenshots.

## Revision 1.5 validation
- 20 distinct product image references and file hashes; all decoded in browser. Sixteen new images reviewed alongside the four originals.
- Smaller quick-add pills, soft hero transition, welcome card, six-message seamless infinite offer ticker.
- Demo member signup, sample account, guest coupon rejection, invalid coupon feedback, 10% calculation without stacking, matching checkout, coupon removal, registration reset, reload persistence, gift removal on empty cart, governorate shipping added after discount.
- Entered email is not stored; no external requests or write requests during demo signup. No real backend account or first-order verification. Native WooCommerce account link still awaits runtime staging verification.
- Mocked frontend WooCommerce configuration verifies that account buttons navigate to the configured native account URL and hide demo perks. This does not test WordPress runtime or real account creation.

## Revision 1.6 validation
- Eight selected products, then 16, then all 20 without duplicates. Serum photo upgraded; importer updates ordering only for demo products.
- Matching darker ribbons; lower ribbon moves continuously. Upper ticker covers the viewport at 0%, 25%, 50%, 75%, and end of cycle.
- Six photo suggestions filter during typing, recover after query clearing, and open product details.
- Required governorate, Cairo 50 EGP, other governorates 120 EGP, persisted selection; no free-shipping rule. Coupon remains 10% of products only.
- COD default, online-unavailable message only after selection, explicit COD fallback, matching final summary. No external requests or order creation.
- Equal circular contact controls and no page/search/cart overflow at 320/390/595/680/734/1440.
- Tests: scripts/qa-v16.mjs plus existing storefront and membership suites. PHP remains parser-only; live WooCommerce shipping/payment settings await staging.

## Draft content update — 9 October 2026
- Mobile welcome card is about 82px at 390px; signup CTA remains functional. No horizontal overflow at 320/390/533/680/768/1440.
- All 20 demo products expose illustrative ingredients and two usage steps, with an explicit draft notice. These are not verified product formulas.
- Structured editable shipping, return and privacy drafts display correctly. Governorate delivery estimates switch between Cairo 2–3 and other governorates 3–5 business days; shipping charges remain 50/120 EGP.
- scripts/qa-draft-content.mjs and scripts/qa-v16.mjs passed. PHP parsing passed; no WordPress runtime test.
- Return draft reference: Egyptian Consumer Protection Agency, https://cpa.gov.eg/ar-eg/بيانات-اعلامية/ArtMID/654/ArticleID/6790

## Revision 1.8 — localization startup and offers controls
- scripts/qa-startup.mjs delays i18n.js and samples visible animation frames: default English, saved Arabic, saved English overriding a stale cookie, cookie fallback and unavailable localStorage. No wrong-language visible frame in tested successful loads. An 8-second fail-open prevents permanent blank content if localization fails.
- Dismissal persists on reload and language switch, and moves keyboard focus to the language button. Owner flag is tested via the real preview build; packaged PHP Customizer gate is present and parses, but awaits WordPress runtime testing.
- 32px language control shows ع / EN. Hero fade is on the text-facing side at 870px in either language and remains across the top at 648px; no overflow at 320/648/870/1440.
- scripts/qa-i18n.mjs audits rendered text and accessibility labels in all 20 product dialogs, ingredients, directions, search, membership, shipping, every payment option, policy dialogs, coupon and governorate validation. Arabic remains only in the intentional language-switch glyph or user-authored values.
- Translation and draft-content assets added before this turn are preserved, including model category photos, fully gold serum cap, individual payment options and the printed ritual image.
