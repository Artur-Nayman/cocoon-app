import { useRef, useId, useEffect } from 'react';
import { useYouTube } from '../hooks/useYouTube';
import VinylRecord from './VinylRecord';

function YouTubePlayerSection({ videoId, volume, playing, onReady }) {
  const uid = useId();
  const wrapperId = `yt-player-${uid}`;
  const { ready, loadVideo, setVolume, pause, play } = useYouTube(wrapperId);
  const prevId = useRef(null);
  const prevVol = useRef(null);

  useEffect(() => {
    if (!ready) return;
    if (videoId && videoId !== prevId.current) {
      loadVideo(videoId, volume);
      prevId.current = videoId;
      prevVol.current = volume;
    }
  }, [ready, videoId, volume, loadVideo]);

  useEffect(() => {
    if (volume !== prevVol.current && ready) {
      setVolume(volume);
      prevVol.current = volume;
    }
  }, [volume, ready, setVolume]);

  useEffect(() => {
    if (ready && onReady) onReady();
  }, [ready, onReady]);

  useEffect(() => {
    if (!ready) return;
    if (playing === false) pause();
    else if (playing === true) play();
  }, [playing, pause, play, ready]);

  return (
    <div style={{
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
      background: '#eee',
      aspectRatio: '16 / 9',
      width: '100%',
    }}>
      <div id={wrapperId} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default function VisualLayer({ videoId, volume, playing, onReady, showVinyl }) {
  if (showVinyl) {
    return (
      <div style={{
        borderRadius: 20,
        background: 'transparent',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem 0',
      }}>
        <VinylRecord playing={playing} />
      </div>
    );
  }

  return <YouTubePlayerSection videoId={videoId} volume={volume} playing={playing} onReady={onReady} />;
}
