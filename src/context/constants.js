export const initialVisual = { videoId: 'YmQ7jRgf4f0', volume: 50 };

export const tabs = [
  { key: 'sounds', label: 'Sounds' },
  { key: 'mixer', label: 'Mixer' },
  { key: 'configure', label: 'Scenes' },
  { key: 'resources', label: 'Resources' },
];

let nextChannelId = 1;
export function genChannelId() {
  return `ch_${Date.now()}_${nextChannelId++}`;
}
