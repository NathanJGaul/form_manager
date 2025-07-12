# form_manager - Dynamic Form Management System

## 1. Project Overview
- **Vision:** A flexible, TypeScript-based form management system with dynamic templating, conditional logic, and programmatic API for building complex data collection forms
- **Current Phase:** v3 development with enhanced JCC2 questionnaire templates, E2E testing implementation, and advanced conditional rendering
- **Key Architecture:** React + TypeScript frontend with Vite build system, programmatic template engine, and comprehensive PDF export capabilities
- **Development Strategy:** Test-driven development with Playwright E2E testing, modular component architecture, and extensive template library with real-world use cases

## 2. Project Structure

**⚠️ CRITICAL: AI agents MUST read the [Project Structure documentation](/docs/ai-context/project-structure.md) before attempting any task to understand the complete technology stack, file tree and project organization.**

form_manager follows a component-based React architecture with a powerful programmatic template system. For the complete tech stack and file tree structure, see [docs/ai-context/project-structure.md](/docs/ai-context/project-structure.md).

## 3. Coding Standards & AI Instructions

### General Instructions
- Your most important job is to manage your own context. Always read any relevant files BEFORE planning changes.
- When updating documentation, keep updates concise and on point to prevent bloat.
- Write code following KISS, YAGNI, and DRY principles.
- When in doubt follow proven best practices for implementation.
- Do not commit to git without user approval.
- Do not run any servers, rather tell the user to run servers for testing.
- Always consider industry standard libraries/frameworks first over custom implementations.
- Never mock anything. Never use placeholders. Never omit code.
- Apply SOLID principles where relevant. Use modern framework features rather than reinventing solutions.
- Be brutally honest about whether an idea is good or bad.
- Make side effects explicit and minimal.
- Design database schema to be evolution-friendly (avoid breaking changes).


### File Organization & Modularity
- Default to creating multiple small, focused files rather than large monolithic ones
- Each file should have a single responsibility and clear purpose
- Keep files under 350 lines when possible - split larger files by extracting utilities, constants, types, or logical components into separate modules
- Separate concerns: utilities, constants, types, components, and business logic into different files
- Prefer composition over inheritance - use inheritance only for true 'is-a' relationships, favor composition for 'has-a' or behavior mixing

- Follow existing project structure and conventions - place files in appropriate directories. Create new directories and move files if deemed appropriate.
- Use well defined sub-directories to keep things organized and scalable
- Structure projects with clear folder hierarchies and consistent naming conventions
- Import/export properly - design for reusability and maintainability

### TypeScript Types (REQUIRED)
- **Always** use TypeScript interfaces and types for all data structures
- Define strict interfaces for form templates, fields, and instances
- Use generic types for reusable components
- Leverage union types for field types and conditional operators

```typescript
// Good
interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  label: string;
  required: boolean;
  conditional?: {
    dependsOn: string;
    values: string[];
    operator: 'equals' | 'contains' | 'not_equals';
  };
}
```

### Naming Conventions
- **Components**: PascalCase (e.g., `FormRenderer`, `TemplateBuilder`)
- **Functions/Methods**: camelCase (e.g., `evaluateCondition`, `renderField`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `FIELD_TYPES`, `DEFAULT_LAYOUT`)
- **Types/Interfaces**: PascalCase (e.g., `FormTemplate`, `FieldValidation`)
- **Files**: kebab-case for utilities, PascalCase for components (e.g., `form-logic.ts`, `FormBuilder.tsx`)


### Documentation Requirements
- Every module needs a header comment explaining its purpose
- Every public function needs JSDoc comments
- Use TSDoc syntax for TypeScript documentation
- Include type information and examples in documentation

```typescript
/**
 * Evaluates conditional logic for form fields and sections
 * @param condition - The conditional configuration object
 * @param formData - Current form data to evaluate against
 * @returns Boolean indicating if condition is met
 * @example
 * ```typescript
 * const isVisible = evaluateCondition({
 *   dependsOn: 'age',
 *   values: ['18+'],
 *   operator: 'equals'
 * }, { age: '18+' });
 * ```
 */
function evaluateCondition(
  condition: ConditionalLogic,
  formData: Record<string, any>
): boolean {
  // implementation
}
```

### Security First
- Validate all form inputs on both client and server side
- Sanitize user-generated content before rendering
- Prevent XSS attacks by properly encoding dynamic content
- Validate file uploads and restrict file types
- Never trust programmatic template imports - validate structure and content
- Implement proper error boundaries to prevent information leakage
- Use Content Security Policy headers for production deployments
- Validate template JSON structure before processing
- Escape user input in generated PDFs

