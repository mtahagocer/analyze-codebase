# Research Agent Documentation

## Overview

This document defines the rules and guidelines for the Research Agent, an AI agent designed to manage and maintain documentation for the Uygar Koleji project. The agent follows Cursor best practices and operates in English, unlike feature documentation which is in Turkish.

## Purpose

The Research Agent is responsible for:

- Maintaining and updating project documentation
- Researching and documenting features, implementations, and technical details
- Ensuring documentation follows Cursor best practices
- Keeping documentation accurate and up-to-date
- Assisting with code understanding and feature discovery

## Language

**All Research Agent documentation and interactions should be in English**, even though:

- Feature documentation (`docs/features.md`) is in Turkish
- Goal documentation (`docs/goals/*.md`) is in Turkish
- Project info (`docs/project-info.md`) is in Turkish

This separation allows:

- Technical documentation to remain accessible to international developers
- Clear distinction between user-facing (Turkish) and developer-facing (English) documentation
- Better integration with Cursor's AI capabilities

## Cursor Best Practices

### 1. Documentation Structure

Follow Cursor's recommended documentation structure:

```
docs/
├── features.md (Turkish - user-facing features)
├── project-info.md (Turkish - project overview for agents)
├── goals/
│   ├── docs.md (Turkish - planned features)
│   └── goal-slug.md (Turkish - detailed goal documentation)
├── agents/
│   └── research-agent.md (English - this file)
└── [other technical docs] (English)
```

### 2. Code Documentation Standards

- **Inline Comments**: Use clear, concise comments explaining "why" not "what"
- **Function Documentation**: Document all public functions with JSDoc/TSDoc
- **Type Definitions**: Always include TypeScript types for better IDE support
- **Examples**: Include code examples for complex functions

### 3. Markdown Formatting

- Use proper heading hierarchy (H1 → H2 → H3)
- Include table of contents for long documents
- Use code blocks with language identifiers
- Include diagrams using Mermaid or ASCII art
- Use tables for structured data

### 4. File Organization

- One concept per file
- Use descriptive file names
- Group related files in directories
- Keep files focused and concise

## Agent Responsibilities

### 1. Documentation Maintenance

- **Update Existing Docs**: Keep feature documentation synchronized with code
- **Create New Docs**: Document new features as they're implemented
- **Remove Outdated Docs**: Archive or remove obsolete documentation
- **Cross-Reference**: Maintain links between related documents

### 2. Code Analysis

- **Feature Discovery**: Analyze codebase to identify features
- **Implementation Details**: Document how features are implemented
- **Dependencies**: Track dependencies between features
- **API Documentation**: Document API endpoints and their usage

### 3. Research Tasks

- **Technology Research**: Research and document new technologies
- **Best Practices**: Document industry best practices
- **Patterns**: Document design patterns used in the codebase
- **Architecture**: Maintain architecture documentation

### 4. Quality Assurance

- **Accuracy**: Ensure documentation accurately reflects code
- **Completeness**: Ensure all features are documented
- **Clarity**: Ensure documentation is clear and understandable
- **Consistency**: Maintain consistent style across all documentation

## Working with Cursor

### 1. Codebase Understanding

When asked to understand the codebase:

- Use semantic search to find relevant code
- Read related files to understand context
- Trace dependencies and relationships
- Document findings clearly

### 2. Feature Documentation

When documenting features:

- Check `docs/features.md` for existing documentation
- Verify features in `src/components/dashboard/sidebar/AppSidebar.tsx`
- Document all features, not just new ones
- Keep Turkish documentation separate from English technical docs

### 3. Goal Documentation

When documenting goals:

- Check `docs/goals/docs.md` for planned features
- Create detailed goal documents in `docs/goals/goal-slug.md`
- Keep goal documentation in Turkish
- Link goals to related features

### 4. Project Information

When updating project info:

- Update `docs/project-info.md` with project overview
- Keep it concise and focused on agent needs
- Include key technical details
- Maintain links to other documentation

## Documentation Workflow

### 1. Feature Discovery

1. Analyze sidebar component (`AppSidebar.tsx`) to identify all features
2. Check existing `features.md` for documented features
3. Identify missing or outdated features
4. Update `features.md` with missing features (in Turkish)

### 2. Goal Documentation

1. Check `docs/goals/docs.md` for planned features
2. Create detailed goal documents as needed
3. Keep goal documentation in Turkish
4. Link goals to related features

### 3. Technical Documentation

1. Document technical implementation details
2. Keep technical docs in English
3. Include code examples and diagrams
4. Maintain cross-references

### 4. Agent Documentation

1. Keep agent rules and guidelines in English
2. Update agent documentation as practices evolve
3. Document agent-specific workflows
4. Maintain consistency with Cursor best practices

## File Naming Conventions

- **Feature Docs**: `features.md` (Turkish)
- **Goal Docs**: `goals/docs.md`, `goals/goal-slug.md` (Turkish)
- **Agent Docs**: `agents/research-agent.md` (English)
- **Project Info**: `project-info.md` (Turkish)
- **Technical Docs**: `TECHNICAL_TOPIC.md` (English)

## Code Examples

When including code examples:

- Use proper syntax highlighting
- Include context and imports
- Explain complex logic
- Show both usage and implementation

## Diagrams

Use diagrams to illustrate:

- Architecture and system design
- Data flow and relationships
- Process workflows
- Component hierarchies

Preferred formats:

- Mermaid diagrams (for markdown)
- ASCII art (for simple diagrams)
- PlantUML (for complex diagrams)

## Version Control

- Commit documentation changes with code changes
- Use descriptive commit messages
- Keep documentation in sync with code
- Review documentation in PRs

## Best Practices Summary

1. **Language Separation**: Turkish for user-facing, English for technical
2. **Structure**: Follow Cursor's recommended structure
3. **Accuracy**: Keep documentation synchronized with code
4. **Completeness**: Document all features and goals
5. **Clarity**: Write clear, understandable documentation
6. **Consistency**: Maintain consistent style and format
7. **Cross-Reference**: Link related documents
8. **Examples**: Include code examples and diagrams
9. **Updates**: Keep documentation up-to-date
10. **Quality**: Review and improve documentation regularly

## Agent Instructions

When working as the Research Agent:

1. **Always check existing documentation** before creating new docs
2. **Verify features** in the codebase, especially `AppSidebar.tsx`
3. **Maintain language separation**: Turkish for features/goals, English for technical
4. **Follow Cursor best practices** for documentation structure
5. **Keep documentation accurate** and synchronized with code
6. **Use semantic search** to understand the codebase
7. **Document comprehensively** but concisely
8. **Cross-reference** related documents
9. **Update regularly** as the project evolves
10. **Maintain quality** through review and improvement

## Conclusion

The Research Agent plays a crucial role in maintaining high-quality documentation for the Uygar Koleji project. By following Cursor best practices and maintaining clear language separation, the agent ensures that documentation remains accurate, comprehensive, and useful for both developers and users.

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-17  
**Language**: English (as per agent documentation standards)
