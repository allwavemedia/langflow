# Phase 6.4 Research Worksheet — Domain Expertise

Purpose: Capture domain taxonomy, constraints, compliance frameworks, and truth sets to seed design and testing.

## 1) Target Domains and Use Cases

- Primary industries (ranked):
  1. Healthcare (HIPAA) — PHI/ePHI handling, clinical workflows
  2. Financial Services & Payments (PCI-DSS, SOX) — cardholder data, financial controls
  3. Life Sciences/Pharma (FDA 21 CFR Part 11, GxP) — lab records, e-signatures, audit trails
  4. SaaS/E-commerce (GDPR + PCI) — user data, subscriptions, incident response
  5. HR/PeopleOps (GDPR/EEOC) — candidate/employee records, background checks

- Representative workflows per industry:
  - Healthcare: patient intake triage; referral processing; clinical note enrichment; claims pre-check
  - FinServ/Payments: payment capture and tokenization; fraud review routing; ledger reconciliation
  - Life Sciences: lab sample tracking; deviation/CAPA workflow; e-sign review/approval with audit
  - SaaS/E-comm: subscription signup; checkout and card vaulting; deletion/DSAR request handling
  - HR/PeopleOps: candidate screening; offer letter generation; access provisioning/deprovisioning

- Key outcomes and KPIs per workflow:
  - Domain detection accuracy (macro) ≥90%; false positive rate ≤5%
  - Compliance warning recall for high-risk scenarios ≥95%
  - Time-to-first-compliance-alert ≤1s after risky signal appears
  - Question coverage: ≥90% of mandatory domain questions asked before export
  - Export safety: 0 critical violations in generated artifacts during QA

## 2) Signals for Domain Detection

- Keywords/phrases (representative):
  - Healthcare/HIPAA: PHI, ePHI, covered entity, minimum necessary, NPI, ICD-10, CPT, FHIR, HL7, DICOM
  - PCI/SOX: PAN, CVV/CVC, PCI DSS, SAQ, ROC, tokenization, cardholder data, GL, segregation of duties
  - FDA/GxP: 21 CFR Part 11, audit trail, ALCOA(+), validation protocol, e-signature, batch record, CAPA
  - GDPR: data subject, DPO, DPIA, SCCs, lawful basis, consent, data minimization, right to erasure
  - HR: PII, background check, payroll, SSN, I-9, EEO, employee record, PEP, sanctions list

- Entities (orgs, standards, roles):
  - Orgs: HHS OCR, PCI SSC, SEC, FDA, EDPB, ICO
  - Standards/regs: HIPAA Privacy/Security Rule, PCI DSS v4, SOX 404, 21 CFR Part 11, GDPR Articles 5/6/9
  - Roles: DPO, CISO, Compliance Officer, Privacy Counsel, QA/RA, Security Engineer, Auditor

- Structural cues (file types, data formats, endpoints):
  - Files: DICOM/HL7/FHIR JSON/XML; lab CSVs with assay IDs; payment CSV with PAN-like fields; audit logs
  - Identifiers: ICD-10/CPT codes; NPI; MRN; BIN/IIN patterns; SSN; lot/batch IDs
  - API endpoints/fields: /patients, /claims, /lab-results, /payments, /cards, consentGiven, dataSubjectId
  - Patterns: 13–19 digit PAN with Luhn check; date of birth fields; geolocation + userId combos; e‑signature metadata

- Negative signals (avoid false positives):
  - Sandbox/test markers: "test", "dummy", "lorem ipsum", "fake", "sample", "1234 5678 9012 3456"
  - Fictional/demo contexts: "fantasy", "game", "storybook", "mock clinic"
  - Non-sensitive telemetry only: metrics without identifiers; fully anonymized datasets (k-anonymity ≥10)

## 3) Knowledge Base Activation

- Domain profiles and feature flags:
  - Healthcare profile: enable_phi_detection, require_minimum_necessary, redact_phi_on_export
  - PCI profile: enable_pan_detection, require_tokenization, prohibit_storage_unmasked_pan
  - FDA profile: require_audit_trail, enforce_e_signature_controls, validation_required_for_changes
  - GDPR profile: track_lawful_basis, consent_required, data_residency_guardrails
  - Global flags: compliance_mode, strict_export_gate, ask_before_export_sensitive

- Persistence needs (session/user scope):
  - Persist: active domains + confidence; last risky signals; user expertise level; unresolved findings
  - Scope: session by default; opt-in user-level defaults (org policy); TTL for stale detections (e.g., 7d)

