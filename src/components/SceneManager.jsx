import { useState, useRef, useEffect, useCallback } from 'react';
import { extractYtId } from '../utils/youtube';
import { searchYouTube } from '../utils/youtubeSearch';
import { logger } from '../utils/logger';
import styles from '../styles/SceneManager.module.css';

function typeFromUrl(url) {
  if (!url) return 'direct';
  return url.includes('youtu') || url.includes('youtube') ? 'youtube' : 'direct';
}

function initFromProps(editingScene, currentConfig) {
  if (editingScene) {
    return {
      name: editingScene.name,
      ytId: editingScene.visual.videoId,
      sceneChannels: editingScene.channels || [],
    };
  }
  return {
    name: currentConfig?.name || '',
    ytId: currentConfig?.visual?.videoId || '',
    sceneChannels: currentConfig?.channels || [],
  };
}

function YtSearchPopup({
  ytSearchRef,
  ytQuery,
  setYtQuery,
  handleYtSearch,
  ytSearching,
  ytResults,
  onPick,
  pickTitle,
  pickIcon,
}) {
  return (
    <div className={styles.ytPopup} ref={ytSearchRef}>
      <div className={styles.ytSearchBar}>
        <input
          className={styles.ytSearchInput}
          value={ytQuery}
          onChange={(e) => setYtQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleYtSearch()}
          placeholder="Search YouTube..."
        />
        <button
          className={styles.ytSearchBtn}
          onClick={handleYtSearch}
          disabled={ytSearching}
        >
          {ytSearching ? '…' : '🔍'}
        </button>
      </div>
      {ytResults.length > 0 && (
        <div className={styles.ytGrid}>
          {ytResults.map((r) => (
            <div key={r.id} className={styles.ytCard}>
              <img
                className={styles.ytThumb}
                src={r.thumbnail}
                alt={r.title}
                loading="lazy"
              />
              <div className={styles.ytInfo}>
                <div className={styles.ytTitle}>{r.title}</div>
                <div className={styles.ytMeta}>{r.channel}</div>
              </div>
              <button
                className={styles.ytPickBtn}
                onClick={() => onPick(r)}
                title={pickTitle}
              >
                {pickIcon}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SceneManager({ onSave, currentConfig, resources, editingScene, onEditDone }) {
  const init = initFromProps(editingScene, currentConfig);
  const [name, setName] = useState(init.name);
  const [ytId, setYtId] = useState(init.ytId);
  const [sceneChannels, setSceneChannels] = useState(init.sceneChannels);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownUp, setDropdownUp] = useState(false);
  const [newChUrl, setNewChUrl] = useState('');
  const [newChName, setNewChName] = useState('');
  const dropdownRef = useRef(null);
  const btnRefs = useRef({});
  const [ytSearchFor, setYtSearchFor] = useState(null);
  const [ytQuery, setYtQuery] = useState('');
  const [ytResults, setYtResults] = useState([]);
  const [ytSearching, setYtSearching] = useState(false);
  const ytSearchRef = useRef(null);

  const toggleDropdown = useCallback((field) => {
    if (openDropdown === field) {
      setOpenDropdown(null);
      return;
    }
    setOpenDropdown(field);
    const btn = btnRefs.current[field];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropdownUp(spaceBelow < 220);
    }
  }, [openDropdown]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!ytSearchFor) return;
    const handler = (e) => {
      if (ytSearchRef.current && !ytSearchRef.current.contains(e.target)) {
        setYtSearchFor(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ytSearchFor]);

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

  const pickYtForVisual = (result) => {
    setYtId(extractYtId(result.url));
    setYtSearchFor(null);
    setYtQuery('');
    setYtResults([]);
  };

  const pickYtForChannel = (result) => {
    setNewChName(result.title);
    setNewChUrl(result.url);
    setYtSearchFor(null);
    setYtQuery('');
    setYtResults([]);
  };

  const handleSave = () => {
    const videoId = extractYtId(ytId);
    if (!name || !videoId) return;
    onSave({
      ...(editingScene ? { id: editingScene.id } : {}),
      name,
      visual: { videoId, volume: currentConfig?.visual?.volume || 50 },
      channels: sceneChannels.map(({ name: cn, url, type, volume, category }) => ({
        name: cn, url, type: type || typeFromUrl(url), volume: volume || 50, category: category || 'ambient',
      })),
    });
    setName('');
    setYtId('');
    setSceneChannels([]);
    if (onEditDone) onEditDone();
  };

  const addChannelToScene = () => {
    if (!newChUrl.trim()) return;
    setSceneChannels((prev) => [
      ...prev,
      {
        name: newChName.trim() || 'Untitled',
        url: newChUrl.trim(),
        type: typeFromUrl(newChUrl),
        volume: 50,
        category: 'ambient',
      },
    ]);
    setNewChUrl('');
    setNewChName('');
  };

  const removeSceneChannel = (idx) => {
    setSceneChannels((prev) => prev.filter((_, i) => i !== idx));
  };

  const pickResource = (url) => {
    setYtId(extractYtId(url));
    setOpenDropdown(null);
  };

  return (
    <>
      <div className={styles.field}>
        <label htmlFor="scene-name">Scene Name</label>
        <input id="scene-name" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rainy Nook" />
      </div>
      <div className={styles.field}>
        <label htmlFor="scene-yt">YouTube Video ID</label>
        <div className={styles.inputRow}>
          <input id="scene-yt" className={styles.input} value={ytId} onChange={(e) => setYtId(e.target.value)} placeholder="e.g. jfKfPfyJRdk" style={{ flex: 1 }} />
          <div className={styles.dropdownWrapper}>
            <button ref={(el) => { btnRefs.current.ytId = el; }} className={styles.resourceBtn} onClick={() => toggleDropdown('ytId')} title="Pick from saved resources">📂</button>
            <button className={styles.resourceBtn} onClick={() => setYtSearchFor(ytSearchFor === 'visual' ? null : 'visual')} title="Search YouTube">🔍</button>
            {openDropdown === 'ytId' && (
              <div className={`${styles.dropdown} ${dropdownUp ? styles.dropdownUp : ''}`} ref={dropdownRef}>
                {resources.filter((r) => r.category === 'visual').length === 0 ? (
                  <span className={styles.dropdownEmpty}>No visual resources</span>
                ) : (
                  resources.filter((r) => r.category === 'visual').map((r) => (
                    <button key={r.id} className={styles.dropdownItem} onClick={() => pickResource(r.url)}>
                      <span className={styles.dropdownName}>{r.name}</span>
                      <span className={styles.dropdownType}>visual</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        {ytSearchFor === 'visual' && (
          <YtSearchPopup
            ytSearchRef={ytSearchRef}
            ytQuery={ytQuery}
            setYtQuery={setYtQuery}
            handleYtSearch={handleYtSearch}
            ytSearching={ytSearching}
            ytResults={ytResults}
            onPick={pickYtForVisual}
            pickTitle="Use as visual"
            pickIcon="🎬"
          />
        )}
      </div>
      <div className={styles.field}>
        <label>Channels (Sounds)</label>
        <div className={styles.channelList}>
          {sceneChannels.map((ch, i) => (
            <div key={i} className={styles.channelRow}>
              <span className={styles.channelName}>{ch.name}</span>
              <span className={styles.channelUrl}>{ch.url.length > 35 ? ch.url.slice(0, 35) + '…' : ch.url}</span>
              <button className={styles.chRemove} onClick={() => removeSceneChannel(i)}>✕</button>
            </div>
          ))}
        </div>
        <div className={styles.inputRow}>
          <input className={styles.input} value={newChName} onChange={(e) => setNewChName(e.target.value)} placeholder="Name" style={{ flex: 0.4 }} />
          <input className={styles.input} value={newChUrl} onChange={(e) => setNewChUrl(e.target.value)} placeholder="YouTube or audio URL" style={{ flex: 1 }} />
          <button className={styles.resourceBtn} onClick={() => setYtSearchFor(ytSearchFor === 'channel' ? null : 'channel')} title="Search YouTube">🔍</button>
          <button className={styles.addBtn} onClick={addChannelToScene}>+</button>
        </div>
        {ytSearchFor === 'channel' && (
          <YtSearchPopup
            ytSearchRef={ytSearchRef}
            ytQuery={ytQuery}
            setYtQuery={setYtQuery}
            handleYtSearch={handleYtSearch}
            ytSearching={ytSearching}
            ytResults={ytResults}
            onPick={pickYtForChannel}
            pickTitle="Fill channel"
            pickIcon="🎵"
          />
        )}
      </div>

      <button className={styles.btn} onClick={handleSave}>Save Scene</button>
    </>
  );
}

export function CocoonsTab({ scenes, onLoad, onDelete, onEdit }) {
  const [search, setSearch] = useState('');

  const filtered = scenes.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <input
        className={styles.searchInput}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search cocoons…"
      />
      <div className={styles.list}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>{search ? 'No matches' : 'No cocoons saved yet.'}</p>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className={styles.listItem} onClick={() => onLoad(s)}>
              <div className={styles.listItemTop}>
                <span className={styles.listItemName}>{s.name}</span>
                <div className={styles.listActions}>
                  <button className={styles.editBtn} onClick={(e) => { e.stopPropagation(); onEdit(s); }} title="Edit">✏️</button>
                  <button className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}>&times;</button>
                </div>
              </div>
              <div className={styles.listItemMeta}>
                <span>🎬 {s.visual.videoId}</span>
                <span>🔊 {(s.channels || []).length} sounds</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
