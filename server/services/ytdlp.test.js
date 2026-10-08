import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractAudioUrl } from './ytdlp.js';
import * as childProcess from 'child_process';

vi.mock('child_process');

describe('extractAudioUrl', () => {
  const mockYoutubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const mockAudioUrl = 'https://example.com/audio.m3u8';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.YT_DLP_JS;
  });

  it('should successfully extract audio url on the first strategy', () => {
    vi.mocked(childProcess.execSync).mockReturnValueOnce(mockAudioUrl + '\n');

    const result = extractAudioUrl(mockYoutubeUrl);

    expect(result).toBe(mockAudioUrl);
    expect(childProcess.execSync).toHaveBeenCalledTimes(1);
    const cmd = childProcess.execSync.mock.calls[0][0];
    expect(cmd).toContain('--format "bestaudio[protocol!=http_dash_segments]" --get-url');
  });

  it('should fallback to subsequent strategies if earlier ones fail', () => {
    // Strategy 1 throws error
    vi.mocked(childProcess.execSync).mockImplementationOnce(() => {
      throw new Error('Command failed');
    });
    // Strategy 2 returns successful url
    vi.mocked(childProcess.execSync).mockReturnValueOnce(mockAudioUrl + '\n');

    const result = extractAudioUrl(mockYoutubeUrl);

    expect(result).toBe(mockAudioUrl);
    expect(childProcess.execSync).toHaveBeenCalledTimes(2);

    const cmd1 = childProcess.execSync.mock.calls[0][0];
    expect(cmd1).toContain('--format "bestaudio[protocol!=http_dash_segments]" --get-url');

    const cmd2 = childProcess.execSync.mock.calls[1][0];
    expect(cmd2).toContain('--format "bestaudio" --get-url');
  });

  it('should fallback if a strategy returns invalid non-http url', () => {
    // Strategy 1 returns non-http
    vi.mocked(childProcess.execSync).mockReturnValueOnce('invalid-url\n');
    // Strategy 2 returns successful url
    vi.mocked(childProcess.execSync).mockReturnValueOnce(mockAudioUrl + '\n');

    const result = extractAudioUrl(mockYoutubeUrl);

    expect(result).toBe(mockAudioUrl);
    expect(childProcess.execSync).toHaveBeenCalledTimes(2);
  });

  it('should return null when all strategies fail', () => {
    vi.mocked(childProcess.execSync).mockImplementation(() => {
      throw new Error('Command failed');
    });

    const result = extractAudioUrl(mockYoutubeUrl);

    expect(result).toBeNull();
    expect(childProcess.execSync).toHaveBeenCalledTimes(4); // There are 4 strategies in the code
  });

  it('should use process.env.YT_DLP_JS in the command when provided', () => {
    process.env.YT_DLP_JS = '--js-runtimes bun';
    vi.mocked(childProcess.execSync).mockReturnValueOnce(mockAudioUrl + '\n');

    const result = extractAudioUrl(mockYoutubeUrl);

    expect(result).toBe(mockAudioUrl);
    expect(childProcess.execSync).toHaveBeenCalledTimes(1);

    const cmd = childProcess.execSync.mock.calls[0][0];
    expect(cmd).toContain('--js-runtimes bun');
  });
});