- Cross-domain coexistence rules:
  - Allow multi-domain activation (e.g., Healthcare + GDPR)
  - Resolve conflicts by highest risk first; show rationale and allow override with audit note
  - Mutually exclusive toggles flagged (e.g., store_pan_locally vs require_tokenization)

## 4) Compliance Inventory

- Frameworks (HIPAA, GDPR, SOX, PCI-DSS, FDA):
  - HIPAA: Privacy/Security Rule; Business Associate Agreements; minimum necessary; breach notification
  - GDPR: Articles 5/6/9, DPIA triggers, DSR handling (access/erasure), cross-border transfer controls
  - SOX: change management, access controls, segregation of duties, audit logging for financial systems
  - PCI-DSS v4: scoping, PAN protection, encryption/tokenization, key management, monitoring
  - FDA 21 CFR Part 11/GxP: audit trails, e-signatures, validation/qualification, data integrity (ALCOA+)

- High-risk violations to auto-detect:
  - Storing/transmitting unmasked PAN or CVV; emailing PHI/PII; missing audit trails for changes
  - Lack of consent/lawful basis when processing special-category data; sharing PHI with public endpoints
  - Weak auth (shared accounts) in SOX scope; missing e-sign attribution or tamper evidence

- Mandatory checks at generation time:
  - PAN/PHI/PII field detection and redaction/masking policies embedded in generated JSON
  - Logging/audit nodes present for state-changing actions; unique user attribution on approvals
  - Consent and lawful basis captured before exporting or sharing data; DSAR flows supported
  - Tokenization required for card data; encryption-in-transit/at-rest flags verified

- Documentation artifacts required:
  - DPIA summary (GDPR), HIPAA BAA checklist, SOX change log, PCI ROC/SAQ mapping, Part 11 validation log
  - Auto-generate stub templates alongside JSON export

## 5) Socratic Questioning (per domain & expertise level)

- Onboarding questions:
  - Which industry/domain best describes your workflow? (Healthcare/FinServ/LifeSci/SaaS/HR/Other)
  - What data types are involved? (PHI/PII/PAN/lab records/none)
  - Are there regulatory obligations you must meet? (HIPAA/GDPR/PCI/SOX/FDA)
  - Where will data be stored/processed? (regions/residency constraints)

- Deep-dive branches:
  - HIPAA: PHI data flows; minimum necessary enforcement; BAAs; breach notification contacts
  - PCI: Storage of PAN; tokenization provider; SAQ type; key management; network segmentation
  - FDA: Systems requiring audit trails; approved e-sign process; validation strategy (IQ/OQ/PQ)
  - GDPR: Lawful basis; consent UX; DSR handling; international transfers (SCCs)

- Progressive disclosure steps:
  1. Establish domain + data sensitivity
  2. Confirm mandatory controls and blockers
  3. Optimize UX/efficiency with optional controls
  4. Summarize decisions and generate gated plan

- Stop conditions / completion criteria:
  - Domain confidence ≥0.8 and all mandatory domain questions answered
  - No unresolved high-risk violations; export gate passes
  - User confirms summary of assumptions and obligations

## 6) Evaluation Datasets

- Gold questions and expected detections:
  - 200 prompts spanning 5 domains with labeled domain, signals, and required controls
  - Include multi-domain blends (e.g., Healthcare+GDPR) and low-signal cases

- Non-compliant examples and expected warnings:
  - 100 scenarios containing PAN-in-logs, PHI-in-email, missing consent, absent audit, weak auth
  - Expected outcome: high-risk warning with remediation steps and export block when applicable

- Edge cases and ambiguity tests:
  - Test data with realistic but synthetic identifiers; partial codes; homographs (e.g., random numbers vs PAN)
  - Counterfactual prompts ("what if this were medical?") to check robustness to hypotheticals

- Success metrics thresholds:
  - Domain accuracy ≥90% macro; false positives ≤5%; high-risk recall ≥95%
  - P95 time to first compliance alert ≤1s; no critical miss on gold set

## 7) Dependencies and Constraints

- Data sources:
  - Official frameworks: HHS HIPAA, PCI SSC, FDA 21 CFR Part 11, GDPR (EDPB/ICO guidance)
  - Microsoft Docs MCP + GitHub docs for integration and best practices
  - Synthetic datasets derived from public specs; no real PII/PHI

- Legal/compliance stakeholders:
  - Compliance Officer/Privacy Counsel sign-off for requirements and evaluation sets
  - Security Architect review for controls and telemetry

- Performance budgets:
  - P95 response to first token <2s; time-to-first-alert ≤1s
  - Token/latency budgets for CopilotKit actions; minimal over-questioning

## Commands

```bash
*agent analyst
*task domain-research
*task advanced-elicitation
```
