import { describe, it, expect } from 'vitest';

describe('SVG badge username validation', () => {
  const USERNAME_REGEX = /^[a-z0-9_-]+$/;

  it.each([
    ['validuser', true],
    ['user-name', true],
    ['user_name', true],
    ['user123', true],
    ['a', true],
  ])('should accept valid username "%s"', (username, expected) => {
    expect(USERNAME_REGEX.test(username)).toBe(expected);
  });

  it.each([
    ['<script>alert(1)</script>', false],
    ['user"onload=alert(1)', false],
    ["user'><svg onload=alert(1)>", false],
    ['user&amp;', false],
    ['user name', false],  // space
    ['User', false],  // uppercase
    ['user.name', false],  // dot
    ['', false],  // empty
  ])('should reject dangerous/invalid username "%s"', (username, expected) => {
    expect(USERNAME_REGEX.test(username)).toBe(expected);
  });
});

describe('SVG XML sanitization', () => {
  function sanitizeSvgText(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  it('should escape XML special characters', () => {
    expect(sanitizeSvgText('<script>')).toBe('&lt;script&gt;');
    expect(sanitizeSvgText('"onload=alert(1)')).toBe('&quot;onload=alert(1)');
    expect(sanitizeSvgText("'><svg>")).toBe('&#39;&gt;&lt;svg&gt;');
    expect(sanitizeSvgText('a&b')).toBe('a&amp;b');
  });

  it('should not modify safe text', () => {
    expect(sanitizeSvgText('validuser')).toBe('validuser');
    expect(sanitizeSvgText('user-name_123')).toBe('user-name_123');
  });
});
