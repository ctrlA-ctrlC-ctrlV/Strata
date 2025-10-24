# Tasks: Migrate from DigitalOcean MongoDB to Supabase

**Input**: Design documents from `/specs/main/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are MANDATORY per constitution (TDD). Write tests first; ensure they FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**URGENT**: All tasks marked for immediate execution to replace database technology.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure) 🚨 URGENT

**Purpose**: Supabase project initialization and basic structure setup

- [X] T001 Create Supabase project on supabase.com with name "strata-garden-rooms-prod"
- [X] T002 [P] Install Supabase CLI globally and configure local development environment
- [X] T003 [P] Install @supabase/supabase-js dependency in backend/package.json
- [X] T004 Configure environment variables in backend/.env with SUPABASE_URL and keys
- [X] T005 [P] Initialize local Supabase development stack using supabase init

---

## Phase 2: Foundational (Blocking Prerequisites) 🚨 URGENT ✅ COMPLETE

**Purpose**: Core database infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create PostgreSQL schema migration in backend/src/migrations/schema/001_initial_schema.sql
- [X] T007 Apply schema migration to Supabase project using supabase db push  
- [X] T008 [P] Generate TypeScript types from database schema in backend/src/types/supabase.ts
- [X] T009 Create Supabase client setup in backend/src/db/supabase.ts
- [X] T010 [P] Create schema validation script in backend/src/migrations/validate-schema.ts
- [X] T011 [P] Set up Row Level Security policies for all tables in migration
- [X] T012 Configure update triggers for timestamp fields in schema migration
- [X] T013 Create database connection health check function in backend/src/db/supabase.ts
- [X] T014 [P] Update backend/src/api/server.ts to initialize Supabase connection instead of MongoDB

**✅ Checkpoint**: Database foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Developer Database Operations (Priority: P1) 🎯 MVP 🚨 URGENT

**Goal**: Enable developers to work with strongly typed database operations using Supabase client

**Independent Test**: Create, read, update operations work with full TypeScript intellisense and compile-time error checking

### Tests for User Story 1 (MANDATORY per constitution) ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T015 [P] [US1] Create unit test for Supabase client connection in backend/tests/unit/db/supabase.test.ts
- [ ] T016 [P] [US1] Create unit test for QuotesRepository methods in backend/tests/unit/repos/quotes.test.ts  
- [ ] T017 [P] [US1] Create integration test for complete quote workflow in backend/tests/integration/quotes-api.test.ts

### Implementation for User Story 1

- [ ] T018 [P] [US1] Create ProductConfiguration interface matching database schema in backend/src/types/entities.ts
- [ ] T019 [P] [US1] Create QuoteRequest interface matching database schema in backend/src/types/entities.ts
- [ ] T020 [US1] Implement QuotesRepository class with Supabase client in backend/src/db/repos/quotes.ts
- [ ] T021 [US1] Replace MongoDB repository usage in backend/src/api/quotes.ts with new Supabase repository
- [ ] T022 [US1] Update error handling in API routes to handle PostgreSQL-specific errors
- [ ] T023 [US1] Test TypeScript compilation and verify no type errors across codebase

**Checkpoint**: At this point, User Story 1 should be fully functional with typed database operations

---

## Phase 4: User Story 2 - System Administrator Operations (Priority: P2) 🚨 URGENT

**Goal**: Provide simplified database operations and monitoring through Supabase dashboard and tooling

**Independent Test**: Database operations can be monitored, queries can be executed, and performance metrics are available

### Tests for User Story 2 (MANDATORY per constitution) ⚠️

- [ ] T024 [P] [US2] Create monitoring test script in backend/src/scripts/health-check.ts
- [ ] T025 [P] [US2] Create database performance test in backend/tests/integration/database-performance.test.ts

### Implementation for User Story 2  

- [ ] T026 [P] [US2] Configure Supabase project monitoring and alerting in dashboard
- [ ] T027 [P] [US2] Create database backup verification script in backend/src/scripts/verify-backups.ts
- [ ] T028 [US2] Document database administration procedures in backend/docs/database-admin.md
- [ ] T029 [US2] Create query performance monitoring setup using Supabase dashboard
- [ ] T030 [US2] Set up automated database health checks in production environment
- [ ] T031 [US2] Configure log aggregation and error tracking for database operations

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently with full admin capabilities

---

## Phase 5: User Story 3 - Business Stakeholder Value (Priority: P3) 🚨 URGENT

**Goal**: Demonstrate reduced infrastructure costs and complexity through Supabase consolidation

**Independent Test**: Infrastructure costs are measurably reduced and deployment complexity is simplified

### Tests for User Story 3 (MANDATORY per constitution) ⚠️

- [ ] T032 [P] [US3] Create deployment validation test in backend/tests/integration/deployment.test.ts  
- [ ] T033 [P] [US3] Create cost monitoring script in backend/src/scripts/cost-analysis.ts

### Implementation for User Story 3

- [ ] T034 [P] [US3] Remove MongoDB dependencies from backend/package.json
- [ ] T035 [P] [US3] Delete MongoDB connection files: backend/src/db/mongo.ts
- [ ] T036 [US3] Update deployment configuration to remove MongoDB connection strings
- [ ] T037 [US3] Document cost savings and complexity reduction in backend/docs/migration-benefits.md  
- [ ] T038 [US3] Update deployment scripts to use only Supabase configuration
- [ ] T039 [US3] Validate production deployment with simplified infrastructure

**Checkpoint**: All user stories should now be independently functional with reduced operational overhead

---

## Phase 6: Polish & Cross-Cutting Concerns 🚨 URGENT

**Purpose**: Final improvements and cleanup that affect multiple user stories

- [ ] T040 [P] Update API documentation in specs/main/contracts/openapi.yaml to reflect Supabase implementation
- [ ] T041 [P] Code cleanup: remove all MongoDB-related imports and references
- [ ] T042 [P] Performance optimization: verify query performance meets <200ms p95 targets  
- [ ] T043 [P] Update developer onboarding documentation in specs/main/quickstart.md
- [ ] T044 Security review: validate RLS policies and environment variable security
- [ ] T045 [P] Final integration test: run complete test suite and verify all functionality
- [ ] T046 Update deployment pipeline to exclude MongoDB configuration

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately 🚨 **START NOW**
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories 🚨 **URGENT**  
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3) 🚨 **URGENT PRIORITY ORDER**
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories 🚨 **MVP PRIORITY**
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 🚨 **ADMIN PRIORITY**
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent but benefits from US1/US2 completion 🚨 **COST PRIORITY**

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Repository classes before API updates  
- Database operations before application logic
- Type definitions before implementations
- Core functionality before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)  
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Interface definitions within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for Supabase client connection in backend/tests/unit/db/supabase.test.ts"  
Task: "Unit test for QuotesRepository methods in backend/tests/unit/repos/quotes.test.ts"
Task: "Integration test for complete quote workflow in backend/tests/integration/quotes-api.test.ts"

# Launch all interface definitions for User Story 1 together:
Task: "Create ProductConfiguration interface in backend/src/types/entities.ts"
Task: "Create QuoteRequest interface in backend/src/types/entities.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) 🎯 **RECOMMENDED URGENT PATH**

1. Complete Phase 1: Setup 🚨 **Day 1**
2. Complete Phase 2: Foundational 🚨 **Day 1-2** (CRITICAL - blocks all stories)  
3. Complete Phase 3: User Story 1 🚨 **Day 2-3**
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery 🚨 **FULL URGENT IMPLEMENTATION**

1. Complete Setup + Foundational → Foundation ready 🚨 **Days 1-2**
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) 🚨 **Days 2-3**  
3. Add User Story 2 → Test independently → Deploy/Demo 🚨 **Days 3-4**
4. Add User Story 3 → Test independently → Deploy/Demo 🚨 **Days 4-5**
5. Each story adds value without breaking previous stories

### Parallel Team Strategy (if multiple developers available)

With multiple developers:

1. Team completes Setup + Foundational together 🚨 **Days 1-2**
2. Once Foundational is done:
   - Developer A: User Story 1 (Database Operations) 🚨 **Priority 1**
   - Developer B: User Story 2 (Admin/Monitoring) 🚨 **Priority 2**  
   - Developer C: User Story 3 (Cleanup/Cost) 🚨 **Priority 3**
3. Stories complete and integrate independently

---

## Execution Summary 🚨 URGENT

**Total Tasks**: 46 tasks
**Tasks per User Story**: 
- Setup: 5 tasks
- Foundational: 9 tasks (BLOCKING)
- US1 (Developer Experience): 9 tasks
- US2 (Admin Operations): 8 tasks  
- US3 (Business Value): 8 tasks
- Polish: 7 tasks

**Parallel Opportunities**: 19 tasks marked [P] for parallel execution
**Critical Path**: Setup → Foundational → US1 (MVP)
**Estimated Timeline**: 5-7 days for complete implementation  
**MVP Timeline**: 2-3 days for US1 only

**Independent Test Criteria**:
- US1: TypeScript compilation succeeds, database operations work with type safety
- US2: Database monitoring and administration tools are functional  
- US3: MongoDB dependencies removed, infrastructure simplified

**Suggested MVP Scope**: Complete through User Story 1 (Developer Experience) for immediate database technology replacement with type safety.

**Format Validation**: ✅ All tasks follow required checklist format with checkboxes, sequential IDs, [P] and [Story] labels where appropriate, and specific file paths.