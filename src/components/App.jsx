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
  const [showTheme, setShowTheme] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('cocoon_theme') || 'light');
  const [bgType, setBgType] = useState(() => localStorage.getItem('cocoon_bgType') || '');
  const [bgValue, setBgValue] = useState(() => localStorage.getItem('cocoon_bgValue') || '');
  const [showVinyl, setShowVinyl] = useState(() => localStorage.getItem('cocoon_showVinyl') === 'true');
  const [showMusicName, setShowMusicName] = useState(() => localStorage.getItem('cocoon_showMusicName') === 'true');
  const autoLoaded = useRef(false);

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
          />
        );
      case 'cocoons':
        return (
          <CocoonsTab
            scenes={scenes}
            onLoad={handleSceneLoad}
            onDelete={deleteScene}
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
    <div className={`${styles.app} ${zenMode ? styles.zen : ''}`} onClick={handleFirstClick}>
      {zenMode && (
        <button className={styles.zenToggle} onClick={() => setZenMode(false)}>
          🎋 Settings
        </button>
      )}

      <div className={styles.playerColumn}>
        <div className={styles.playerCard}>
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
            <span className={styles.masterLabel}>Master Volume</span>
            <span className={styles.masterPct}>{masterVolume}%</span>
            <input
              className={styles.masterSlider}
              type="range"
              min="0"
              max="100"
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
            />
            <button className={styles.masterToggle} onClick={handleToggleAll} title="Pause / Play all">
              {playing.visual && playing.melodic && playing.atmospheric ? '⏸' : '▶️'}
            </button>
          </div>
        </div>
      </div>

      {!zenMode && (
        <div className={styles.sideColumn}>
          <TabPanel
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
            {renderTabContent()}
          </TabPanel>
          <button
            style={{
              background: 'none', border: 'none', fontSize: '0.75rem',
              opacity: 0.4, cursor: 'pointer', padding: '0.3rem', textAlign: 'center',
              color: 'var(--text-color)',
            }}
            onClick={() => setZenMode(true)}
          >
            🎋 Enter Zen Mode
          </button>
        </div>
      )}

      {zenMode && (
        <button className={styles.zenHint} onClick={() => setZenMode(false)}>
          🎋 Show Settings
        </button>
      )}

      {backendStatus === 'down' && (
        <div className={styles.backendBanner}>
          ⚠️ Backend not running — YouTube audio unavailable. Use &quot;offline&quot; resources from the Resources tab.
        </div>
      )}
      <MelodicLayer url={config.melodic.url} volume={config.melodic.volume * masterVolume / 10000} type={config.melodic.type} playing={playing.melodic} onBackendStatus={setBackendStatus} />
      <AtmosphericLayer url={config.atmospheric.url} volume={config.atmospheric.volume * masterVolume / 10000} type={config.atmospheric.type} playing={playing.atmospheric} onBackendStatus={setBackendStatus} />

      <button className={styles.themeFloater} onClick={() => setShowTheme((v) => !v)} title="Theme">
        🎨
      </button>
      {showTheme && (
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
        />
      )}
    </div>
  );
}
