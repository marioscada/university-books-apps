/**
 * Helper di formattazione per la pagina Collezioni (puri, testabili).
 */

/** Tempo relativo leggibile da una data ISO (oggi / ieri / N giorni·settimane·mesi fa). */
export function relTime(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const d = Math.floor(s / 86400);
  if (s < 86400) return 'oggi';
  if (d === 1) return 'ieri';
  if (d < 7) return `${d} giorni fa`;
  if (d < 30) {
    const w = Math.floor(d / 7);
    return `${w} ${w === 1 ? 'settimana' : 'settimane'} fa`;
  }
  const mo = Math.floor(d / 30);
  return `${mo} ${mo === 1 ? 'mese' : 'mesi'} fa`;
}

/** Dimensione file leggibile (— se 0). */
export function humanSize(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}
