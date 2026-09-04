# MazidMart Website Enhancement Plan — Catalog-Only Brand Informative Site

**Date:** 2026-09-04
**Scope:** `mazidmart-website/Mazid-Mart` (static HTML/CSS/JS) + `customer_silver_app` (Flutter/Supabase) integration
**Goal:** Transform current static site into premium **informational catalog** website: display **Categories & Products only** via **free (no-auth) endpoints**, luxury silver brand identity, fully responsive.

---

## 1. Executive Summary

Current website is static (HTML 426 lines, 12 CSS files ~1500 lines, 5 JS files) with hardcoded images for 5 categories (Rings 12, Necklaces 12, Bracelets 8, Earrings 5, Silver Sets 26 = 63 SKUs) and 3 disabled categories (Anklets, Silver Bars, Custom). No backend; slider data is local `js/work_slider.js:16-23`.

> **Verified live catalog (2026-09-04):** `GET get_categories?only_active=true&only_roots=true` with anon key returns `success:true, 4 roots` — `KIDS COLLECTION (1)`, `LADIES JEWELLERY (0)`, `GENTS JEWELLERY (4)`, `GIFT BOXES (0)` — confirming site's 8 hardcoded categories are **stale** and must be replaced by live API. Products are served via `get_products_by_category` / `get_all_products`.

Flutter app `customer_silver_app` (`lib/core/api/end_points.dart:1`) uses Supabase RPC `https://aqxymuqjcmdenlgctzou.supabase.co/rest/v1/rpc/` with anon key (`.env:1`). Free endpoints already support public catalog without login. Website should consume **same public RPC** directly via `fetch` + `apikey` header — no session/cart/wishlist/order.

Target is **read-only brand showcase**: Hero, About/Legacy, Categories Grid (live), Product Gallery, Silver Price Banner (optional), Contact/Location, Footer — no checkout, no auth.

---

## 2. Discovery & Audit

### 2.1 Website — Current State (`index.html:1`)

| Area | Status | Issues |
|------|--------|--------|
| **Header** `css/header.css:1` | Fixed, blur, bilingual | Mobile grid logic fragrile (`768px`), logo re-order hacks, `background: rgba(0,0,0,0.2)` low contrast, no sticky shadow |
| **Hero** `css/hero.css:1` | 4 slides `images/hero_images/slide1-4.png`, 100vh | No lazy-load, no preloader, no `srcset`, text shadow only, Lighthouse CLS risk |
| **About/Stats** `css/about.css` | 4 stats (15+ yrs, 40+ awards...) | Hardcoded, no animation chaining, not data-driven |
| **Collection** `css/collection.css` | 2 static images | Overlapping text on <900px, images not responsive |
| **Why Choose / Promo** `css/choose.css:211` | 4 feature boxes + 2 promo cards | Promo cards use `overlay` class collision with header overlay, no hover on touch |
| **Discover** `css/discover_section.css:126` | Full bleed CTA | Single bg image not optimized |
| **Services** `css/service.css:196` | 4 cards (Custom, Repair, Wholesale, Corporate) | Makes site look service-agency, not catalog — to be **removed/de-emphasized** per brand-only goal |
| **Our Work (Categories)** `css/work.css:1` | 8-box grid 4→2 cols, modal slider `js/work_slider.js:16` | 3 categories disabled via JS `opacity:0.5` hack, local paths `images/mazid products/...` spaces in path = 404 risk, modal not accessible, no product details |
| **Contact** `css/contact.css:206` | 4 cards | Hardcoded map link `YourMapLink`, duplicate phone/whatsapp |
| **Responsive** | `768px`, `900px`, `480px` three breakpoints | Inconsistent breakpoints, `header.css:105` vs `work.css:107`, no `1024px` tablet, no container fluid |
| **i18n** `js/lang.js:222` | `data-key` dictionary, body `.ar` RTL | Works, but translation not synced with API (`name_en/name_ar`) |
| **JS** | 5 files `js/` | No bundler, `defer` correct, but `work_slider.js:118` disables boxes via inline style — should filter via API `is_active` |

### 2.2 Mobile App — Relevant Free Layer (`lib/core/api/end_points.dart:1`)

Confirmed free/public endpoints (tested via `DioConsumer` with only `apikey` header, no Bearer):

