export const DEFAULT_SCENES = [
  {
    name: 'Study Session',
    visual: { videoId: 'YmQ7jRgf4f0', volume: 30 },
    melodic: { url: 'https://raw.githubusercontent.com/sayhan1610/guardians/main/songs/rain.mp3', type: 'direct', volume: 40 },
    atmospheric: { url: 'https://raw.githubusercontent.com/sayhan1610/guardians/main/songs/snow.mp3', type: 'direct', volume: 25 },
  },
  {
    name: 'Chill Vibes',
    visual: { videoId: '1Tl2FtV06qo', volume: 30 },
    melodic: { url: '', volume: 50 },
    atmospheric: { url: 'https://youtu.be/WHPEKLQID4U', type: 'youtube', volume: 30 },
  },
  {
    name: 'Lofi Focus',
    visual: { videoId: 'E2vONfzoyRI', volume: 30 },
    melodic: { url: '', volume: 50 },
    atmospheric: { url: 'https://youtu.be/uiMXGIG_DQo', type: 'youtube', volume: 20 },
  },
];

export const DEFAULT_RESOURCES = [
  // Visual (3)
  { name: 'Lofi Study Stream', type: 'youtube', url: 'https://youtu.be/YmQ7jRgf4f0', category: 'visual' },
  { name: 'Lofi Chill Stream', type: 'youtube', url: 'https://youtu.be/1Tl2FtV06qo', category: 'visual' },
  { name: 'Lofi Focus Stream', type: 'youtube', url: 'https://youtu.be/E2vONfzoyRI', category: 'visual' },
  // Atmospheric (10)
  { name: 'Rain', type: 'youtube', url: 'https://youtu.be/eTeD8DAta4c', category: 'atmospheric' },
  { name: 'Train', type: 'youtube', url: 'https://youtu.be/BELKTFzdjPU', category: 'atmospheric' },
  { name: 'Coffee Shop', type: 'youtube', url: 'https://youtu.be/uiMXGIG_DQo', category: 'atmospheric' },
  { name: 'Wind', type: 'youtube', url: 'https://youtu.be/jykvqa_UWP4', category: 'atmospheric' },
  { name: 'Ocean Waves', type: 'youtube', url: 'https://youtu.be/WHPEKLQID4U', category: 'atmospheric' },
  { name: 'Fireplace', type: 'youtube', url: 'https://youtu.be/6VB4bgiB0yA', category: 'atmospheric' },
  { name: 'Forest', type: 'youtube', url: 'https://youtu.be/_v7jeEVU_rw', category: 'atmospheric' },
  { name: 'Rain & Thunder', type: 'youtube', url: 'https://youtu.be/iLs04Z6uBqU', category: 'atmospheric' },
  { name: 'Night Train', type: 'youtube', url: 'https://youtu.be/8oVTXSntnA0', category: 'atmospheric' },
  { name: 'Gentle Rain', type: 'youtube', url: 'https://youtu.be/xSP7N9CQkqg', category: 'atmospheric' },
  // Melodic (4)
  { name: 'Lofi Study Session', type: 'youtube', url: 'https://youtu.be/lTRiuFIWV54', category: 'melodic' },
  { name: 'Animal Crossing Lofi', type: 'youtube', url: 'https://youtu.be/kwi63g4ONaI', category: 'melodic' },
  { name: 'Lofi Hip Hop Radio', type: 'youtube', url: 'https://youtu.be/7NOSDKb0HlU', category: 'melodic' },
  { name: 'Coffee Shop Jazz', type: 'youtube', url: 'https://youtu.be/MYPVQccHhAQ', category: 'melodic' },
  // Direct MP3 fallbacks (works without backend)
  { name: 'Lofi Rain (offline)', type: 'direct', url: 'https://raw.githubusercontent.com/sayhan1610/guardians/main/songs/rain.mp3', category: 'melodic' },
  { name: 'Lofi Hail (offline)', type: 'direct', url: 'https://raw.githubusercontent.com/sayhan1610/guardians/main/songs/hail.mp3', category: 'melodic' },
  { name: 'Lofi Snow (offline)', type: 'direct', url: 'https://raw.githubusercontent.com/sayhan1610/guardians/main/songs/snow.mp3', category: 'atmospheric' },
];
