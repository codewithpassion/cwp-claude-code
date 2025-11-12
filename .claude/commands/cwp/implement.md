---
description: Start implementing a feature
argument-hint: [path|prompt] [--parallel]
---

You are an expert implementation coordinator.

Analyse the following user prompt: $ARGUMENTS

Then follow this workflow:

# Implement - Execute Implementation

Launche the implementation workflow for the requested feature. 
If the user passed '--parallel' as part of the prompt, use PARALLEL coder subagents
Uses parallel coder subagents to work on independent tasks while conserving context and maintaining coordination.

If '--parallel' is omited, the start ONE coder subagent and work through tasks sequentially.

## CRITICAL Requirements

### 1. Use Coder Subagents
- Spawn one or many sub agents depending on the request complexity to implement the tasks
- Each coder gets independent task group from phase task file

### 2. Run bun check After Each Coder
- **MUST** run `bun check (or npm|yarn depending on the project) when a coder completes their task group
- **MUST** verify ZERO type or compilation errors before marking tasks complete

### 3. Task File Updates are CRITICAL
- **ABSOLUTELY CRITICAL**: Phase task files (passed by the user) MUST be updated with completed tasks
- Each coder **MUST** check boxes `[ ]` → `[x]` for completed subtasks
- Each coder **MUST** mark main tasks as `[x]` complete
- If task file is NOT updated, the process is considered **FAILED**
- Coordinator **MUST** verify task file changes before phase completion

### 4. Quality Gates (All Required)
- [ ] All tasks marked `[x]` in the phase task files
- [ ] linting, checks, and compilation passes with ZERO errors after each coder
- [ ] All tests pass
- [ ] No critical security issues

## Coordinator Workflow

The Implementation Coordinator Agent will:

### 1. Prepare Phase
- Verify the reuirements passed in the prompt can be read
- Break down the requirements into tasks.
- Analyze task dependencies (identify critical path vs parallel work)
- Determine optimal coder count if '--parallel' development is requested (2-5 based on task complexity and dependencies)
- Create task groups for parallel execution (independent tasks per group)

### 2. Spawn Parallel Subagents if requested
- Use **Task tool** for each subagent for implementation 
- If '--parallel' is passed in the primpt: Create 2-5 coder agents as parallel subagents
- Assign independent task groups to each coder (no overlapping files/features)
- Minimize context overlap between coders
- Provide clear instructions to each coder (see below)

**Instructions to Each Coder Subagent:**
```
Implement tasks [X.X-Y.Y] 

CRITICAL REQUIREMENTS (All mandatory):
1. Read the task file to understand your assigned tasks
2. Implement each task following CLAUDE.md guidelines
3. **Check subtask boxes [ ] → [x] as you complete them in the task file**
4. **Mark main task boxes [ ] → [x] when task is complete**
5. **Run all checks when you finish - MUST pass with ZERO errors**
7. Write tests for your code (if requirements includes testing tasks)

FAILURE CONDITIONS:
- If task file NOT updated with checkboxes → Work is FAILED
- If checks has errors → Work is FAILED
- If any `any` types used → Work is FAILED

Report back with:
- Which tasks you completed
- Confirmation that checkboxes are updated in task file
- `bun check` results (must show ZERO errors)
- Any blockers encountered
```

### 3. Monitor Coder Progress
- Wait for all coders to complete (parallel execution)
- Track task completion by monitoring task file changes
- Handle dependencies if one coder blocks another
- Escalate blockers if any coder gets stuck

### 4. Verify Each Coder's Work (CRITICAL STEP)
After each coder completes, coordinator **MUST** verify:

- [ ] **Read task file** - Confirm checkboxes updated for assigned tasks
- [ ] **Verify all checks passed** - Coder must report ZERO errors
- [ ] **Spot check code** - Verify tasks actually implemented
- [ ] **Check code follows patterns** - Matches CLAUDE.md guidelines

**If ANY verification step fails:**
- Work is incomplete and must be redone
- Reassign to same or different coder
- Do NOT proceed until fixed

### 5. Run Final Quality Gates
After all coders complete and verified:

- [ ] All tasks marked `[x]` in the tasks files
- [ ] Run checks globally - must pass with ZERO errors
- [ ] Run build - must succeed
- [ ] Run all tests (if phase includes tests)
- [ ] Verify no critical security issues
- [ ] Check all quality standards met (see Quality Gates section)

### 6. Complete Phase
- Verify all quality gates passed
- Mark phase as complete
- Prepare for next phase (if applicable)

**Output Files:**
- Updated the tasks file with `[x]` checkboxes
- Implementation artifacts (code, tests, documentation)

## How to Invoke Coder Subagents

The coordinator uses the **Task tool** to spawn parallel coder subagents. Each invocation creates an independent coder working on their assigned task group.

### Example: Spawning 3 Parallel Coder Agents

```typescript
// Coder 1: Database & Backend Foundation
Task({
  subagent_type: 'coder',
  description: 'Phase 1 Database & Backend',
  prompt: `Implement tasks 1.1-1.5 and 2.1-2.2 from project-docs/tasks/phase-1-tasks.md

CRITICAL REQUIREMENTS:
1. Check subtask boxes [ ] → [x] as you complete them in the task file
2. Mark main task boxes [ ] → [x] when complete
3. Run 'bun check' when finished - MUST pass with ZERO errors
4. NO 'any' types allowed - use proper TypeScript types

Report back:
- Tasks completed
- Task file checkboxes updated (confirm)
- bun check results (must be passing)
- Any blockers`
})

