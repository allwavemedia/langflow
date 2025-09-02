"use client";

import { useState, useEffect } from "react";
import { CopilotChat } from "@copilotkit/react-ui";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ModernChatInterfaceProps {
  isClient: boolean;
  className?: string;
}

export function ModernChatInterface({ isClient, className = "" }: ModernChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  // Initial welcome message
  useEffect(() => {
    if (isClient && messages.length === 0) {
      setMessages([{
        id: 'welcome-1',
        role: 'assistant',
        content: "Hi! I'm your Socratic Langflow Architect. I'll help you create sophisticated workflows through intelligent questioning. What kind of workflow would you like to build today?",
        timestamp: new Date()
      }]);
    }
  }, [isClient, messages.length]);

  if (!isClient) {
    return (
      <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-xs text-gray-500">Socratic Questioning Mode</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-gray-500">Online</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label={isExpanded ? "Minimize chat" : "Expand chat"}
          >
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? '' : 'rotate-180'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Content */}
      {isExpanded && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* CopilotKit Chat Integration */}
          <div className="flex-1 relative">
            <CopilotChat
              instructions="You are a Socratic Langflow Architect. Use thoughtful questions to guide users through workflow design. Focus on understanding their needs deeply before proposing solutions."
              labels={{
                title: "Socratic Langflow Architect",
                initial: "Hi! I'm your Socratic Langflow Architect. I'll help you create sophisticated workflows through intelligent questioning. What kind of workflow would you like to build today?",
                placeholder: "Describe what you want to build...",
              }}
              makeSystemMessage={(instructions) => `${instructions}\n\nRemember to:\n1. Ask clarifying questions before jumping to solutions\n2. Help users think through their requirements systematically\n3. Guide them to discover optimal workflow patterns\n4. Provide expert advice while encouraging user discovery`}
              onInProgress={(inProgress) => console.log("Chat processing:", inProgress)}
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* Minimized State Preview */}
      {!isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Ready to help with workflow design</span>
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              Start Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModernChatInterface;
