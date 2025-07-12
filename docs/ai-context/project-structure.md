# form_manager Project Structure

This document provides the complete technology stack and file tree structure for the form_manager project. **AI agents MUST read this file to understand the project organization before making any changes.**

## Technology Stack

### Frontend Technologies
- **TypeScript 5.5.3+** with **npm** - Strongly typed JavaScript with package management
- **React 18.3.1+** - Component-based UI framework with hooks and modern patterns
- **Vite 5.4.2+** - Fast build tool and development server with HMR
- **Tailwind CSS 3.4.1+** - Utility-first CSS framework for rapid styling

### Core Libraries & APIs
- **pdf-lib 1.17.1+** - PDF generation and manipulation for form exports
- **lucide-react 0.344.0+** - Modern icon library for UI components
- **LocalStorage API** - Client-side data persistence for forms and templates
- **File API** - File uploads and template import/export functionality

### Form System Architecture
- **Template Engine** - Programmatic form template creation and management
- **Conditional Logic Engine** - Dynamic field and section visibility control
- **Data Persistence** - Auto-save and form instance management
- **Export System** - Multi-format export (PDF, CSV, JSON)

### Development & Quality Tools
- **ESLint 9.9.1+** - Code linting with TypeScript and React rules
- **TypeScript 5.5.3+** - Static type checking and compilation
- **Playwright 1.53.2+** - End-to-end testing with browser automation
- **PostCSS 8.4.35+** - CSS processing and Tailwind compilation
- **Vite** - Build automation and development server

### Testing & MCP Integration
- **@playwright/test** - Comprehensive E2E testing suite
- **@playwright/mcp 0.0.29+** - MCP server integration for testing
- **Single-file builds** - Standalone HTML distributions
- **Static hosting ready** - No backend dependencies required

### Future Technologies
- **Backend API** - Planned server-side template and data management
- **Real-time collaboration** - Multi-user form editing capabilities
- **Cloud storage** - Template sharing and backup systems
- **Advanced analytics** - Form completion and usage analytics

## Complete Project Structure

