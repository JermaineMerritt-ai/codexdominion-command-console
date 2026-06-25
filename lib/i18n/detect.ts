import type { Locale } from "./locales";

// Lightweight, deterministic language detection (no external API). Uses
// language-distinctive markers (not stems that overlap with English) and falls
// back to English on a tie or no signal.
const MARKERS: Record<Exclude<Locale, "en">, RegExp[]> = {
  es: [
    /\b(mu[eé]strame|mostrar|muestra|decisiones|riesgos?|proveedores|evidencia|aprobaci[oó]n|aprobaciones|pendientes|m[oó]dulos|conocimiento|oportunidades|generar|denegad|rechazad|explica|certificaci|postura|pagos|sistema|organizaci[oó]n)\b/i,
    /[ñ¿¡]/,
  ],
  fr: [
    /\b(montre|moi|fournisseurs|preuves|approbations|attente|prochaine|pourquoi|afficher|examiner|connaissance|paiements|gouvernance|syst[eè]me)\b/i,
    /(décisions|générer|opportunités|élev)/,
    /\b(à|les|des|du)\b/,
  ],
};

export function detectLanguage(text: string): Locale {
  let best: Locale = "en";
  let bestScore = 0;
  (Object.keys(MARKERS) as Exclude<Locale, "en">[]).forEach((loc) => {
    const score = MARKERS[loc].reduce((a, re) => a + (re.test(text) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = loc;
    }
  });
  return best;
}
