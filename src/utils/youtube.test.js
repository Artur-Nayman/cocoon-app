import { describe, it, expect } from 'vitest';
import { extractYtId } from './youtube.js';

describe('extractYtId', () => {
  describe('Falsy and empty inputs', () => {
    it('returns empty string for null', () => {
      expect(extractYtId(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(extractYtId(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(extractYtId('')).toBe('');
    });

    it('returns empty string for whitespace-only string', () => {
      expect(extractYtId('   ')).toBe('');
    });
  });

  describe('Valid 11-character IDs', () => {
    it('returns the exact ID if exactly 11 valid characters', () => {
      expect(extractYtId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('returns the exact ID ignoring leading/trailing spaces', () => {
      expect(extractYtId('  dQw4w9WgXcQ  ')).toBe('dQw4w9WgXcQ');
    });

    it('allows underscores and hyphens in ID', () => {
      expect(extractYtId('A_B-C123456')).toBe('A_B-C123456');
    });
  });

  describe('Full YouTube URLs', () => {
    it('extracts ID from standard watch URL', () => {
      expect(extractYtId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts ID from embed URL', () => {
      expect(extractYtId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts ID from v/ URL', () => {
      expect(extractYtId('https://www.youtube.com/v/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts ID from shorts URL', () => {
      expect(extractYtId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts ID from youtu.be short URL', () => {
      expect(extractYtId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts ID from URL with additional query parameters', () => {
      expect(extractYtId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=youtu.be&t=10s')).toBe('dQw4w9WgXcQ');
    });

    it('extracts ID ignoring leading/trailing whitespace in URL', () => {
      expect(extractYtId('   https://youtu.be/dQw4w9WgXcQ   ')).toBe('dQw4w9WgXcQ');
    });
  });

  describe('Invalid inputs and URLs', () => {
    it('returns trimmed input if not 11 chars and not a known URL pattern', () => {
      expect(extractYtId('not-a-valid-id')).toBe('not-a-valid-id');
    });

    it('returns trimmed input if URL pattern matches but ID is wrong length', () => {
      // 10 chars instead of 11
      expect(extractYtId('https://youtu.be/dQw4w9WgXc')).toBe('https://youtu.be/dQw4w9WgXc');
    });
  });
});
