'use client';

import { useState, useEffect, useCallback } from 'react';
import type { McpServerConfig, McpConnectionTestResult } from '@/types/mcp';
import { mcpConfigService } from '@/services/mcpConfigService';
import { mcpValidationService } from '@/services/mcpValidationService';

interface UseMcpServersReturn {
  servers: McpServerConfig[];
  loading: boolean;
  error: string | null;
  addServer: (server: Omit<McpServerConfig, 'id' | 'enabled' | 'lastConnected'>) => Promise<void>;
  removeServer: (id: string) => Promise<void>;
  updateServer: (id: string, updates: Partial<McpServerConfig>) => Promise<void>;
  toggleServer: (id: string) => Promise<void>;
  testConnection: (server: McpServerConfig) => Promise<McpConnectionTestResult>;
  refreshServers: () => Promise<void>;
}

export function useMcpServers(): UseMcpServersReturn {
  const [servers, setServers] = useState<McpServerConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const config = await mcpConfigService.loadFullConfig();
      setServers(config.servers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load servers');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConfig = useCallback(async (updatedServers: McpServerConfig[]) => {
    try {
      const config = await mcpConfigService.loadFullConfig();
      await mcpConfigService.saveFullConfig({
        ...config,
        servers: updatedServers
      });
      setServers(updatedServers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
      throw err;
    }
  }, []);

  const addServer = useCallback(async (serverData: Omit<McpServerConfig, 'id' | 'enabled' | 'userAdded' | 'createdAt' | 'updatedAt'>) => {
    const newServer: McpServerConfig = {
      ...serverData,
      id: crypto.randomUUID(),
      enabled: true,
      userAdded: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedServers = [...servers, newServer];
    await saveConfig(updatedServers);
  }, [servers, saveConfig]);

  const removeServer = useCallback(async (id: string) => {
    const updatedServers = servers.filter(server => server.id !== id);
    await saveConfig(updatedServers);
  }, [servers, saveConfig]);

  const updateServer = useCallback(async (id: string, updates: Partial<McpServerConfig>) => {
    const updatedServers = servers.map(server =>
      server.id === id ? { ...server, ...updates } : server
    );
    await saveConfig(updatedServers);
  }, [servers, saveConfig]);

  const toggleServer = useCallback(async (id: string) => {
    const server = servers.find(s => s.id === id);
    if (!server) {
      throw new Error('Server not found');
    }

    await updateServer(id, { enabled: !server.enabled });
  }, [servers, updateServer]);

  const testConnection = useCallback(async (server: McpServerConfig): Promise<McpConnectionTestResult> => {
    try {
      const result = await mcpValidationService.testConnection(server);
      
      // Update last checked time if successful
      if (result.success) {
        await updateServer(server.id, { 
          lastChecked: new Date(),
          healthStatus: 'healthy'
        });
      } else {
        await updateServer(server.id, { 
          healthStatus: 'unhealthy'
        });
      }
      
      return result;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Connection test failed',
        responseTime: 0
      };
    }
  }, [updateServer]);

  const refreshServers = useCallback(async () => {
    await loadServers();
  }, [loadServers]);

  // Load servers on mount
  useEffect(() => {
    loadServers();
  }, [loadServers]);

  return {
    servers,
    loading,
    error,
    addServer,
    removeServer,
    updateServer,
    toggleServer,
    testConnection,
    refreshServers
  };
}
