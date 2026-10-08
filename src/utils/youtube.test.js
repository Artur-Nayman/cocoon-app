import { describe, it, expect } from 'vitest';
import { extractYtId } from './youtube.js';

describe('extractYtId', () => {
  it('should return empty string for falsy inputs', () => {
    expect(extractYtId('')).toBe('');
    expect(extractYtId(null)).toBe('');
    expect(extractYtId(undefined)).toBe('');
  });

  it('should extract ID from valid 11-character inputs', () => {
    expect(extractYtId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYtId('aBcDeFgHiJk')).toBe('aBcDeFgHiJk');
    expect(extractYtId('1234567890_')).toBe('1234567890_');
    expect(extractYtId('---___aBcDe')).toBe('---___aBcDe');
  });

  it('should handle whitespace padding', () => {
    expect(extractYtId('  dQw4w9WgXcQ  ')).toBe('dQw4w9WgXcQ');
  });

  it('should extract ID from standard youtube.com/watch URLs', () => {
    expect(extractYtId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYtId('http://youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYtId('youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYtId('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should extract ID from short youtu.be URLs', () => {
    expect(extractYtId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYtId('http://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYtId('youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should extract ID from embed URLs', () => {
    expect(extractYtId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYtId('youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should extract ID from /v/ URLs', () => {
    expect(extractYtId('https://www.youtube.com/v/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should extract ID from shorts URLs', () => {
    expect(extractYtId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should handle URLs with extra query parameters', () => {
    expect(extractYtId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s')).toBe('dQw4w9WgXcQ');
    expect(extractYtId('https://youtu.be/dQw4w9WgXcQ?t=42s')).toBe('dQw4w9WgXcQ');
  });

  it('should return trimmed input if no valid pattern matches', () => {
    expect(extractYtId('not-a-valid-id-or-url')).toBe('not-a-valid-id-or-url');
    expect(extractYtId('https://example.com/dQw4w9WgXcQ')).toBe('https://example.com/dQw4w9WgXcQ');
  });
});
