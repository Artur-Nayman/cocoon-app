import styles from '../styles/YouTubeSearchPopup.module.css';

export default function YouTubeSearchPopup({
  popupRef,
  ytQuery,
  setYtQuery,
  handleYtSearch,
  ytSearching,
  ytResults,
  onPick,
  actionIcon,
  actionTitle,
  className
}) {
  return (
    <div className={`${styles.ytPopup} ${className || ''}`.trim()} ref={popupRef}>
      <div className={styles.ytSearchBar}>
        <input
          className={styles.ytSearchInput}
          value={ytQuery}
          onChange={(e) => setYtQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleYtSearch()}
          placeholder="Search YouTube..."
        />
        <button
          className={styles.ytSearchBtn}
          onClick={handleYtSearch}
          disabled={ytSearching}
        >
          {ytSearching ? '…' : '🔍'}
        </button>
      </div>
      {ytResults.length > 0 && (
        <div className={styles.ytGrid}>
          {ytResults.map((r) => (
            <div key={r.id} className={styles.ytCard}>
              <img className={styles.ytThumb} src={r.thumbnail} alt={r.title} loading="lazy" />
              <div className={styles.ytInfo}>
                <div className={styles.ytTitle}>{r.title}</div>
                <div className={styles.ytMeta}>{r.channel}</div>
              </div>
              <button
                className={styles.ytActionBtn}
                onClick={() => onPick(r)}
                title={actionTitle}
              >
                {actionIcon}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