- `get_home_screen_data` `end_points.dart:75` — SDUI sections: `hero_banners`, `categories_grid`, `products_horizontal_scroll`, `product_grid`, `deals_flash`, `category_promotion` etc. `lib/features/home/data/models/home_section_model.dart:62` handles typing. **Pass `user_id=''` to get guest data** `lib/features/home/data/repos/home_repository.dart:36`.
- `get_categories` `end_points.dart:124` — root + children, `only_active`, `only_roots`. Used by `CategoriesRepository:38`. Free.
- `get_subcategories` (same RPC) with `parent_id_filter`.
- `get_category_product_images` `end_points.dart:130` — `POST {p_category_id}` `categories_repository.dart:104`.
- `get_all_products` `end_points.dart:78`, `get_products_by_category` `:87`, `search_products` `:84`, `get_newest_products` `:102`, `get_most_popular_products` `:105` — all public, paginated.
- Silver price via Supabase table direct `SilverPriceRepository` (public read) — can add live ticker.

**Auth-required (MUST NOT expose):** `add_to_cart:144`, `get_cart_summary:147`, `add_to_wishlist:164`, `create_order:181`, `get_my_orders:184`, `get_my_notifications:210`, `delete_account:46`, admin endpoints.

App caching pattern: `CacheHelper` + `_inMemoryCache` `home_repository.dart:13` (stale-while-revalidate) — reuse on web via `localStorage`.

### 2.3 Assets

- `images/mazid products/{Bracelets,Earrings,Necklaces,Rings,silver_sets}` total 63 files — to be **replaced by API `imageUrl`/`mainImageUrl`**.
- `images/work/*.png` 8 category covers — keep as fallback.
- Fonts: `Cairo` + `Dancing Script` loaded twice (`base.css:2` + `index.html:22`) — dedupe.

---

## 3. Goals & Non-Goals

**Goals:**
- Display **live Categories + Products** from free endpoints only; no login, no cart.
- Lift design to **luxury silver** (minimal, elegant, whitespace, serif + sans pairing).
- Full responsiveness: `320 / 480 / 768 / 1024 / 1280 / 1440`.
- Bilingual (EN/AR) kept, synced to API `name_en/name_ar`.
- SEO, performance (Lighthouse 95+), a11y.

**Non-Goals (explicitly excluded):**
- No checkout/cart/wishlist/order flow.
- No auth / profile / admin.
- No paid search history / notifications.

---

## 4. Target Architecture

### 4.1 Stack Options (Decision Required)

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A (Recommended) Keep static + enhance** | Vanilla HTML/CSS/JS + new `js/api.js` fetching Supabase RPC | Fastest, no build, keep CNAME/github pages | No SSR SEO |
| **B Light Vite** | Vite + plain JS or Alpine, modular CSS | Better build, minify, keep simple | Adds build step |
| **C Next.js** | Migration (if future e-commerce needed) | SSR/SEO best | Overkill for catalog-only |

**Recommendation: Option A for now** (fulfills brief, minimal disruption), structured to allow upgrade to B.

### 4.2 API Integration Layer

```
js/api.js  (new)
  - config: SUPABASE_URL, ANON_KEY (same .env anon key is public by design)
  - headers: { apikey, Content-Type }
  - free endpoints:
    GET  /rest/v1/rpc/get_categories?only_active=true&only_roots=true&apikey=...
    GET  /rest/v1/rpc/get_home_screen_data?user_id=&apikey=...
    POST /rest/v1/rpc/get_category_product_images {p_category_id}
    GET  /rest/v1/rpc/get_products_by_category?category_id=...&apikey=...
    GET  /rest/v1/rpc/get_all_products?page=1&apikey=...
    GET  /rest/v1/rpc/search_products?query=...&apikey=...
    GET  /rest/v1/rpc/get_newest_products & get_most_popular_products
  - helpers: fetchWithCache (localStorage + staleWhileRevalidate), i18n pick
  - error: toast + fallback to static 63 images

js/catalog.js (new)
  - renderCategories(grid)  <- CategoriesResponse.data
  - renderProducts(modal/grid) <- ProductModel[]
  - category -> products navigation

css/catalog.css (new)
  - product card, skeleton shimmer (reuse app shimmer idea)
```

Auth flow explicitly **removed**: `SessionManager` not mirrored; website never stores `user_id` securely — uses `''` or omits.

### 4.3 Data Models (mirror Flutter)

Reuse `lib/features/home/data/models/category_model.dart:1` and `product_model.dart:1` shape:
`{id, name_en, name_ar, image_url, products_count, is_active, sort_order, product_images}`.
Website JS will map same keys.

