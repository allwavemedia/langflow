// Enhanced Library Index - Epic 6: User-Friendly MCP Server Integration
// Exports all enhanced components for easy importing

export { contextEngine } from './contextEngine';
export { mcpManager } from './mcpManager';
// TODO: Phase 2 - Re-enable when EnhancedCopilotManager is fully compatible
// export { EnhancedCopilotManager, createEnhancedCopilotManager } from './EnhancedCopilotManager';

// Search Manager
export { searchManager, SearchManager } from './searchManager';

// Multi-Source Knowledge Integration
export { multiSourceKnowledge, MultiSourceKnowledge } from './multiSourceKnowledge';

// MCP Tool Utilities - Based on CopilotKit Official Patterns
export {
  generateMcpToolInstructions,
  extractParametersFromSchema,
  normalizeToolArgs,
  processStringifiedJsonArgs,
  convertToMcpEndpointConfig,
  validateMcpServerUrl,
  getExampleMcpServers,
  type MCPTool,
  type Parameter,
  type JsonSchemaProperty,
} from './mcpToolUtils';

export type {
  ContextAnalysis
} from './contextEngine';

export type {
  McpServerConfig,
  McpQueryResponse,
  McpQueryOptions
} from './mcpManager';

// TODO: Phase 2 - Re-enable when EnhancedCopilotManager is fully compatible
/*
export type {
  CopilotAction,
  EnhancedCopilotConfig
} from './EnhancedCopilotManager';
*/

// Re-export MCP types for convenience
export type {
  McpTemplate,
  McpServerHealth,
  McpConfiguration,
  McpConnectionTestResult,
  McpTransport,
} from '@/types/mcp';
