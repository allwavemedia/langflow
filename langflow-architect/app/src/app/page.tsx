"use client";

import { useEffect, useState } from "react";
import { ModernChatInterface } from "@/components/ModernChatInterface";
import { CopilotIntegration } from "@/components/CopilotIntegration";

// Core types for workflow data and statistics
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
  const [isClient, setIsClient] = useState(false);
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<string[]>([]);
  const [enhancementStats, setEnhancementStats] = useState<EnhancementStats | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* CopilotKit Actions Integration */}
      {isClient && (
        <CopilotIntegration 
          workflowData={workflowData}
          currentQuestions={currentQuestions}
          enhancementStats={enhancementStats}
          setWorkflowData={setWorkflowData}
          setCurrentQuestions={setCurrentQuestions}
          setEnhancementStats={setEnhancementStats}
          isClient={isClient}
        />
      )}
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Socratic Langflow Architect
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                AI-Powered Socratic Workflow Design Assistant - Epic 6.4.3
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                CopilotKit Active
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area with Integrated Chat */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
          
          {/* Welcome/Instructions Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Welcome to Socratic Workflow Design
                </h2>
                <p className="text-gray-600 mb-4">
                  I&apos;m your AI assistant that uses Socratic questioning to help you design better workflows. 
                  Instead of jumping straight to solutions, I&apos;ll guide you through thoughtful questions 
                  to understand your needs deeply.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Share your workflow idea or challenge</li>
                  <li>• I&apos;ll ask clarifying questions to understand your needs</li>
                  <li>• Together we&apos;ll explore requirements and constraints</li>
                  <li>• Discover optimal patterns and solutions through guided discovery</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">Available Capabilities:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-green-800">
                  <div>✓ Clarification Questions</div>
                  <div>✓ Root Cause Analysis</div>
                  <div>✓ Alternative Exploration</div>
                  <div>✓ Assumption Challenges</div>
                </div>
              </div>

              {/* Current Analysis Display */}
              {workflowData && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Current Analysis:</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Description:</span>
                      <p className="text-gray-800 mt-1">{workflowData.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {workflowData.category}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {workflowData.complexity}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Questions Display */}
              {currentQuestions.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Guiding Questions:</h3>
                  <ul className="space-y-2">
                    {currentQuestions.slice(-3).map((question, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="flex-shrink-0 w-4 h-4 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5">
                          {currentQuestions.length - 2 + index}
                        </span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Ready to start?</h3>
                <p className="text-sm text-gray-600">
                  Use the chat interface on the right to begin describing your workflow needs. 
                  I&apos;ll guide you through the discovery process with thoughtful questions.
                </p>
              </div>
            </div>
          </div>

          {/* Modern Chat Interface */}
          <div className="bg-white rounded-lg shadow-lg h-full">
            <ModernChatInterface 
              isClient={isClient} 
              className="h-full"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
