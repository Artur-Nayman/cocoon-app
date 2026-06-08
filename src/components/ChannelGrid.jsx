import ChannelCard from './ChannelCard';
import styles from '../styles/ChannelGrid.module.css';

export default function ChannelGrid({ channels, masterVolume, onToggle, onVolume, onRemove, onBackendStatus }) {
  return (
    <div className={styles.grid}>
      {channels.length === 0 && (
        <div className={styles.empty}>
          <span>No sounds active</span>
          <span className={styles.emptyHint}>Browse sounds below to add them</span>
        </div>
      )}
      {channels.map((ch) => (
        <ChannelCard
          key={ch.id}
          channel={ch}
          masterVolume={masterVolume}
          onToggle={onToggle}
          onVolume={onVolume}
          onRemove={onRemove}
          onBackendStatus={onBackendStatus}
        />
      ))}
    </div>
  );
}
