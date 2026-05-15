# 📰 Commodity News Aggregator — POC

A working proof-of-concept React app that aggregates RSS feeds from LNG Prime and Hellenic Shipping News into a unified, filterable editorial-style interface — using **progressive loading** so the user sees content fast and only fetches more on demand.

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173` automatically.

---

## ⚡ Architecture: Progressive Loading

This is the **key design decision** of this POC.

### The Problem with Naive "Fetch Everything" Approach

Most tutorials show you how to fetch all RSS feeds in parallel on page load. But:
- 12 simultaneous requests trip CORS proxy rate limits (HTTP 429)
- User only sees the first 10–15 articles anyway
- Wastes bandwidth on data nobody scrolls to

### Our Strategy

```
┌──────────────────────────────────────────────────┐
│  INITIAL LOAD (on page mount)                    │
│  • Fetch 2 main feeds (one per publisher)        │
│  • ~1 second, ~30-40 articles                    │
│  • User can read & filter immediately            │
└──────────────────────────────────────────────────┘
                       ↓
            User scrolls or clicks "Load More"
                       ↓
┌──────────────────────────────────────────────────┐
│  ON-DEMAND LOAD                                  │
│  • Fetch one category feed at a time             │
│  • Articles merged + deduped + re-sorted         │
│  • User controls how much they fetch             │
└──────────────────────────────────────────────────┘
```

This mirrors how Twitter, YouTube, and modern news apps work.

---

## 📊 What This POC Includes

### 2 Initial Feeds (auto-load)
- **LNG Prime — All News** (`lngprime.com/feed/`)
- **Hellenic Shipping — Top Stories** (`.../tag/top-stories/feed/`)

### 8 On-Demand Category Feeds

**LNG Prime sections:**
- LNG Terminals
- Vessels
- Contracts & Tenders
- Corporate

**Hellenic Shipping sections:**
- International Shipping
- Dry Bulk Market
- Oil & Companies
- World Economy

### 3-Level Filtering
1. **Publisher** — LNG Prime / Hellenic Shipping
2. **Topic** — LNG / Shipping / Energy / Economy
3. **Section** — Specific sub-feed within publisher

### Load More UX
- **"Load Next Category"** button — fetches one feed at a time
- **"Load All"** button — sequential fetch of all remaining (with throttling)
- Visual feedback: which feed is loading next, how many remain
- "All loaded" indicator when complete

---

## 📂 Project Structure

```
src/
├── App.jsx                        Progressive load state management
├── components/
│   ├── Masthead.jsx               Newspaper-style header
│   ├── TickerBar.jsx              Status bar (loaded/total)
│   ├── Filters.jsx                3-level filter UI
│   ├── ArticleGrid.jsx            Lead story + grid
│   ├── ArticleCard.jsx            Article card
│   ├── LoadMoreButton.jsx         Load More / Load All controls
│   └── LoadingState.jsx           Initial load animation
├── services/
│   └── dataSourceService.js  ⭐    Feed registry, transformers, fetchers
└── styles/
    └── global.css                 Editorial design system
```

---

## 🧠 The Architectural Magic

The core abstraction lives in `src/services/dataSourceService.js`.

### Source Priority System

```js
{ id: 'lng-main', priority: 'initial', ... }   // Auto-loaded
{ id: 'lng-vessels', priority: 'lazy', ... }   // Load More
```

Just changing `priority` from `'lazy'` to `'initial'` makes a feed load eagerly. Architecture stays the same.

### Three Public API Functions

```js
fetchInitialSources()           // On mount — fast
fetchOneSource(sourceId)        // Load More click
deduplicateArticles(articles)   // After merging
```

### Normalized Article Shape

Every article — RSS or future Marketaux — has this shape:

```js
{
  id, sourceId, publisher, publisherColor, sourceName,
  sourceType, category, title, description, url, imageUrl,
  publishedAt, categories,
  
  // OPTIONAL (Marketaux):
  sentimentScore, entities, relevanceScore
}
```

### Enabling Marketaux

Code is fully scaffolded. Steps:

1. **Get API key** from [marketaux.com](https://www.marketaux.com) (free tier: 100 req/day)
2. **Create `.env`:**
   ```
   VITE_MARKETAUX_API_KEY=your_key_here
   ```
3. **Uncomment in `dataSourceService.js`:**
   - Marketaux entries in `SOURCES` array (~line 130)
   - `transformMarketauxItem()` function
   - `fetchMarketaux()` function
   - `case 'marketaux':` in `fetchOne()` switch

The UI automatically:
- Adds Marketaux to publisher filter
- Shows sentiment scores (▲/▼) on Marketaux articles
- Includes Marketaux in Load More queue

---

## 🎨 Design Language

**Aesthetic:** Trading-floor editorial — serif display type, ivory newsprint background, ticker tape source status.

**Target user:** Commodity professionals (LNG analysts, shipping brokers, energy traders) who live on Bloomberg Terminal, FT, S&P Platts. Generic tech-startup aesthetics undermine credibility.

**Customize:** All design tokens in `src/styles/global.css` under `:root`.

---

## ⚠️ CORS Proxy (POC Only)

We use `allorigins.win` with a `corsproxy.io` fallback. Public proxies are unreliable for production. Replace with:

| Production Option | Notes |
|---|---|
| Next.js API routes | If you migrate to Next.js |
| Express/Node backend | Simple proxy endpoint |
| Cloudflare Worker | Serverless, fast, free tier |

---

## 📋 Adding More Sources

Add an entry to `SOURCES`:

```js
{
  id: 'mining-gold',
  publisher: 'Mining.com',
  publisherColor: '#92400e',
  name: 'Gold',
  type: 'rss',
  category: 'Mining',
  priority: 'lazy',  // or 'initial' if it should auto-load
  feedUrl: 'https://www.mining.com/tag/gold/feed/',
},
```

UI picks up automatically — filters, ticker, Load More queue all adapt.

---

## 🚧 What's NOT Production-Ready

This is a POC. For production:

1. ✅ **Backend** — move RSS fetching server-side
2. ✅ **Database** — store articles for search, archive, dedup
3. ✅ **Cron scheduler** — auto-refresh every 1–2 hours
4. ✅ **Infinite scroll** — replace Load More button with intersection observer
5. ✅ **Search** — full-text article search
6. ✅ **Image fallback service** — for feeds without featured images
7. ✅ **Error monitoring** — Sentry or similar
8. ✅ **Caching layer** — Redis/Memcached for hot articles

---

## ❓ FAQ

**Q: Why progressive loading instead of fetching all 10 feeds at once?**
A: User sees content faster (~1s vs ~5s). No rate limit issues. Bandwidth-efficient. Matches how real news apps work.

**Q: Why not infinite scroll?**
A: Explicit Load More buttons are clearer for a POC. Easy to upgrade to scroll-triggered loading later (use `IntersectionObserver`).

**Q: What if a CORS proxy fails on a specific feed?**
A: We try a fallback proxy automatically. If both fail for one feed, others continue to work — failure is isolated per source.

**Q: Will the architecture work with Marketaux too?**
A: Yes. Marketaux entries are added to the same `SOURCES` array with `type: 'marketaux'` instead of `'rss'`. The Load More flow treats them identically.

---

Built as a research POC.  
Progressive loading by design — every feed is fetched only when needed.
