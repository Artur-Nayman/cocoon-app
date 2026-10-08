import styles from '../styles/App.module.css';
import { useAppContext } from '../context/useAppContext';

export default function TitleBar() {
  const { maximized } = useAppContext();

  return (
    <div className={styles.titleBar}>
      <span className={styles.titleBarLabel}>Digital Cocoon</span>
      <div className={styles.titleBarButtons}>
        <button className={styles.titleBarBtn} onClick={() => window.electronAPI?.minimize()} title="Minimize">—</button>
        <button className={styles.titleBarBtn} onClick={() => window.electronAPI?.maximize()} title={maximized ? 'Restore' : 'Maximize'}>{maximized ? '❐' : '□'}</button>
        <button className={`${styles.titleBarBtn} ${styles.titleBarBtnClose}`} onClick={() => window.electronAPI?.close()} title="Close">✕</button>
      </div>
    </div>
  );
}
