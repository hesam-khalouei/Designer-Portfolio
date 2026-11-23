# Documentation Governance — Recursive Documentation Workflow

**Status:** Approved project working policy  
**Applies to:** Every project task, regardless of size  
**Scope:** Source code, configuration, dependencies, tests, architecture, security, deployment, operations, and documentation

## 1. Purpose

This policy makes the repository's Markdown documentation an active part of the engineering workflow and the authoritative record of project intent, decisions, constraints, and implementation status.

Documentation is not a final administrative step. It is part of planning, implementation, verification, and handoff.

The policy applies to every change, including small fixes, refactors, dependency changes, configuration edits, test changes, and documentation-only work.

## 2. Mandatory workflow

Every task MUST follow these steps.

### Step A — Discover and read relevant documentation

Before investigating or changing implementation details:

1. Read the repository's root-level agent and contributor instructions that apply to the task (including `AGENTS.md`, if present).
2. Read `docs/README.md` to understand the documentation structure.
3. Identify and read the relevant documents under:
   - `docs/architecture/`
   - `docs/decisions/`
   - `docs/phases/`
   - `docs/operations/`
4. Read any domain-specific instructions or specifications referenced by those documents.
5. Check the current implementation and repository state rather than assuming that documentation is up to date.

Do not read every Markdown file indiscriminately when the repository grows. Discover the relevant documents by topic and dependency, and follow cross-references. Read broader documentation when the task has cross-cutting impact.

### Step B — Establish impact before implementation

Before making a change, identify:

- The user-visible or system behavior affected.
- Relevant architecture and approved decisions.
- Affected modules, data contracts, configuration, and dependencies.
- Security, privacy, accessibility, localization, and performance implications, where applicable.
- Required tests and verification commands.
- Which documentation files may need updating.

If the requested change conflicts with an approved decision or existing specification, stop and explain the conflict. Do not silently override an approved decision. Obtain approval when the decision belongs to the project owner.

### Step C — Implement incrementally

- Keep changes scoped to the approved task.
- Preserve existing behavior unless a behavior change is explicitly approved.
- Do not introduce unrelated cleanup.
- Do not claim a change, test, deployment, or commit succeeded unless there is evidence.
- Record newly discovered constraints or decisions in the appropriate document.

### Step D — Verify

Run the checks appropriate to the change. Examples include:

- TypeScript validation.
- Production build.
- Unit, integration, UI, or end-to-end tests.
- Accessibility and responsive checks.
- Security and policy checks.
- Manual verification where automation is unavailable.

Record exact commands and outcomes. Distinguish `PASS`, `FAIL`, `NOT RUN`, and `BLOCKED`. Explain known warnings and their impact.

### Step E — Update documentation

After implementation and verification:

1. Update every existing document whose statements, status, instructions, architecture, contracts, or decisions have changed.
2. Add a new document when the task introduces a durable architectural decision, workflow, operational procedure, or substantial phase of work.
3. Update links, indexes, and phase status where needed.
4. Record implementation status accurately, including incomplete work and known limitations.
5. If no documentation change is warranted, explicitly state why in the task report.

Documentation must describe the actual repository state—not the intended future state. Clearly label proposals, approved decisions, planned work, and implemented behavior.

### Step F — Final handoff

Every meaningful implementation task MUST finish with a concise Markdown report containing:

- Task and scope.
- Documents reviewed.
- Files changed.
- Decisions made or confirmed.
- Tests and exact results.
- Documentation updated.
- Remaining risks, limitations, and follow-up work.
- Git status/commit details only when actually verified.

The report belongs in the most relevant existing location, normally `docs/phases/` for phase work or `docs/operations/` for operational work. Avoid creating duplicate reports for the same task.

## 3. Recursive documentation rule

Documentation changes are also project changes and MUST follow this policy.

When editing a Markdown file:

1. Read the document and its parent/index documents.
2. Check cross-references and any policy or decision that governs the content.
3. Update affected indexes and links.
4. Verify that the result does not contradict other approved documents.
5. Record the documentation change in the task report when appropriate.

This recursion is bounded: do not update unrelated documents merely because another Markdown file changed. Follow actual semantic impact and references.

## 4. Source authority and conflict resolution

Project documents have distinct authority domains. Do not treat them as
one flat precedence list.

### Authority by domain

1. **Explicit project-owner decisions:** A clearly approved and recorded
   owner decision resolves conflicts within its stated scope. Record
   consequential product or technical decisions in the appropriate
   decision document.

