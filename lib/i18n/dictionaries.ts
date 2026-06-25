import type { CommandIntent } from "@/lib/command/intents";
import type { Locale } from "./locales";

/** Localized result headings (canonical intent → label per locale). */
export const INTENT_LABELS: Partial<
  Record<CommandIntent, Record<Locale, string>>
> = {
  show_high_risk_decisions: {
    en: "High-risk decisions",
    es: "Decisiones de alto riesgo",
    fr: "Décisions à haut risque",
  },
  show_pending_approvals: {
    en: "Pending approvals",
    es: "Aprobaciones pendientes",
    fr: "Approbations en attente",
  },
  generate_evidence_for_denied: {
    en: "Evidence pack (denied decisions)",
    es: "Paquete de evidencia (decisiones denegadas)",
    fr: "Dossier de preuves (décisions refusées)",
  },
  show_expiring_vendors: {
    en: "Expiring vendors",
    es: "Proveedores con certificaciones por vencer",
    fr: "Fournisseurs à certification expirante",
  },
  show_high_match_opportunities: {
    en: "High-match opportunities",
    es: "Oportunidades de alta coincidencia",
    fr: "Opportunités à forte correspondance",
  },
  review_system_risk_posture: {
    en: "System risk posture",
    es: "Postura de riesgo del sistema",
    fr: "Posture de risque du système",
  },
  recommend_next_governance_action: {
    en: "Recommended next action",
    es: "Próxima acción recomendada",
    fr: "Prochaine action recommandée",
  },
  show_active_modules: {
    en: "Active modules",
    es: "Módulos activos",
    fr: "Modules actifs",
  },
  show_highest_risk_module: {
    en: "Highest-risk module",
    es: "Módulo de mayor riesgo",
    fr: "Module à plus haut risque",
  },
  show_payment_approval_risks: {
    en: "Payment approval risks",
    es: "Riesgos de aprobación de pagos",
    fr: "Risques d'approbation des paiements",
  },
  show_organization_knowledge: {
    en: "Organization knowledge",
    es: "Conocimiento de la organización",
    fr: "Connaissance de l'organisation",
  },
  explain_decision: {
    en: "Explain decision",
    es: "Explicar decisión",
    fr: "Expliquer la décision",
  },
};

/** General UI strings used in the Command Workspace. */
export const UI_STRINGS: Record<string, Record<Locale, string>> = {
  suggested_commands: {
    en: "Suggested commands",
    es: "Comandos sugeridos",
    fr: "Commandes suggérées",
  },
  execution_plans: {
    en: "Execution plans",
    es: "Planes de ejecución",
    fr: "Plans d'exécution",
  },
  recommended_actions: {
    en: "Recommended actions",
    es: "Acciones recomendadas",
    fr: "Actions recommandées",
  },
  next_step: { en: "Next step", es: "Próximo paso", fr: "Prochaine étape" },
  data_source: {
    en: "Data source",
    es: "Fuente de datos",
    fr: "Source de données",
  },
  acting_as: { en: "Acting as", es: "Actuando como", fr: "Agissant en tant que" },
};

/** Localized versions of the curated command chips. */
export const LOCALIZED_COMMANDS: Record<Locale, string[]> = {
  en: [
    "Show high-risk decisions",
    "Show pending approvals",
    "Review system risk posture",
    "Show vendors with expiring certifications",
    "Show active modules",
    "Show payment approval risks",
    "Show organization knowledge graph",
  ],
  es: [
    "Muéstrame las decisiones de alto riesgo",
    "Muéstrame las aprobaciones pendientes",
    "Revisar la postura de riesgo del sistema",
    "Mostrar proveedores con certificaciones por vencer",
    "Mostrar módulos activos",
    "Mostrar riesgos de aprobación de pagos",
    "Mostrar el grafo de conocimiento de la organización",
  ],
  fr: [
    "Montre-moi les décisions à haut risque",
    "Montre-moi les approbations en attente",
    "Examiner la posture de risque du système",
    "Afficher les fournisseurs à certification expirante",
    "Afficher les modules actifs",
    "Afficher les risques d'approbation des paiements",
    "Afficher le graphe de connaissance de l'organisation",
  ],
};