// Coder 2: Backend Features & Seed Data
Task({
  subagent_type: 'coder',
  description: 'Phase 1 Backend Features',
  prompt: `Implement tasks 2.3-2.4 and 3.1-3.2 from project-docs/tasks/phase-1-tasks.md

CRITICAL REQUIREMENTS:
1. Check subtask boxes [ ] → [x] as you complete them in the task file
2. Mark main task boxes [ ] → [x] when complete
3. Run 'bun check' when finished - MUST pass with ZERO errors
4. NO 'any' types allowed - use proper TypeScript types

Report back:
- Tasks completed
- Task file checkboxes updated (confirm)
- bun check results (must be passing)
- Any blockers`
})

// Coder 3: Frontend Structure & Integration
Task({
  subagent_type: 'coder',
  description: 'Phase 1 Frontend',
  prompt: `Implement tasks 4.1-4.4 and 6.1-6.3 from project-docs/tasks/phase-1-tasks.md

CRITICAL REQUIREMENTS:
1. Check subtask boxes [ ] → [x] as you complete them in the task file
2. Mark main task boxes [ ] → [x] when complete
3. Run 'bun check' when finished - MUST pass with ZERO errors
4. NO 'any' types allowed - use proper TypeScript types

Report back:
- Tasks completed
- Task file checkboxes updated (confirm)
- bun check results (must be passing)
- Any blockers`
})
```

**After all coders complete:** Coordinator verifies task file updated + bun check passes globally

## Example Parallel Coder Distribution

### For Phase 1 (Backend-Heavy) with 3 Coders:

**Coder 1: Database Schema & Foundation**
├── Tasks 1.1-1.5: Database schema setup
├── Task 2.1-2.2: Core Convex functions
└── Run `bun check` when complete

**Coder 2: Backend Features & Seed Data**
├── Tasks 2.3-2.4: Feature-specific Convex functions
├── Tasks 3.1-3.2: Seed data generation
└── Run `bun check` when complete

**Coder 3: Frontend Structure & Integration**
├── Tasks 4.1-4.4: Frontend project structure
├── Tasks 6.1-6.3: Backend integration
└── Run `bun check` when complete

### For Larger Phases with 4 Coders:

**Coder 1: Backend Core**
├── Database models
├── Core API endpoints
├── Authentication logic
└── Run `bun check`

**Coder 2: Backend Features**
├── Feature-specific endpoints
├── Data validation
├── Business logic
└── Run `bun check`

**Coder 3: Frontend Components**
├── UI components
├── React hooks
├── State management
└── Run `bun check`

**Coder 4: Integration & Quality**
├── API integration
├── Testing setup
├── Build verification
├── Documentation
└── Run `bun check`

## How Coders Communicate

1. **Shared Task File** (supplied from the user)
   - Single source of truth for phase tasks
   - Coders read it to understand assigned tasks
   - **Coders MUST update checkboxes when complete**
   - **NOT updating = FAILED process**
   - Coordinator verifies updates

2. **Status Updates**
   - Daily summary in a status file
   - Blockers escalated immediately
   - Dependencies tracked

3. **Code Integration**
   - Agents work on separate files/components
   - Regular git commits with clear messages
   - Code review between agents as needed

4. **Coordinator Decisions**
   - Breaks deadlocks
   - Reassigns work if needed
   - Escalates critical issues
   - Approves task completion


## Task Completion Flow

```
1. Agent selects task from [ ] (pending)
2. Agent works on subtasks
3. Agent checks subtask boxes as completed
4. Agent marks main task as [x] (complete)
5. Agent marks task with "✅ Completed by Agent N"
6. Coordinator verifies task is truly done
7. Coordinator marks task as fully complete
8. Move to next task
```

## Quality Gates (All Required Before Phase Completion)

### Critical Requirements (MUST PASS)
- [ ] **All tasks marked `[x]` in phase tasks file**
- [ ] **Task file updated by each coder (verified via git diff or file read)**
- [ ] **`bun check` passes with ZERO errors globally**
- [ ] **ZERO `any` types in new code (search entire codebase)**
- [ ] **All tests pass** (if phase includes testing tasks)
- [ ] **Build succeeds**: `bun build`

### Quality Standards
- [ ] Code follows project patterns (see CLAUDE.md)
- [ ] Proper TypeScript types (imported from libraries, defined interfaces)
- [ ] Functions have explicit return types
- [ ] Error handling implemented properly
- [ ] JSDoc comments on public functions
- [ ] No critical security issues

### Documentation
- [ ] Code is self-documenting with clear naming
- [ ] Complex logic has inline comments
- [ ] README updated if needed (new features, setup steps)

**IF ANY CRITICAL REQUIREMENT FAILS, PHASE IS NOT COMPLETE AND MUST BE FIXED.**


## Parallel Coder Capacity

- **2 coders**: Small phases (backend + frontend combined, or two independent feature groups)
- **3 coders**: Optimal for most phases (backend core + backend features + frontend, or database + backend + frontend)
- **4 coders**: Recommended for larger phases (backend core + backend features + frontend + integration/testing)
- **5+ coders**: Coordination overhead exceeds benefits

**Key Principle**: Assign independent work to each coder to minimize dependencies and file conflicts

## Handling Blockers

If an agent encounters a blocker:

1. Agent marks task with `⚠️ BLOCKER: [description]`
2. Coordinator is immediately notified
3. Coordinator either:
   - Reassigns to another agent
   - Resolves the blocker
   - Reorders work to unblock
4. Agent continues with next independent task

## Context Management

Each agent gets:
- **Task focus**: Only their assigned tasks
- **Shared context**: PRD, tech stack, personas
- **Code context**: Relevant files for their domain
- **Phase scope**: Phase document and dependencies

Agents do NOT duplicate full project context to conserve context usage.

