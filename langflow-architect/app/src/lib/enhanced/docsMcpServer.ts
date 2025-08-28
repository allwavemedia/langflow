// DocsMcpServer - Phase 2: Build a lightweight MCP "Langflow Docs" server that serves schema, components, and samples; add a webhook endpoint to refresh cache on doc updates

import { docsIngestionService } from './docsIngestionService';
import { langflowSchemaRegistry } from './langflowSchemaRegistry';

interface McpDocRequest {
  method: string;
  params?: {
    query?: string;
    category?: string;
    type?: string;
    limit?: number;
  };
}

interface DocParams {
  query?: string;
  category?: string;
  type?: string;
  limit?: number;
  workflow?: {
    data?: {
      nodes?: unknown[];
      edges?: unknown[];
    };
    name?: string;
    description?: string;
  };
}

interface WebhookPayload {
  commits?: Array<{
    modified?: string[];
    added?: string[];
    removed?: string[];
  }>;
}

interface McpDocResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  sources?: string[];
  timestamp: string;
}

interface DocsMcpServerOptions {
  enableWebhook?: boolean;
  webhookSecret?: string;
  cacheRefreshInterval?: number;
}

export class DocsMcpServer {
  private isInitialized: boolean = false;
  private lastRefresh: Date | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;
  private options: DocsMcpServerOptions;

  constructor(options: DocsMcpServerOptions = {}) {
    this.options = {
      enableWebhook: true,
      webhookSecret: process.env.DOCS_WEBHOOK_SECRET || 'langflow-docs-webhook',
      cacheRefreshInterval: parseInt(process.env.DOCS_CACHE_REFRESH_INTERVAL || '3600000'), // 1 hour
      ...options
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      console.log('Initializing DocsMcpServer...');
      
      // Initial documentation ingestion
      await this.refreshDocumentation();
      
      // Set up periodic refresh
      if (this.options.cacheRefreshInterval && this.options.cacheRefreshInterval > 0) {
        this.refreshInterval = setInterval(() => {
          this.refreshDocumentation().catch(error => {
            console.error('Scheduled documentation refresh failed:', error);
          });
        }, this.options.cacheRefreshInterval);
      }

      this.isInitialized = true;
      console.log('DocsMcpServer initialized successfully');
      
    } catch (error) {
      console.error('DocsMcpServer initialization failed:', error);
    }
  }

