import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import VisualLayer from './VisualLayer';
import MelodicLayer from './MelodicLayer';
import AtmosphericLayer from './AtmosphericLayer';
import TabPanel from './TabPanel';
import SceneManager, { CocoonsTab } from './SceneManager';
import VoiceControlPanel from './VoiceControlPanel';
import ResourcesPanel from './ResourcesPanel';
import ThemeSwitcher from './ThemeSwitcher';
import { useSceneManager } from '../hooks/useSceneManager';
import { useResourceManager } from '../hooks/useResourceManager';
import { resumeAudioContext } from '../utils/audioContext';
import { extractYtId } from '../utils/youtube';
import styles from '../styles/App.module.css';

const initialConfig = {
  visual: { videoId: 'YmQ7jRgf4f0', volume: 50 },
  melodic: { url: '', volume: 50 },
  atmospheric: { url: '', volume: 50 },
};

const tabs = [
  { key: 'configure', label: 'Configure Scene' },
  { key: 'cocoons', label: 'Your Cocoons' },
  { key: 'voice', label: 'Volume' },
  { key: 'resources', label: 'Resources' },
];

export default function App() {
  const [config, setConfig] = useState(initialConfig);
  const [activeScene, setActiveScene] = useState(null);
  const [interacted, setInteracted] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [activeTab, setActiveTab] = useState('configure');
  const [playing, setPlaying] = useState({ visual: true, melodic: true, atmospheric: true });
  const [masterVolume, setMasterVolume] = useState(100);
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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('cocoon_theme', theme);
  }, [theme]);

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
    requestAnimationFrame(() => {
      document.addEventListener('mousedown', handler);
    });
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [showTheme]);

  const { scenes, saveScene, deleteScene } = useSceneManager();
  const { resources, addResource, deleteResource } = useResourceManager();

  const currentTrackName = useMemo(() => {
    if (showVinyl && showMusicName) {
      const r = resources.find((res) => res.category === 'melodic' && res.url === config.melodic.url);
      return r?.name || config.melodic.url || '';
    }
    const videoId = config.visual.videoId;
    const r = resources.find((res) => res.category === 'visual' && extractYtId(res.url) === videoId);
    return r?.name || videoId || '';
  }, [showVinyl, showMusicName, resources, config]);

  const handleFirstClick = useCallback(() => {
    if (!interacted) {
      resumeAudioContext();
      setInteracted(true);
    }
  }, [interacted]);

  const handleSceneLoad = useCallback((scene) => {
    setActiveScene(scene);
    setConfig({
      visual: { videoId: scene.visual.videoId, volume: scene.visual.volume },
      melodic: { url: scene.melodic.url || '', type: scene.melodic.type || 'direct', volume: scene.melodic.volume },
      atmospheric: { url: scene.atmospheric.url || '', type: scene.atmospheric.type || 'direct', volume: scene.atmospheric.volume },
    });
    resumeAudioContext();
  }, []);

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

  const handleMixerChange = useCallback((next) => {
    setConfig(next);
  }, []);

  const handleTogglePlay = useCallback((layer) => {
    setPlaying((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const handleToggleAll = useCallback(() => {
    setPlaying((prev) => {
      const allNow = prev.visual && prev.melodic && prev.atmospheric;
      return { visual: !allNow, melodic: !allNow, atmospheric: !allNow };
    });
  }, []);

  const activeIndex = useMemo(() => {
    if (!activeScene) return -1;
    return scenes.findIndex((s) => s.id === activeScene.id);
  }, [scenes, activeScene]);

  const handlePrev = useCallback(() => {
    if (scenes.length === 0 || activeIndex < 0) return;
    const prevIndex = activeIndex <= 0 ? scenes.length - 1 : activeIndex - 1;
    handleSceneLoad(scenes[prevIndex]);
  }, [scenes, activeIndex, handleSceneLoad]);

  const handleNext = useCallback(() => {
    if (scenes.length === 0 || activeIndex < 0) return;
    const nextIndex = activeIndex >= scenes.length - 1 ? 0 : activeIndex + 1;
    handleSceneLoad(scenes[nextIndex]);
  }, [scenes, activeIndex, handleSceneLoad]);

  useEffect(() => {
    if (!zenMode) return;
    const handler = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [zenMode, handlePrev, handleNext]);

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

  useEffect(() => {
    if (zenMode) {
      window.electronAPI?.saveWindowSize();
      requestAnimationFrame(() => {
        const el = document.querySelector(`.${styles.playerCard}`);
        if (el && window.electronAPI?.resizeTo) {
          window.electronAPI.resizeTo(
            el.offsetWidth + 16,
            el.offsetHeight + 16
          );
        }
      });
    } else {
      window.electronAPI?.restoreWindowSize();
    }
  }, [zenMode]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'configure':
        return (
          <SceneManager
            scenes={scenes}
            onSave={saveScene}
            onDelete={deleteScene}
            onLoad={handleSceneLoad}
            currentConfig={config}
            resources={resources}
            editingScene={editingScene}
            onEditDone={() => setEditingScene(null)}
          />
        );
      case 'cocoons':
        return (
          <CocoonsTab
            scenes={scenes}
            onLoad={handleSceneLoad}
            onDelete={deleteScene}
            onEdit={(scene) => { setEditingScene(scene); setActiveTab('configure'); }}
          />
        );
      case 'voice':
        return (
          <VoiceControlPanel
            config={config}
            onChange={handleMixerChange}
            playing={playing}
            onTogglePlay={handleTogglePlay}
            resources={resources}
            onToggleAll={handleToggleAll}
          />
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

  return (
    <div className={`${styles.app} ${zenMode ? `${styles.zen} ${zenBgMode === 'transparent' ? styles.zenBgTransparent : ''}` : ''}`} onClick={handleFirstClick}>
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
            <button className={styles.zenExit} onClick={() => setZenMode(false)} title="Exit zen mode">
              ←
            </button>
          )}
          <h1>Digital Cocoon</h1>
          {activeScene && <div className={styles.sceneTitle}>{activeScene.name}</div>}
          <div className={styles.playerMediaWrap}>
            <VisualLayer videoId={config.visual.videoId} volume={Math.round(config.visual.volume * masterVolume / 100)} playing={playing.visual} showVinyl={showVinyl} />
            {currentTrackName && (
              <div className={styles.nowPlayingOverlay}>
                <span className={styles.nowPlayingOvlIcon}>{showVinyl ? '🎵' : '🎬'}</span>
                <span className={styles.nowPlayingOvlName}>{currentTrackName}</span>
              </div>
            )}
          </div>

          <div className={styles.masterRow}>
            <div className={styles.masterControls}>
              <button className={styles.controlBtn} onClick={handlePrev} title="Previous cocoon" disabled={scenes.length < 2}>⏮</button>
              <button className={styles.controlBtn} onClick={handleToggleAll} title="Pause / Play all">
                {playing.visual && playing.melodic && playing.atmospheric ? '⏸' : '▶️'}
              </button>
              <button className={styles.controlBtn} onClick={handleNext} title="Next cocoon" disabled={scenes.length < 2}>⏭</button>
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
        </div>
      </div>
      {!zenMode && <button className={styles.zenBtn} onClick={() => setZenMode(true)}>◻ Zen Mode</button>}

      {!zenMode && (
        <div className={styles.sideColumn}>
          <TabPanel
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
            {renderTabContent()}
          </TabPanel>
        </div>
      )}

      {backendStatus === 'down' && (
        <div className={styles.backendBanner}>
          ⚠️ YouTube audio unavailable (yt-dlp not found). Use &quot;offline&quot; resources from the Resources tab.
        </div>
      )}
      <MelodicLayer url={config.melodic.url} volume={config.melodic.volume * masterVolume / 10000} type={config.melodic.type} playing={playing.melodic} onBackendStatus={setBackendStatus} />
      <AtmosphericLayer url={config.atmospheric.url} volume={config.atmospheric.volume * masterVolume / 10000} type={config.atmospheric.type} playing={playing.atmospheric} onBackendStatus={setBackendStatus} />

      {!zenMode && (
        <button className={styles.themeFloater} onClick={() => setShowTheme((v) => !v)} title="Theme">
          🎨
        </button>
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
