# Brownfield Execution Plan — Code Quality Hardening

## Objectives

- Reduce ESLint warnings to zero and keep them at zero
- Maintain strict TypeScript type safety
- Lower cognitive complexity and eliminate dead code
- Protect performance via lightweight checks and guardrails

## Scope and Outcomes

- Affects Langflow Architect codebase only (no behavior change expected)
- Targets: unused variables/imports, explicit any, complex functions, formatting
- Outcomes: cleaner diffs, safer refactors, faster reviews, consistent CI signal

## Milestones

- M1 Baseline captured and issues triaged
- M2 Autofix applied (format + lint fix)
- M3 Manual remediation complete (types + complexity)
- M4 Strict checks verified (typecheck + lint in CI)
- M5 CI quality gates enforced

## Execution Steps

1) Baseline and Tracking

- Capture current ESLint warnings (machine-readable report)
- Run TypeScript type check with no emit
- Identify hotspots (files with most warnings and highest complexity)

```bash
# ESLint baseline (JSON report)
npx eslint . -f json -o .reports/eslint-baseline.json

# TypeScript typecheck
npx tsc --noEmit
```

1) Autofix Pass

- Apply formatters and lint auto-fix where safe
- Remove unused imports/variables, consistent import order

```bash
# Prettier + ESLint autofix
npx prettier "**/*.{ts,tsx,md,css}" --write
npx eslint . --fix
```

1) Manual Remediation

- Replace explicit any with typed alternatives or generics
- Split overly long/complex functions; extract helpers
- Add narrow types to API responses and props
- Remove dead code and disabled blocks

1) Strictness and Guardrails

- Verify tsconfig strict flags remain enabled (noImplicitAny, strictNullChecks, etc.)
- Add lint rules to prevent regression (no-explicit-any, no-unused-vars as error)
- Add simple performance guard (avoid synchronous heavy ops in render)

1) CI Quality Gates

- Fail build on any ESLint warning or TypeScript error
- Persist ESLint JSON artifact for trend tracking
- Add minimal PR checks: lint, typecheck, and unit tests

```bash
# Typical CI steps
npx eslint . -f stylish
npx tsc --noEmit
npm test -- --reporter=dot
```

## Success Metrics

- ESLint warnings: 0
- Type errors: 0
- Complexity: reduced for top 10 offenders
- Build time: no regression (>5% increase triggers follow-up)

## Risks and Mitigations

- Large diffs from autofix → run in isolated PR, then small PRs per folder
- Type tightening breaks callers → codemods + incremental refactors
- Hidden performance impact → small scoped changes + quick profiling

## Commands (for convenience)

```bash
# Baseline
npx eslint . -f json -o .reports/eslint-baseline.json
npx tsc --noEmit

# Autofix
npx prettier "**/*.{ts,tsx,md,css}" --write
npx eslint . --fix

# Checks
npx eslint . -f stylish
npx tsc --noEmit
npm test -- --reporter=dot
```
