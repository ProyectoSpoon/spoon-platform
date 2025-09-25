// Herramientas de diagnóstico de red y Supabase
import { supabase } from '../lib/supabase';

export interface ConnectivityReport {
  timestamp: string;
  supabaseUrl: string | undefined;
  anonKeyPresent: boolean;
  dnsResolved?: boolean;
  authHealth?: { ok: boolean; status?: number; error?: string; latencyMs?: number };
  restProbe?: { ok: boolean; status?: number; error?: string; latencyMs?: number };
  timeSkewSeconds?: number;
}

async function timedFetch(url: string, options?: RequestInit) {
  const start = Date.now();
  try {
    const res = await fetch(url, options);
    const latencyMs = Date.now() - start;
    return { res, latencyMs };
  } catch (e: any) {
    const latencyMs = Date.now() - start;
    return { error: e?.message || String(e), latencyMs };
  }
}

export async function diagnoseSupabaseConnectivity(): Promise<ConnectivityReport> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const report: ConnectivityReport = {
    timestamp: new Date().toISOString(),
    supabaseUrl,
    anonKeyPresent: !!(anonKey && anonKey !== 'REEMPLAZA_CON_TU_ANON_KEY')
  };

  if (!supabaseUrl) return report;

  // Auth health endpoint
  const authHealthUrl = `${supabaseUrl}/auth/v1/health`;
  const authProbe = await timedFetch(authHealthUrl);
  if (authProbe.res) {
    report.authHealth = { ok: authProbe.res.ok, status: authProbe.res.status, latencyMs: authProbe.latencyMs };
  } else {
    report.authHealth = { ok: false, error: authProbe.error, latencyMs: authProbe.latencyMs };
  }

  // REST probe (expected 404 or 401 but reachable)
  const restUrl = `${supabaseUrl}/rest/v1/`; // intentionally root
  const restProbe = await timedFetch(restUrl, { headers: { Accept: 'application/json' } });
  if (restProbe.res) {
    report.restProbe = { ok: restProbe.res.ok, status: restProbe.res.status, latencyMs: restProbe.latencyMs };
  } else {
    report.restProbe = { ok: false, error: restProbe.error, latencyMs: restProbe.latencyMs };
  }

  // Time skew (approx) vs server date header (if present)
  try {
    if (restProbe.res) {
      const serverDate = restProbe.res.headers.get('date');
      if (serverDate) {
        const serverMs = Date.parse(serverDate);
        if (!Number.isNaN(serverMs)) {
          report.timeSkewSeconds = Math.round((Date.now() - serverMs) / 1000);
        }
      }
    }
  } catch {}

  return report;
}

// Helper para log rápido (puede llamarse temporalmente desde alguna pantalla)
export async function logConnectivity() {
  try {
    const r = await diagnoseSupabaseConnectivity();
    console.log('[Diagnostics] Supabase', JSON.stringify(r, null, 2));
  } catch (e) {
    console.log('[Diagnostics] Error', e);
  }
}
