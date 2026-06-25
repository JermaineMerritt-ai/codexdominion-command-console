import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCommand } from "../lib/command/intents";
import {
  detectLanguage,
  localizeIntentLabel,
  t,
  coerceLocale,
  translationCoverage,
  LOCALIZED_COMMANDS,
} from "../lib/i18n";

// ── Language detection ───────────────────────────────────────

test("detects Spanish, French, and English", () => {
  assert.equal(detectLanguage("Muéstrame las decisiones de alto riesgo"), "es");
  assert.equal(detectLanguage("Montre-moi les décisions à haut risque"), "fr");
  assert.equal(detectLanguage("Show high-risk decisions"), "en");
});

// ── Multilingual intent mapping (governance unchanged) ───────

test("Spanish and French prompts resolve to the SAME canonical intent", () => {
  const en = parseCommand("Show high-risk decisions");
  const es = parseCommand("Muéstrame las decisiones de alto riesgo");
  const fr = parseCommand("Montre-moi les décisions à haut risque");
  assert.equal(en.intent, "show_high_risk_decisions");
  assert.equal(es.intent, "show_high_risk_decisions");
  assert.equal(fr.intent, "show_high_risk_decisions");
  // language is recorded for audit metadata
  assert.equal(es.language, "es");
  assert.equal(fr.language, "fr");
  assert.equal(en.language, "en");
});

test("permission is identical regardless of input language", () => {
  const en = parseCommand("Generate evidence pack for denied decisions");
  const es = parseCommand("Generar paquete de evidencia para decisiones denegadas");
  assert.equal(en.permission, "generate_evidence_pack");
  assert.equal(es.permission, "generate_evidence_pack");
});

test("every localized command chip maps to a supported intent", () => {
  for (const loc of ["es", "fr"] as const) {
    for (const prompt of LOCALIZED_COMMANDS[loc]) {
      assert.notEqual(parseCommand(prompt).intent, "unsupported", `${loc}: ${prompt}`);
    }
  }
});

// ── Localized responses ──────────────────────────────────────

test("intent labels localize, with English fallback", () => {
  assert.equal(
    localizeIntentLabel("show_high_risk_decisions", "High-risk decisions", "es"),
    "Decisiones de alto riesgo",
  );
  assert.equal(
    localizeIntentLabel("show_high_risk_decisions", "High-risk decisions", "fr"),
    "Décisions à haut risque",
  );
  // intent without a translation → provided fallback
  assert.equal(
    localizeIntentLabel("show_audit_events", "Show audit events", "es"),
    "Show audit events",
  );
});

test("UI strings translate and fall back to the key", () => {
  assert.equal(t("next_step", "fr"), "Prochaine étape");
  assert.equal(t("recommended_actions", "es"), "Acciones recomendadas");
  assert.equal(t("nonexistent_key", "es"), "nonexistent_key");
});

// ── Fallback / unsupported ───────────────────────────────────

test("unsupported language codes fall back to English", () => {
  assert.equal(coerceLocale("de"), "en");
  assert.equal(coerceLocale(undefined), "en");
  assert.equal(coerceLocale("es"), "es");
});

test("translation coverage is reported", () => {
  const c = translationCoverage();
  assert.ok(c > 0 && c <= 100);
});
