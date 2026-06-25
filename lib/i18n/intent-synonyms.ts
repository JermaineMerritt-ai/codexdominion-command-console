import type { CommandIntent } from "@/lib/command/intents";

/**
 * Non-English phrasings that resolve to the SAME canonical intent. English
 * patterns live in INTENT_DEFINITIONS; these add Spanish + French coverage.
 * Adding a language is configuration, not code.
 */
export const INTENT_SYNONYMS: Partial<Record<CommandIntent, RegExp[]>> = {
  show_high_risk_decisions: [
    /decisiones de alto riesgo/i,
    /d[eé]cisions [aà] haut risque/i,
  ],
  show_pending_approvals: [
    /aprobaciones pendientes/i,
    /approbations en attente/i,
  ],
  generate_evidence_for_denied: [
    /(generar|crear).*paquete de evidencia.*(denegad|rechazad)/i,
    /paquete de evidencia.*(denegad|rechazad)/i,
    /(g[eé]n[eé]rer|cr[eé]er).*dossier de preuves.*(refus|rejet)/i,
    /dossier de preuves.*(refus|rejet)/i,
  ],
  show_expiring_vendors: [
    /proveedores.*(vencen|caducan|expir|certificaci)/i,
    /fournisseurs.*(expir|certificat)/i,
  ],
  show_high_match_opportunities: [
    /oportunidades.*(alto|puntuaci|coincidencia)/i,
    /opportunit[eé]s.*(correspondance|score|[eé]lev)/i,
  ],
  review_system_risk_posture: [
    /postura de riesgo/i,
    /posture de risque/i,
  ],
  recommend_next_governance_action: [
    /recomienda.*(acci[oó]n|gobernanza)/i,
    /recommande.*(action|gouvernance)/i,
  ],
  show_active_modules: [/m[oó]dulos activos/i, /modules actifs/i],
  show_highest_risk_module: [
    /m[oó]dulo.*(mayor|m[aá]s alto).*riesgo/i,
    /module.*(plus.*risqu|risque.*[eé]lev)/i,
  ],
  show_payment_approval_risks: [
    /riesgos?.*(pago|autorizaci[oó]n)/i,
    /risques?.*(paiement|approbation)/i,
  ],
  show_organization_knowledge: [
    /(grafo|gr[aá]fico).*conocimiento/i,
    /(graphe|connaissance).*organis/i,
    /qu[eé] sabe/i,
    /que sait/i,
  ],
  explain_decision: [
    /explica.*(por qu[eé]|decisi[oó]n)/i,
    /explique.*(pourquoi|d[eé]cision)/i,
  ],
};
