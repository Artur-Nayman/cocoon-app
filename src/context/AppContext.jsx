import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useResourceManager } from '../hooks/useResourceManager';
import { useSceneManager } from '../hooks/useSceneManager';
import { useSleepTimer } from '../hooks/useSleepTimer';
import styles from '../styles/App.module.css'; // used for querySelector('.playerCard')
import { extractYtId } from '../utils/youtube';
import { AppContext } from './AppContextObj';
import { genChannelId, initialVisual } from './constants';



export default function AppProvider({ children }) {
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
      window.electronAPI.onMaximizedChange((isMaximized) => {
        setMaximized(isMaximized);
        if (isMaximized) {
          setZenMode(false);
        }
      });
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
    if (zenMode && zenBgMode) resizeToCard();
  }, [zenMode, zenBgMode, resizeToCard]);

  /* Auto-resize window when card content changes in zen mode */
  useEffect(() => {
    if (!zenMode || !window.electronAPI?.resizeTo) return;
    const card = document.querySelector(`.${styles.playerCard}`);
    if (!card) return;
    const ro = new ResizeObserver(() => resizeToCard());
    ro.observe(card);
    return () => ro.disconnect();
  }, [zenMode, resizeToCard]);

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


  const contextValue = {
    visual, setVisual,
    channels, setChannels,
    masterVolume, setMasterVolume,
    visualPlaying, setVisualPlaying,
    activeScene, setActiveScene,
    interacted, setInteracted,
    zenMode, setZenMode,
    activeTab, setActiveTab,
    backendStatus, setBackendStatus,
    editingScene, setEditingScene,
    showTheme, setShowTheme,
    theme, setTheme,
    bgType, setBgType,
    bgValue, setBgValue,
    showVinyl, setShowVinyl,
    showMusicName, setShowMusicName,
    maximized, setMaximized,
    zenBgMode, setZenBgMode,
    themeRef,
    scenes, saveScene, deleteScene,
    resources, addResource, deleteResource,
    sleepTimer,
    allPlaying,
    handleSceneLoad,
    handleAddChannel,
    handleRemoveChannel,
    handleToggleChannel,
    handleChannelVolume,
    handleVisualVolume,
    handleAddVisual,
    handleToggleAll,
    handlePrev,
    handleNext,
    currentTrackName,
    saveCurrentAsScene,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
