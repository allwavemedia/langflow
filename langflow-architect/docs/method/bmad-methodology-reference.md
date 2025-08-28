# BMad Methodology Reference Guide

## Overview
This document provides a comprehensive reference for applying BMad methodology to the Langflow Architect project. It centralizes command usage, agent coordination patterns, and workflow guidance.

## BMad Agent Transformation Patterns

### Available Agents
```bash
*agent architect    # Technical architecture and system design
*agent dev          # Implementation, coding, technical problem-solving
*agent qa           # Testing strategy, quality validation, performance verification
*agent pm           # Project coordination, requirements management, timeline planning
*agent analyst      # Domain expertise, requirements analysis, user research
*agent ux-expert    # User experience design, interface patterns, usability
```

### Agent Selection Guidelines

#### **Use Architect When:**
- Designing system architecture and component relationships
- Making technical decisions about frameworks and patterns
- Creating technical specifications and integration plans
- Validating technical approaches and design patterns

#### **Use Developer When:**
- Implementing features and writing code
- Resolving technical issues and debugging
- Creating technical components and modules
- Optimizing performance and code quality

#### **Use QA When:**
- Designing testing strategies and validation approaches
- Creating test cases and quality metrics
- Validating system functionality and performance
- Ensuring production readiness and quality standards

#### **Use PM When:**
- Coordinating project activities and timelines
- Managing epic and story organization
- Tracking progress and milestone achievements
- Facilitating team communication and handoffs

#### **Use Analyst When:**
- Researching domain requirements and user needs
- Analyzing business requirements and technical constraints
- Creating requirement specifications and acceptance criteria
- Conducting competitive analysis and market research

#### **Use UX Expert When:**
- Designing user interfaces and interaction patterns
- Creating user experience flows and wireframes
- Conducting usability analysis and improvement recommendations
- Ensuring accessibility and design consistency

## BMad Command Reference

### Core Commands
```bash
*help                    # Display available commands and workflows
*agent [name]           # Transform into specific agent role
*task [name]            # Execute specific task within current agent
*workflow [name]        # Start structured workflow process
*checklist [name]       # Execute validation checklist
*status                 # Show current progress and context
```

### Project-Specific Tasks

#### Architecture Tasks
```bash
*task create-architecture-design     # Design system architecture
*task validate-technical-approach    # Validate technical decisions
*task design-integration-plan        # Plan component integration
*task review-component-architecture  # Review existing architecture
```

#### Development Tasks
```bash
*task implement-feature              # Implement specific functionality
*task code-quality-optimization      # Optimize code quality and resolve issues
*task create-technical-component     # Build technical components
*task fix-build-failures            # Resolve compilation and build issues
```

#### Quality Assurance Tasks
```bash
*task create-test-strategy          # Design testing approach
*task validate-system-functionality # Test system functionality
*task performance-validation        # Validate performance metrics
*task quality-gate-assessment       # Assess quality criteria
```

#### Project Management Tasks
```bash
*task document-restructuring-analysis  # Analyze document organization
*task brownfield-create-epic           # Create new epic structure
*task brownfield-create-story          # Create detailed user stories
*task project-coordination             # Coordinate project activities
```

#### Analysis Tasks
```bash
*task advanced-elicitation            # Deep requirements gathering
*task create-domain-detection-system  # Design domain expertise system
*task domain-research                 # Research domain-specific patterns
*task requirements-analysis           # Analyze business requirements
```

#### UX Tasks
```bash
*task design-user-experience         # Design user interaction patterns
*task create-interface-design        # Create UI/UX designs
*task usability-analysis            # Analyze user experience quality
*task accessibility-validation       # Ensure accessibility compliance
```

### Workflow Patterns

#### Brownfield Enhancement Workflow
```bash
*workflow brownfield-enhancement
```
**Purpose**: Systematic approach to enhancing existing systems
**Phases**: Analysis → Architecture → Implementation → Testing → Deployment

#### API Integration Workflow
```bash
*workflow api-integration
```
**Purpose**: Structured approach to external service integration
**Phases**: Research → Design → Implementation → Testing → Documentation

