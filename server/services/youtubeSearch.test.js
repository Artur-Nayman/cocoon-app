import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchYouTube } from './youtubeSearch.js';
import { execSync } from 'child_process';

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

describe('searchYouTube', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('should return empty array when execSync throws an error', () => {
    execSync.mockImplementation(() => {
      throw new Error('Command failed');
    });

    const result = searchYouTube('test query');

    expect(execSync).toHaveBeenCalled();
    expect(result).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      '[youtubeSearch] yt-dlp search failed:',
      'Command failed'
    );
  });

  it('should parse yt-dlp output successfully', () => {
    const mockOutput = JSON.stringify({
      id: '123',
      title: 'Test Video',
      webpage_url: 'https://youtu.be/123',
      thumbnail: 'thumb.jpg',
      duration: 100,
      channel: 'Test Channel',
      description: 'Test Desc'
    }) + '\n';

    execSync.mockReturnValue(mockOutput);

    const result = searchYouTube('test query');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: '123',
      title: 'Test Video',
      url: 'https://youtu.be/123',
      thumbnail: 'thumb.jpg',
      duration: 100,
      channel: 'Test Channel',
      description: 'Test Desc'
    });
  });

  it('should return empty array if output is empty', () => {
    execSync.mockReturnValue('');
    const result = searchYouTube('test query');
    expect(result).toEqual([]);
  });

  it('should skip items that fail to parse as JSON', () => {
    const mockOutput = JSON.stringify({
      id: '123',
      title: 'Test Video'
    }) + '\ninvalid json\n';

    execSync.mockReturnValue(mockOutput);

    const result = searchYouTube('test query');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('123');
  });
});