  async handleRequest(request: McpDocRequest): Promise<McpDocResponse> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'DocsMcpServer not initialized',
        timestamp: new Date().toISOString()
      };
    }

    try {
      switch (request.method) {
        case 'getDocumentation':
          return await this.getDocumentation(request.params);
          
        case 'getComponents':
          return await this.getComponents(request.params);
          
        case 'getSchemas':
          return await this.getSchemas(request.params);
          
        case 'searchDocumentation':
          return await this.searchDocumentation(request.params);
          
        case 'validateWorkflow':
          return await this.validateWorkflow(request.params);
          
        case 'getServerStatus':
          return this.getServerStatus();
          
        case 'refreshCache':
          return await this.refreshCache();
          
        default:
          return {
            success: false,
            error: `Unknown method: ${request.method}`,
            timestamp: new Date().toISOString()
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Request processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async getDocumentation(params?: DocParams): Promise<McpDocResponse> {
    try {
      const category = params?.category;
      const limit = params?.limit || 50;
      
      // Get cached documentation from the ingestion service
      const docs = await docsIngestionService.ingestDocumentation();
      
      let filteredDocs = docs;
      if (category) {
        filteredDocs = docs.filter(doc => doc.category === category);
      }
      
      // Limit results
      const limitedDocs = filteredDocs.slice(0, limit);
      
      return {
        success: true,
        data: {
          documentation: limitedDocs.map(doc => ({
            path: doc.path,
            type: doc.type,
            category: doc.category,
            lastUpdated: doc.lastUpdated,
            version: doc.version,
            content: doc.content.substring(0, 1000) // Truncate for overview
          })),
          total: filteredDocs.length,
          categories: [...new Set(docs.map(doc => doc.category))]
        },
        sources: ['Langflow Official Documentation'],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get documentation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async getComponents(params?: DocParams): Promise<McpDocResponse> {
    try {
      const category = params?.category;
      const limit = params?.limit || 50;
      
      let components = langflowSchemaRegistry.getAvailableComponents();
      
      if (category) {
        components = langflowSchemaRegistry.getComponentsByCategory(category);
      }
      
      const limitedComponents = components.slice(0, limit);
      
      return {
        success: true,
        data: {
          components: limitedComponents.map(component => ({
            id: component.id,
            type: component.type,
            displayName: component.displayName,
            description: component.description,
            category: component.metadata.category,
            inputs: component.inputs.map(input => ({
              name: input.name,
              displayName: input.displayName,
              type: input.type,
              required: input.required,
              description: input.description
            })),
            outputs: component.outputs.map(output => ({
              name: output.name,
              displayName: output.displayName,
              type: output.type,
              description: output.description
            })),
            metadata: component.metadata
          })),
          total: components.length,
          categories: [...new Set(components.map(c => c.metadata.category))]
        },
        sources: ['Langflow Schema Registry'],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get components: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async getSchemas(_params?: DocParams): Promise<McpDocResponse> {
    try {
      const stats = langflowSchemaRegistry.getCacheStatistics();
      
      return {
        success: true,
        data: {
          schemaStatistics: stats,
          availableSchemas: ['workflow', 'component', 'node', 'edge'],
          validationSupported: true,
          lastUpdated: stats.lastUpdated
        },
        sources: ['Langflow Schema Registry'],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get schemas: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async searchDocumentation(params?: DocParams): Promise<McpDocResponse> {
    try {
      const query = params?.query;
      const category = params?.category;
      const limit = params?.limit || 20;
      
      if (!query) {
        return {
          success: false,
          error: 'Query parameter is required for search',
          timestamp: new Date().toISOString()
        };
      }
      
      const searchResults = docsIngestionService.searchDocumentation(query, category);
      const limitedResults = searchResults.slice(0, limit);
      
      return {
        success: true,
        data: {
          results: limitedResults.map(result => ({
            path: result.path,
            type: result.type,
            category: result.category,
            lastUpdated: result.lastUpdated,
            version: result.version,
            snippet: this.extractSnippet(result.content, query),
            relevanceScore: this.calculateRelevanceScore(result.content, query)
          })),
          query,
          total: searchResults.length,
          category: category || 'all'
        },
        sources: ['Langflow Documentation Search'],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async validateWorkflow(params?: DocParams): Promise<McpDocResponse> {
    try {
      const workflow = params?.workflow;
      
      if (!workflow) {
        return {
          success: false,
          error: 'Workflow parameter is required for validation',
          timestamp: new Date().toISOString()
        };
      }
      
      const validationResult = langflowSchemaRegistry.validateWorkflow(workflow);
      
      return {
        success: true,
        data: {
          validation: validationResult,
          workflow: {
            nodeCount: workflow.data?.nodes?.length || 0,
            edgeCount: workflow.data?.edges?.length || 0,
            name: workflow.name || 'Unnamed Workflow',
            description: workflow.description || ''
          }
        },
        sources: ['Langflow Schema Validator'],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private getServerStatus(): McpDocResponse {
    const docsStats = docsIngestionService.getCacheStatistics();
    const schemaStats = langflowSchemaRegistry.getCacheStatistics();
    
    return {
      success: true,
      data: {
        server: {
          initialized: this.isInitialized,
          lastRefresh: this.lastRefresh,
          webhookEnabled: this.options.enableWebhook,
          refreshInterval: this.options.cacheRefreshInterval
        },
        documentation: {
          totalDocuments: docsStats.totalDocuments,
          cacheSize: docsStats.cacheSize,
          freshDocuments: docsStats.freshDocuments,
          lastRefresh: docsStats.lastRefresh
        },
        schemas: {
          totalSchemas: schemaStats.totalSchemas,
          totalComponents: schemaStats.totalComponents,
          lastUpdated: schemaStats.lastUpdated,
          version: schemaStats.version
        }
      },
      sources: ['DocsMcpServer Status'],
      timestamp: new Date().toISOString()
    };
  }

  private async refreshCache(): Promise<McpDocResponse> {
    try {
      console.log('Manual cache refresh triggered...');
      await this.refreshDocumentation();
      
      return {
        success: true,
        data: {
          message: 'Cache refreshed successfully',
          refreshTime: this.lastRefresh
        },
        sources: ['DocsMcpServer Cache Refresh'],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: `Cache refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async refreshDocumentation(): Promise<void> {
    try {
      // Refresh documentation cache
      await docsIngestionService.refreshCache();
      
      // Re-extract schemas from fresh documentation
      const docs = await docsIngestionService.ingestDocumentation();
      await langflowSchemaRegistry.extractSchemasFromDocumentation(docs);
      
      this.lastRefresh = new Date();
      console.log(`Documentation cache refreshed at ${this.lastRefresh.toISOString()}`);
      
    } catch (error) {
      console.error('Documentation refresh failed:', error);
      throw error;
    }
  }

  // Webhook endpoint handler
  async handleWebhook(payload: WebhookPayload, signature?: string): Promise<McpDocResponse> {
    if (!this.options.enableWebhook) {
      return {
        success: false,
        error: 'Webhook support is disabled',
        timestamp: new Date().toISOString()
      };
    }

    try {
      // Basic signature verification (simplified)
      if (signature && this.options.webhookSecret) {
        // In production, implement proper HMAC verification
        const expectedSignature = `sha256=${this.options.webhookSecret}`;
        if (signature !== expectedSignature) {
          return {
            success: false,
            error: 'Invalid webhook signature',
            timestamp: new Date().toISOString()
          };
        }
      }

      // Handle GitHub webhook payload
      const updateTriggered = await docsIngestionService.handleWebhookUpdate(payload);
      
      if (updateTriggered) {
        // Also refresh our schemas
        const docs = await docsIngestionService.ingestDocumentation();
        await langflowSchemaRegistry.extractSchemasFromDocumentation(docs);
        this.lastRefresh = new Date();
      }

      return {
        success: true,
        data: {
          webhookProcessed: true,
          updateTriggered,
          lastRefresh: this.lastRefresh
        },
        sources: ['DocsMcpServer Webhook'],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: `Webhook processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private extractSnippet(content: string, query: string): string {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const lines = content.split('\n');
    
    // Find the first line that contains any query term
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (queryTerms.some(term => line.includes(term))) {
        // Return context around the match
        const start = Math.max(0, i - 1);
        const end = Math.min(lines.length, i + 3);
        return lines.slice(start, end).join('\n').substring(0, 200) + '...';
      }
    }
    
    // Fallback to first 200 characters
    return content.substring(0, 200) + '...';
  }

  private calculateRelevanceScore(content: string, query: string): number {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    let score = 0;
    const totalTerms = queryTerms.length;
    
    queryTerms.forEach(term => {
      if (contentLower.includes(term)) {
        score += 1;
      }
    });
    
    return score / totalTerms;
  }

  destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    this.isInitialized = false;
  }
}

export const docsMcpServer = new DocsMcpServer();