/**
 * UNIFIED DATA SOURCE SERVICE — Progressive Loading
 * 
 * Sources:
 *   1. LNG Prime (RSS) — WordPress site, /category/{name}/feed/ pattern
 *   2. Hellenic Shipping News (RSS) — /category/{name}/feed/ + /tag/{name}/feed/
 *   3. World Grain (RSS) — Main /feed only (sub-categories not publicly documented)
 *   4. Marketaux (API) — Energy + Basic Materials
 * 
 * Only real, verified feed URLs included — no guessed/invented URLs.
 */

const CORS_PROXY = url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
const CORS_PROXY_FALLBACK = url => `https://corsproxy.io/?${encodeURIComponent(url)}`;

export const SOURCES = [
  /* ===== LNG PRIME — Confirmed WordPress category feeds ===== */
  {
    id: 'lng-main',
    publisher: 'LNG Prime',
    publisherColor: '#1e5a8e',
    name: 'All News',
    type: 'rss',
    category: 'LNG',
    priority: 'initial',
    feedUrl: 'https://lngprime.com/feed/',
  },
  {
    id: 'lng-terminals',
    publisher: 'LNG Prime',
    publisherColor: '#1e5a8e',
    name: 'LNG Terminals',
    type: 'rss',
    category: 'LNG',
    priority: 'lazy',
    feedUrl: 'https://lngprime.com/category/lng-terminals/feed/',
  },
  {
    id: 'lng-vessels',
    publisher: 'LNG Prime',
    publisherColor: '#1e5a8e',
    name: 'Vessels',
    type: 'rss',
    category: 'LNG',
    priority: 'lazy',
    feedUrl: 'https://lngprime.com/category/vessels/feed/',
  },
  {
    id: 'lng-contracts',
    publisher: 'LNG Prime',
    publisherColor: '#1e5a8e',
    name: 'Contracts & Tenders',
    type: 'rss',
    category: 'LNG',
    priority: 'lazy',
    feedUrl: 'https://lngprime.com/category/contracts-and-tenders/feed/',
  },
  {
    id: 'lng-corporate',
    publisher: 'LNG Prime',
    publisherColor: '#1e5a8e',
    name: 'Corporate',
    type: 'rss',
    category: 'LNG',
    priority: 'lazy',
    feedUrl: 'https://lngprime.com/category/corporate/feed/',
  },
  {
    id: 'lng-as-fuel',
    publisher: 'LNG Prime',
    publisherColor: '#1e5a8e',
    name: 'LNG as Fuel',
    type: 'rss',
    category: 'LNG',
    priority: 'lazy',
    feedUrl: 'https://lngprime.com/category/lng-as-fuel/feed/',
  },
  {
    id: 'lng-breaking',
    publisher: 'LNG Prime',
    publisherColor: '#1e5a8e',
    name: 'Breaking News',
    type: 'rss',
    category: 'LNG',
    priority: 'lazy',
    feedUrl: 'https://lngprime.com/category/breaking-news/feed/',
  },

  /* ===== HELLENIC SHIPPING NEWS — From their /rss-feeds/ directory ===== */
  {
    id: 'hellenic-top',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'Top Stories',
    type: 'rss',
    category: 'Shipping',
    priority: 'initial',
    feedUrl: 'https://www.hellenicshippingnews.com/tag/top-stories/feed/',
  },
  {
    id: 'hellenic-international',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'International Shipping',
    type: 'rss',
    category: 'Shipping',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/international-shipping-news/feed/',
  },
  {
    id: 'hellenic-drybulk',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'Dry Bulk Market',
    type: 'rss',
    category: 'Shipping',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/dry-bulk-market/feed/',
  },
  {
    id: 'hellenic-piracy',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'Piracy & Security News',
    type: 'rss',
    category: 'Shipping',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/piracy-and-security-news/feed/',
  },
  {
    id: 'hellenic-port',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'Port News',
    type: 'rss',
    category: 'Shipping',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/port-news/feed/',
  },
  {
    id: 'hellenic-shipbuilding',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'Shipbuilding News',
    type: 'rss',
    category: 'Shipping',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/shipbuilding-news/feed/',
  },
  {
    id: 'hellenic-oil',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'Oil & Companies News',
    type: 'rss',
    category: 'Energy',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/oil-companies-news/feed/',
  },
  {
    id: 'hellenic-energy',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'General Energy News',
    type: 'rss',
    category: 'Energy',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/general-energy-news/feed/',
  },
  {
    id: 'hellenic-economy',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'World Economy News',
    type: 'rss',
    category: 'Economy',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/world-economy-news/feed/',
  },
  {
    id: 'hellenic-commodity',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'Commodity News',
    type: 'rss',
    category: 'Commodities',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/commodity-news/feed/',
  },
  {
    id: 'hellenic-stock',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'Stock Market News',
    type: 'rss',
    category: 'Markets',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/stock-market-news/feed/',
  },

  /* ===== WORLD GRAIN — Topic-specific RSS feeds only =====
   * IMPORTANT: world-grain.com/rss is an HTML directory page, NOT a feed.
   * Only /rss/topic/{id}-{slug} URLs return actual RSS XML.
   * Each topic on world-grain.com/rss has a unique numeric ID that must
   * be discovered via "View Page Source" — they're not predictable.
   * 
   * To add more topics, inspect world-grain.com/rss and look for
   * <a href="/rss/topic/XXXX-name"> links.
   * ============================================================ */
  {
    id: 'world-grain-aba',
    publisher: 'World Grain',
    publisherColor: '#a16207',
    name: 'ABA',
    type: 'rss',
    category: 'Grain',
    priority: 'initial',
    feedUrl: 'https://www.world-grain.com/rss/topic/1041-aba',
  },

  /* ===== MARKETAUX ===== */
  {
    id: 'marketaux-energy',
    publisher: 'Marketaux',
    publisherColor: '#7c3aed',
    name: 'Energy (Sentiment)',
    type: 'marketaux',
    category: 'Energy',
    priority: 'initial',
    filters: { industries: 'Energy' },
  },
  {
    id: 'marketaux-materials',
    publisher: 'Marketaux',
    publisherColor: '#7c3aed',
    name: 'Basic Materials',
    type: 'marketaux',
    category: 'Commodities',
    priority: 'lazy',
    filters: { industries: 'Basic Materials' },
  },
];

