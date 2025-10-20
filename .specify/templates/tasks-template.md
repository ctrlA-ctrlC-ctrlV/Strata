---
description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are MANDATORY per constitution (TDD). Write tests first; ensure they FAIL before implementation. Include Lighthouse CI and axe-core accessibility checks for affected pages/components.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions (Static Web Default)
- **Static site (default)**: `site/` (sources), `site/assets/` (images/fonts), `tests/` (all test types)
- **Alternative web app**: `frontend/src/` (if using a framework that enforces this structure)
- Paths shown below assume static site - adjust based on plan.md structure

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize static site with [SSG/framework] (e.g., Eleventy, Astro, Next static export, VitePress)
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks for STATIC WEB (adjust as needed):

- [ ] T004 Configure build pipeline: minify, tree-shake, dead-code elimination, critical CSS
- [ ] T005 [P] Set up Lighthouse CI with budgets (FCP ≤ 1.5s, LCP ≤ 2.5s, TTI ≤ 3.5s, ≤ 500KB bundles)
- [ ] T006 [P] Set up automated accessibility checks (axe-core/pa11y) and basic keyboard nav tests
- [ ] T007 Establish image pipeline (responsive sizes, lazy-load, formats: AVIF/WebP)
- [ ] T008 Configure asset fingerprinting (content hashes) and cache-control headers
- [ ] T009 Configure security headers (HSTS, CSP, SRI, XFO, XCTO, Referrer-Policy, Permissions-Policy)
- [ ] T010 Add CI tasks to run tests, a11y, Lighthouse on changed pages/components

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (MANDATORY per constitution) ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T011 [P] [US1] Lighthouse budget check for page `[/path]` in tests/perf/lh_[name].yml
- [ ] T012 [P] [US1] Accessibility test (axe) for component/page `[name]` in tests/a11y/[name].spec.[js|ts]
- [ ] T013 [P] [US1] Visual regression snapshot for `[page/component]` in tests/visual/[name].spec.[js|ts]

### Implementation for User Story 1

- [ ] T014 [P] [US1] Implement component `[name]` in site/src/components/[name].[ext]
- [ ] T015 [P] [US1] Implement page `[route]` in site/src/pages/[route].html (or framework equivalent)
- [ ] T016 [US1] Ensure no-JS fallback for key interaction `[describe]`
- [ ] T017 [US1] Optimize critical CSS for page `[route]`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (MANDATORY per constitution) ⚠️

- [ ] T018 [P] [US2] Lighthouse budget check for page `[/path]` in tests/perf/lh_[name].yml
- [ ] T019 [P] [US2] Accessibility test (axe) for component/page `[name]`

### Implementation for User Story 2

- [ ] T020 [P] [US2] Implement component `[name]` in site/src/components/[name].[ext]
- [ ] T021 [US2] Implement page `[route]` in site/src/pages/[route].html (or framework equivalent)
- [ ] T022 [US2] Ensure progressive enhancement for `[feature]`
- [ ] T023 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (MANDATORY per constitution) ⚠️

- [ ] T024 [P] [US3] Lighthouse budget check for page `[/path]`
- [ ] T025 [P] [US3] Accessibility test (axe) for component/page `[name]`

### Implementation for User Story 3

- [ ] T026 [P] [US3] Implement component `[name]` in site/src/components/[name].[ext]
- [ ] T027 [US3] Implement page `[route]` in site/src/pages/[route].html (or framework equivalent)
- [ ] T028 [US3] Optimize images for `[route]` and verify responsive sources

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all pages/components (meet budgets & Lighthouse ≥ 90/100; SEO = 100)
- [ ] TXXX [P] Additional unit/UI tests in tests/unit/ and tests/visual/
- [ ] TXXX Security hardening (CSP, SRI, headers) and verify no inline scripts/styles without nonces
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence



