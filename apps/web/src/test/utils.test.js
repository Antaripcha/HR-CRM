import { describe, it, expect } from 'vitest';
import { getInitials, getAvatarColor, capitalise, formatCurrency, debounce } from '../lib/utils';

describe('getInitials', () => {
  it('returns two initials for full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });
  it('returns one initial for single name', () => {
    expect(getInitials('Alice')).toBe('A');
  });
  it('handles empty string', () => {
    expect(getInitials('')).toBe('');
  });
  it('limits to 2 characters', () => {
    expect(getInitials('Alice Bob Charlie')).toBe('AB');
  });
});

describe('capitalise', () => {
  it('capitalises first letter', () => {
    expect(capitalise('hello')).toBe('Hello');
  });
  it('replaces underscores with spaces', () => {
    expect(capitalise('on_leave')).toBe('On leave');
  });
  it('handles empty string', () => {
    expect(capitalise('')).toBe('');
  });
});

describe('getAvatarColor', () => {
  it('returns a CSS class string', () => {
    const color = getAvatarColor('Alice');
    expect(color).toMatch(/^bg-/);
  });
  it('is deterministic for the same name', () => {
    expect(getAvatarColor('Test')).toBe(getAvatarColor('Test'));
  });
});

describe('debounce', () => {
  it('delays function execution', async () => {
    let count = 0;
    const fn = debounce(() => count++, 50);
    fn(); fn(); fn();
    expect(count).toBe(0);
    await new Promise(r => setTimeout(r, 100));
    expect(count).toBe(1);
  });
});
