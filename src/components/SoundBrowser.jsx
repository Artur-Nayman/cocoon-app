import { useCallback, useMemo, useRef, useState } from 'react';
import { CHANNEL_CATEGORIES, DEFAULT_BUILTIN_SOUNDS } from '../constants/defaults';
import styles from '../styles/SoundBrowser.module.css';
import { logger } from '../utils/logger';
import { searchYouTube } from '../utils/youtubeSearch';

export default function SoundBrowser({ onAddChannel, onAddVisual, onSaveResource }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ytQuery, setYtQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef(null);

  const [visibleCount, setVisibleCount] = useState(20);
  const [prevCategory, setPrevCategory] = useState(activeCategory);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);

  if (activeCategory !== prevCategory || searchQuery !== prevSearchQuery) {
    setPrevCategory(activeCategory);
    setPrevSearchQuery(searchQuery);
    setVisibleCount(20);
  }

  const observer = useRef();
  const lastElementRef = useCallback((node) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => prev + 20);
      }
    });
    if (node) observer.current.observe(node);
  }, []);

  const handleYtSearch = useCallback(async () => {
    if (!ytQuery.trim()) return;
    setSearching(true);
    try {
      setSearchResults(await searchYouTube(ytQuery));
    } catch (err) {
      logger.warn('YouTube search failed:', err);
    }
    setSearching(false);
  }, [ytQuery]);

  const filteredBuiltins = useMemo(() => {
    let items = DEFAULT_BUILTIN_SOUNDS;
    if (activeCategory !== 'all') {
      items = items.filter((s) => s.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((s) => s.name.toLowerCase().includes(q));
    }
    return items;
  }, [activeCategory, searchQuery]);

  const addBuiltin = useCallback((sound) => {
    onAddChannel({
      name: sound.name,
      url: sound.url,
      type: sound.type,
      volume: 50,
      category: sound.category,
    });
  }, [onAddChannel]);

  const addYtResult = useCallback((result, asVisual) => {
    const item = {
      name: result.title,
      url: result.url,
      type: 'youtube',
      volume: 50,
      category: 'music',
    };
    if (asVisual) {
      onAddVisual(result.url);
    } else {
      onAddChannel(item);
    }
  }, [onAddChannel, onAddVisual]);

  const saveYtToResource = useCallback((result) => {
    if (onSaveResource) {
      onSaveResource({ name: result.title, url: result.url, type: 'youtube', category: 'music' });
    }
  }, [onSaveResource]);

  return (
    <div className={styles.browser}>
      <div className={styles.searchBar}>
        <input
          ref={searchInputRef}
          className={styles.searchInput}
          value={ytQuery}
          onChange={(e) => setYtQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleYtSearch()}
          placeholder="Search YouTube..."
        />
        <button type="button" className={styles.searchBtn} onClick={handleYtSearch} disabled={searching} aria-label="Search">
          {searching ? '…' : '🔍'}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className={styles.ytResults}>
          <div className={styles.sectionTitle}>YouTube Results</div>
          <div className={styles.ytGrid}>
            {searchResults.map((r) => (
              <div key={r.id} className={styles.ytCard}>
                <img className={styles.ytThumb} src={r.thumbnail} alt={r.title} loading="lazy" />
                <div className={styles.ytInfo}>
                  <div className={styles.ytTitle}>{r.title}</div>
                  <div className={styles.ytMeta}>{r.channel} · {r.duration > 0 ? `${Math.floor(r.duration / 60)}:${String(r.duration % 60).padStart(2, '0')}` : '?'}</div>
                </div>
                <div className={styles.ytActions}>
                  <button type="button" className={styles.addBtn} onClick={() => addYtResult(r, false)} title="Add as audio" aria-label="Add as audio">🎵</button>
                  <button type="button" className={styles.addBtn} onClick={() => addYtResult(r, true)} title="Play as video" aria-label="Play as video">🎬</button>
                  {onSaveResource && (
                    <button type="button" className={styles.addBtn} onClick={() => saveYtToResource(r)} title="Save to Resources" aria-label="Save to Resources">💾</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.categories}>
        <button
          type="button"
          className={`${styles.catPill} ${activeCategory === 'all' ? styles.catActive : ''}`}
          onClick={() => setActiveCategory('all')}
        >All</button>
        {CHANNEL_CATEGORIES.map((c) => (
          <button
            type="button"
            key={c.key}
            className={`${styles.catPill} ${activeCategory === c.key ? styles.catActive : ''}`}
            onClick={() => setActiveCategory(c.key)}
          >{c.icon} {c.label}</button>
        ))}
      </div>

      <input
        className={styles.filterInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Filter sounds..."
      />

      <div className={styles.soundGrid}>
        {filteredBuiltins.slice(0, visibleCount).map((sound) => (
          <button
            type="button"
            key={sound.id || sound.url || sound.name}
            className={styles.soundCard}
            onClick={() => addBuiltin(sound)}
          >
            <span className={styles.soundIcon}>{sound.icon}</span>
            <span className={styles.soundName}>{sound.name}</span>
          </button>
        ))}
      </div>
      {visibleCount < filteredBuiltins.length && (
        <div ref={lastElementRef} style={{ height: '1px', flexShrink: 0 }} />
      )}
    </div>
  );
}
