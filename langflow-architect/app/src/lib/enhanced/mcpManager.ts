/**
 * MCP Manager for Enhanced Server Orchestration - Phase 2 Implementation
 * Provides health monitoring, domain filtering, and server statistics
 */

export interface McpServerHealth {
  serverId: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastCheck: number;
  responseTime?: number;
  error?: string;
}

export interface McpServerStats {
  serverId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  uptime: number;
}

export interface DomainFilter {
  allowedDomains: string[];
  blockedDomains: string[];
  requiresApproval: string[];
}

export class McpManager {
  private healthChecks: Map<string, McpServerHealth> = new Map();
  private stats: Map<string, McpServerStats> = new Map();
  private domainFilters: DomainFilter = {
    allowedDomains: [],
    blockedDomains: [],
    requiresApproval: []
  };

  /**
   * Register a new MCP server for monitoring
   */
  registerServer(serverId: string): void {
    this.healthChecks.set(serverId, {
      serverId,
      status: 'unknown',
      lastCheck: Date.now()
    });

    this.stats.set(serverId, {
      serverId,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      uptime: Date.now()
    });
  }

  /**
   * Perform health check on a server
   */
  async checkServerHealth(serverId: string): Promise<McpServerHealth> {
    const startTime = Date.now();
    
    try {
      // TODO: Implement actual health check logic
      // For now, simulate a health check
      const isHealthy = Math.random() > 0.1; // 90% success rate
      const responseTime = Math.random() * 100 + 50; // 50-150ms

      const health: McpServerHealth = {
        serverId,
        status: isHealthy ? 'healthy' : 'unhealthy',
        lastCheck: Date.now(),
        responseTime: responseTime,
        error: isHealthy ? undefined : 'Simulated health check failure'
      };

      this.healthChecks.set(serverId, health);
      return health;
    } catch (error) {
      const health: McpServerHealth = {
        serverId,
        status: 'unhealthy',
        lastCheck: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.healthChecks.set(serverId, health);
      return health;
    }
  }

  /**
   * Get health status for all servers
   */
  getAllHealthStatus(): McpServerHealth[] {
    return Array.from(this.healthChecks.values());
  }

  /**
   * Get statistics for a specific server
   */
  getServerStats(serverId: string): McpServerStats | undefined {
    return this.stats.get(serverId);
  }

  /**
   * Get statistics for all servers
   */
  getAllStats(): McpServerStats[] {
    return Array.from(this.stats.values());
  }

  /**
   * Record a server request
   */
  recordRequest(serverId: string, success: boolean, responseTime: number): void {
    const stats = this.stats.get(serverId);
    if (!stats) return;

    stats.totalRequests++;
    if (success) {
      stats.successfulRequests++;
    } else {
      stats.failedRequests++;
    }

    // Update average response time
    const totalTime = stats.averageResponseTime * (stats.totalRequests - 1) + responseTime;
    stats.averageResponseTime = totalTime / stats.totalRequests;

    this.stats.set(serverId, stats);
  }

  /**
   * Set domain filtering rules
   */
  setDomainFilters(filters: DomainFilter): void {
    this.domainFilters = filters;
  }

  /**
   * Check if a domain is allowed
   */
  isDomainAllowed(domain: string): boolean {
    if (this.domainFilters.blockedDomains.includes(domain)) {
      return false;
    }

    if (this.domainFilters.allowedDomains.length > 0) {
      return this.domainFilters.allowedDomains.includes(domain);
    }

    return true; // Allow by default if no specific rules
  }

  /**
   * Get overall system health
   */
  getSystemHealth(): {
    totalServers: number;
    healthyServers: number;
    unhealthyServers: number;
    averageResponseTime: number;
    uptime: number;
  } {
    const allHealth = this.getAllHealthStatus();
    const allStats = this.getAllStats();

    const healthyCount = allHealth.filter(h => h.status === 'healthy').length;
    const avgResponseTime = allStats.length > 0 
      ? allStats.reduce((sum, s) => sum + s.averageResponseTime, 0) / allStats.length
      : 0;

    const oldestUptime = allStats.length > 0
      ? Math.min(...allStats.map(s => s.uptime))
      : Date.now();

    return {
      totalServers: allHealth.length,
      healthyServers: healthyCount,
      unhealthyServers: allHealth.length - healthyCount,
      averageResponseTime: avgResponseTime,
      uptime: Date.now() - oldestUptime
    };
  }
}

// Export singleton instance
export const mcpManager = new McpManager();