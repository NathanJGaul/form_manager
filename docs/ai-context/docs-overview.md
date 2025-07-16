# Documentation Architecture

This project uses a **3-tier documentation system** that organizes knowledge by stability and scope, enabling efficient AI context loading and scalable development.

## How the 3-Tier System Works

**Tier 1 (Foundation)**: Stable, system-wide documentation that rarely changes - architectural principles, technology decisions, cross-component patterns, and core development protocols.

**Tier 2 (Component)**: Architectural charters for major components - high-level design principles, integration patterns, and component-wide conventions without feature-specific details.

**Tier 3 (Feature-Specific)**: Granular documentation co-located with code - specific implementation patterns, technical details, and local architectural decisions that evolve with features.

This hierarchy allows AI agents to load targeted context efficiently while maintaining a stable foundation of core knowledge.

## Documentation Principles
- **Co-location**: Documentation lives near relevant code
- **Smart Extension**: New documentation files created automatically when warranted
- **AI-First**: Optimized for efficient AI context loading and machine-readable patterns

## Tier 1: Foundational Documentation (System-Wide)

- **[Master Context](/CLAUDE.md)** - *Essential for every session.* Coding standards, security requirements, MCP server integration patterns, and development protocols
- **[Project Structure](/docs/ai-context/project-structure.md)** - *REQUIRED reading.* Complete technology stack, file tree, and system architecture
- **[Documentation Overview](/docs/ai-context/docs-overview.md)** - *This file.* Documentation architecture and organization guide
- **[Product Requirements](/docs/PRD.md)** - *Core requirements.* Product vision, features, and success criteria
- **[README](/README.md)** - *Project overview.* Quick start guide, features, and installation instructions

## Tier 2: Component & System Documentation

### Core Systems
- **[Programmatic Template System](/docs/PROGRAMMATIC-TEMPLATE-SYSTEM-PLAN.md)** - *Template engine architecture.* Builder patterns, fluent API design, and extensibility
- **[Field Types and API](/docs/FIELD_TYPES_AND_PROGRAMMATIC_API.md)** - *API reference.* Complete field type documentation and programmatic API guide
- **[Compound Conditionals](/docs/compound-conditionals-implementation.md)** - *Advanced conditional logic.* AND/OR operators, nested conditions, and evaluation patterns

### Features & Functionality
- **[CSV Export System](/docs/CSV_EXPORT_IMPROVEMENTS.md)** - *Export functionality.* CSV generation, data formatting, and integrity validation
- **[Default Values](/docs/DEFAULT_VALUES_IMPLEMENTATION.md)** - *Default value patterns.* Implementation strategy and usage patterns
- **[N/A Section Functionality](/docs/na-section-functionality.md)** - *Section management.* N/A status handling and user experience patterns
- **[Developer Tools Suite](/docs/developer-tools-suite.md)** - *Development utilities.* Mock data generation, CSV integrity checking, and debugging tools
- **[Import Functionality](/docs/IMPORT-BUTTON-GUIDE.md)** - *Template import.* File upload, validation, and processing
- **[Lazy Loading](/docs/LAZY_LOADING_IMPLEMENTATION.md)** - *Performance optimization.* Lazy loading patterns and implementation

### Testing & Quality
- **[Playwright Testing](/docs/README-playwright.md)** - *E2E testing guide.* Test patterns, best practices, and configuration
- **[MCP Playwright Integration](/docs/README-mcp-playwright.md)** - *MCP testing.* Server integration for automated testing
- **[PRD Compliance](/docs/PRD-COMPLIANCE-REPORT.md)** - *Requirement tracking.* Compliance status and implementation coverage

### Implementation Reports
- **[Phase 1 Implementation](/docs/PHASE-1-IMPLEMENTATION-REPORT.md)** - *Initial implementation.* Core features and architecture decisions
- **[Comprehensive Template Demo](/docs/COMPREHENSIVE-TEMPLATE-DEMO.md)** - *Template showcase.* Complex template examples and patterns
- **[Single HTML Implementation](/docs/SINGLE-HTML-IMPLEMENTATION.md)** - *Build configuration.* Single-file HTML build process

## Tier 3: Feature-Specific Documentation

### Component Context Templates
- **[Component Template](/docs/CONTEXT-tier2-component.md)** - *Template for component docs.* Structure for creating new component documentation
- **[Feature Template](/docs/CONTEXT-tier3-feature.md)** - *Template for feature docs.* Structure for creating new feature documentation

### Planned Feature Documentation
Future granular CONTEXT.md files will be created as components grow:
- `/src/components/CONTEXT.md` - React component patterns and conventions
- `/src/programmatic/CONTEXT.md` - Programmatic API implementation details
- `/src/utils/CONTEXT.md` - Utility function patterns and usage
- `/src/types/CONTEXT.md` - Type system organization and patterns

## Project-Specific Documentation

### Templates
The `/templates/` directory contains example form templates:
- **jcc2_questionnaire_v4.ts** - Current JCC2 questionnaire implementation
- Various test templates for conditional logic, layout, and features

### Scripts & Tools
The `/scripts/` and `/tools/` directories contain development utilities:
- Debug scripts for template validation
- Testing utilities for various features
- CSV export verification tools

## Adding New Documentation

### New Feature Documentation
1. Create documentation in `/docs/` with descriptive filename
2. Add entry to this file under appropriate tier
3. Follow existing naming patterns (FEATURE-NAME.md or feature-name.md)

### New Component
1. When a component grows significantly (5+ files), create `/component/CONTEXT.md`
2. Add entry to this file under Tier 3
3. Document component-specific patterns and architecture

### Updating Documentation
1. Keep documentation current with implementation
2. Update this overview when adding/removing documentation files
3. Maintain clear tier separation

---

*This documentation architecture enables efficient AI context loading while maintaining comprehensive project knowledge. The 3-tier system minimizes documentation cascade effects and supports scalable development.*