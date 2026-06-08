import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import VisualLayer from './VisualLayer';
import TabPanel from './TabPanel';
import SceneManager from './SceneManager';
import ResourcesPanel from './ResourcesPanel';
import ThemeSwitcher from './ThemeSwitcher';
import SoundBrowser from './SoundBrowser';
import ChannelGrid from './ChannelGrid';
import MixerPanel from './MixerPanel';
import SleepTimer from './SleepTimer';

import { useSceneManager } from '../hooks/useSceneManager';
import { useResourceManager } from '../hooks/useResourceManager';
import { useSleepTimer } from '../hooks/useSleepTimer';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { resumeAudioContext } from '../utils/audioContext';
import { extractYtId } from '../utils/youtube';
import styles from '../styles/App.module.css';

let nextChannelId = 1;
function genChannelId() {
  return `ch_${Date.now()}_${nextChannelId++}`;
}

const initialVisual = { videoId: 'YmQ7jRgf4f0', volume: 50 };

const tabs = [
  { key: 'sounds', label: 'Sounds' },
  { key: 'mixer', label: 'Mixer' },
  { key: 'configure', label: 'Scenes' },
  { key: 'resources', label: 'Resources' },
];

export default function App() {
  const [visual, setVisual] = useState(initialVisual);
  const [channels, setChannels] = useState([]);
  const [masterVolume, setMasterVolume] = useState(100);
  const [visualPlaying, setVisualPlaying] = useState(false);
  const [activeScene, setActiveScene] = useState(null);
  const [interacted, setInteracted] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [activeTab, setActiveTab] = useState('sounds');
  const [backendStatus, setBackendStatus] = useState('unknown');
  const [editingScene, setEditingScene] = useState(null);
  const [showTheme, setShowTheme] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('cocoon_theme') || 'light');
  const [bgType, setBgType] = useState(() => localStorage.getItem('cocoon_bgType') || '');
  const [bgValue, setBgValue] = useState(() => localStorage.getItem('cocoon_bgValue') || '');
  const [showVinyl, setShowVinyl] = useState(() => localStorage.getItem('cocoon_showVinyl') === 'true');
  const [showMusicName, setShowMusicName] = useState(() => localStorage.getItem('cocoon_showMusicName') === 'true');
  const [maximized, setMaximized] = useState(false);
  const [zenBgMode, setZenBgMode] = useState(() => localStorage.getItem('cocoon_zenBg') || 'dark');
  const autoLoaded = useRef(false);
  const themeRef = useRef(null);

  const { scenes, saveScene, deleteScene } = useSceneManager();
  const { resources, addResource, deleteResource } = useResourceManager();

  const handleSleepTimerEnd = useCallback(() => {
    setVisualPlaying(false);
    setChannels((prev) => prev.map((ch) => ({ ...ch, playing: false })));
  }, []);

  const sleepTimer = useSleepTimer(handleSleepTimerEnd);

  const allPlaying = useMemo(() => {
    return visualPlaying && channels.every((ch) => ch.playing !== false);
  }, [visualPlaying, channels]);

  const handleSceneLoad = useCallback((scene) => {
    setActiveScene(scene);
    setVisual({ videoId: scene.visual.videoId, volume: scene.visual.volume });
    setVisualPlaying(false);
    setChannels((scene.channels || []).map((ch) => ({
      ...ch,
      id: genChannelId(),
      playing: false,
    })));
  }, []);

  const handleAddChannel = useCallback((ch) => {
    setChannels((prev) => [...prev, { ...ch, id: genChannelId(), playing: false }]);
  }, []);

  const handleRemoveChannel = useCallback((id) => {
    setChannels((prev) => prev.filter((ch) => ch.id !== id));
  }, []);

  const handleToggleChannel = useCallback((id) => {
    setChannels((prev) => prev.map((ch) =>
      ch.id === id ? { ...ch, playing: !(ch.playing !== false) } : ch
    ));
  }, []);

  const handleChannelVolume = useCallback((id, volume) => {
    setChannels((prev) => prev.map((ch) =>
      ch.id === id ? { ...ch, volume } : ch
    ));
  }, []);

  const handleVisualVolume = useCallback((vol) => {
    setVisual((prev) => ({ ...prev, volume: vol }));
  }, []);

  const handleAddVisual = useCallback((url) => {
    const id = extractYtId(url);
    if (id) {
      setVisual((prev) => ({ ...prev, videoId: id }));
    }
  }, []);

  const handleToggleAll = useCallback(() => {
    const next = !allPlaying;
    setVisualPlaying(next);
    setChannels((prev) => prev.map((ch) => ({ ...ch, playing: next })));
  }, [allPlaying]);

  const handlePrev = useCallback(() => {
    if (scenes.length === 0 || !activeScene) return;
    const idx = scenes.findIndex((s) => s.id === activeScene.id);
    if (idx < 0) return;
    const prevIdx = idx <= 0 ? scenes.length - 1 : idx - 1;
    handleSceneLoad(scenes[prevIdx]);
  }, [scenes, activeScene, handleSceneLoad]);

  const handleNext = useCallback(() => {
    if (scenes.length === 0 || !activeScene) return;
    const idx = scenes.findIndex((s) => s.id === activeScene.id);
    if (idx < 0) return;
    const nextIdx = idx >= scenes.length - 1 ? 0 : idx + 1;
    handleSceneLoad(scenes[nextIdx]);
  }, [scenes, activeScene, handleSceneLoad]);

  const handleFirstClick = useCallback(() => {
    if (!interacted) {
      resumeAudioContext();
      setInteracted(true);
    }
  }, [interacted]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('cocoon_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('zen-widget', zenMode);
  }, [zenMode]);

  useEffect(() => {
    const body = document.body;
    body.className = '';
    if (bgType === 'color') {
      body.classList.add('bg-solid');
      body.style.backgroundColor = bgValue;
    } else if (bgType === 'image') {
      body.classList.add('bg-image');
      body.style.backgroundImage = `url(${bgValue})`;
    } else if (bgType === 'animation' && bgValue) {
      body.classList.add(`bg-anim-${bgValue}`);
    } else {
      body.style.backgroundColor = '';
      body.style.backgroundImage = '';
    }
    localStorage.setItem('cocoon_bgType', bgType);
    localStorage.setItem('cocoon_bgValue', bgValue);
  }, [bgType, bgValue]);

  useEffect(() => {
    localStorage.setItem('cocoon_showVinyl', showVinyl);
  }, [showVinyl]);

  useEffect(() => {
    localStorage.setItem('cocoon_showMusicName', showMusicName);
  }, [showMusicName]);

  useEffect(() => {
    if (!showTheme) return;
    const handler = (e) => {
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setShowTheme(false);
      }
    };
    const keyHandler = (e) => {
      if (e.key === 'Escape') setShowTheme(false);
    };
    requestAnimationFrame(() => document.addEventListener('mousedown', handler));
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [showTheme]);

  useEffect(() => {
    document.addEventListener('click', handleFirstClick, { once: true });
    return () => document.removeEventListener('click', handleFirstClick);
  }, [handleFirstClick]);

  useEffect(() => {
    if (scenes.length > 0 && !activeScene && !autoLoaded.current) {
      autoLoaded.current = true;
      handleSceneLoad(scenes[0]);
    }
  });

  useEffect(() => {
    if (window.electronAPI?.setAlwaysOnTop) {
      window.electronAPI.setAlwaysOnTop(zenMode);
    }
  }, [zenMode]);

  useEffect(() => {
    if (window.electronAPI?.onMaximizedChange) {
      window.electronAPI.onMaximizedChange(setMaximized);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cocoon_zenBg', zenBgMode);
  }, [zenBgMode]);

  const resizeToCard = useCallback(() => {
    requestAnimationFrame(() => {
      const el = document.querySelector(`.${styles.playerCard}`);
      if (el && window.electronAPI?.resizeTo) {
        window.electronAPI.resizeTo(el.offsetWidth + 24, el.offsetHeight + 24);
      }
    });
  }, []);

  useEffect(() => {
    if (zenMode) {
      window.electronAPI?.saveWindowSize();
      resizeToCard();
    } else {
      window.electronAPI?.restoreWindowSize();
    }
  }, [zenMode, resizeToCard]);

  useEffect(() => {
    if (zenMode) resizeToCard();
  }, [zenMode, zenBgMode, resizeToCard]);

  const shortcuts = useMemo(() => ({
    onToggleAll: handleToggleAll,
    onToggleChannel: (idx) => {
      setChannels((prev) => {
        if (idx >= prev.length) return prev;
        const chId = prev[idx].id;
        return prev.map((ch) => ch.id === chId ? { ...ch, playing: !(ch.playing !== false) } : ch);
      });
    },
    onMasterVolumeUp: () => setMasterVolume((v) => Math.min(100, v + 10)),
    onMasterVolumeDown: () => setMasterVolume((v) => Math.max(0, v - 10)),
  }), [handleToggleAll]);

  useKeyboardShortcuts(shortcuts);

  const currentTrackName = useMemo(() => {
    if (showVinyl && showMusicName) {
      const firstMusic = channels.find((ch) => ch.category === 'music' && ch.playing !== false);
      return firstMusic?.name || '';
    }
    const r = resources.find((res) => res.category === 'visual' && extractYtId(res.url) === visual.videoId);
    return r?.name || visual.videoId || '';
  }, [showVinyl, showMusicName, channels, resources, visual.videoId]);

  const saveCurrentAsScene = useCallback(() => {
    saveScene({
      name: `Scene ${scenes.length + 1}`,
      visual: { videoId: visual.videoId, volume: visual.volume },
      channels: channels.map((ch) => ({
        name: ch.name,
        url: ch.url,
        type: ch.type,
        volume: ch.volume,
        category: ch.category,
        playing: ch.playing !== false,
      })),
    });
  }, [saveScene, scenes, visual, channels]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sounds':
        return <SoundBrowser onAddChannel={handleAddChannel} onAddVisual={handleAddVisual} />;
      case 'mixer':
        return (
          <div>
            <ChannelGrid
              channels={channels}
              masterVolume={masterVolume}
              onToggle={handleToggleChannel}
              onVolume={handleChannelVolume}
              onRemove={handleRemoveChannel}
              onBackendStatus={setBackendStatus}
            />
            <MixerPanel
              channels={channels}
              masterVolume={masterVolume}
              onMasterVolume={setMasterVolume}
              onChannelVolume={handleChannelVolume}
              onToggleChannel={handleToggleChannel}
              onRemoveChannel={handleRemoveChannel}
              onToggleAll={handleToggleAll}
              allPlaying={allPlaying}
            />
            <SleepTimer
              minutes={sleepTimer.sleepMinutes}
              remaining={sleepTimer.remaining}
              label={sleepTimer.label}
              onToggle={sleepTimer.toggle}
            />
            <button className={styles.saveSceneBtn} onClick={saveCurrentAsScene}>
              💾 Save Current Mix
            </button>
          </div>
        );
      case 'configure':
        return (
          <div>
            <SceneManager
              key={editingScene?.id || 'new'}
              scenes={scenes}
              onSave={saveScene}
              onDelete={deleteScene}
              onLoad={handleSceneLoad}
              currentConfig={{ visual, channels }}
              resources={resources}
              editingScene={editingScene}
              onEditDone={() => setEditingScene(null)}
            />
          </div>
        );
      case 'resources':
        return (
          <ResourcesPanel
            resources={resources}
            onAdd={addResource}
            onDelete={deleteResource}
          />
        );
      default:
        return null;
    }
  };

  const visVol = Math.round(visual.volume * masterVolume / 100);

  return (
    <div
      className={`${styles.app} ${zenMode ? `${styles.zen} ${zenBgMode === 'transparent' ? styles.zenBgTransparent : ''}` : ''}`}
      onClick={handleFirstClick}
    >
      {!zenMode && (
        <div className={styles.titleBar}>
          <span className={styles.titleBarLabel}>Digital Cocoon</span>
          <div className={styles.titleBarButtons}>
            <button className={styles.titleBarBtn} onClick={() => window.electronAPI?.minimize()} title="Minimize">—</button>
            <button className={styles.titleBarBtn} onClick={() => window.electronAPI?.maximize()} title={maximized ? 'Restore' : 'Maximize'}>{maximized ? '❐' : '□'}</button>
            <button className={`${styles.titleBarBtn} ${styles.titleBarBtnClose}`} onClick={() => window.electronAPI?.close()} title="Close">✕</button>
          </div>
        </div>
      )}
      <div className={styles.playerColumn}>
        <div className={styles.playerCard}>
          {zenMode && (
            <button className={styles.zenExit} onClick={() => setZenMode(false)} title="Exit zen mode">←</button>
          )}
          <h1>Digital Cocoon</h1>
          {activeScene && <div className={styles.sceneTitle}>{activeScene.name}</div>}
          <div className={styles.playerMediaWrap}>
            <VisualLayer
              videoId={visual.videoId}
              volume={visVol}
              playing={visualPlaying}
              showVinyl={showVinyl}
            />
            {currentTrackName && (
              <div className={styles.nowPlayingOverlay}>
                <span className={styles.nowPlayingOvlIcon}>{showVinyl ? '🎵' : '🎬'}</span>
                <span className={styles.nowPlayingOvlName}>{currentTrackName}</span>
              </div>
            )}
          </div>

          <div className={styles.visualVolRow}>
            <span className={styles.visualVolLabel}>🔊 Video</span>
            <input
              className={styles.visualVolSlider}
              type="range"
              min="0"
              max="100"
              value={visual.volume}
              onChange={(e) => handleVisualVolume(Number(e.target.value))}
            />
            <span className={styles.visualVolPct}>{visual.volume}%</span>
          </div>

          <ChannelGrid
            channels={channels}
            masterVolume={masterVolume}
            onToggle={handleToggleChannel}
            onVolume={handleChannelVolume}
            onRemove={handleRemoveChannel}
            onBackendStatus={setBackendStatus}
          />

          <div className={styles.masterRow}>
            <div className={styles.masterControls}>
              <button className={styles.controlBtn} onClick={handlePrev} title="Previous scene" disabled={scenes.length < 2}>⏮</button>
              <button className={styles.controlBtn} onClick={handleToggleAll} title="Pause / Play all">
                {allPlaying ? '⏸' : '▶️'}
              </button>
              <button className={styles.controlBtn} onClick={handleNext} title="Next scene" disabled={scenes.length < 2}>⏭</button>
            </div>
            <span className={styles.masterPct}>{masterVolume}%</span>
            <input
              className={styles.masterSlider}
              type="range"
              min="0"
              max="100"
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
            />
          </div>
          {sleepTimer.label && (
            <div className={styles.timerBadge}>⏰ {sleepTimer.label}</div>
          )}
        </div>
      </div>
      {!zenMode && <button className={styles.zenBtn} onClick={() => setZenMode(true)}>◻ Zen Mode</button>}

      {!zenMode && (
        <div className={styles.sideColumn}>
          <TabPanel tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
            {renderTabContent()}
          </TabPanel>
        </div>
      )}

      {backendStatus === 'down' && (
        <div className={styles.backendBanner}>
          ⚠️ YouTube audio unavailable (yt-dlp not found). Use offline resources.
        </div>
      )}


      {!zenMode && (
        <button className={styles.themeFloater} onClick={() => setShowTheme((v) => !v)} title="Theme">🎨</button>
      )}
      {showTheme && (
        <div ref={themeRef}>
          <ThemeSwitcher
            theme={theme}
            bgType={bgType}
            bgValue={bgValue}
            showVinyl={showVinyl}
            showMusicName={showMusicName}
            onThemeChange={setTheme}
            onBgTypeChange={setBgType}
            onBgValueChange={setBgValue}
            onVinylToggle={setShowVinyl}
            onMusicNameToggle={setShowMusicName}
            onClose={() => setShowTheme(false)}
            zenBgMode={zenBgMode}
            onZenBgChange={setZenBgMode}
          />
        </div>
      )}
    </div>
  );
}
