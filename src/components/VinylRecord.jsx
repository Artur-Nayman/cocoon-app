export default function VinylRecord({ playing }) {
  return (
    <div className="vinylContainer">
      <div className={`vinylRecord ${!playing ? 'paused' : ''}`}>
        <div className="vinylShine" />
        <div className="vinylLabel">
          <div className="vinylLabelInner" />
          <div className="vinylHole" />
        </div>
      </div>
    </div>
  );
}
