import { useState, useRef, useEffect, useCallback } from 'react';
import { extractYtId } from '../utils/youtube';
import styles from '../styles/SceneManager.module.css';

export default function SceneManager({ onSave, currentConfig, resources, editingScene, onEditDone }) {
  const [name, setName] = useState('');
  const [ytId, setYtId] = useState('');
  const [melodicUrl, setMelodicUrl] = useState('');
  const [atmosUrl, setAtmosUrl] = useState('');

  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownUp, setDropdownUp] = useState(false);
  const dropdownRef = useRef(null);
  const btnRefs = useRef({});

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
    if (editingScene) {
      setName(editingScene.name);
      setYtId(editingScene.visual.videoId);
      setMelodicUrl(editingScene.melodic.url || '');
      setAtmosUrl(editingScene.atmospheric.url || '');
    }
  }, [editingScene]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSave = () => {
    const videoId = extractYtId(ytId);
    if (!name || !videoId) return;
    onSave({
      ...(editingScene ? { id: editingScene.id } : {}),
      name,
      visual: { videoId, volume: currentConfig.visual.volume },
      melodic: { url: melodicUrl, type: melodicUrl.includes('youtu') ? 'youtube' : 'direct', volume: currentConfig.melodic.volume },
      atmospheric: { url: atmosUrl, type: atmosUrl.includes('youtu') ? 'youtube' : 'direct', volume: currentConfig.atmospheric.volume },
    });
    setName('');
    setYtId('');
    setMelodicUrl('');
    setAtmosUrl('');
    if (onEditDone) onEditDone();
  };

  const pickResource = (field, resource) => {
    if (field === 'ytId') {
      setYtId(extractYtId(resource.url));
    } else if (field === 'melodicUrl') {
      setMelodicUrl(resource.url);
    } else if (field === 'atmosUrl') {
      setAtmosUrl(resource.url);
    }
    setOpenDropdown(null);
  };

  const filteredByCategory = (field) => {
    if (field === 'ytId') return resources.filter((r) => r.category === 'visual');
    if (field === 'melodicUrl') return resources.filter((r) => r.category === 'melodic');
    if (field === 'atmosUrl') return resources.filter((r) => r.category === 'atmospheric');
    return [];
  };

  const renderDropdown = (field) => (
    <div className={styles.dropdownWrapper}>
      <button
        ref={(el) => { btnRefs.current[field] = el; }}
        className={styles.resourceBtn}
        onClick={() => toggleDropdown(field)}
        title="Pick from saved resources"
      >
        📂
      </button>
      {openDropdown === field && (
        <div className={`${styles.dropdown} ${dropdownUp ? styles.dropdownUp : ''}`} ref={dropdownRef}>
          {filteredByCategory(field).length === 0 ? (
            <span className={styles.dropdownEmpty}>No matching resources</span>
          ) : (
            filteredByCategory(field).map((r) => (
              <button
                key={r.id}
                className={styles.dropdownItem}
                onClick={() => pickResource(field, r)}
              >
                <span className={styles.dropdownName}>{r.name}</span>
                <span className={styles.dropdownType}>{r.category}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className={styles.field}>
        <label htmlFor="scene-name-cfg">Scene Name</label>
        <input id="scene-name-cfg" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rainy Nook" />
      </div>
      <div className={styles.field}>
        <label htmlFor="scene-yt-cfg">YouTube Video ID</label>
        <div className={styles.inputRow}>
          <input id="scene-yt-cfg" className={styles.input} value={ytId} onChange={(e) => setYtId(e.target.value)} placeholder="e.g. jfKfPfyJRdk" style={{ flex: 1 }} />
          {renderDropdown('ytId')}
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="scene-mel-cfg">Melodic URL</label>
        <div className={styles.inputRow}>
          <input id="scene-mel-cfg" className={styles.input} value={melodicUrl} onChange={(e) => setMelodicUrl(e.target.value)} placeholder="Music stream URL" style={{ flex: 1 }} />
          {renderDropdown('melodicUrl')}
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="scene-atm-cfg">Atmospheric URL</label>
        <div className={styles.inputRow}>
          <input id="scene-atm-cfg" className={styles.input} value={atmosUrl} onChange={(e) => setAtmosUrl(e.target.value)} placeholder="Ambient sound URL" style={{ flex: 1 }} />
          {renderDropdown('atmosUrl')}
        </div>
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
                {s.melodic.url && <span>🎵 {s.melodic.url.length > 40 ? s.melodic.url.slice(0, 40) + '…' : s.melodic.url}</span>}
                {s.atmospheric.url && <span>🌿 {s.atmospheric.url.length > 40 ? s.atmospheric.url.slice(0, 40) + '…' : s.atmospheric.url}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
