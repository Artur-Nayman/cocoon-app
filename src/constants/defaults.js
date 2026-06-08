export const CHANNEL_COLORS = {
  nature: '#4caf50',
  city: '#ff9800',
  music: '#9c27b0',
  ambient: '#2196f3',
  white_noise: '#f44336',
  voice: '#e91e63',
  custom: '#607d8b',
};

export const CHANNEL_CATEGORIES = [
  { key: 'nature', label: 'Nature', icon: '🌿' },
  { key: 'city', label: 'City', icon: '🏙️' },
  { key: 'music', label: 'Music', icon: '🎵' },
  { key: 'ambient', label: 'Ambient', icon: '🌊' },
  { key: 'white_noise', label: 'Noise', icon: '🤍' },
  { key: 'voice', label: 'Voice', icon: '🎙️' },
];

export const DEFAULT_BUILTIN_SOUNDS = [
  { name: 'Rain', url: 'https://youtu.be/eTeD8DAta4c', type: 'youtube', category: 'nature', icon: '🌧️' },
  { name: 'Ocean Waves', url: 'https://youtu.be/WHPEKLQID4U', type: 'youtube', category: 'nature', icon: '🌊' },
  { name: 'Forest Birds', url: 'https://youtu.be/_v7jeEVU_rw', type: 'youtube', category: 'nature', icon: '🌲' },
  { name: 'Thunder Storm', url: 'https://youtu.be/iLs04Z6uBqU', type: 'youtube', category: 'nature', icon: '⛈️' },
  { name: 'Wind', url: 'https://youtu.be/jykvqa_UWP4', type: 'youtube', category: 'nature', icon: '💨' },
  { name: 'Gentle Rain', url: 'https://youtu.be/xSP7N9CQkqg', type: 'youtube', category: 'nature', icon: '🌦️' },
  { name: 'Train', url: 'https://youtu.be/BELKTFzdjPU', type: 'youtube', category: 'city', icon: '🚂' },
  { name: 'Coffee Shop', url: 'https://youtu.be/uiMXGIG_DQo', type: 'youtube', category: 'city', icon: '☕' },
  { name: 'Night Train', url: 'https://youtu.be/8oVTXSntnA0', type: 'youtube', category: 'city', icon: '🚆' },
  { name: 'Fireplace', url: 'https://youtu.be/6VB4bgiB0yA', type: 'youtube', category: 'ambient', icon: '🔥' },
  { name: 'Lofi Study', url: 'https://youtu.be/lTRiuFIWV54', type: 'youtube', category: 'music', icon: '📚' },
  { name: 'Animal Crossing Lofi', url: 'https://youtu.be/kwi63g4ONaI', type: 'youtube', category: 'music', icon: '🎮' },
  { name: 'Lofi Hip Hop', url: 'https://youtu.be/7NOSDKb0HlU', type: 'youtube', category: 'music', icon: '🎧' },
  { name: 'Coffee Jazz', url: 'https://youtu.be/MYPVQccHhAQ', type: 'youtube', category: 'music', icon: '🎷' },
  { name: 'Rain (offline)', url: 'https://raw.githubusercontent.com/sayhan1610/guardians/main/songs/rain.mp3', type: 'direct', category: 'nature', icon: '🌧️' },
  { name: 'Snow (offline)', url: 'https://raw.githubusercontent.com/sayhan1610/guardians/main/songs/snow.mp3', type: 'direct', category: 'nature', icon: '❄️' },
  { name: 'Hail (offline)', url: 'https://raw.githubusercontent.com/sayhan1610/guardians/main/songs/hail.mp3', type: 'direct', category: 'nature', icon: '🧊' },
];

export const DEFAULT_SCENES = [
  {
    name: 'Study Session',
    visual: { videoId: 'YmQ7jRgf4f0', volume: 30 },
    channels: [
      { name: 'Rain', url: 'https://youtu.be/eTeD8DAta4c', type: 'youtube', volume: 40, category: 'nature' },
      { name: 'Lofi Study', url: 'https://youtu.be/lTRiuFIWV54', type: 'youtube', volume: 25, category: 'music' },
    ],
  },
  {
    name: 'Chill Vibes',
    visual: { videoId: '1Tl2FtV06qo', volume: 30 },
    channels: [
      { name: 'Ocean Waves', url: 'https://youtu.be/WHPEKLQID4U', type: 'youtube', volume: 35, category: 'nature' },
      { name: 'Coffee Shop', url: 'https://youtu.be/uiMXGIG_DQo', type: 'youtube', volume: 25, category: 'city' },
      { name: 'Animal Crossing Lofi', url: 'https://youtu.be/kwi63g4ONaI', type: 'youtube', volume: 20, category: 'music' },
    ],
  },
  {
    name: 'Sleepy Night',
    visual: { videoId: 'E2vONfzoyRI', volume: 20 },
    channels: [
      { name: 'Gentle Rain', url: 'https://youtu.be/xSP7N9CQkqg', type: 'youtube', volume: 30, category: 'nature' },
      { name: 'Fireplace', url: 'https://youtu.be/6VB4bgiB0yA', type: 'youtube', volume: 25, category: 'ambient' },
    ],
  },
  {
    name: 'Urban Focus',
    visual: { videoId: 'jfKfPfyJRdk', volume: 25 },
    channels: [
      { name: 'Train', url: 'https://youtu.be/BELKTFzdjPU', type: 'youtube', volume: 35, category: 'city' },
      { name: 'Coffee Jazz', url: 'https://youtu.be/MYPVQccHhAQ', type: 'youtube', volume: 30, category: 'music' },
      { name: 'Rain (offline)', url: 'https://raw.githubusercontent.com/sayhan1610/guardians/main/songs/rain.mp3', type: 'direct', volume: 20, category: 'nature' },
    ],
  },
];

export const DEFAULT_RESOURCES = [
  ...DEFAULT_BUILTIN_SOUNDS.map((s) => ({ name: s.name, type: s.type, url: s.url, category: s.category })),
  { name: 'Lofi Study Stream', type: 'youtube', url: 'https://youtu.be/YmQ7jRgf4f0', category: 'visual' },
  { name: 'Lofi Chill Stream', type: 'youtube', url: 'https://youtu.be/1Tl2FtV06qo', category: 'visual' },
  { name: 'Lofi Focus Stream', type: 'youtube', url: 'https://youtu.be/E2vONfzoyRI', category: 'visual' },
];
