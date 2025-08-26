# Langflow Architect - Standalone Application

A standalone Socratic AI architect application for generating Langflow workflows through intelligent questioning and guidance. This project leverages CopilotKit to provide a professional chat interface with advanced AI integration capabilities.

## Project Overview

The Langflow Architect is designed as a standalone web application that helps users create complex Langflow workflows through an intelligent Socratic questioning process. The application guides users from initial project concepts to fully realized, production-ready Langflow JSON configurations.

## Technology Stack

- **Frontend**: Next.js 14+ with React and TypeScript
- **AI Interface**: CopilotKit for chat components and AI integration
- **Backend**: Next.js API Routes with CopilotKit Runtime
- **AI Engine**: OpenAI GPT-5 with function calling and streaming
- **Deployment**: Vercel platform with KV storage
- **State Management**: CopilotKit conversation state management

## Project Structure

```
langflow-architect/
├── README.md                 # This file
├── docs/                     # Project documentation
│   ├── prd-standalone.md     # Product Requirements Document
│   ├── architecture-standalone.md  # Technical Architecture
│   ├── implementation-roadmap.md   # Implementation timeline
│   └── stories/              # User stories and epics
│       ├── epic-1-foundation.md
│       ├── epic-2-socratic-engine.md
│       ├── epic-3-json-generation.md
│       └── epic-4-deployment-ux.md
└── bmad-core/                # BMad Method framework files
    ├── core-config.yaml      # BMad configuration
    ├── data/                 # Knowledge base and reference data
    ├── tasks/                # BMad methodology tasks
    ├── workflows/            # BMad workflow definitions
    └── utils/                # Utility templates and tools
```

## Key Features

### Socratic Questioning Engine
- **8+ Question Categories**: Technical architecture, user experience, integration requirements, performance considerations, security needs, deployment preferences, team dynamics, and business constraints
- **Context-Aware Progression**: Dynamic question flow based on user responses and expertise level
- **Intelligent Branching**: Smart follow-up questions based on project type and complexity

### CopilotKit Integration
- **Professional Chat Interface**: Pre-built chat components (CopilotChat, CopilotSidebar, CopilotPopup)
- **Action System**: Structured data generation for workflow components
- **Streaming Support**: Real-time response generation with live updates
- **Generative UI**: Live workflow preview as conversations progress

### Langflow JSON Generation
- **Schema Validation**: 100% compatibility with current Langflow versions
- **Complex Patterns**: Support for loops, conditions, and advanced workflow structures
- **Export Capabilities**: Multiple format export with implementation guides
- **Template Library**: Proven patterns and reusable components

## Development Phases

1. **Foundation (Weeks 1-4)**: Next.js + CopilotKit setup, basic chat interface
2. **Socratic Engine (Weeks 5-8)**: Advanced questioning system with CopilotKit actions
3. **JSON Generation (Weeks 9-12)**: Workflow generation and export capabilities
4. **Production (Weeks 13-16)**: Deployment, polish, and launch preparation

## Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API access
- Vercel account (for deployment)

### Development Setup
```bash
# Clone and navigate to project
cd langflow-architect

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your OpenAI API key

# Start development server
npm run dev
```

### Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Documentation

- **[Product Requirements](./docs/prd-standalone.md)**: Comprehensive product specification
- **[Technical Architecture](./docs/architecture-standalone.md)**: CopilotKit-based architecture design
- **[Implementation Roadmap](./docs/implementation-roadmap.md)**: 16-week development timeline
- **[User Stories](./docs/stories/)**: Detailed epic breakdown with acceptance criteria

## BMad Method Integration

This project leverages the BMad Method framework for systematic development and quality assurance. The `bmad-core/` directory contains:

- **Knowledge Base**: Technical best practices and patterns
- **Workflows**: Development process templates
- **Tasks**: Structured development activities
- **Data**: Reference materials and methodologies

## Success Metrics

- **User Completion Rate**: >85% successfully generate Langflow JSON
- **JSON Validity**: 100% schema compliance
- **Response Time**: <3 seconds for chat interactions
- **User Satisfaction**: >4.5/5 rating for ease of use

## Contributing

This project follows the BMad Method development practices. See the workflow definitions in `bmad-core/workflows/` for detailed contribution guidelines.

## License

[License information to be determined]

---

**Note**: This is the standalone version of the Langflow Architect, designed to be independent of the main Langflow platform while maintaining full compatibility with Langflow workflow formats.
