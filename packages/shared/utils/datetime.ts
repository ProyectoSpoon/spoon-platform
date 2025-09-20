// Shared date-time utilities
// Use America/Bogota timezone consistently for day-based logic

export function getBogotaDateISO(date: Date = new Date()): string {
  // Returns YYYY-MM-DD string in America/Bogota timezone
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(date);
}

// Semantic alias used for business-day logic across the app
export const getBogotaBusinessDayISO = getBogotaDateISO;

export function nowBogotaISO(date: Date = new Date()): string {
  // Returns ISO string but aligned conceptually to Bogota time clock
  // Consumers should avoid relying on timezone offset from this value
  // and prefer getBogotaDateISO for date comparisons.
  const d = new Date(date);
  return d.toISOString();
}

// Formats a timestamp consistently in America/Bogota, regardless of server TZ.
// Accepts Date | number | string (ISO). If the string lacks timezone info,
// we assume it's a local Bogota wall-clock (since America/Bogota has no DST),
// and construct an equivalent UTC instant by adding +5h to preserve the same
// wall time when formatted back in Bogota.
export function formatInBogota(
  ts: string | number | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  },
  locale: string = 'es-CO'
): string {
  let date: Date;

  if (ts instanceof Date) {
    date = ts;
  } else if (typeof ts === 'number') {
    date = new Date(ts);
  } else if (typeof ts === 'string') {
    const hasTZ = /[zZ]|[+-]\d{2}:?\d{2}$/.test(ts);
    if (hasTZ) {
      // Safe to parse directly
      date = new Date(ts);
    } else {
      // Naive timestamp (no tz). Treat as Bogota local wall time.
      // America/Bogota is UTC-5 year-round (no DST), so create a UTC instant
      // adding 5 hours so that formatting in Bogota reproduces the same wall time.
      const m = ts.match(
        /(\d{4})[-/](\d{2})[-/](\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/
      );
      if (m) {
        const [_, Y, M, D, h, mnt, s] = m;
        const year = Number(Y);
        const month = Number(M) - 1;
        const day = Number(D);
        const hour = Number(h) + 5; // shift to UTC
        const minute = Number(mnt);
        const sec = s ? Number(s) : 0;
        const ms = 0;
        date = new Date(Date.UTC(year, month, day, hour, minute, sec, ms));
      } else {
        // Fallback: let JS try to parse, then format in Bogota
        date = new Date(ts);
      }
    }
  } else {
    date = new Date(NaN);
  }

  // Always force Bogota timezone in formatting
  const fmt = new Intl.DateTimeFormat(locale, {
    timeZone: 'America/Bogota',
    ...options,
  });
  return fmt.format(date);
}

export function formatBogotaDate(ts: string | number | Date, locale: string = 'es-CO'): string {
  return formatInBogota(ts, { year: 'numeric', month: '2-digit', day: '2-digit' }, locale);
}

export function formatBogotaTime(ts: string | number | Date, locale: string = 'es-CO'): string {
  return formatInBogota(ts, { hour: '2-digit', minute: '2-digit' }, locale);
}

/**
 * Returns an ISO string (UTC instant) for a Bogota local date (YYYY-MM-DD)
 * at the given wall-clock time (hour:min:sec) in America/Bogota.
 * Example: bogotaDateAtHourISO('2025-09-13', 22) -> '2025-09-14T03:00:00.000Z'
 * (Because 22:00 Bogota equals 03:00 UTC next day)
 */
export function bogotaDateAtHourISO(
  ymd: string,
  hour: number = 0,
  minute: number = 0,
  second: number = 0
): string {
  const h = String(hour).padStart(2, '0');
  const m = String(minute).padStart(2, '0');
  const s = String(second).padStart(2, '0');
  // America/Bogota has fixed UTC-5, no DST
  return new Date(`${ymd}T${h}:${m}:${s}-05:00`).toISOString();
}