2. **Product requirements and intent — `GEMINI.md`:** The owner-approved
   Product Constitution is the primary reference for product vision,
   intended capabilities, user experience requirements and non-negotiable
   product expectations. It does not, by itself, approve a technical
   implementation, dependency, schema or security design.

3. **Technical architecture — architecture documents and ADRs:**
   These define technical decisions, constraints, system boundaries and
   implementation strategies. A product requirement does not silently
   supersede an accepted technical decision. A required change must be
   evaluated and recorded.

4. **Execution scope and sequence — Roadmap and phase specifications:**
   These define approved phase order, task scope, acceptance criteria and
   planned or completed status. The project Roadmap remains the canonical
   execution plan.

5. **Actual implementation state — verified repository and test evidence:**
   Source code and reproducible test results establish what is currently
   implemented and verified. They do not automatically approve a product
   requirement or architectural decision.

6. **Working process — `AGENTS.md` and this governance document:**
   These define how work, reviews, approvals, documentation and repository
   operations are conducted. They do not independently redefine product
   scope or technical architecture.

7. **Historical evidence — audits and reports:** These record findings and
   outcomes at a particular point in time. They must not be silently
   rewritten to make historical statements appear current.

8. **Proposals, drafts and generated notes:** These remain non-authoritative
   until explicitly reviewed and accepted.

### Conflict resolution

If two sources conflict:

- Do not silently select one source or infer approval.
- Identify the exact statements, their authority domains and affected files.
- Check whether either statement is historical, superseded or limited in scope.
- Pause the affected implementation if the conflict could change an approved
  product requirement, technical decision, security boundary or phase scope.
- Present the conflict and practical options to the project owner.
- Record the owner's decision in the appropriate document. Create or update
  an ADR when a technical architecture decision changes.
- Update affected cross-references and mark superseded material clearly.

A requirement being documented does not mean it is implemented. A planned
capability must remain labelled as planned until repository and test evidence
demonstrate otherwise.

A report is evidence of what happened at a point in time; it does not
automatically override a later approved decision or verified implementation.

## 5. Proportionality — avoid documentation overhead

The rule is mandatory review, not mandatory rewriting.

Examples:

| Change | Expected documentation action |
|---|---|
| Typo or isolated visual correction | Review relevant guidance; update docs only if behavior or instructions changed |
| Bug fix | Update the relevant technical note or phase report if it changes known behavior or constraints |
| New component/module | Update architecture/module documentation and relevant usage guidance |
| Dependency addition/removal | Update dependency/architecture records and setup instructions where relevant |
| API, schema, or data-model change | Update contracts, data model, migration, and security documentation |
| Security or RLS change | Update security policy and verification evidence |
| Design token or typography change | Update design-system documentation |
| Build, test, or deployment workflow change | Update operations and developer setup documentation |
| Architectural decision | Record an approved ADR/decision before or alongside implementation |
| Documentation-only change | Check indexes, references, and consistency |

If a task is truly trivial and has no durable effect on project knowledge, a short statement such as `Documentation reviewed; no update required because ...` is sufficient.

## 6. Safety and repository hygiene

- Never delete, overwrite, or bulk-stage unknown files as part of documentation cleanup.
- Inspect unexpected files and Git status before staging.
- Do not treat generated audit output as authoritative without verification.
- Do not copy secrets, credentials, private keys, or sensitive user data into Markdown.
- Keep examples free of real secrets; use clearly fake placeholders.
- Do not mark planned work as completed.
- Preserve historical reports; correct them with dated follow-up notes rather than rewriting history when auditability matters.
- Avoid duplicate documents. Search for an existing canonical document before creating a new one.

## 7. Task checklist

Use this checklist for each task:

- [ ] Read applicable repository instructions.
- [ ] Read `docs/README.md` and relevant documentation.
- [ ] Inspect current implementation and Git status.
- [ ] Identify scope, dependencies, risks, and affected documents.
- [ ] Confirm approval for changes that alter approved decisions.
- [ ] Implement only the agreed scope.
- [ ] Run and record relevant verification.
- [ ] Update affected Markdown documents and indexes.
- [ ] Record why no documentation update was needed, if applicable.
- [ ] Produce a concise task report with verified outcomes.
- [ ] Review final diff and Git status before staging or committing.

## 8. Adoption

This policy is approved for the Portfolio Panel project.

The project owner and contributors should treat it as a required workflow. Root-level agent instructions (for example, `AGENTS.md`) should contain a short, prominent reference to this document so that coding agents encounter the policy before making changes.

**Canonical policy path:** `docs/operations/documentation-governance.md`
