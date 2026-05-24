docs/plans/2026-05-24_repo-health-cleanup-plan.md

````markdown
# Repo Health Cleanup Plan

Status: Draft  
Purpose: Track small loose ends found after the docs-structure cleanup.

---

## 1. Documentation Authority Cleanup

- [ ] Fix `docs/architecture/doc-authority.md`.
  - [ ] Remove duplicate `id-and-normalization.md` entry.
  - [ ] Remove `graph-validation.md` from canonical root docs if it remains listed as supporting/reference.
  - [ ] Keep `graph-model.md` as the canonical owner of node and edge definitions.
  - [ ] Keep `graph-node-kinds.md` and `graph-edge-kinds.md` as supporting reference docs.

- [ ] Fix `docs/architecture/doc-authority-map.md`.
  - [ ] Remove `graph-node-kinds.md` from root authority docs.
  - [ ] Remove `graph-edge-kinds.md` from root authority docs.
  - [ ] Remove `graph-validation.md` from root authority docs if it is treated as supporting/reference.
  - [ ] Keep those docs under `Supporting reference documents`.

- [ ] Fix `docs/README.md`.
  - [ ] Remove `Graph Node Kinds` from `Canonical Architecture`.
  - [ ] Remove `Graph Edge Kinds` from `Canonical Architecture`.
  - [ ] Keep both under `Architecture Reference Docs`.

---

## 2. Package Metadata Cleanup

- [ ] Fix `package.json` description.
  - [ ] Replace the flattened working-title warning with a short product description.
  - [ ] Suggested description:
    > Deterministic, local, evidence-backed codebase mapping for TypeScript repos and AI coding agents.

- [ ] Decide license truth.
  - [ ] If public/open source: keep `ISC` and update README from `License TBD`.
  - [ ] If not open source yet: change package license to `UNLICENSED` and keep README explicit.
  - [ ] Make README and `package.json` agree.

- [ ] Add useful keywords.
  - [ ] `typescript`
  - [ ] `code-analysis`
  - [ ] `code-graph`
  - [ ] `static-analysis`
  - [ ] `developer-tools`

- [ ] Decide whether `author` should remain empty.
- [ ] Decide whether `main: "index.js"` should remain.
  - [ ] If not publishing as a package yet, consider removing it.
  - [ ] If publishing later, replace it with a real built entrypoint.

---

## 3. Validation Script Cleanup

- [ ] Add a typecheck script to `package.json`.

Suggested scripts:

```bash
typecheck": "tsc --noEmit
check": "npm run typecheck && npm test
```

- [ ] Run validation.

```bash
npm run check
```

- [ ] Keep `npm test` as the fast regression-test command.

---

## 4. Generated Report Safety

- [ ] Confirm `project-endpoint-report.md` stays ignored.
- [ ] Confirm endpoint truth report generation does not create tracked files by accident.
- [ ] If more generated reports are added later, add them to `.gitignore`.

---

## 5. Final Verification

- [ ] Run regression tests.

```bash
npm test
```

- [ ] Run typecheck if added.

```bash
npm run typecheck
```

- [ ] Search for stale docs paths.

```bash
git grep -n "docs/planning\|docs/positioning\|Early design phase" -- README.md docs
```

- [ ] Search for stale authority-chain wording.

```bash
git grep -n "Architecture → Design → Development → Roadmaps" -- README.md docs
```

- [ ] Search for duplicate canonical/reference wording around node and edge docs.

```bash
git grep -n "graph-node-kinds.md\|graph-edge-kinds.md\|graph-validation.md" -- docs/architecture/doc-authority.md docs/architecture/doc-authority-map.md docs/README.md README.md
```

---

## 6. Suggested Commit Split

- [ ] Commit docs authority/index cleanup first.

```bash
git add README.md docs/README.md docs/architecture/doc-authority.md docs/architecture/doc-authority-map.md
git commit -m "docs: clean up authority references"
```

- [ ] Commit package metadata/check scripts separately.

```bash
git add package.json  
git commit -m "chore: add repo health checks"
```

---

## Done When

- [ ] Documentation authority docs no longer contradict the supporting-reference docs.
- [ ] `docs/README.md` no longer lists node/edge guide docs as canonical owners.
- [ ] README and `package.json` agree on status/license.
- [ ] `npm test` passes.
- [ ] `npm run typecheck` passes, if added.
- [ ] No stale `docs/planning` or `docs/positioning` references remain.