export const INITIAL_SOURCES = SOURCES.filter(s => s.priority === 'initial');
export const LAZY_SOURCES = SOURCES.filter(s => s.priority === 'lazy');
export const PUBLISHERS = [...new Set(SOURCES.map(s => s.publisher))];
export const CATEGORIES = [...new Set(SOURCES.map(s => s.category))];

export function getSourcesByPublisher(publisher) {
  return SOURCES.filter(s => s.publisher === publisher);
}

/* ============================================================
   TRANSFORMERS
   ============================================================ */

function transformRSSItem(item, source) {
  const imageUrl = extractImageFromRSS(item);
  const cleanDescription = cleanText(
    item.description || item['content:encoded'] || ''
  );

  return {
    id: item.guid || item.link || `${source.id}-${item.title}`,
    sourceId: source.id,
    publisher: source.publisher,
    publisherColor: source.publisherColor,
    sourceName: source.name,
    sourceType: 'rss',
    category: source.category,
    title: cleanText(item.title || 'Untitled'),
    description: truncate(cleanDescription, 280),
    url: item.link || '#',
    imageUrl,
    publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
    categories: Array.isArray(item.categories) ? item.categories : [],
  };
}

function transformMarketauxItem(item, source) {
  const primaryEntity = item.entities?.length
    ? [...item.entities].sort((a, b) => (b.match_score || 0) - (a.match_score || 0))[0]
    : null;

  return {
    id: item.uuid,
    sourceId: source.id,
    publisher: source.publisher,
    publisherColor: source.publisherColor,
    sourceName: source.name,
    sourceType: 'marketaux',
    category: source.category,
    title: item.title || 'Untitled',
    description: truncate(item.snippet || item.description || '', 280),
    url: item.url || '#',
    imageUrl: item.image_url || null,
    publishedAt: item.published_at ? new Date(item.published_at) : new Date(),
    categories: [
      ...new Set((item.entities || []).map(e => e.industry).filter(Boolean)),
    ],
    sentimentScore: primaryEntity?.sentiment_score,
    entities: item.entities || [],
    relevanceScore: item.relevance_score,
    sourceDomain: item.source,
  };
}

/* ============================================================
   FETCHERS
   ============================================================ */

async function fetchWithFallback(url) {
  try {
    const response = await fetch(CORS_PROXY(url));
    if (response.ok) {
      const text = await response.text();
      if (text && text.length > 100) return text;
    }
  } catch {}

  try {
    const response = await fetch(CORS_PROXY_FALLBACK(url));
    if (response.ok) {
      const text = await response.text();
      if (text && text.length > 100) return text;
    }
  } catch {}

  throw new Error('All CORS proxies failed');
}