---

## 5. Design Enhancement Plan (Increase Design Level)

### 5.1 Brand Direction — "Silver Elegance Minimal"

- **Palette:** Deep emerald `#0f3d24` (primary), warm silver `#c0c0c0/#e8e8e8`, off-white `#faf9f7`, charcoal `#1a1a1a`, accent gold `#c9a86a` for premium touches. Remove pure black overlay `rgba(0,0,0,0.9)` → `rgba(15,61,36,0.92)`.
- **Typography:** Keep `Cairo` for AR, replace EN body `base.css:33 Dancing Script` (mis-applied to all EN) → `Poppins` body, `Playfair Display` or `Cormorant Garamond` for headings + `Dancing Script` only for signature `MazidMart`.
- **Imagery:** Add subtle grain, soft shadows, `object-fit:cover`, `aspect-ratio:4/5` for product cards. Remove harsh `scale(1.1)` hover → `scale(1.03)` + overlay fade.
- **Spacing:** 8pt system, sections `100px` desktop / `64px` mobile, containers `1280px` max.

### 5.2 Section-by-Section Redesign

1. **Header** `css/header.css`: transparent → solid on scroll (`header.scrolled` already exists), add subtle border-bottom, correct mobile drawer (use `transform: translateX`, not `right:-100%`), add language switch animation.
2. **Hero** `css/hero.css`: add overlay gradient, auto slider `js/slider.js:15` keep but add dots + progress, preload first slide, `min-height: 88vh` not 100vh to avoid fold.
3. **About**: add subtle divider, signature animation, counters via `js/animation.js:22` keep.
4. **Collection**: flip to API-driven category highlight (first featured category) instead of static 2 images.
5. **Our Work → Catalog**: rename to `Catalog / Collections`. Grid stays 4→3→2→1 responsive. Each box shows live `image_url`, `products_count` badge, AR name via `name_ar`. Click → products modal or dedicated page `#catalog/{id}`.
6. **Product Modal** `css/work.css:157`: redesign to product grid (not just images) — card with `mainImageUrl`, `name`, `weight_grams`, `final_price` if available. Pagination / view all.
7. **Discover** keep but use `banners_seasonal` from API if present.
8. **Services**: **remove** or collapse to minimal 1-row USP icons (keeps “Why Choose Us” 4 boxes).
9. **Contact** `css/contact.css`: keep 4 cards, fix map link, add `tel:` `wa.me` correctly.
10. **Footer** `css/footer.css:15`: expand (links to categories, social, copyright). Minimal now.
11. **New**: Silver price ticker (thin bar below header) using public table.

### 5.3 Micro-interactions

- Skeleton loaders for categories/products (shimmer, like `home_shimmer.dart`).
- Stagger fade-in on scroll.
- Hover lift `translateY(-4px) + shadow`.
- RTL-aware slider nav (already in `work_slider.js:185`).

---

## 6. Responsive Handling

### 6.1 Breakpoint System (unify)

```css
/* New unified */
--bp-xs: 480px
--bp-sm: 768px
--bp-md: 1024px
--bp-lg: 1280px
--bp-xl: 1440px
.container { max-width:1280px; padding:0 24px; }
```

Fix current mismatch (`header 768` vs `work 900`). Add `1024` tablet.

### 6.2 Layout Matrix

| Section | 320-479 | 480-767 | 768-1023 | 1024-1279 | 1280+ |
|---------|---------|---------|----------|-----------|-------|
| Header | drawer | drawer | flex | flex | flex |
| Hero | 1 col, h1 1.6rem | 1.8rem | 2.2rem | 2.5rem | 2.8rem |
| Catalog grid | 1 col | 2 cols | 3 cols | 4 cols | 4 cols |
| Product modal grid | 1 col | 2 cols | 3 cols | 4 cols | 4 cols |
| Contact | 1 col | 2 cols | 2 cols | 4 cols | 4 cols |
| Collection | stack | stack | side-by-side | side-by-side | side-by-side |

### 6.3 Techniques

- `clamp()` for fluid type: `font-size: clamp(1.6rem,4vw,2.5rem)`.
- `aspect-ratio` + `object-fit` for images, no fixed `height:180px` mobile hack.
- `grid` + `flex` fallback, `gap` fluid.
- Touch: modal swipe, disable hover overlay on `pointer: coarse` → always show title + tap.
- Images: `srcset`/`sizes`, lazy `loading="lazy"`, fallback `onerror`.
- Overlay path bug fix: encode `mazid products` space → `encodeURI` or rename folder to `mazid_products`.

