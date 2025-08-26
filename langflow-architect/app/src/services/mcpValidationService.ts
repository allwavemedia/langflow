// MCP Validation Service for Epic 6: User-Friendly MCP Server Integration

import type { 
  McpServerConfig, 
  McpConnectionTestResult,
  McpTransport 
} from '../types/mcp';

export class McpValidationService {
  private readonly DEFAULT_TIMEOUT = 5000;

  async testConnection(serverConfig: McpServerConfig): Promise<McpConnectionTestResult> {
    const startTime = performance.now();
    
    try {
      const result = await this.performConnectionTest(serverConfig.transport);
      const responseTime = performance.now() - startTime;

      return {
        success: true,
        responseTime: Math.round(responseTime),
        capabilities: result.capabilities,
        serverInfo: result.serverInfo
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      return {
        success: false,
        responseTime: Math.round(responseTime),
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async testMultipleConnections(
    serverConfigs: McpServerConfig[], 
    options: { timeout?: number; concurrent?: boolean } = {}
  ): Promise<Array<{ serverId: string; result: McpConnectionTestResult }>> {
    const { timeout = this.DEFAULT_TIMEOUT, concurrent = true } = options;

    if (concurrent) {
      const promises = serverConfigs.map(async (config) => ({
        serverId: config.id,
        result: await Promise.race([
          this.testConnection(config),
          this.createTimeoutPromise(timeout)
        ])
      }));

      return Promise.all(promises);
    } else {
      const results: Array<{ serverId: string; result: McpConnectionTestResult }> = [];
      
      for (const config of serverConfigs) {
        const result = await Promise.race([
          this.testConnection(config),
          this.createTimeoutPromise(timeout)
        ]);
        
        results.push({ serverId: config.id, result });
      }

      return results;
    }
  }

  private async performConnectionTest(transport: McpTransport): Promise<{
    capabilities?: string[];
    serverInfo?: {
      name: string;
      version: string;
      protocolVersion: string;
    };
  }> {
    switch (transport.type) {
      case 'sse':
        return this.testSSEConnection(transport);
      case 'http':
        return this.testHTTPConnection(transport);
      case 'stdio':
        return this.testStdioConnection(transport);
      default:
        throw new Error(`Unsupported transport type: ${transport.type}`);
    }
  }

  private async testSSEConnection(transport: McpTransport): Promise<{
    capabilities?: string[];
    serverInfo?: { name: string; version: string; protocolVersion: string };
  }> {
    if (!transport.url) {
      throw new Error('URL is required for SSE transport');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        eventSource.close();
        reject(new Error('SSE connection timeout'));
      }, this.DEFAULT_TIMEOUT);

      let messageReceived = false;

      const eventSource = new EventSource(transport.url!);

      eventSource.onopen = () => {
        if (!messageReceived) {
          clearTimeout(timeout);
          eventSource.close();
          resolve({
            capabilities: ['sse_transport'],
            serverInfo: {
              name: 'Unknown SSE Server',
              version: '1.0.0',
              protocolVersion: 'MCP/1.0'
            }
          });
        }
      };

      eventSource.onmessage = (event) => {
        messageReceived = true;
        clearTimeout(timeout);
        eventSource.close();

        try {
          const data = JSON.parse(event.data);
          resolve({
            capabilities: data.capabilities || ['sse_transport'],
            serverInfo: data.serverInfo || {
              name: data.name || 'Unknown SSE Server',
              version: data.version || '1.0.0',
              protocolVersion: data.protocolVersion || 'MCP/1.0'
            }
          });
        } catch {
          resolve({
            capabilities: ['sse_transport'],
            serverInfo: {
              name: 'Unknown SSE Server',
              version: '1.0.0',
              protocolVersion: 'MCP/1.0'
            }
          });
        }
      };

      eventSource.onerror = () => {
        clearTimeout(timeout);
        eventSource.close();
        reject(new Error('SSE connection failed'));
      };
    });
  }

  private async testHTTPConnection(transport: McpTransport): Promise<{
    capabilities?: string[];
    serverInfo?: { name: string; version: string; protocolVersion: string };
  }> {
    if (!transport.url) {
      throw new Error('URL is required for HTTP transport');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.DEFAULT_TIMEOUT);

    try {
      const response = await fetch(transport.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...transport.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        capabilities: data.capabilities || ['http_transport'],
        serverInfo: data.serverInfo || {
          name: data.name || 'Unknown HTTP Server',
          version: data.version || '1.0.0',
          protocolVersion: data.protocolVersion || 'MCP/1.0'
        }
      };
    } catch (error) {
      clearTimeout(timeout);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('HTTP connection timeout');
      }
      
      throw error;
    }
  }

