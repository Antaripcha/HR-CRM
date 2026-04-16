// Unit tests for leave business logic (no DB required)
describe('Leave date validation logic', () => {
  const validateDates = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) return { valid: false, error: 'End date must be after start date' };
    const days = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return { valid: true, days };
  };

  it('returns error when end is before start', () => {
    const result = validateDates('2024-10-10', '2024-10-05');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/end date/i);
  });

  it('calculates correct days for single day leave', () => {
    const result = validateDates('2024-10-10', '2024-10-10');
    expect(result.valid).toBe(true);
    expect(result.days).toBe(1);
  });

  it('calculates correct days for multi-day leave', () => {
    const result = validateDates('2024-10-01', '2024-10-05');
    expect(result.valid).toBe(true);
    expect(result.days).toBe(5);
  });

  it('handles month boundaries', () => {
    const result = validateDates('2024-09-28', '2024-10-02');
    expect(result.valid).toBe(true);
    expect(result.days).toBe(5);
  });
});

describe('Employee ID generation logic', () => {
  const generateId = (count) => `EMP${String(count + 1).padStart(4, '0')}`;

  it('generates EMP0001 for first employee', () => {
    expect(generateId(0)).toBe('EMP0001');
  });
  it('generates EMP0010 for 10th employee', () => {
    expect(generateId(9)).toBe('EMP0010');
  });
  it('generates EMP0100 for 100th employee', () => {
    expect(generateId(99)).toBe('EMP0100');
  });
  it('generates EMP1000 for 1000th employee', () => {
    expect(generateId(999)).toBe('EMP1000');
  });
});
