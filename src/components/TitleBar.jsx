import { useAppContext } from '../context/useAppContext';
import styles from '../styles/App.module.css';

export default function TitleBar() {
  const { maximized } = useAppContext();

  return (
    <div className={styles.titleBar}>
      <span className={styles.titleBarLabel}>Digital Cocoon</span>
      <div className={styles.titleBarButtons}>
        <button type="button" className={styles.titleBarBtn} onClick={() => window.electronAPI?.minimize()} title="Minimize">—</button>
        <button type="button" className={styles.titleBarBtn} onClick={() => window.electronAPI?.maximize()} title={maximized ? 'Restore' : 'Maximize'}>{maximized ? '❐' : '□'}</button>
        <button type="button" className={`${styles.titleBarBtn} ${styles.titleBarBtnClose}`} onClick={() => window.electronAPI?.close()} title="Close">✕</button>
      </div>
    </div>
  );
}
