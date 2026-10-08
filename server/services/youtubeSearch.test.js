import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import { searchYouTube } from './youtubeSearch.js';

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

describe('searchYouTube', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse valid yt-dlp json output correctly', () => {
    const mockOutput = [
      JSON.stringify({
        id: '123',
        title: 'Test Video',
        webpage_url: 'https://youtu.be/123',
        thumbnail: 'https://i.ytimg.com/vi/123/hqdefault.jpg',
        duration: 120,
        uploader: 'Test Channel',
        description: 'Test Description',
      }),
      JSON.stringify({
        id: '456',
        title: 'Another Video',
        channel: 'Another Channel',
      }),
    ].join('\n');

    vi.mocked(execSync).mockReturnValue(mockOutput);

    const results = searchYouTube('test query');

    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('yt-dlp'),
      expect.any(Object)
    );
    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('ytsearch10:test query'),
      expect.any(Object)
    );

    expect(results).toHaveLength(2);

    expect(results[0]).toEqual({
      id: '123',
      title: 'Test Video',
      url: 'https://youtu.be/123',
      thumbnail: 'https://i.ytimg.com/vi/123/hqdefault.jpg',
      duration: 120,
      channel: 'Test Channel',
      description: 'Test Description',
    });

    expect(results[1]).toEqual({
      id: '456',
      title: 'Another Video',
      url: 'https://youtu.be/456',
      thumbnail: 'https://i.ytimg.com/vi/456/hqdefault.jpg',
      duration: 0,
      channel: 'Another Channel',
      description: '',
    });
  });

  it('should handle empty output', () => {
    vi.mocked(execSync).mockReturnValue('');
    const results = searchYouTube('empty query');
    expect(results).toEqual([]);
  });

  it('should skip invalid JSON lines and still return valid ones', () => {
    const mockOutput = [
      'invalid json here',
      JSON.stringify({ id: 'valid_id', title: 'Valid Title' }),
      'another error',
    ].join('\n');

    vi.mocked(execSync).mockReturnValue(mockOutput);
    const results = searchYouTube('mixed query');

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('valid_id');
  });

  it('should return empty array and catch error when execSync throws', () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('Command failed');
    });

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const results = searchYouTube('error query');

    expect(results).toEqual([]);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[youtubeSearch] yt-dlp search failed:',
      'Command failed'
    );

    consoleWarnSpy.mockRestore();
  });

  it('should escape double quotes in the query safely', () => {
    vi.mocked(execSync).mockReturnValue('');
    searchYouTube('query with "quotes"');

    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('ytsearch10:query with \\"quotes\\"'),
      expect.any(Object)
    );
  });
});