---

## 7. Implementation Phases (Tasks)

### Phase 0 — Setup & Audit (Done)

- Map endpoints, confirm free vs auth, count assets. **Deliverable: this doc.**

### Phase 1 — Foundation (2-3 days)

- Create `js/config.js` (SUPABASE_URL/ANON_KEY), `js/api.js` (DioConsumer equivalent fetch), `js/catalog.js`.
- Add `css/catalog.css`, `css/tokens.css` (design tokens).
- Fix `base.css` font bug (`body.en` → Poppins), dedupe Google Fonts, add CSS vars.
- Unify breakpoints, add `clamp()` & `aspect-ratio`.
- Rename `images/mazid products` → `images/mazid_products` (or keep but encode) to avoid 404.

### Phase 2 — Live Catalog (3-4 days)

- Fetch `get_categories` on load, render `work-grid` dynamically; fallback to static 63 if offline.
- Category click → fetch `get_category_product_images` or `get_products_by_category` → modal grid of products (image + name_en/ar + price).
- Add shimmer/skeleton, empty state, error retry.
- Wire `get_home_screen_data` to drive hero banners / discover if sections returned; else keep static slides.
- Bilingual mapping: pick `name_ar` when `body.ar`.

### Phase 3 — Design Elevation (3 days)

- Redesign header/hero/catalog cards per 5.1/5.2, apply new palette/tokens.
- Restyle modal to product cards (not bare images), add pagination.
- Polish Why Choose, Contact, Footer; optionally remove Services.
- Add silver price banner (poll Supabase).
- Add subtle animations, hover states, RTL polish.

### Phase 4 — Responsive & QA (2 days)

- Implement breakpoint matrix, test 320→1440 (Chrome DevTools + real device).
- Fix overlay z-index, drawer `transform`, hero 100vh mobile URL bar bug (`100dvh`).
- A11y: `alt`, `aria-label`, keyboard nav (already partially in `work_slider.js:212`).
- Perf: lazy, compress `images/*`, set `CNAME`, check Lighthouse.
- SEO: meta, OG, JSON-LD, Arabic `hreflang`.

### Phase 5 — Deploy & Handover

- Push to `CNAME` branch, verify GitHub Pages.
- Document env (anon key is public), caching strategy, how to add category via Supabase dashboard.
- Optional: migrate to Vite (Phase 6) if requested.

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Anon key exposure | It's public by Supabase design; RLS policies must restrict writes — verify `is_active` read-only |
| CORS on RPC | Supabase allows anon; add `apikey` header, handle 401 → fallback static |
| Spaces in `mazid products` path | Encode URI & rename folder |
| Rate limiting | Cache 5min `localStorage` + debounce search |
| Modal already complex (235 lines) | Refactor to `catalog.js` not patch `work_slider.js` |

---

## 9. File Map (Proposed)

```
Mazid-Mart/
  index.html               # ref new js/css, add catalog container
  css/
    tokens.css             # NEW — vars: colors, breakpoints, radii
    catalog.css            # NEW — categories/products grid, skeletons
    base.css               # FIX — font, container
    header.css / hero.css / work.css ... (polish)
  js/
    config.js              # NEW — SUPABASE_URL/ANON_KEY
    api.js                 # NEW — free endpoints only
    catalog.js             # NEW — render categories/products
    work_slider.js         # KEEP refactored to use api.js
    lang.js / header.js / slider.js / animation.js (keep)
  images/
    mazid_products/        # RENAMED (remove space)
```

---

## 10. Acceptance Criteria

- [ ] Categories & products rendered live from `get_categories`/`get_products_by_category` without login.
- [ ] No auth/cart/order code on website.
- [ ] No hardcoded category list; respects `is_active`.
- [ ] Responsive passes 6 breakpoints, no horizontal scroll, modal works on touch.
- [ ] Bilingual categories (EN/AR) correct.
- [ ] Lighthouse Performance >90, Accessibility >95.
- [ ] Design uplift visible: tokens, hover, skeletons, luxury palette.

---

## 11. Next Step

Await approval to start **Phase 1**. Upon green light, will implement `js/api.js` + `catalog.css` and wire live catalog first, then design polish.

