import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractAudioUrl } from './ytdlp.js';
import * as childProcess from 'child_process';

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

describe('ytdlp service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractAudioUrl', () => {
    it('returns url from the first successful strategy', () => {
      childProcess.execSync.mockReturnValue('https://example.com/audio.mp3\n');

      const url = extractAudioUrl('https://youtube.com/watch?v=123');

      expect(url).toBe('https://example.com/audio.mp3');
      expect(childProcess.execSync).toHaveBeenCalledTimes(1);
    });

    it('falls back to next strategy if execSync throws', () => {
      childProcess.execSync
        .mockImplementationOnce(() => { throw new Error('Command failed'); })
        .mockReturnValueOnce('https://example.com/audio2.mp3\n');

      const url = extractAudioUrl('https://youtube.com/watch?v=456');

      expect(url).toBe('https://example.com/audio2.mp3');
      expect(childProcess.execSync).toHaveBeenCalledTimes(2);
    });

    it('falls back if url does not start with http', () => {
      childProcess.execSync
        .mockReturnValueOnce('not-a-url\n')
        .mockReturnValueOnce('https://example.com/audio3.mp3\n');

      const url = extractAudioUrl('https://youtube.com/watch?v=789');

      expect(url).toBe('https://example.com/audio3.mp3');
      expect(childProcess.execSync).toHaveBeenCalledTimes(2);
    });

    it('returns null if all strategies fail', () => {
      childProcess.execSync.mockImplementation(() => { throw new Error('Command failed'); });

      const url = extractAudioUrl('https://youtube.com/watch?v=abc');

      expect(url).toBeNull();
      expect(childProcess.execSync).toHaveBeenCalledTimes(4);
    });
  });
});
