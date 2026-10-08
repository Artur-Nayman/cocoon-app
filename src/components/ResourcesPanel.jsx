import { useCallback, useMemo, useRef, useState } from 'react';
import styles from '../styles/ResourcesPanel.module.css';
import { logger } from '../utils/logger';
import { searchYouTube } from '../utils/youtubeSearch';

const types = [
  { key: 'youtube', label: 'YouTube' },
  { key: 'direct', label: 'Direct Audio' },
  { key: 'file', label: 'Local File' },
];

const categories = [
  { key: 'all', label: 'All' },
  { key: 'visual', label: '🎬 Visual' },
  { key: 'music', label: '🎵 Music' },
  { key: 'nature', label: '🌿 Nature' },
  { key: 'ambient', label: '🌊 Ambient' },
  { key: 'city', label: '🏙️ City' },
];

export default function ResourcesPanel({ resources, onAdd, onDelete }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('youtube');
  const [category, setCategory] = useState('nature');
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');
  const fileRef = useRef(null);
  const [ytQuery, setYtQuery] = useState('');
  const [ytResults, setYtResults] = useState([]);
  const [ytSearching, setYtSearching] = useState(false);
  const [showYtSearch, setShowYtSearch] = useState(false);

  const filtered = useMemo(
    () => resources.filter(
      (r) =>
        (filterCat === 'all' || r.category === filterCat) &&
        r.name.toLowerCase().includes(search.toLowerCase()),
    ),
    [resources, filterCat, search],
  );

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), url: url.trim(), type, category });
    setName('');
    setUrl('');
    setType('youtube');
    setCategory('nature');
  };

  const handleFileBrowse = () => fileRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUrl(URL.createObjectURL(file));
    if (!name) setName(file.name.replace(/\.[^.]+$/, ''));
  };

  const handleYtSearch = useCallback(async () => {
    if (!ytQuery.trim()) return;
    setYtSearching(true);
    try {
      setYtResults(await searchYouTube(ytQuery));
    } catch (err) {
      logger.warn('YouTube search failed:', err);
    }
    setYtSearching(false);
  }, [ytQuery]);

  const saveYtResult = (result) => {
    onAdd({ name: result.title, url: result.url, type: 'youtube', category: 'visual' });
    setShowYtSearch(false);
    setYtQuery('');
    setYtResults([]);
  };

  return (
    <div>
      <div className={styles.form}>
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Resource name"
        />
        <div className={styles.urlRow}>
          <input
            className={styles.input}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL or paste link"
            style={{ flex: 1 }}
          />
          <button type="button" className={styles.browseBtn} onClick={handleFileBrowse} title="Browse local file" aria-label="Browse local file">📁</button>
          <input ref={fileRef} type="file" accept="audio/*,video/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
        <div className={styles.groupLabel}>Format</div>
        <div className={styles.btnRow}>
          {types.map((t) => (
            <button
              type="button"
              key={t.key}
              className={`${styles.pill} ${type === t.key ? styles.pillActive : ''}`}
              onClick={() => setType(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className={styles.groupLabel}>Layer</div>
        <div className={styles.btnRow}>
          {categories.slice(1).map((c) => (
            <button
              type="button"
              key={c.key}
              className={`${styles.pill} ${category === c.key ? styles.pillActive : ''}`}
              onClick={() => setCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <button type="button" className={styles.addBtn} onClick={handleAdd}>Add Resource</button>
      </div>

      <div className={styles.ytSection}>
        <button
          type="button"
          className={styles.ytToggle}
          onClick={() => setShowYtSearch((v) => !v)}
        >
          {showYtSearch ? '▼ Hide' : '▶'} YouTube Search
        </button>
        {showYtSearch && (
          <div className={styles.ytSearch}>
            <div className={styles.searchBar}>
              <input
                className={styles.ytInput}
                value={ytQuery}
                onChange={(e) => setYtQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleYtSearch()}
                placeholder="Search YouTube..."
              />
              <button type="button" className={styles.ytBtn} onClick={handleYtSearch} disabled={ytSearching} aria-label="Search YouTube">
                {ytSearching ? '…' : '🔍'}
              </button>
            </div>
            {ytResults.length > 0 && (
              <div className={styles.ytGrid}>
                {ytResults.map((r) => (
                  <div key={r.id} className={styles.ytCard}>
                    <img className={styles.ytThumb} src={r.thumbnail} alt={r.title} loading="lazy" />
                    <div className={styles.ytInfo}>
                      <div className={styles.ytTitle}>{r.title}</div>
                      <div className={styles.ytMeta}>{r.channel}</div>
                    </div>
                    <button type="button" className={styles.ytSaveBtn} onClick={() => saveYtResult(r)} title="Save to Resources" aria-label="Save to Resources">💾</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search resources…"
        />
        <div className={styles.filterRow}>
          {categories.map((c) => (
            <button
              type="button"
              key={c.key}
              className={`${styles.filterPill} ${filterCat === c.key ? styles.filterPillActive : ''}`}
              onClick={() => setFilterCat(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>{search || filterCat !== 'all' ? 'No matches' : 'No resources saved yet.'}</p>
      ) : (
        <div className={styles.list}>
          {filtered.map((r) => (
            <div key={r.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{r.name}</span>
                <span className={`${styles.badge} ${styles[r.type]}`}>{r.type}</span>
                <span className={`${styles.badge} ${styles[r.category] || styles.badgeCategory}`}>{r.category}</span>
              </div>
              <button type="button" className={styles.deleteBtn} onClick={() => onDelete(r.id)} aria-label="Delete resource">&times;</button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.count}>{filtered.length} / {resources.length} resources</div>
    </div>
  );
}