async function fetchRSSFeed(source) {
  try {
    const xmlText = await fetchWithFallback(source.feedUrl);
    const items = parseRSSXML(xmlText);
    const articles = items.map(item => transformRSSItem(item, source));
    return { source, articles, status: 'success' };
  } catch (err) {
    console.error(`[RSS] ${source.publisher} — ${source.name}: ${err.message}`);
    return { source, articles: [], status: 'error', error: err.message };
  }
}

async function fetchMarketaux(source) {
  const apiKey = import.meta.env.VITE_MARKETAUX_API_KEY;

  if (!apiKey) {
    console.warn(`[Marketaux] No API key. Add VITE_MARKETAUX_API_KEY to .env`);
    return {
      source,
      articles: [],
      status: 'error',
      error: 'No API key set',
    };
  }

  try {
    const params = new URLSearchParams({
      ...source.filters,
      filter_entities: 'true',
      language: 'en',
      limit: '20',
      api_token: apiKey,
    });

    const url = `https://api.marketaux.com/v1/news/all?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      let errorMsg = `HTTP ${response.status}`;
      if (response.status === 401) errorMsg = 'Invalid API key';
      else if (response.status === 402) errorMsg = 'Daily quota exceeded';
      else if (response.status === 429) errorMsg = 'Rate limited';
      throw new Error(`${errorMsg}: ${body.slice(0, 100)}`);
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const items = data.data || [];
    const articles = items.map(item => transformMarketauxItem(item, source));
    return { source, articles, status: 'success' };
  } catch (err) {
    console.error(`[Marketaux] ${source.name}: ${err.message}`);
    return { source, articles: [], status: 'error', error: err.message };
  }
}

function fetchOne(source) {
  switch (source.type) {
    case 'rss':
      return fetchRSSFeed(source);
    case 'marketaux':
      return fetchMarketaux(source);
    default:
      return Promise.resolve({
        source,
        articles: [],
        status: 'error',
        error: 'Unknown source type',
      });
  }
}

/* ============================================================
   PUBLIC API
   ============================================================ */

export async function fetchInitialSources() {
  const results = await Promise.all(INITIAL_SOURCES.map(fetchOne));
  return processResults(results);
}

export async function fetchOneSource(sourceId) {
  const source = SOURCES.find(s => s.id === sourceId);
  if (!source) {
    return { articles: [], sourceStatus: [], fetchedAt: new Date() };
  }
  const result = await fetchOne(source);
  return processResults([result]);
}

function processResults(results) {
  const allArticles = [];
  const sourceStatus = [];

  results.forEach(result => {
    const { source, articles, status, error } = result;
    allArticles.push(...articles);
    sourceStatus.push({
      sourceId: source.id,
      publisher: source.publisher,
      publisherColor: source.publisherColor,
      sourceName: source.name,
      category: source.category,
      sourceType: source.type,
      status,
      count: articles.length,
      error,
    });
  });

  return {
    articles: allArticles,
    sourceStatus,
    fetchedAt: new Date(),
  };
}

/* ============================================================
   UTILITIES
   ============================================================ */

function parseRSSXML(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    console.error('XML parse error:', parseError.textContent);
    return [];
  }

  const items = doc.querySelectorAll('item');
  return Array.from(items).map(item => ({
    title: getNodeText(item, 'title'),
    link: getNodeText(item, 'link'),
    description: getNodeText(item, 'description'),
    pubDate: getNodeText(item, 'pubDate'),
    guid: getNodeText(item, 'guid'),
    categories: Array.from(item.querySelectorAll('category')).map(c => c.textContent),
    'content:encoded': item.getElementsByTagNameNS('*', 'encoded')[0]?.textContent,
    'media:content': item.getElementsByTagNameNS('*', 'content')[0]?.getAttribute('url'),
    enclosure: item.querySelector('enclosure')?.getAttribute('url'),
  }));
}

function getNodeText(parent, selector) {
  try {
    return parent.querySelector(selector)?.textContent?.trim() || '';
  } catch {
    return '';
  }
}

function extractImageFromRSS(item) {
  if (item['media:content']) return item['media:content'];
  if (item.enclosure) return item.enclosure;

  const content = item['content:encoded'] || item.description || '';
  const imgMatches = [...content.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];

  for (const match of imgMatches) {
    const url = match[1];
    if (/feedburner|feedsportal|doubleclick|googleads|pixel\.gif/i.test(url)) continue;
    if (/[?&](w|width|h|height)=1[&"']/i.test(url)) continue;
    return url;
  }

  return null;
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

export function deduplicateArticles(articles) {
  const seen = new Set();
  return articles.filter(article => {
    const key = normalizeUrl(article.url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeUrl(url) {
  if (!url) return Math.random().toString();
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`.toLowerCase().replace(/\/$/, '');
  } catch {
    return url.toLowerCase();
  }
}
