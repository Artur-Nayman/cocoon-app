import styles from '../styles/SceneCard.module.css';

export default function SceneCard({ scene, onLoad, onDelete }) {
  return (
    <div className={styles.card} onClick={() => onLoad(scene)}>
      <button
        className={styles.delete}
        onClick={(e) => { e.stopPropagation(); onDelete(scene.id); }}
        aria-label="Delete scene"
      >
        &times;
      </button>
      <span className={styles.name}>{scene.name}</span>
    </div>
  );
}
