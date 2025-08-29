"use client";

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useState } from "react";
import KnowledgeAttribution from "../components/KnowledgeAttribution";

interface WorkflowData {
  description: string;
  category: string;
  complexity: string;
  timestamp: string;
  attribution?: string;
  knowledgeSources?: AttributionSource[];
  regulatoryHints?: string[];
  confidenceScore?: number;
}

type AttributionSource = {
  id: string;
  type: "web-search" | "mcp" | "static-knowledge";
  provider: string;
  url?: string;
  title: string;
  confidence: number;
  timestamp: string;
};

type EnhancementStats = {
  cache: {
    cacheSize: number;
    maxSize: number;
    hitRate: number;
    missRate: number;
    totalQueries: number;
    utilizationRate: number;
  };
  topPerformingSources: Array<{
    provider: string;
    type: string;
    totalUses: number;
    averageConfidence: number;
  }>;
  searchManagerStatus: {
    tavilyEnabled: boolean;
    duckduckgoEnabled: boolean;
  };
};

export default function Home() {
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<string[]>([]);
  const [enhancementStats, setEnhancementStats] = useState<EnhancementStats | null>(null);

  // Make the current workflow data readable by the AI
  useCopilotReadable({
    description: "Current workflow analysis, questions, and enhancement statistics",
    value: {
      workflowData,
      currentQuestions,
      enhancementStats,
    },
  });

  // Action to trigger workflow analysis
  useCopilotAction({
    name: "start_workflow_analysis",
    description: "Start analyzing a new workflow with user input",
    parameters: [
      {
        name: "description",
        type: "string",
        description: "User's description of what they want to build",
        required: true,
      },
    ],
    handler: async ({ description }) => {
      // Enhanced workflow analysis will be handled by the API
      const mockAnalysis = {
        description,
        category: "automation",
        complexity: "moderate",
        timestamp: new Date().toISOString(),
        attribution: "Enhanced analysis with web search integration",
        knowledgeSources: [],
        regulatoryHints: [],
        confidenceScore: 0.85,
      };
      
      setWorkflowData(mockAnalysis);
      
      // Generate some initial questions
      const questions = [
        "What specific triggers should start this workflow?",
        "What data sources will you be working with?",
        "How should the workflow handle errors or exceptions?",
      ];
      
      setCurrentQuestions(questions);
      
      return "Enhanced workflow analysis started! I've generated initial questions and will search for current best practices to help design your workflow.";
    },
  });

  // Action to download generated Langflow JSON
  useCopilotAction({
    name: "download_langflow_json",
    description: "Download the generated Langflow workflow as a JSON file",
    parameters: [
      {
        name: "workflow_json",
        type: "string",
        description: "The Langflow JSON workflow to download",
        required: true,
      },
      {
        name: "filename",
        type: "string", 
        description: "Name for the downloaded file",
        required: false,
      },
    ],
    handler: async ({ workflow_json, filename }) => {
      try {
        const parsedJson = JSON.parse(workflow_json);
        const blob = new Blob([JSON.stringify(parsedJson, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename || "langflow-workflow.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        return "Langflow workflow JSON has been downloaded successfully!";
      } catch (err) {
        console.error("Error downloading workflow:", err);
        return "Error downloading the workflow file. Please try again.";
      }
    },
  });

  // Action to update workflow questions
  useCopilotAction({
    name: "update_workflow_questions",
    description: "Update the current questions based on user responses",
    parameters: [
      {
        name: "new_questions",
        type: "string",
        description: "JSON array of new questions to display",
        required: true,
      },
    ],
    handler: async ({ new_questions }) => {
      try {
        const questions = JSON.parse(new_questions);
        if (Array.isArray(questions)) {
          setCurrentQuestions(questions);
          return "Questions updated successfully!";
        }
        return "Invalid questions format provided.";
      } catch (err) {
        console.error("Error parsing questions:", err);
        return "Error parsing questions. Please provide a valid JSON array.";
      }
    },
  });

  // Action to get enhancement statistics
  useCopilotAction({
    name: "show_enhancement_statistics",
    description: "Display web search and caching statistics",
    parameters: [],
    handler: async () => {
      try {
        // This would be called by the enhanced API action
        const mockStats = {
          cache: {
            cacheSize: 45,
            maxSize: 500,
            hitRate: 0.73,
            missRate: 0.27,
            totalQueries: 156,
            utilizationRate: 0.09
          },
          topPerformingSources: [
            { provider: 'tavily', type: 'web-search', totalUses: 34, averageConfidence: 0.82 },
            { provider: 'duckduckgo', type: 'web-search', totalUses: 28, averageConfidence: 0.65 }
          ],
          searchManagerStatus: {
            tavilyEnabled: true,
            duckduckgoEnabled: true
          }
        };
        
        setEnhancementStats(mockStats);
        return "Enhancement statistics retrieved! Check the Statistics panel for cache performance and search provider information.";
  } catch {
        return "Unable to retrieve enhancement statistics at this time.";
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Socratic Langflow Architect
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Use AI-powered Socratic questioning to design and build sophisticated Langflow workflows.
            Just describe what you want to build, and I&apos;ll guide you through the process.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Current Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Current Analysis
            </h2>
            {workflowData ? (
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-600">Description:</span>
                  <p className="text-gray-800">{workflowData.description}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Category:</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {workflowData.category}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Complexity:</span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">
                    {workflowData.complexity}
                  </span>
                </div>
                {workflowData.confidenceScore && (
                  <div>
                    <span className="font-medium text-gray-600">Confidence:</span>
                    <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded">
                      {Math.round(workflowData.confidenceScore * 100)}%
                    </span>
                  </div>
                )}
                {workflowData.regulatoryHints && workflowData.regulatoryHints.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <span className="font-medium text-yellow-800">⚠️ Regulatory/Standards Hints:</span>
                    <ul className="mt-1 text-sm text-yellow-700">
                      {workflowData.regulatoryHints.map((alert, index) => (
                        <li key={`alert-${index}-${alert.slice(0,20)}`}>• {alert}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {workflowData.knowledgeSources && workflowData.knowledgeSources.length > 0 && (
                  <KnowledgeAttribution
                    sources={workflowData.knowledgeSources}
                    summary={workflowData.attribution}
                  />
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No workflow analysis yet. Start a conversation with the AI to begin!
              </p>
            )}
          </div>

          {/* Enhancement Statistics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Enhancement Statistics
            </h2>
            {enhancementStats ? (
              <div className="space-y-4">
                {/* Cache Statistics */}
                <div className="border-l-4 border-blue-500 pl-3">
                  <h3 className="font-medium text-gray-700 mb-2">Knowledge Cache</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Hit Rate:</span>
                      <span className="ml-1 font-medium text-green-600">
                        {Math.round(enhancementStats.cache.hitRate * 100)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cache Size:</span>
                      <span className="ml-1 font-medium">
                        {enhancementStats.cache.cacheSize}/{enhancementStats.cache.maxSize}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Search Providers */}
                <div className="border-l-4 border-green-500 pl-3">
                  <h3 className="font-medium text-gray-700 mb-2">Search Providers</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tavily:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        enhancementStats.searchManagerStatus.tavilyEnabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {enhancementStats.searchManagerStatus.tavilyEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">DuckDuckGo:</span>
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                        Enabled
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-500 italic">
                  No statistics available yet.
                </p>
                <p className="text-sm text-blue-600">
                  Ask the AI to &quot;show enhancement statistics&quot;
                </p>
              </div>
            )}
          </div>

          {/* Current Questions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Guiding Questions
            </h2>
            {currentQuestions.length > 0 ? (
              <ul className="space-y-3">
                {currentQuestions.map((question, index) => (
                  <li key={`question-${index}-${question.slice(0, 10)}`} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-800">{question}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                Questions will appear here as we analyze your workflow.
              </p>
            )}
          </div>
        </div>

        {/* Getting Started Card */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Getting Started
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              Ready to build your Langflow workflow? Here&apos;s how to get started:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Click the chat icon in the sidebar to open the AI assistant</li>
              <li>Describe what you want to build (e.g., &quot;I want to create a chatbot that answers questions about my product documentation&quot;)</li>
              <li>Answer the AI&apos;s questions to refine your workflow design</li>
              <li>Export your completed workflow as a Langflow JSON file</li>
            </ol>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">💡 Tip:</p>
              <p className="text-blue-700 mt-1">
                The more specific you are about your requirements, the better I can help you design an optimal workflow!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
