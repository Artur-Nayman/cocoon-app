import { useState, useMemo, useCallback, useRef } from 'react';
import { BACKEND_URL } from '../config';
import { DEFAULT_BUILTIN_SOUNDS, CHANNEL_CATEGORIES } from '../constants/defaults';
import styles from '../styles/SoundBrowser.module.css';

export default function SoundBrowser({ onAddChannel, onAddVisual }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ytQuery, setYtQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef(null);

  const handleYtSearch = useCallback(async () => {
    if (!ytQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/youtube/search?q=${encodeURIComponent(ytQuery.trim())}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.warn('YouTube search failed:', err);
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
        <button className={styles.searchBtn} onClick={handleYtSearch} disabled={searching}>
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
                  <button className={styles.addBtn} onClick={() => addYtResult(r, false)} title="Add as audio">🎵</button>
                  <button className={styles.addBtn} onClick={() => addYtResult(r, true)} title="Play as video">🎬</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.categories}>
        <button
          className={`${styles.catPill} ${activeCategory === 'all' ? styles.catActive : ''}`}
          onClick={() => setActiveCategory('all')}
        >All</button>
        {CHANNEL_CATEGORIES.map((c) => (
          <button
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
        {filteredBuiltins.map((sound, i) => (
          <div key={`${sound.name}-${i}`} className={styles.soundCard} onClick={() => addBuiltin(sound)}>
            <span className={styles.soundIcon}>{sound.icon}</span>
            <span className={styles.soundName}>{sound.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
