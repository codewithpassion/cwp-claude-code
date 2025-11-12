# CWP Claude Commands

A collection of custom slash commands for Claude Code to streamline software development workflows.

## Available Commands

### `/cwp:prime`
**Purpose**: Initialize project context by reading key project files.

**Usage**: `/cwp:prime`

**What it does**:
- Runs `git ls-files` to list all tracked files in the repository
- Reads essential project files:
  - `README.md` - Project overview and documentation
  - `CLAUDE.md` - Claude-specific guidelines and patterns
  - `package.json` - Project dependencies and scripts
  - `ai_docs/Rules.md` - AI-specific rules and conventions

Use this command at the start of a session to give Claude full context about your project structure and conventions.

---

### `/cwp:commit [all]`
**Purpose**: Create a well-formatted git commit with an AI-generated commit message.

**Usage**:
- `/cwp:commit` - Commits currently staged changes
- `/cwp:commit all` - Stages and commits all changed files

**Model**: Uses Haiku for fast execution

**What it does**:
- Analyzes current changes in the repository
- Generates a descriptive commit message
- Creates a commit with the generated message
- If `all` argument is passed, includes ALL changed files

---

### `/cwp:implement [path|prompt] [--parallel]`
**Purpose**: Execute complex feature implementation with optional parallel development using multiple coder agents.

**Usage**:
- `/cwp:implement "Add user authentication"` - Sequential implementation
- `/cwp:implement path/to/tasks.md --parallel` - Parallel implementation with multiple agents

**What it does**:
- Analyzes the implementation requirements
- Breaks down work into tasks
- Spawns coder subagent(s) to implement features
- If `--parallel` flag is provided: creates 2-5 parallel coder agents for independent tasks
- Each coder must update task checkboxes and pass `bun check` (or npm/yarn)
- Runs quality gates and verification after completion

**Quality Gates**:
- All task checkboxes must be marked complete
- Build and type checking must pass with zero errors
- All tests must pass
- No `any` types in TypeScript code
- Code must follow project patterns

---

### `/cwp:tech-stack [<path-to-project-brief-or-PRD>]`
**Purpose**: Analyze requirements and recommend/document the technology stack.

**Usage**:
- `/cwp:tech-stack` - Analyzes current codebase and creates tech stack docs
- `/cwp:tech-stack path/to/requirements.md` - Analyzes requirements first

**What it does**:
1. **Analyzes Requirements** (if path provided):
   - Reads project brief or PRD
   - Identifies scalability, integration, and performance requirements
2. **Analyzes Existing Stack**:
   - Maps current technologies
   - Identifies reusable components
   - Flags breaking changes needed
3. **Recommends Stack**:
   - Frontend framework & libraries
   - Backend framework & runtime
   - Database & cache solutions
   - Infrastructure & deployment
   - Development tools & testing
4. **Documents Decisions**:
   - Rationale for each choice
   - Trade-offs vs alternatives
   - Compatibility matrix
   - Migration path (if updating)

**Output**: Creates `tech-stack.md` with complete technology stack documentation

---

### `/cwp:review-code`
**Purpose**: Perform a comprehensive code review of the latest commit.

**Usage**: `/cwp:review-code`

**What it does**:
1. **Identifies the Commit**: Retrieves and displays the most recent commit hash and message
2. **Conducts Code Review**:
   - Analyzes changes in the commit
   - Provides three specific, actionable suggestions for improvement
   - Focuses on performance, readability, maintainability, and security
3. **Considers Edge Cases**:
   - Identifies missing or unhandled edge cases
   - Recommends updates to handle these scenarios

Provides thorough, professional feedback as if submitting a formal pull request review.

---

### `/cwp:prompt-optimizer <prompt>`
**Purpose**: Optimize prompts for better AI model performance and efficiency.

**Usage**: `/cwp:prompt-optimizer "Your prompt here"`

**Model**: Uses Sonnet for advanced reasoning

**What it does**:
1. **Prompt Engineering**:
   - Applies chain-of-thought reasoning
   - Adds few-shot examples
   - Implements role-based instructions
   - Uses clear delimiters and formatting
   - Adds output format specifications
2. **Context Optimization**:
   - Minimizes token usage
   - Structures information hierarchically
   - Removes redundant information
   - Adds relevant context
   - Uses compression techniques
3. **Performance Testing**:
   - Creates prompt variants
   - Designs evaluation criteria
   - Tests edge cases
   - Measures consistency
4. **Model-Specific Optimization**:
   - GPT-4 best practices
   - Claude optimization techniques
   - Prompt chaining strategies
   - Temperature/parameter tuning
   - Token budget management
5. **RAG Integration**:
   - Context window management
   - Retrieval query optimization
   - Chunk size recommendations
   - Embedding strategies
6. **Production Considerations**:
   - Prompt versioning
   - A/B testing framework
   - Monitoring metrics
   - Fallback strategies
   - Cost optimization

**Output**: Optimized prompts with explanations, evaluation metrics, and testing strategies.

---

### `/cwp:error-analisys <error-context>`
**Purpose**: Comprehensive error analysis and resolution guidance.

**Usage**: `/cwp:error-analisys "error description or path"`

**Model**: Uses Sonnet for deep analysis

**What it does**:
1. **Error Pattern Analysis**:
   - Categorizes error types
   - Identifies root causes
   - Traces error propagation
   - Analyzes error frequency
   - Correlates with system events
2. **Debugging Strategy**:
   - Stack trace analysis
   - Variable state inspection
   - Execution flow tracing
   - Memory dump analysis
   - Race condition detection
3. **Error Handling Improvements**:
   - Custom exception classes
   - Error boundary implementation
   - Retry logic with backoff
   - Circuit breaker patterns
   - Graceful degradation
4. **Logging Enhancement**:
   - Structured logging setup
   - Correlation ID implementation
   - Log aggregation strategy
   - Debug vs production logging
   - Sensitive data masking
5. **Monitoring Integration**:
   - Sentry/Rollbar setup
   - Error alerting rules
   - Error dashboards
   - Trend analysis
6. **Recovery Mechanisms**:
   - Automatic recovery procedures
   - Data consistency checks
   - Rollback strategies
7. **Prevention Strategies**:
   - Input validation
   - Type safety improvements
   - Contract testing
   - Defensive programming

**Output**: Specific fixes, preventive measures, test cases, and long-term reliability improvements.

---

## Installation

These commands are located in `.claude/commands/cwp/` and are automatically available in Claude Code when you use the `cwp:` namespace.

## Contributing

To add new commands:
1. Create a new `.md` file in `.claude/commands/cwp/`
2. Add frontmatter with `description`, `argument-hint`, and optional `model` specification
3. Write the command prompt
4. Update this README with documentation

## Command Structure

Each command file follows this structure:

```markdown
---
description: Brief description of the command
argument-hint: [optional-arg] [--flags]
model: sonnet|haiku|opus  # Optional, defaults to sonnet
---

# Command prompt content here
```
