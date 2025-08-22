import { parseCurrencyToCents, formatCurrencyCOP } from '../../lib/utils';

describe('currency utils', () => {
  test('parseCurrencyToCents parses locale-like strings to cents', () => {
    expect(parseCurrencyToCents('1.550.000')).toBe(155000000);
    expect(parseCurrencyToCents("1´550.000")).toBe(155000000);
    expect(parseCurrencyToCents('$ 1.550.000')).toBe(155000000);
    expect(parseCurrencyToCents('')).toBe(0);
  });

  test('formatCurrencyCOP formats centavos to COP without decimals', () => {
    expect(formatCurrencyCOP(155000000)).toMatch(/1\.?550\.?000/);
  });
});
