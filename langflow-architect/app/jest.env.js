// Jest environment variables
process.env.OPENAI_API_KEY = 'test-api-key'
process.env.COPILOTKIT_DEBUG = 'true'
process.env.NODE_ENV = 'test'

// Phase 2 enhancement environment variables for testing
process.env.GITHUB_TOKEN = 'test-github-token'
process.env.TAVILY_API_KEY = 'test-tavily-key'
process.env.FEATURE_SEARCH = 'false'
process.env.FEATURE_DOCS_GROUNDING = 'false'
process.env.FEATURE_MCP_ORCHESTRATION = 'false'
