import styles from '../styles/App.module.css';
import AppProvider from '../context/AppContext';
import { useAppContext } from '../context/useAppContext';
import { resumeAudioContext } from '../utils/audioContext';

import TitleBar from './TitleBar';
import PlayerColumn from './PlayerColumn';
import SideColumn from './SideColumn';
import ThemeSwitcher from './ThemeSwitcher';

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

  const handleFirstClick = () => {
    if (!interacted) {
      resumeAudioContext();
      setInteracted(true);
    }
  };

  return (
    <div
      className={`${styles.app} ${zenMode ? `${styles.zen} ${zenBgMode === 'transparent' ? styles.zenBgTransparent : ''}` : ''}`}
      onClick={handleFirstClick}
    >
      {!zenMode && <TitleBar />}
      <PlayerColumn />

      {!zenMode && <button className={styles.zenBtn} onClick={() => setZenMode(true)}>◻ Zen Mode</button>}
      {!zenMode && <SideColumn />}

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

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