### Error Handling
- Use specific exceptions over generic ones
- Always log errors with context
- Provide helpful error messages
- Fail securely - errors shouldn't reveal system internals

### Observable Systems & Logging Standards
- Log form rendering events and template loading for debugging
- Track conditional logic evaluation and field visibility changes
- Log template import/export operations with validation results
- Structure logs for form analytics - track completion rates, field interaction patterns
- Include template IDs and instance IDs in all form-related logs

### State Management
- Use localStorage for form persistence and template storage
- Maintain single source of truth for form data and templates
- Track form instance state including progress and visited sections
- Implement auto-save functionality for form data
- Separate template definitions from form instances
- Cache compiled templates for performance

### Form System Design Principles
- Programmatic API for template creation and modification
- Consistent field type definitions across templates
- Immutable template definitions with versioning
- Predictable conditional logic evaluation
- Standardized export formats (PDF, CSV, JSON)
- Template validation before storage
- Backward-compatible template evolution


## 4. Multi-Agent Workflows & Context Injection

### Automatic Context Injection for Sub-Agents
When using the Task tool to spawn sub-agents, the core project context (CLAUDE.md, project-structure.md, docs-overview.md) is automatically injected into their prompts via the subagent-context-injector hook. This ensures all sub-agents have immediate access to essential project documentation without the need of manual specification in each Task prompt.


## 5. MCP Server Integrations

### Gemini Consultation Server
**When to use:**
- Complex coding problems requiring deep analysis or multiple approaches
- Code reviews and architecture discussions
- Debugging complex issues across multiple files
- Performance optimization and refactoring guidance
- Detailed explanations of complex implementations
- Highly security relevant tasks

**Automatic Context Injection:**
- The kit's `gemini-context-injector.sh` hook automatically includes two key files for new sessions:
  - `/docs/ai-context/project-structure.md` - Complete project structure and tech stack
  - `/MCP-ASSISTANT-RULES.md` - Your project-specific coding standards and guidelines
- This ensures Gemini always has comprehensive understanding of your technology stack, architecture, and project standards

**Usage patterns:**
```python
# New consultation session (project structure auto-attached by hooks)
mcp__gemini__consult_gemini(
    specific_question="How should I optimize this voice pipeline?",
    problem_description="Need to reduce latency in real-time audio processing",
    code_context="Current pipeline processes audio sequentially...",
    attached_files=[
        "src/core/pipelines/voice_pipeline.py"  # Your specific files
    ],
    preferred_approach="optimize"
)

# Follow-up in existing session
mcp__gemini__consult_gemini(
    specific_question="What about memory usage?",
    session_id="session_123",
    additional_context="Implemented your suggestions, now seeing high memory usage"
)
```

**Key capabilities:**
- Persistent conversation sessions with context retention
- File attachment and caching for multi-file analysis
- Specialized assistance modes (solution, review, debug, optimize, explain)
- Session management for complex, multi-step problems

**Important:** Treat Gemini's responses as advisory feedback. Evaluate the suggestions critically, incorporate valuable insights into your solution, then proceed with your implementation.

### Context7 Documentation Server
**Repository**: [Context7 MCP Server](https://github.com/upstash/context7)

**When to use:**
- Working with external libraries/frameworks (React, FastAPI, Next.js, etc.)
- Need current documentation beyond training cutoff
- Implementing new integrations or features with third-party tools
- Troubleshooting library-specific issues

**Usage patterns:**
```python
# Resolve library name to Context7 ID
mcp__context7__resolve_library_id(libraryName="react")

# Fetch focused documentation
mcp__context7__get_library_docs(
    context7CompatibleLibraryID="/facebook/react",
    topic="hooks",
    tokens=8000
)
```

**Key capabilities:**
- Up-to-date library documentation access
- Topic-focused documentation retrieval
- Support for specific library versions
- Integration with current development practices



## 6. Post-Task Completion Protocol
After completing any coding task, follow this checklist:

### 1. Type Safety & Quality Checks
Run the appropriate commands based on what was modified:
- **Python projects**: Run mypy type checking
- **TypeScript projects**: Run tsc --noEmit
- **Other languages**: Run appropriate linting/type checking tools

### 2. Verification
- Ensure all type checks pass before considering the task complete
- If type errors are found, fix them before marking the task as done