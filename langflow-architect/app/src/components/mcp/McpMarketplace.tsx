/**
 * MCP Server Discovery and Marketplace Component
 * Story 6.1: Visual marketplace interface with server categories and discovery
 */

import React, { useState, useMemo, useCallback } from 'react';
import { McpMarketplaceEntry, McpCategory, MCP_CATEGORIES, McpTransport } from '../../types/mcp';

interface McpMarketplaceProps {
  readonly onServerSelect?: (server: McpMarketplaceEntry) => void;
  readonly onPreviewServer?: (server: McpMarketplaceEntry) => void;
}

interface FilterState {
  search: string;
  category: McpCategory | 'All';
  minRating: number;
  sortBy: 'popularity' | 'rating' | 'alphabetical' | 'newest';
  showFeaturedOnly: boolean;
}

export default function McpMarketplace({ onServerSelect, onPreviewServer }: McpMarketplaceProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'All',
    minRating: 0,
    sortBy: 'popularity',
    showFeaturedOnly: false
  });
  
  // Mock marketplace data - will be replaced with API call in Task 5
  const mockMarketplaceData: McpMarketplaceEntry[] = useMemo(() => [
    {
      id: 'web-search-tavily',
      name: 'Tavily Web Search',
      description: 'Professional web search API with domain-focused results and high-quality content extraction.',
      category: 'Web Search',
      author: 'Tavily AI',
      version: '1.2.0',
      rating: 4.8,
      downloads: 15420,
      transport: { type: 'sse', url: 'https://mcp.copilotkit.ai/sse/tavily' },
      capabilities: ['search', 'extract', 'summarize'],
      tags: ['search', 'web', 'research', 'ai'],
      icon: '🔍',
      documentation: 'https://docs.tavily.com/mcp',
      repository: 'https://github.com/tavily/mcp-server',
      featured: true
    },
    {
      id: 'file-operations',
      name: 'File Operations MCP',
      description: 'Comprehensive file system operations including read, write, search, and directory management.',
      category: 'File Operations',
      author: 'CopilotKit Team',
      version: '2.1.0',
      rating: 4.6,
      downloads: 12800,
      transport: { type: 'stdio', command: 'file-mcp-server' },
      capabilities: ['read', 'write', 'search', 'directory'],
      tags: ['files', 'filesystem', 'operations'],
      icon: '📁',
      documentation: 'https://docs.copilotkit.ai/mcp/file-ops',
      featured: true
    },
    {
      id: 'github-integration',
      name: 'GitHub API Integration',
      description: 'Complete GitHub API integration for repository management, issues, PRs, and code analysis.',
      category: 'API Integrations',
      author: 'GitHub Inc.',
      version: '1.5.2',
      rating: 4.7,
      downloads: 9650,
      transport: { type: 'sse', url: 'https://mcp.copilotkit.ai/sse/github' },
      capabilities: ['repositories', 'issues', 'pulls', 'code'],
      tags: ['github', 'git', 'api', 'development'],
      icon: '🐙',
      documentation: 'https://docs.github.com/mcp',
      featured: false
    },
    {
      id: 'database-postgres',
      name: 'PostgreSQL Database MCP',
      description: 'Secure PostgreSQL database operations with query execution and schema management.',
      category: 'Database',
      author: 'PostgreSQL Community',
      version: '1.0.5',
      rating: 4.5,
      downloads: 7200,
      transport: { type: 'stdio', command: 'postgres-mcp', args: ['--secure'] },
      capabilities: ['query', 'schema', 'admin'],
      tags: ['database', 'sql', 'postgres'],
      icon: '🗄️',
      documentation: 'https://postgresql.org/mcp',
      featured: false
    }
  ], []);

  // Enhanced filter and sort marketplace entries
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = mockMarketplaceData;

    // Filter by category
    if (filters.category !== 'All') {
      filtered = filtered.filter(entry => entry.category === filters.category);
    }

    // Filter by featured only
    if (filters.showFeaturedOnly) {
      filtered = filtered.filter(entry => entry.featured);
    }

    // Filter by minimum rating
    if (filters.minRating > 0) {
      filtered = filtered.filter(entry => entry.rating >= filters.minRating);
    }

    // Enhanced search filter (name, description, tags, capabilities, author)
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.name.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query) ||
        entry.author.toLowerCase().includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query)) ||
        entry.capabilities.some(cap => cap.toLowerCase().includes(query))
      );
    }

    // Enhanced sorting with newest option
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'newest':
          // Mock newest sorting by reverse alphabetical for now
          return b.name.localeCompare(a.name);
        case 'popularity':
        default:
          return b.downloads - a.downloads;
      }
    });

    return filtered;
  }, [filters, mockMarketplaceData]);

  // Filter update handlers
  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      search: '',
      category: 'All',
      minRating: 0,
      sortBy: 'popularity',
      showFeaturedOnly: false
    });
  }, []);

  const handleServerSelect = (server: McpMarketplaceEntry) => {
    onServerSelect?.(server);
  };

  const handlePreviewServer = (server: McpMarketplaceEntry) => {
    onPreviewServer?.(server);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">MCP Server Marketplace</h1>
        <p className="text-slate-400">
          Discover and integrate Model Context Protocol servers to enhance your AI capabilities
        </p>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-slate-300 mb-2">
              Search Servers
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by name, description, capabilities, tags, or author..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort Dropdown */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-slate-300 mb-2">
              Sort By
            </label>
            <select
              id="sort"
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value as FilterState['sortBy'])}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="popularity">Popularity</option>
              <option value="rating">Rating</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-slate-300 mb-2">
              Min Rating
            </label>
            <select
              id="rating"
              value={filters.minRating}
              onChange={(e) => updateFilter('minRating', Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>All Ratings</option>
              <option value={3}>3+ Stars</option>
              <option value={4}>4+ Stars</option>
              <option value={4.5}>4.5+ Stars</option>
            </select>
          </div>
        </div>

        {/* Featured Toggle */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.showFeaturedOnly}
              onChange={(e) => updateFilter('showFeaturedOnly', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="ml-2 text-sm font-medium text-slate-300">Show Featured Only</span>
          </label>
        </div>

        {/* Category Filter Grid */}
        <div>
          <div className="block text-sm font-medium text-slate-300 mb-3">
            Categories
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateFilter('category', 'All')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.category === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All Categories
            </button>
            {MCP_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => updateFilter('category', category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.category === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Results Count and Filter Summary */}
      <div className="mb-6">
        <p className="text-slate-400">
          Found {filteredAndSortedEntries.length} server{filteredAndSortedEntries.length !== 1 ? 's' : ''}
          {filters.category !== 'All' && ` in ${filters.category}`}
          {filters.minRating > 0 && ` with ${filters.minRating}+ stars`}
          {filters.showFeaturedOnly && ` (featured only)`}
        </p>
        {(filters.search || filters.category !== 'All' || filters.minRating > 0 || filters.showFeaturedOnly) && (
          <button
            onClick={clearAllFilters}
            className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Marketplace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedEntries.map((server) => (
          <McpMarketplaceCard
            key={server.id}
            server={server}
            onSelect={handleServerSelect}
            onPreview={handlePreviewServer}
          />
        ))}
      </div>

      {/* Enhanced Empty State */}
      {filteredAndSortedEntries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No servers found</h3>
          <p className="text-slate-400 mb-4">
            Try adjusting your search criteria, rating filter, or browse different categories
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

interface McpMarketplaceCardProps {
  readonly server: McpMarketplaceEntry;
  readonly onSelect: (server: McpMarketplaceEntry) => void;
  readonly onPreview: (server: McpMarketplaceEntry) => void;
}

// Helper function for transport badge styling
const getTransportBadgeStyle = (type: string): string => {
  switch (type) {
    case 'sse':
      return 'bg-green-900 text-green-300';
    case 'stdio':
      return 'bg-blue-900 text-blue-300';
    default:
      return 'bg-purple-900 text-purple-300';
  }
};

// Helper function for installation instructions
const getInstallationContent = (transport: McpTransport) => {
  if (transport.type === 'sse') {
    return (
      <div className="space-y-2">
        <div className="text-slate-300">This server uses Server-Sent Events (SSE) connection:</div>
        <div className="bg-slate-800 rounded p-2 font-mono text-xs text-slate-400">
          Endpoint: {transport.url}
        </div>
        <div className="text-slate-400 text-xs">
          ✓ No local installation required<br/>
          ✓ Automatic reconnection handling<br/>
          ✓ Real-time event streaming
        </div>
      </div>
    );
  }
  
  if (transport.type === 'stdio') {
    return (
      <div className="space-y-2">
        <div className="text-slate-300">This server requires local installation:</div>
        <div className="bg-slate-800 rounded p-2 font-mono text-xs text-slate-400">
          {transport.command} {transport.args?.join(' ') || ''}
        </div>
        <div className="text-slate-400 text-xs">
          ⚠️ Requires local installation<br/>
          ⚠️ Command-line setup needed<br/>
          ✓ Direct process communication
        </div>
      </div>
    );
  }
  
  return (
    <div className="text-slate-400">HTTP-based MCP server with REST API communication</div>
  );
};

function McpMarketplaceCard({ server, onSelect, onPreview }: McpMarketplaceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate installation
      onSelect(server);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors relative overflow-hidden">
      {/* Featured Badge */}
      {server.featured && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
            ✨ FEATURED
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Server Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="text-3xl bg-slate-700 rounded-lg p-2 flex-shrink-0">
            {server.icon || '🔧'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1 truncate">
              {server.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-slate-400 mb-2">
              <span>by {server.author}</span>
              <span>•</span>
              <span>v{server.version}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                {server.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-300 text-sm mb-4 leading-relaxed">
          {server.description}
        </p>

        {/* Enhanced Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Downloads</div>
            <div className="text-white font-medium">{server.downloads.toLocaleString()}</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Category</div>
            <div className="text-white font-medium">{server.category}</div>
          </div>
        </div>

        {/* Transport Information */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wide">Connection</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getTransportBadgeStyle(server.transport.type)}`}>
              {server.transport.type.toUpperCase()}
            </span>
          </div>
          <div className="text-xs text-slate-500 truncate">
            {server.transport.url || server.transport.command || 'Local server'}
          </div>
        </div>

        {/* Capabilities */}
        <div className="mb-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Capabilities</div>
          <div className="flex flex-wrap gap-1">
            {server.capabilities.slice(0, isExpanded ? undefined : 4).map((capability) => (
              <span
                key={capability}
                className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded border border-blue-800"
              >
                {capability}
              </span>
            ))}
            {server.capabilities.length > 4 && !isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded hover:bg-slate-600 transition-colors"
              >
                +{server.capabilities.length - 4} more
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        {server.tags.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Tags</div>
            <div className="flex flex-wrap gap-1">
              {server.tags.slice(0, isExpanded ? undefined : 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded"
                >
                  #{tag}
                </span>
              ))}
              {server.tags.length > 3 && !isExpanded && (
                <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                  +{server.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Expanded Information */}
        {isExpanded && (
          <div className="border-t border-slate-700 pt-4 mb-4 space-y-4">
            {/* Installation Instructions */}
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Installation</div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-sm">
                {getInstallationContent(server.transport)}
              </div>
            </div>

            {/* Documentation Links */}
            {(server.documentation || server.repository) && (
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Resources</div>
                <div className="flex gap-2">
                  {server.documentation && (
                    <a
                      href={server.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-2 bg-blue-900/20 text-blue-300 border border-blue-800 rounded hover:bg-blue-900/30 transition-colors"
                    >
                      📖 Documentation
                    </a>
                  )}
                  {server.repository && (
                    <a
                      href={server.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-2 bg-slate-700 text-slate-300 border border-slate-600 rounded hover:bg-slate-600 transition-colors"
                    >
                      🐙 Repository
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Requirements & Compatibility */}
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Compatibility</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/50 rounded p-2">
                  <div className="text-slate-400 mb-1">Platform</div>
                  <div className="text-slate-300">
                    {server.transport.type === 'sse' ? 'Cross-platform' : 'Local system'}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded p-2">
                  <div className="text-slate-400 mb-1">Protocol</div>
                  <div className="text-slate-300">MCP v1.0</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium"
          >
            {isExpanded ? 'Show Less' : 'More Info'}
          </button>
          <button
            onClick={() => onPreview(server)}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium"
          >
            Preview
          </button>
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            {isInstalling ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Installing...
              </>
            ) : (
              'Add Server'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
