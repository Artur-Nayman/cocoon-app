import { useEffect, useRef, useCallback, useState } from 'react';

let apiReady = false;
const readyCallbacks = [];

function onYouTubeIframeAPIReady() {
  apiReady = true;
  readyCallbacks.forEach(fn => fn());
  readyCallbacks.length = 0;
}

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

function ensureAPI() {
  if (document.querySelector('#yt-api-script')) return;
  const tag = document.createElement('script');
  tag.id = 'yt-api-script';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

export function useYouTube(containerId) {
  const playerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const readyResolve = useRef(null);

  const getPlayer = useCallback(() => playerRef.current, []);

  useEffect(() => {
    ensureAPI();

    const initPlayer = () => {
      if (playerRef.current) return;
      playerRef.current = new window.YT.Player(containerId, {
        height: '100%',
        width: '100%',
        videoId: 'jfKfPfyJRdk',
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            setReady(true);
            if (readyResolve.current) readyResolve.current();
          },
        },
      });
    };

    if (apiReady) {
      initPlayer();
    } else {
      readyCallbacks.push(initPlayer);
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [containerId]);

  const loadVideo = useCallback((videoId, volume) => {
    const p = playerRef.current;
    if (!p || !p.loadVideoById) return;
    p.loadVideoById(videoId);
    setTimeout(() => {
      if (p && p.setVolume) p.setVolume(volume);
    }, 500);
  }, []);

  const setVolume = useCallback((vol) => {
    const p = playerRef.current;
    if (p && p.setVolume) p.setVolume(vol);
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  return { ready, getPlayer, loadVideo, setVolume, pause, play };
}