```
form_manager/
├── README.md                           # Project overview and setup
├── CLAUDE.md                           # Master AI context file
├── package.json                        # npm configuration and scripts
├── package-lock.json                   # Dependency lock file
├── .gitignore                          # Git ignore patterns
├── tsconfig.json                       # TypeScript project references
├── tsconfig.app.json                   # App-specific TypeScript config
├── tsconfig.node.json                  # Node.js TypeScript config
├── vite.config.ts                      # Vite build configuration
├── vite.config.inline.ts               # Single-file build configuration
├── tailwind.config.js                  # Tailwind CSS configuration
├── postcss.config.js                   # PostCSS processing configuration
├── eslint.config.js                    # ESLint configuration
├── playwright.config.ts                # Playwright testing configuration
├── src/                                # Source code
│   ├── main.tsx                        # Application entry point
│   ├── App.tsx                         # Root application component
│   ├── index.css                       # Global styles and Tailwind imports
│   ├── vite-env.d.ts                   # Vite environment type definitions
│   ├── components/                     # React components
│   │   ├── AppRouter.tsx               # Application routing component
│   │   ├── Dashboard.tsx               # Main dashboard component
│   │   ├── ErrorBoundary.tsx           # Error boundary for error handling
│   │   ├── FormBuilder.tsx             # Form template builder interface
│   │   ├── FormRenderer.tsx            # Dynamic form rendering engine
│   │   └── ProgrammaticImportModal.tsx # Template import modal
│   ├── types/                          # TypeScript type definitions
│   │   ├── form.ts                     # Core form interfaces and types
│   │   └── pdfExport.ts                # PDF export type definitions
│   ├── routes/                         # Route components
│   │   ├── BuilderRoute.tsx            # Form builder route component
│   │   ├── DashboardRoute.tsx          # Dashboard route component
│   │   └── FormRoute.tsx               # Form route component
│   ├── utils/                          # Utility functions
│   │   ├── bundleAnalyzer.ts           # Bundle analysis utilities
│   │   ├── formLogic.ts                # Form validation and logic
│   │   ├── lazyExamples.ts             # Lazy loading examples
│   │   ├── pdfExport.ts                # PDF generation utilities
│   │   └── storage.ts                  # LocalStorage management
│   └── programmatic/                   # Programmatic template system
│       ├── index.ts                    # Main programmatic API exports
│       ├── types.ts                    # Programmatic system types
│       ├── builder/                    # Template building utilities
│       │   └── TemplateBuilder.ts      # Fluent API for template creation
│       ├── control-flow/               # Conditional logic engine
│       │   ├── ConditionEvaluator.ts   # Condition evaluation logic
│       │   ├── ControlFlowEngine.ts    # Flow control orchestration
│       │   └── TemplateContext.ts      # Template execution context
│       ├── examples/                   # Example template implementations
│       │   ├── ComprehensiveEventForm.ts # Complex event form example
│       │   ├── DefaultValueExample.ts  # Default value patterns
│       │   ├── EventFormShowcase.ts    # Showcase template
│       │   ├── JCC2UserQuestionnaire.ts # JCC2 questionnaire template
│       │   └── WorkingComprehensiveTemplate.ts # Working complex example
│       ├── library/                    # Reusable template library
│       │   └── CommonTemplates.ts      # Common template definitions
│       └── tdl/                        # Template Definition Language
│           ├── converter.ts            # TDL to template conversion
│           ├── parser.ts               # TDL parsing logic
│           └── validator.ts            # TDL validation rules
├── templates/                          # Static template definitions
│   ├── conditionals_test.ts            # Conditional logic test template
│   ├── empty_section_test.ts           # Empty section handling test
│   ├── horizontal_grouping_demo.ts     # Horizontal field grouping demo
│   ├── jcc2_questionnaire.ts           # JCC2 questionnaire v1
│   ├── jcc2_questionnaire_v2.ts        # JCC2 questionnaire v2
│   ├── jcc2_questionnaire_v3.ts        # JCC2 questionnaire v3 (current)
│   ├── section_conditionals_test.ts    # Section conditional test
│   ├── simple_conditionals_test.ts     # Simple conditional test
│   ├── test_template.ts                # Basic test template
│   └── text_field_horizontal_test.ts   # Text field horizontal layout test
├── tests/                              # E2E test suite
│   ├── global-setup.ts                 # Playwright global setup
│   ├── app.spec.ts                     # Basic application tests
│   ├── dashboard.spec.ts               # Dashboard functionality tests
│   ├── form-builder.spec.ts            # Form builder tests
│   ├── conditional-logic.spec.ts       # Conditional logic tests
│   ├── data-persistence.spec.ts        # Data persistence tests
│   ├── import-functionality.spec.ts    # Template import tests
│   ├── programmatic-import.spec.ts     # Programmatic import tests
│   ├── programmatic-template-system.spec.ts # Programmatic system tests
│   ├── jcc2-questionnaire-e2e.spec.ts # JCC2 questionnaire E2E tests
│   ├── jcc2-dashboard-form-e2e-working.spec.ts # Working JCC2 E2E tests
│   ├── comprehensive-event-form.spec.ts # Comprehensive form tests
│   ├── event-form-showcase.spec.ts     # Event form showcase tests
│   ├── working-comprehensive-template.spec.ts # Comprehensive template tests
│   ├── prd-requirements.spec.ts        # PRD compliance tests
│   ├── single-html-file.spec.ts        # Single-file build tests
│   ├── form-exit-functionality.spec.ts # Form exit tests
│   └── form-instance-overwrite.spec.ts # Instance overwrite tests
├── docs/                               # Documentation
│   ├── ai-context/                     # AI-specific documentation
│   │   ├── project-structure.md        # This file
│   │   ├── docs-overview.md            # Documentation architecture
│   │   ├── system-integration.md       # Integration patterns
│   │   ├── deployment-infrastructure.md # Infrastructure docs
│   │   ├── handoff.md                  # Task management
│   │   └── MCP-ASSISTANT-RULES.md      # MCP integration rules and patterns
│   ├── COMPREHENSIVE-TEMPLATE-DEMO.md  # Comprehensive template documentation
│   ├── COMPREHENSIVE_CODE_REVIEW.md    # Code review documentation
│   ├── CONTEXT-tier2-component.md      # Component-level context
│   ├── CONTEXT-tier3-feature.md        # Feature-level context
│   ├── CSV_EXPORT_IMPROVEMENTS.md      # CSV export documentation
│   ├── DEFAULT_VALUES_IMPLEMENTATION.md # Default values implementation
│   ├── FIELD_TYPES_AND_PROGRAMMATIC_API.md # Field types and API docs
│   ├── IMPORT-BUTTON-GUIDE.md          # Import functionality guide
│   ├── LAZY_LOADING_IMPLEMENTATION.md  # Lazy loading documentation
│   ├── PHASE-1-IMPLEMENTATION-REPORT.md # Phase 1 implementation report
│   ├── PRD-COMPLIANCE-REPORT.md        # PRD compliance documentation
│   ├── PRD.md                          # Product Requirements Document
│   ├── PROGRAMMATIC-TEMPLATE-SYSTEM-PLAN.md # Programmatic system plan
│   ├── README-mcp-playwright.md        # MCP Playwright documentation
│   ├── README-playwright.md            # Playwright testing guide
│   ├── README.md                       # Documentation overview
│   ├── SINGLE-HTML-IMPLEMENTATION.md   # Single HTML implementation guide
│   ├── open-issues/                    # Open issues documentation
│   │   └── example-api-performance-issue.md # Performance issue tracking
│   └── specs/                          # Technical specifications
│       ├── example-api-integration-spec.md # API integration spec
│       └── example-feature-specification.md # Feature specification template
├── scripts/                            # Automation and testing scripts
│   ├── debug-console.js                # Debug console utilities
│   ├── debug-template-detailed.js      # Detailed template debugging
│   ├── debug-template.js               # Template debugging utilities
│   ├── mcp-test.js                     # MCP testing scripts
│   ├── test-conditionals-templates.js  # Conditional logic testing
│   ├── test-csv-export.js              # CSV export testing
│   ├── test-default-values.js          # Default values testing (JS)
│   ├── test-default-values.ts          # Default values testing (TS)
│   ├── test-import-with-defaults.ts    # Import with defaults testing
│   ├── test-jcc2-defaults.ts           # JCC2 defaults testing
│   ├── test-single-file.js             # Single file testing
│   └── test-web-default-values.ts      # Web default values testing
├── dist/                               # Built application files
├── node_modules/                       # npm dependencies
├── logs/                               # Application logs
├── pdfs/                               # Sample PDF files
│   ├── data_collection_form.pdf        # Sample data collection form
│   └── questionnaire.pdf               # Sample questionnaire
├── assets/                             # Project assets
│   └── screenshots/                    # Screenshot documentation
│       ├── after-import.png            # Import functionality screenshot
│       ├── after-refresh.png           # Refresh functionality screenshot
│       ├── dashboard-full.png          # Full dashboard view
│       ├── dashboard-templates-section.png # Templates section view
│       └── template-ui.png             # Template UI documentation
├── tools/                              # Development and debugging tools
│   ├── debug-jcc2-form.js              # JCC2 form debugging script
│   ├── debug-templates.js              # Template debugging utilities
│   ├── screenshot-dashboard.js         # Dashboard screenshot automation
│   ├── test-common-templates.js        # Common templates testing
│   ├── test-default-templates.js       # Default templates testing
│   ├── test-progress-calculation.js    # Progress calculation testing
│   ├── test-refresh-button.js          # Refresh button testing
│   ├── test-runtime.js                 # Runtime testing utilities
│   ├── test-template-load.js           # Template loading testing
│   └── verify-jcc2-csv.js              # JCC2 CSV verification
├── test-utils/                         # HTML testing utilities
│   ├── force-reload-templates.html     # Template reload utility
│   ├── test-defaults-browser.html      # Browser-based default testing
│   └── test-storage.html               # Storage testing utility
├── playwright-report/                  # Playwright test reports
│   └── index.html                      # Test report viewer
├── test-results/                       # Test result files
│   ├── results.json                    # JSON test results
│   └── results.xml                     # XML test results
└── index.html                          # Main application HTML
```

## Key Architecture Patterns

### Component Architecture
- **Dashboard.tsx** - Central hub for template management and form instances
- **FormBuilder.tsx** - Visual form template creation interface
- **FormRenderer.tsx** - Dynamic form rendering with conditional logic
- **ProgrammaticImportModal.tsx** - Programmatic template import interface

### Programmatic Template System
- **TemplateBuilder.ts** - Fluent API for creating form templates programmatically
- **ConditionEvaluator.ts** - Evaluates conditional logic for field visibility
- **ControlFlowEngine.ts** - Orchestrates form flow and section progression
- **TDL (Template Definition Language)** - Custom DSL for template definition

### Data Flow
1. Templates stored in localStorage with unique IDs
2. Form instances track progress and data separately from templates
3. Conditional logic evaluated in real-time during form interaction
4. Export system generates PDFs, CSV, and JSON from completed forms

### Testing Strategy
- **Playwright E2E tests** - Full user journey testing
- **Component isolation tests** - Individual component behavior
- **Template validation tests** - Programmatic template correctness
- **Export functionality tests** - Multi-format export validation

---

*This structure supports a comprehensive form management system with dynamic templating, conditional logic, and multiple export formats. The programmatic API enables complex form creation while maintaining type safety and validation.*