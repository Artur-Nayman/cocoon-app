export function extractYtId(input) {
  if (!input) return '';
  const trimmed = input.trim();
  // Already just an ID (11 chars, alphanumeric + underscore/dash)
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  // Full URL patterns
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : trimmed;
}
