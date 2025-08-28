# CopilotKit Integration Patterns

This document provides standardized patterns for integrating CopilotKit into the Langflow Architect application. Following these conventions ensures consistency and leverages the full power of CopilotKit.

## Environment Variables

All CopilotKit-related environment variables should be prefixed with `COPILOTKIT_`.

### Required Variables
-   `COPILOTKIT_API_KEY`: The API key for the CopilotKit service.
-   `OPENAI_API_KEY`: The API key for OpenAI models.

### Optional Variables
-   `COPILOTKIT_RUNTIME_URL`: The URL for the CopilotKit runtime endpoint. Defaults to `/api/copilotkit`.

## Technical Constraints

-   **Streaming by Default**: All CopilotKit actions should support streaming to provide real-time feedback to the user.
-   **Error Handling**: Use the built-in error handling mechanisms of CopilotKit to manage API failures and other exceptions gracefully.
-   **Context Management**: Leverage `useCopilotReadable` to provide relevant context to the CopilotKit runtime, improving the quality of AI-driven suggestions and actions.
-   **Action Naming**: Action names should be descriptive and follow a `verb_noun` pattern (e.g., `create_workflow`, `analyze_requirements`).
