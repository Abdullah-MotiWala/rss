import { useState, useEffect, useMemo } from 'react';
import {
  fetchInitialSources,
  fetchOneSource,
  deduplicateArticles,
  LAZY_SOURCES,
  INITIAL_SOURCES,
} from './services/dataSourceService';
import Masthead from './components/Masthead';
import TickerBar from './components/TickerBar';
import Filters from './components/Filters';
import ArticleGrid from './components/ArticleGrid';
import LoadingState from './components/LoadingState';
import LoadMoreButton from './components/LoadMoreButton';

export default function App() {
  // Article data
  const [articles, setArticles] = useState([]);
  const [sourceStatus, setSourceStatus] = useState([]);
  const [fetchedAt, setFetchedAt] = useState(null);

  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Track which lazy sources have been loaded
  const [loadedLazyIds, setLoadedLazyIds] = useState(new Set());

  // Filtering state — just publisher + sub-source
  const [filterPublisher, setFilterPublisher] = useState('all');
  const [filterSourceId, setFilterSourceId] = useState('all');

  /* ============================================================
     INITIAL LOAD — Fetch 2 main feeds on mount
     ============================================================ */
  const loadInitial = async () => {
    setInitialLoading(true);
    setError(null);
    try {
      const result = await fetchInitialSources();
      setArticles(result.articles);
      setSourceStatus(result.sourceStatus);
      setFetchedAt(result.fetchedAt);

      if (result.articles.length === 0) {
        setError('No articles loaded. The CORS proxy may be down — try refreshing.');
      }
    } catch (err) {
      setError('Failed to load feeds: ' + err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  /* ============================================================
     LOAD MORE — Fetch the next lazy source on demand
     ============================================================ */
  const loadMore = async () => {
    const nextSource = LAZY_SOURCES.find(s => !loadedLazyIds.has(s.id));
    if (!nextSource) return;

    setLoadingMore(true);
    try {
      const result = await fetchOneSource(nextSource.id);

      const merged = deduplicateArticles([...articles, ...result.articles]);
      merged.sort((a, b) => b.publishedAt - a.publishedAt);

      setArticles(merged);
      setSourceStatus(prev => [...prev, ...result.sourceStatus]);
      setFetchedAt(result.fetchedAt);
      setLoadedLazyIds(prev => new Set([...prev, nextSource.id]));
    } catch (err) {
      console.error('Load more failed:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  /* ============================================================
     LOAD ALL — Bulk-load all remaining lazy sources
     ============================================================ */
  const loadAll = async () => {
    const remaining = LAZY_SOURCES.filter(s => !loadedLazyIds.has(s.id));
    if (remaining.length === 0) return;

    setLoadingMore(true);
    try {
      let newArticles = [...articles];
      const newLoadedIds = new Set(loadedLazyIds);

      for (const source of remaining) {
        const result = await fetchOneSource(source.id);
        newArticles = [...newArticles, ...result.articles];
        newLoadedIds.add(source.id);

        const deduped = deduplicateArticles(newArticles);
        deduped.sort((a, b) => b.publishedAt - a.publishedAt);
        setArticles(deduped);
        setSourceStatus(prev => [...prev, ...result.sourceStatus]);
        setLoadedLazyIds(new Set(newLoadedIds));

        await new Promise(r => setTimeout(r, 300));
      }
      setFetchedAt(new Date());
    } catch (err) {
      console.error('Load all failed:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  /* ============================================================
     REFRESH — Reset everything and reload initial
     ============================================================ */
  const refresh = async () => {
    setArticles([]);
    setSourceStatus([]);
    setLoadedLazyIds(new Set());
    setFilterPublisher('all');
    setFilterSourceId('all');
    await loadInitial();
  };

  useEffect(() => {
    loadInitial();
  }, []);

  // Apply filters (publisher + sub-source only)
  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      if (filterPublisher !== 'all' && a.publisher !== filterPublisher) return false;
      if (filterSourceId !== 'all' && a.sourceId !== filterSourceId) return false;
      return true;
    });
  }, [articles, filterPublisher, filterSourceId]);

  const remainingLazyCount = LAZY_SOURCES.length - loadedLazyIds.size;
  const loadedSourceCount = INITIAL_SOURCES.length + loadedLazyIds.size;
  const totalSourceCount = INITIAL_SOURCES.length + LAZY_SOURCES.length;

  return (
    <div className="app">
      <Masthead fetchedAt={fetchedAt} />
      <TickerBar
        sourceStatus={sourceStatus}
        loading={initialLoading}
        totalSources={totalSourceCount}
        loadedSources={loadedSourceCount}
      />

      {error && <div className="error-banner">⚠ {error}</div>}

      <Filters
        articles={articles}
        filterPublisher={filterPublisher}
        filterSourceId={filterSourceId}
        onPublisherChange={setFilterPublisher}
        onSourceChange={setFilterSourceId}
        onRefresh={refresh}
      />

      <main className="main-container">
        {initialLoading ? (
          <LoadingState />
        ) : (
          <>
            <ArticleGrid articles={filteredArticles} filterPublisher={filterPublisher} />

            {remainingLazyCount > 0 && (
              <LoadMoreButton
                onLoadMore={loadMore}
                onLoadAll={loadAll}
                loading={loadingMore}
                remaining={remainingLazyCount}
                nextSource={LAZY_SOURCES.find(s => !loadedLazyIds.has(s.id))}
              />
            )}

            {remainingLazyCount === 0 && articles.length > 0 && (
              <div className="all-loaded">
                <span className="all-loaded-rule"></span>
                <span className="all-loaded-text">
                  ✓ All {loadedSourceCount} feeds loaded · {articles.length} articles
                </span>
                <span className="all-loaded-rule"></span>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div>
            <div className="footer-title">The Commodity Wire</div>
            <p className="footer-text">
              Progressive RSS aggregator for LNG, shipping, energy, and global
              trade. Initial load fetches main feeds; additional category feeds
              load on demand. Architecture future-ready for Marketaux integration.
            </p>
          </div>
          <div className="footer-section">
            <h4>Loading Strategy</h4>
            <ul>
              <li>Initial · 2 main feeds</li>
              <li>On demand · 8 categories</li>
              <li>Total · 10 sources</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Roadmap</h4>
            <ul>
              <li>RSS Layer · Active</li>
              <li>Marketaux · Scaffolded</li>
              <li>Backend · Phase 2</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
