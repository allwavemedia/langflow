// MCP Server Integration Types for Epic 6: User-Friendly MCP Server Integration

export interface McpTransport {
  type: 'sse' | 'stdio' | 'http';
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  headers?: Record<string, string>;
}

export interface McpServerConfig {
  id: string;
  name: string;
  description?: string;
  transport: McpTransport;
  capabilities?: string[];
  metadata?: {
    category: string;
    icon?: string;
    version?: string;
    author?: string;
    rating?: number;
    tags?: string[];
  };
  enabled: boolean;
  userAdded: boolean;
  createdAt: Date;
  updatedAt: Date;
  healthStatus?: 'healthy' | 'unhealthy' | 'unknown';
  lastChecked?: Date;
}

export interface McpTemplate {
  id: string;
  name: string;
  description: string;
  config: Partial<McpServerConfig>;
  requiredFields: string[];
  category: string;
  isPublic: boolean;
  author?: string;
  version: string;
  tags?: string[];
}

export interface McpServerHealth {
  serverId: string;
  status: 'healthy' | 'unhealthy' | 'checking' | 'unknown';
  lastChecked: Date;
  responseTime?: number;
  errorMessage?: string;
  capabilities?: string[];
}

export interface McpMarketplaceEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  version: string;
  rating: number;
  downloads: number;
  transport: McpTransport;
  capabilities: string[];
  tags: string[];
  icon?: string;
  documentation?: string;
  repository?: string;
  featured: boolean;
}

export interface McpConnectionTestResult {
  success: boolean;
  responseTime: number;
  capabilities?: string[];
  error?: string;
  errorMessage?: string;
  serverInfo?: {
    name: string;
    version: string;
    protocolVersion: string;
  };
}

export interface McpServerUsageStats {
  serverId: string;
  requestCount: number;
  successCount: number;
  failureCount: number;
  averageResponseTime: number;
  lastUsed?: Date;
}

// Validation schemas
// Configuration structure
export interface McpConfiguration {
  servers: McpServerConfig[];
  templates: McpTemplate[];
  settings: {
    autoStart: boolean;
    healthCheckInterval: number;
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
  };
  version: string;
  lastUpdated: Date;
}

// Validation schemas
export const DEFAULT_SSE_ENDPOINT = 'https://mcp.copilotkit.ai/sse';

export const MCP_CATEGORIES = [
  'Web Search',
  'File Operations', 
  'API Integrations',
  'Database',
  'Development Tools',
  'Productivity',
  'Communication',
  'Analytics',
  'Security',
  'Other'
] as const;

export type McpCategory = typeof MCP_CATEGORIES[number];

export const MCP_TRANSPORT_TYPES = ['sse', 'stdio', 'http'] as const;
export type McpTransportType = typeof MCP_TRANSPORT_TYPES[number];
