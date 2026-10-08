import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchYouTube } from './youtubeSearch.js';
import { execSync } from 'child_process';

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

describe('searchYouTube', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should ignore JSON parse errors in individual lines', () => {
    // Mock execSync to return a mix of valid and invalid JSON
    execSync.mockReturnValue(`{"id": "valid1", "title": "First Valid"}
INVALID_JSON
{"id": "valid2", "title": "Second Valid"}`);

    const results = searchYouTube('test query', 2);

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('valid1');
    expect(results[1].id).toBe('valid2');
  });

  it('should return an empty array if output is empty', () => {
    execSync.mockReturnValue('');

    const results = searchYouTube('empty output query');

    expect(results).toHaveLength(0);
    expect(results).toEqual([]);
  });

  it('should handle execSync throwing an error', () => {
    // Mock execSync to throw an error
    execSync.mockImplementation(() => {
      throw new Error('Command failed');
    });

    // Suppress console.warn for this test to keep output clean
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const results = searchYouTube('error query');

    expect(results).toHaveLength(0);
    expect(results).toEqual([]);

    expect(consoleSpy).toHaveBeenCalledWith('[youtubeSearch] yt-dlp search failed:', 'Command failed');

    consoleSpy.mockRestore();
  });
});