#### Domain Expertise Workflow
```bash
*workflow domain-expertise
```
**Purpose**: Implementing domain-specific intelligence and guidance
**Phases**: Research → Design → Implementation → Testing → Validation

### Validation Checklists

#### Architecture Validation
```bash
*checklist architect-checklist
```
**Purpose**: Validate architectural decisions and technical approach
**Coverage**: Design patterns, scalability, maintainability, integration

#### Story Definition of Done
```bash
*checklist story-dod-checklist
```
**Purpose**: Ensure user stories meet completion criteria
**Coverage**: Acceptance criteria, technical requirements, testing, documentation

#### Change Management
```bash
*checklist change-checklist
```
**Purpose**: Validate changes against project standards
**Coverage**: Impact analysis, testing, documentation, deployment readiness

## Agent Coordination Patterns

### Sequential Agent Handoffs
```bash
# Analysis → Architecture → Implementation
*agent analyst
*task requirements-analysis
*agent architect
*task create-architecture-design
*agent dev
*task implement-feature
```

### Parallel Agent Work
```bash
# Simultaneous work on different aspects
*agent dev          # Feature implementation
*agent qa           # Test strategy development
*agent ux-expert    # Interface design
```

### Quality Validation Cycle
```bash
# Implementation → QA → PM coordination
*agent dev
*task implement-feature
*agent qa
*task validate-system-functionality
*agent pm
*task project-coordination
```

## Document Organization Standards

### Epic Structure
- **Location**: `docs/stories/epic-[number]-[name].md`
- **Content**: User stories with acceptance criteria
- **Format**: BMad-compliant story structure
- **Dependencies**: Clear epic relationships and progression

### Implementation Plans
- **Location**: `docs/phase-[number]-implementation-plan.md`
- **Content**: Technical implementation details and timelines
- **Format**: Architecture, requirements, deliverables, metrics
- **Scope**: Phase-specific technical guidance

### Architecture Documentation
- **Location**: `docs/[component]-architecture.md`
- **Content**: System design and technical specifications
- **Format**: Architecture decisions, patterns, integration points
- **Audience**: Technical team and stakeholders

### Status Tracking
- **Location**: `docs/implementation-roadmap.md`
- **Content**: High-level progress and strategic direction
- **Format**: Current status, completed phases, next priorities
- **Frequency**: Updated with major milestone completion

## Quality Standards

### Definition of Done
- [ ] Acceptance criteria met for all user stories
- [ ] Technical requirements implemented and tested
- [ ] Code quality standards maintained (ESLint clean, TypeScript compliant)
- [ ] Documentation updated and current
- [ ] BMad methodology followed throughout development

### Technical Standards
- **TypeScript Compliance**: 100% strict typing
- **Code Quality**: Zero ESLint warnings
- **Test Coverage**: Comprehensive testing for critical paths
- **Performance**: No regression in build or runtime performance
- **Documentation**: Current and accurate technical documentation

### Process Standards
- **Agent Usage**: Appropriate agent selection for each task type
- **Task Execution**: Proper BMad task patterns and workflows
- **Document Organization**: BMad-compliant structure and content
- **Quality Validation**: Checklist usage for validation and approval

## Project-Specific Guidelines

### Langflow Architect Context
- **Domain**: AI workflow design and generation
- **Technology Stack**: Next.js, TypeScript, CopilotKit, MCP
- **Architecture**: Standalone web application with AI integration
- **User Base**: Non-technical users creating Langflow workflows

### Phase 4 Focus Areas
- **Domain Detection**: Automatic expertise activation
- **Compliance Intelligence**: Regulatory guidance integration
- **Socratic Questioning**: Adaptive conversation patterns
- **Code Quality**: ESLint warning resolution and optimization

### Success Metrics
- **User Experience**: Intuitive workflow creation process
- **Technical Quality**: Production-ready code with zero warnings
- **Domain Coverage**: Support for multiple industry domains
- **Compliance**: Regulatory framework integration and validation

This reference guide ensures consistent BMad methodology application throughout the Langflow Architect development process.
