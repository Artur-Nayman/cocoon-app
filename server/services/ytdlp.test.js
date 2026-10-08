import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractAudioUrl } from './ytdlp.js';
import { execSync } from 'child_process';

vi.mock('child_process', () => {
  return {
    execSync: vi.fn(),
  };
});

describe('extractAudioUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return URL on first successful strategy', () => {
    execSync.mockReturnValue('https://example.com/audio.mp3\n');
    const url = extractAudioUrl('https://youtube.com/watch?v=123');
    expect(url).toBe('https://example.com/audio.mp3');
    expect(execSync).toHaveBeenCalledTimes(1);
  });

  it('should continue to next strategy if execSync throws', () => {
    execSync
      .mockImplementationOnce(() => {
        throw new Error('Command failed');
      })
      .mockImplementationOnce(() => {
        return 'https://example.com/audio2.mp3\n';
      });

    const url = extractAudioUrl('https://youtube.com/watch?v=123');
    expect(url).toBe('https://example.com/audio2.mp3');
    expect(execSync).toHaveBeenCalledTimes(2);
  });

  it('should continue to next strategy if URL does not start with http', () => {
    execSync
      .mockReturnValueOnce('invalid_url\n')
      .mockReturnValueOnce('https://example.com/audio3.mp3\n');

    const url = extractAudioUrl('https://youtube.com/watch?v=123');
    expect(url).toBe('https://example.com/audio3.mp3');
    expect(execSync).toHaveBeenCalledTimes(2);
  });

  it('should return null if all strategies fail', () => {
    execSync.mockImplementation(() => {
      throw new Error('Command failed');
    });

    const url = extractAudioUrl('https://youtube.com/watch?v=123');
    expect(url).toBeNull();
    expect(execSync).toHaveBeenCalledTimes(4); // 4 strategies
  });
});
