// utils/businessHours.ts
// Normalización y utilidades de horarios de restaurantes

export interface NormalizedShift { start: string; end: string }
export interface NormalizedDay {
  key: string;
  label: string;
  shifts: NormalizedShift[];
  closed: boolean;
  isToday: boolean;
}

const DAY_DEFS: { key:string; label:string; aliases:string[] }[] = [
  { key:'monday',    label:'Lun', aliases:['monday','lunes','mon','lun'] },
  { key:'tuesday',   label:'Mar', aliases:['tuesday','martes','tue','mar'] },
  { key:'wednesday', label:'Mié', aliases:['wednesday','miercoles','miércoles','wed','mie','mié'] },
  { key:'thursday',  label:'Jue', aliases:['thursday','jueves','thu','jue'] },
  { key:'friday',    label:'Vie', aliases:['friday','viernes','fri','vie'] },
  { key:'saturday',  label:'Sáb', aliases:['saturday','sabado','sábado','sat','sab','sáb'] },
  { key:'sunday',    label:'Dom', aliases:['sunday','domingo','sun','dom'] }
];

function getTodayLocaleKey(): string {
  return new Date().toLocaleDateString('es-CO', { weekday: 'long' }).toLowerCase();
}

export function normalizeBusinessHours(raw: any): NormalizedDay[] {
  if (!raw || typeof raw !== 'object') return [];
  const todayKey = getTodayLocaleKey();
  const result: NormalizedDay[] = [];
  for (const def of DAY_DEFS) {
    let source: any = null;
    for (const a of def.aliases) {
      if (raw[a]) { source = raw[a]; break; }
    }
    let shifts: NormalizedShift[] = [];
    if (source) {
      if (Array.isArray(source.turnos)) {
        shifts = source.turnos.filter(Boolean).map((t: any) => ({
          start: t.horaApertura || t.open || '',
          end: t.horaCierre || t.close || ''
        })).filter(s => s.start && s.end);
      } else if (source.open && source.close) {
        shifts = [{ start: source.open, end: source.close }];
      } else if (Array.isArray(source)) {
        shifts = source.map((t: any) => ({
          start: t.horaApertura || t.open || '',
          end: t.horaCierre || t.close || ''
        })).filter(s => s.start && s.end);
      }
    }
    const closed = shifts.length === 0;
    result.push({ key: def.key, label: def.label, shifts, closed, isToday: def.aliases.includes(todayKey) });
  }
  return result;
}

export function isOpenNow(normalized: NormalizedDay[]): boolean | null {
  if (!normalized.length) return null;
  const now = new Date();
  const minutes = now.getHours()*60 + now.getMinutes();
  const today = normalized.find(d => d.isToday);
  if (!today || today.closed) return false;
  return today.shifts.some(s => {
    const [oh, om] = s.start.split(':').map(Number);
    const [ch, cm] = s.end.split(':').map(Number);
    if (isNaN(oh) || isNaN(ch)) return false;
    const oM = oh*60 + om;
    const cM = ch*60 + cm;
    return minutes >= oM && minutes <= cM;
  });
}

export function formatTodayHours(normalized: NormalizedDay[]): string {
  const today = normalized.find(d => d.isToday);
  if (!today || today.closed) return 'Sin horario';
  return today.shifts.map(s => `${s.start} - ${s.end}`).join(' / ');
}

export function compactWeeklySummary(normalized: NormalizedDay[]): string[] {
  // Devuelve arreglo de strings "Lun: 09-18 / 19-22" etc.
  return normalized.map(d => {
    if (d.closed) return `${d.label}: -`;
    return `${d.label}: ${d.shifts.map(s => `${s.start}-${s.end}`).join(' / ')}`;
  });
}