  private async testStdioConnection(transport: McpTransport): Promise<{
    capabilities?: string[];
    serverInfo?: { name: string; version: string; protocolVersion: string };
  }> {
    if (!transport.command) {
      throw new Error('Command is required for stdio transport');
    }

    // Note: In a browser environment, stdio transport testing is limited
    // This would typically require a backend service to test stdio connections
    throw new Error('Stdio transport testing not available in browser environment');
  }

  private createTimeoutPromise(timeout: number): Promise<McpConnectionTestResult> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Connection test timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  // URL validation utilities
  validateUrl(url: string): { valid: boolean; error?: string } {
    try {
      const parsedUrl = new URL(url);
      
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
      }

      if (!parsedUrl.hostname) {
        return { valid: false, error: 'URL must include a valid hostname' };
      }

      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  // Server configuration validation
  validateTransportConfig(transport: McpTransport): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const typeValidation = this.validateTransportType(transport.type);
    if (!typeValidation.valid) {
      errors.push(...typeValidation.errors);
      return { valid: false, errors };
    }

    const configValidation = this.validateTransportSpecificConfig(transport);
    errors.push(...configValidation.errors);

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private validateTransportType(type: string): { valid: boolean; errors: string[] } {
    if (!type) {
      return { valid: false, errors: ['Transport type is required'] };
    }

    if (!['sse', 'stdio', 'http'].includes(type)) {
      return { valid: false, errors: ['Invalid transport type. Must be sse, stdio, or http'] };
    }

    return { valid: true, errors: [] };
  }

  private validateTransportSpecificConfig(transport: McpTransport): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (transport.type === 'sse' || transport.type === 'http') {
      const urlErrors = this.validateUrlTransport(transport);
      errors.push(...urlErrors);
    }

    if (transport.type === 'stdio') {
      const stdioErrors = this.validateStdioTransport(transport);
      errors.push(...stdioErrors);
    }

    return { valid: errors.length === 0, errors };
  }

  private validateUrlTransport(transport: McpTransport): string[] {
    const errors: string[] = [];

    if (!transport.url) {
      errors.push(`URL is required for ${transport.type} transport`);
    } else {
      const urlValidation = this.validateUrl(transport.url);
      if (!urlValidation.valid) {
        errors.push(urlValidation.error!);
      }
    }

    return errors;
  }

  private validateStdioTransport(transport: McpTransport): string[] {
    const errors: string[] = [];

    if (!transport.command) {
      errors.push('Command is required for stdio transport');
    }
    
    if (transport.args && !Array.isArray(transport.args)) {
      errors.push('Arguments must be an array');
    }

    if (transport.env && typeof transport.env !== 'object') {
      errors.push('Environment variables must be an object');
    }

    return errors;
  }

  // Health check utilities
  async performHealthCheck(servers: McpServerConfig[]): Promise<Map<string, McpConnectionTestResult>> {
    const results = new Map<string, McpConnectionTestResult>();
    
    const healthChecks = await this.testMultipleConnections(
      servers.filter(s => s.enabled), 
      { timeout: 3000, concurrent: true }
    );

    for (const { serverId, result } of healthChecks) {
      results.set(serverId, result);
    }

    return results;
  }

  // Quick connectivity check for UI indicators
  async quickConnectivityCheck(transport: McpTransport): Promise<boolean> {
    try {
      await Promise.race([
        this.performConnectionTest(transport),
        this.createTimeoutPromise(2000)
      ]);
      return true;
    } catch {
      return false;
    }
  }
}

export const mcpValidationService = new McpValidationService();
