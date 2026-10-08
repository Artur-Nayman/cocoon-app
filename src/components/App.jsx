import { useEffect } from 'react';
import AppProvider from '../context/AppContext';
import { useAppContext } from '../context/useAppContext';
import styles from '../styles/App.module.css';
import { resumeAudioContext } from '../utils/audioContext';
import PlayerColumn from './PlayerColumn';
import SideColumn from './SideColumn';
import ThemeSwitcher from './ThemeSwitcher';
import TitleBar from './TitleBar';

function MainLayout() {
  const {
    zenMode, setZenMode,
    zenBgMode,
    interacted, setInteracted,
    backendStatus,
    showTheme, setShowTheme,
    theme, setTheme,
    bgType, setBgType,
    bgValue, setBgValue,
    showVinyl, setShowVinyl,
    showMusicName, setShowMusicName,
    setZenBgMode,
    themeRef,
  } = useAppContext();

  useEffect(() => {
    if (interacted) return;
    const handleInteraction = () => {
      resumeAudioContext();
      setInteracted(true);
    };

    window.addEventListener('pointerdown', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [interacted, setInteracted]);

  return (
    <div
      className={`${styles.app} ${zenMode ? `${styles.zen} ${zenBgMode === 'transparent' ? styles.zenBgTransparent : ''}` : ''}`}
    >
      {!zenMode && <TitleBar />}
      <PlayerColumn />

      {!zenMode && <button type="button" className={styles.zenBtn} onClick={() => setZenMode(true)}>◻ Zen Mode</button>}
      {!zenMode && <SideColumn />}

      {backendStatus === 'down' && (
        <div className={styles.backendBanner}>
          ⚠️ YouTube audio unavailable (yt-dlp not found). Use offline resources.
        </div>
      )}

      {!zenMode && (
        <button type="button" className={styles.themeFloater} onClick={() => setShowTheme((v) => !v)} title="Theme" aria-label="Theme">🎨</button>
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

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
