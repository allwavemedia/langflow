// Domain Intelligence Demo - Epic 6.4.1 Integration
// Demonstrates the complete domain detection and expertise activation system

'use client';

import React, { useState } from 'react';
import DomainExpertiseProvider from '@/components/domain/DomainExpertiseProvider';
import DomainContextDisplay from '@/components/domain/DomainContextDisplay';
import ComponentRecommendations from '@/components/domain/ComponentRecommendations';
import { useDomainExpertise } from '@/components/domain/DomainExpertiseProvider';
import type { ComponentRecommendation } from '@/lib/enhanced/domainDetectionSystem';

// Sample conversation examples for different domains
const domainExamples = {
  healthcare: "I need to build a patient data management system that handles PHI and medical records while ensuring HIPAA compliance for our healthcare workflow.",
  finance: "We're developing a banking API that processes payments and transactions with PCI-DSS compliance and encryption for financial data security.",
  manufacturing: "I want to create a supply chain automation system that tracks inventory, manages production workflows, and integrates with ERP systems.",
  retail: "Building an e-commerce platform that handles customer data, order processing, inventory management, and integrates with payment gateways.",
  api_integration: "Need to design REST API endpoints with OAuth authentication, rate limiting, and webhook integration for third-party services.",
  cloud_infrastructure: "Setting up a microservices architecture on AWS with Docker containers, Kubernetes orchestration, and CI/CD pipelines."
};

export default function DomainIntelligenceDemo() {
  return (
    <DomainExpertiseProvider sessionId="demo-session" autoActivate={true}>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧠 Domain Intelligence System
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Epic 6.4.1 - Intelligent Domain Detection System with Dynamic Component Recommendations
          </p>
        </div>

        <DemoContent />
      </div>
    </DomainExpertiseProvider>
  );
}

function DemoContent() {
  const [inputText, setInputText] = useState('');
  const [selectedExample, setSelectedExample] = useState('');
  const { analyzeDomainContext, switchDomain, isAnalyzing, activeDomain, error } = useDomainExpertise();

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    await analyzeDomainContext(inputText);
  };

  const handleExampleSelect = async (domain: string, text: string) => {
    setSelectedExample(domain);
    setInputText(text);
    if (activeDomain) {
      await switchDomain(text);
    } else {
      await analyzeDomainContext(text);
    }
  };

  const handleComponentSelect = (component: ComponentRecommendation) => {
    console.log('Selected component:', component);
    // In a real implementation, this would add the component to the workflow
    alert(`Selected: ${component.name}\n\nDescription: ${component.description}\n\nThis would normally add the component to your Langflow workflow.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input Section */}
      <div className="lg:col-span-2 space-y-6">
        {/* Text Input */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-lg font-medium mb-3">🎯 Describe Your Project</h2>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe your project, use case, or requirements. Be specific about the domain, technologies, and compliance needs..."
            className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-gray-500">
              {inputText.length} characters
            </div>
            <button
              onClick={handleAnalyze}
              disabled={!inputText.trim() || isAnalyzing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Analyzing...' : activeDomain ? 'Switch Domain' : 'Analyze Domain'}
            </button>
          </div>
          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Domain Examples */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-lg font-medium mb-3">💡 Try These Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(domainExamples).map(([domain, text]) => (
              <button
                key={domain}
                onClick={() => handleExampleSelect(domain, text)}
                disabled={isAnalyzing}
                className={`p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 ${
                  selectedExample === domain ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="font-medium text-sm capitalize mb-1">
                  {domain.replace('_', ' ')}
                </div>
                <div className="text-xs text-gray-600 line-clamp-2">
                  {text.substring(0, 100)}...
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Component Recommendations */}
        <ComponentRecommendations 
          showFilters={true}
          maxRecommendations={8}
          onComponentSelect={handleComponentSelect}
        />
      </div>

      {/* Domain Context Sidebar */}
      <div className="space-y-6">
        <DomainContextDisplay showActions={true} />
        
        {/* System Status */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h3 className="font-medium text-base mb-3">🔧 System Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">MCP Integration:</span>
              <span className="text-green-600">✓ Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Web Search:</span>
              <span className="text-green-600">✓ Available</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Context Engine:</span>
              <span className="text-green-600">✓ Ready</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Domain Cache:</span>
              <span className="text-blue-600">📊 Learning</span>
            </div>
          </div>
        </div>

        {/* Architecture Info */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h3 className="font-medium text-base mb-3">🏗️ Architecture</h3>
          <div className="text-xs text-gray-600 space-y-2">
            <div>
              <strong>Dynamic Intelligence:</strong> No hardcoded patterns, fully adaptive domain detection
            </div>
            <div>
              <strong>MCP Integration:</strong> Real-time knowledge from Microsoft Docs and CopilotKit servers
            </div>
            <div>
              <strong>Web Search:</strong> Enhanced context from live web sources with attribution
            </div>
            <div>
              <strong>Component Matching:</strong> Relevance-scored recommendations based on domain expertise
            </div>
          </div>
        </div>

        {/* Epic Progress */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h3 className="font-medium text-base mb-3">📋 Epic 6.4.1 Progress</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>Domain Detection Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>MCP Knowledge Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>Web Search Enhancement</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>Component Recommendations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>React Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">🔄</span>
              <span>Demo & Validation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
