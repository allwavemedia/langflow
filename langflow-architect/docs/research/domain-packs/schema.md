# Domain Pack Schema (Data-Only, Hot-Swappable)

Purpose: Define a portable, declarative format to enrich the agent with domain-specific hints, questions, and controls without hard-coding behavior.

Contract (YAML)

- id: string (unique identifier, e.g., "PCI", "HIPAA", "GDPR")
- name: string (display name)
- version: string (SemVer)
- detection_hints:
  - keywords: string[] (representative terms)
  - regex: string[] (optional patterns)
  - entities: string[] (standards, orgs, roles)
- Socratic_questions:
  - required: string[] (must-ask before export)
  - optional: string[] (nice-to-have for UX/efficiency)
- required_controls: array of rules
  - if: string (Boolean expression over captured context, e.g., "stores_pan == true")
  - then: string[] (actions/policies, e.g., ["tokenize_pan", "mask_on_export"]) 
- evaluation:
  - gold: array of cases
    - prompt: string
    - expect: string[] (expected warnings/actions)
- references: string[] (authoritative sources)

Example YAML excerpt

```yaml
id: pci
name: PCI DSS
version: 1.0.0
detection_hints:
  keywords: ["PAN", "tokenization", "PCI DSS", "cardholder data"]
  regex: ["\\b(?:\\d[ -]*?){13,19}\\b"]
socratic_questions:
  required:
    - Do you store primary account numbers (PAN) at rest?
    - Which tokenization provider do you use?
  optional:
    - Do you mask PAN in logs and exports?
required_controls:
  - if: stores_pan == true
    then: ["tokenize_pan", "mask_pan_on_export"]
  - if: transmits_pan == true
    then: ["encryption_in_transit", "restrict_endpoints"]
evaluation:
  gold:
    - prompt: "Log shows 16-digit card, store for later"
      expect: ["warn_high_risk", "require_tokenization"]
references:
  - https://www.pcisecuritystandards.org/
```
