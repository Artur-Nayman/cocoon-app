import styles from '../styles/App.module.css';
import { useAppContext } from '../context/useAppContext';
import VisualLayer from './VisualLayer';
import ChannelGrid from './ChannelGrid';

export default function PlayerColumn() {
  const {
    zenMode, setZenMode,
    setShowTheme,
    activeScene,
    visual, handleVisualVolume,
    masterVolume, setMasterVolume,
    visualPlaying,
    showVinyl,
    currentTrackName,
    channels,
    handleToggleChannel, handleChannelVolume, handleRemoveChannel,
    setBackendStatus,
    handlePrev, handleToggleAll, handleNext,
    scenes,
    allPlaying,
    sleepTimer,
  } = useAppContext();

  const visVol = Math.round(visual.volume * masterVolume / 100);

  return (
    <div className={styles.playerColumn}>
      <div className={styles.playerCard}>
        {zenMode ? (
          <div className={styles.zenToolbar}>
            <button className={styles.zenToolBtn} onClick={() => setShowTheme(true)} title="Theme">🎨</button>
            <button className={styles.zenToolBtn} onClick={() => setZenMode(false)} title="Exit Zen">⬅</button>
            {window.electronAPI && (
              <button className={styles.zenToolBtn} onClick={() => window.electronAPI.close()} title="Close">✕</button>
            )}
          </div>
        ) : (
          <h1>Digital Cocoon</h1>
        )}
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
  );
}
