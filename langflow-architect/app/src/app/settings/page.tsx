"use client";

import { useState } from "react";
import Link from "next/link";

interface MCPServer {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  toolsCount?: number;
}

interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'web' | 'database';
  status: 'configured' | 'not-set';
  value?: string;
}

interface SecuritySetting {
  id: string;
  name: string;
  value: boolean | string | number;
  type: 'toggle' | 'select' | 'input';
  options?: string[];
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("mcp-servers");

  // State for MCP Servers
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([
    { id: '1', name: 'Microsoft Learn MCP Server', type: 'microsoft-learn', status: 'active', toolsCount: 1 },
  ]);
  const [showAddMcpServer, setShowAddMcpServer] = useState(false);
  const [newMcpServer, setNewMcpServer] = useState({ name: '', type: 'custom' });

  // State for Data Sources
  const [dataSources, setDataSources] = useState<DataSource[]>([
    { id: '1', name: 'OpenAI API Key', type: 'api', status: 'configured', value: 'sk-...' },
    { id: '2', name: 'Tavily API Key', type: 'api', status: 'not-set' },
    { id: '3', name: 'Tavily Search', type: 'web', status: 'configured' },
    { id: '4', name: 'DuckDuckGo Search', type: 'web', status: 'configured' },
  ]);
  const [editingDataSource, setEditingDataSource] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // State for Security Settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([
    { id: '1', name: 'Conversation History', value: 'local-only', type: 'select', options: ['local-only', 'cloud-sync', 'disabled'] },
    { id: '2', name: 'Data Retention', value: 30, type: 'select', options: ['7', '30', '90', '365'] },
    { id: '3', name: 'HIPAA Compliance', value: true, type: 'toggle' },
    { id: '4', name: 'GDPR Compliance', value: true, type: 'toggle' },
    { id: '5', name: 'SOX Compliance', value: false, type: 'toggle' },
  ]);

  const tabs = [
    {
      id: "mcp-servers",
      name: "MCP Servers",
      icon: "🔧",
      description: "Manage Model Context Protocol servers"
    },
    {
      id: "data-sources",
      name: "Data Sources",
      icon: "📊",
      description: "Configure external data sources"
    },
    {
      id: "security",
      name: "Security",
      icon: "🔒",
      description: "Security and privacy settings"
    }
  ];

  // MCP Server functions
  const addMcpServer = () => {
    if (newMcpServer.name.trim()) {
      const server: MCPServer = {
        id: Date.now().toString(),
        name: newMcpServer.name,
        type: newMcpServer.type,
        status: 'inactive'
      };
      setMcpServers([...mcpServers, server]);
      setNewMcpServer({ name: '', type: 'custom' });
      setShowAddMcpServer(false);
    }
  };

  const removeMcpServer = (id: string) => {
    setMcpServers(mcpServers.filter(server => server.id !== id));
  };

  // Data Source functions
  const updateDataSource = (id: string, value: string) => {
    setDataSources(dataSources.map(ds =>
      ds.id === id
        ? { ...ds, value, status: value ? 'configured' : 'not-set' }
        : ds
    ));
    setEditingDataSource(null);
    setEditValue('');
  };

  // Security functions
  const updateSecuritySetting = (id: string, value: boolean | string | number) => {
    setSecuritySettings(securitySettings.map(setting =>
      setting.id === id ? { ...setting, value } : setting
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Chat
              </Link>
              <div className="flex items-center">
                <span className="text-xl mr-2">⚙️</span>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="text-lg mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "mcp-servers" && (
              <MCPServersTab
                servers={mcpServers}
                showAddServer={showAddMcpServer}
                newServer={newMcpServer}
                onShowAddServer={setShowAddMcpServer}
                onNewServerChange={setNewMcpServer}
                onAddServer={addMcpServer}
                onRemoveServer={removeMcpServer}
              />
            )}
            {activeTab === "data-sources" && (
              <DataSourcesTab
                sources={dataSources}
                editingId={editingDataSource}
                editValue={editValue}
                onEditSource={setEditingDataSource}
                onEditValueChange={setEditValue}
                onUpdateSource={updateDataSource}
              />
            )}
            {activeTab === "security" && (
              <SecurityTab
                settings={securitySettings}
                onUpdateSetting={updateSecuritySetting}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function MCPServersTab({
  servers,
  showAddServer,
  newServer,
  onShowAddServer,
  onNewServerChange,
  onAddServer,
  onRemoveServer
}: {
  servers: MCPServer[];
  showAddServer: boolean;
  newServer: { name: string; type: string };
  onShowAddServer: (show: boolean) => void;
  onNewServerChange: (server: { name: string; type: string }) => void;
  onAddServer: () => void;
  onRemoveServer: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">MCP Servers</h2>
          <p className="text-gray-600 mb-4">
            Manage Model Context Protocol servers to extend your AI assistant&apos;s capabilities with external knowledge sources.
          </p>

          {/* MCP Overview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-900 mb-2">🔧 What are MCP Servers?</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                MCP (Model Context Protocol) servers are specialized tools that extend your AI assistant&apos;s capabilities by providing access to external data sources and services.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <strong className="text-blue-900">Common Use Cases:</strong>
                  <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                    <li>Search documentation</li>
                    <li>Manage GitHub repositories</li>
                    <li>Query databases</li>
                    <li>Access web APIs</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-blue-900">Benefits:</strong>
                  <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                    <li>Real-time data access</li>
                    <li>Enhanced AI responses</li>
                    <li>Secure integrations</li>
                    <li>Extensible architecture</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => onShowAddServer(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span>
          Add MCP Server
        </button>
      </div>

      {/* Add Server Form */}
      {showAddServer && (
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New MCP Server</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="server-name" className="block text-sm font-medium text-gray-700 mb-1">
                Server Name <span className="text-red-500">*</span>
              </label>
              <input
                id="server-name"
                type="text"
                value={newServer.name}
                onChange={(e) => onNewServerChange({ ...newServer, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., GitHub MCP Server, Microsoft Learn"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Choose a descriptive name for your MCP server</p>
            </div>

            <div>
              <label htmlFor="server-type" className="block text-sm font-medium text-gray-700 mb-1">
                Server Type <span className="text-red-500">*</span>
              </label>
              <select
                id="server-type"
                value={newServer.type}
                onChange={(e) => onNewServerChange({ ...newServer, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select server type...</option>
                <option value="documentation">📚 Documentation (Microsoft Learn, GitHub Docs)</option>
                <option value="github">🐙 GitHub (Repository management, issues, PRs)</option>
                <option value="filesystem">📁 File System (Local file operations)</option>
                <option value="database">🗄️ Database (SQL/NoSQL queries)</option>
                <option value="api">🔗 API Service (REST/GraphQL endpoints)</option>
                <option value="custom">⚙️ Custom (Generic MCP server)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Select the type of MCP server you&apos;re connecting to</p>
            </div>

            {/* Configuration Guidance */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">📋 Configuration Guide</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>Transport Types:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>HTTP Stream:</strong> Modern transport (recommended) - uses HTTP/1.1 or HTTP/2 streams</li>
                  <li><strong>SSE:</strong> Legacy transport - uses Server-Sent Events for compatibility</li>
                </ul>

                <p className="mt-3"><strong>Common MCP Server Endpoints:</strong></p>
                <div className="bg-white rounded p-2 text-xs font-mono">
                  <div>• GitHub: https://api.github.com/mcp</div>
                  <div>• Microsoft Learn: https://learn.microsoft.com/mcp</div>
                  <div>• Local: http://localhost:3001/mcp</div>
                  <div>• Custom: Your server&apos;s MCP endpoint URL</div>
                </div>

                <p className="mt-3"><strong>Capabilities:</strong> MCP servers provide tools for specific tasks. Each server type offers different capabilities:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Documentation:</strong> Search, retrieve, and analyze technical docs</li>
                  <li><strong>GitHub:</strong> Repository operations, issue management, PR reviews</li>
                  <li><strong>File System:</strong> Read, write, and manage local files</li>
                  <li><strong>Database:</strong> Query and manipulate data</li>
                  <li><strong>API:</strong> Interact with external web services</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={onAddServer}
                disabled={!newServer.name.trim() || !newServer.type}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>➕</span>
                Add Server
              </button>
              <button
                onClick={() => onShowAddServer(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Server List */}
      <div className="space-y-3">
        {servers.map((server) => (
          <div key={server.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-3">
              <span className="text-lg">🔧</span>
              <div>
                <h4 className="font-medium text-gray-900">{server.name}</h4>
                <p className="text-sm text-gray-600">Type: {server.type}</p>
                {server.type === 'documentation' && (
                  <p className="text-xs text-gray-500 mt-1">
                    📚 Provides semantic search and retrieval across technical documentation
                  </p>
                )}
                {server.type === 'github' && (
                  <p className="text-xs text-gray-500 mt-1">
                    🐙 Enables repository operations, issue management, and pull request reviews
                  </p>
                )}
                {server.type === 'filesystem' && (
                  <p className="text-xs text-gray-500 mt-1">
                    📁 Allows reading, writing, and managing local files and directories
                  </p>
                )}
                {server.type === 'database' && (
                  <p className="text-xs text-gray-500 mt-1">
                    🗄️ Provides database query and manipulation capabilities
                  </p>
                )}
                {server.type === 'api' && (
                  <p className="text-xs text-gray-500 mt-1">
                    🔗 Facilitates interaction with external REST and GraphQL APIs
                  </p>
                )}
                {server.type === 'microsoft-learn' && (
                  <p className="text-xs text-gray-500 mt-1">
                    📖 Specialized for Microsoft Learn documentation search and retrieval
                  </p>
                )}
                {server.name === 'Microsoft Learn MCP Server' && (
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    ✅ Official Microsoft Learn integration - 1 specialized tool for documentation search
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                server.status === 'active' ? 'bg-green-100 text-green-800' :
                server.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {server.status}
              </span>
              {server.toolsCount && (
                <span className="text-sm text-gray-600">{server.toolsCount} tools</span>
              )}
              <button
                onClick={() => onRemoveServer(server.id)}
                className="text-red-600 hover:text-red-800 p-1"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataSourcesTab({
  sources,
  editingId,
  editValue,
  onEditSource,
  onEditValueChange,
  onUpdateSource
}: {
  sources: DataSource[];
  editingId: string | null;
  editValue: string;
  onEditSource: (id: string | null) => void;
  onEditValueChange: (value: string) => void;
  onUpdateSource: (id: string, value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Sources</h2>
        <p className="text-gray-600">
          Configure external data sources and APIs for enhanced AI responses.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Web Search</h3>
          <div className="space-y-3">
            {sources.filter(s => s.type === 'web').map((source) => (
              <div key={source.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{source.name}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  source.status === 'configured' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {source.status === 'configured' ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">API Keys</h3>
          <p className="text-sm text-gray-600 mb-3">
            Configure API keys for external services. Keys are stored securely and encrypted.
          </p>
          <div className="space-y-3">
            {sources.filter(s => s.type === 'api').map((source) => (
              <div key={source.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{source.name}</span>
                {editingId === source.id ? (
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <span className="sr-only">API Key for {source.name}</span>
                      <input
                        type="password"
                        value={editValue}
                        onChange={(e) => onEditValueChange(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Enter API key"
                        title="API Key"
                      />
                    </label>
                    <button
                      onClick={() => onUpdateSource(source.id, editValue)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => onEditSource(null)}
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      source.status === 'configured' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {source.status === 'configured' ? 'Configured' : 'Not Set'}
                    </span>
                    <button
                      onClick={() => {
                        onEditSource(source.id);
                        onEditValueChange(source.value || '');
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {source.status === 'configured' ? 'Update' : 'Set'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityTab({
  settings,
  onUpdateSetting
}: {
  settings: SecuritySetting[];
  onUpdateSetting: (id: string, value: boolean | string | number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Security &amp; Privacy</h2>
        <p className="text-gray-600">
          Configure security settings and privacy preferences.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Data Privacy</h3>
          <div className="space-y-3">
            {settings.filter(s => s.id === '1' || s.id === '2').map((setting) => (
              <div key={setting.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{setting.name}</span>
                {setting.type === 'select' ? (
                  <div>
                    <label htmlFor={`setting-${setting.id}`} className="sr-only">{setting.name}</label>
                    <select
                      id={`setting-${setting.id}`}
                      value={setting.value.toString()}
                      onChange={(e) => onUpdateSetting(setting.id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title={setting.name}
                    >
                      {setting.options?.map((option) => (
                        <option key={option} value={option}>
                          {option === 'local-only' ? 'Local Only' :
                           option === 'cloud-sync' ? 'Cloud Sync' :
                           option === 'disabled' ? 'Disabled' :
                           `${option} days`}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-sm text-gray-900">{setting.value} days</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Compliance</h3>
          <div className="space-y-3">
            {settings.filter(s => s.id !== '1' && s.id !== '2').map((setting) => (
              <div key={setting.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{setting.name}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id={`setting-${setting.id}`}
                    type="checkbox"
                    checked={setting.value as boolean}
                    onChange={(e) => onUpdateSetting(setting.id, e.target.checked)}
                    className="sr-only peer"
                    title={setting.name}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
