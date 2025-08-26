import React from 'react';

interface KnowledgeSource {
  id: string;
  type: 'web-search' | 'mcp' | 'static-knowledge';
  provider: string;
  url?: string;
  title: string;
  confidence: number;
  timestamp: string;
}

interface KnowledgeAttributionProps {
  sources: KnowledgeSource[];
  summary?: string;
  showDetails?: boolean;
}

export const KnowledgeAttribution: React.FC<KnowledgeAttributionProps> = ({
  sources,
  summary,
  showDetails = false
}) => {
  const [isExpanded, setIsExpanded] = React.useState(showDetails);

  if (!sources || sources.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic mt-2">
        Response based on static knowledge
      </div>
    );
  }

  const sourceTypeColors = {
    'web-search': 'bg-blue-100 text-blue-800',
    'mcp': 'bg-green-100 text-green-800',
    'static-knowledge': 'bg-gray-100 text-gray-800'
  };

  const sourceTypeIcons = {
    'web-search': '🔍',
    'mcp': '🏢',
    'static-knowledge': '📚'
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Knowledge Sources:</span>
          <span className="text-xs text-gray-500">
            {sources.length} source{sources.length > 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          {isExpanded ? 'Hide details' : 'Show details'}
        </button>
      </div>

      {summary && (
        <div className="mt-2 text-sm text-gray-600">
          {summary}
        </div>
      )}

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {sources.map((source, index) => (
            <div 
              key={source.id} 
              className="flex items-start space-x-3 p-2 bg-white rounded border"
            >
              <span className="text-lg">
                {sourceTypeIcons[source.type]}
              </span>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {source.url ? (
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                      >
                        {source.title}
                      </a>
                    ) : (
                      source.title
                    )}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${sourceTypeColors[source.type]}`}>
                    {source.provider}
                  </span>
                </div>
                
                <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                  <span>Confidence: {Math.round(source.confidence * 100)}%</span>
                  <span>Type: {source.type.replace('-', ' ')}</span>
                  <span>
                    {new Date(source.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Average confidence: {Math.round(
                sources.reduce((sum, s) => sum + s.confidence, 0) / sources.length * 100
              )}%
              • Last updated: {new Date(Math.max(...sources.map(s => new Date(s.timestamp).getTime()))).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeAttribution;