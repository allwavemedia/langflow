# Socratic Langflow Architect - Comprehensive Testing Guide

This document provides a complete guide for testing the Socratic Langflow Architect application, including live API integration tests that validate the full user journey and Socratic questioning workflow.

## Test Suite Overview

Our testing strategy covers four key areas:

1. **Unit Tests** - Component logic and utility functions
2. **Integration Tests** - CopilotKit actions and API endpoints  
3. **End-to-End Tests** - Full user workflow scenarios
4. **Live API Tests** - Real OpenAI API integration validation

## Prerequisites

### Environment Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Playwright Browsers**
   ```bash
   npm run playwright:install
   ```

3. **Configure Environment Variables**
   Create `.env.local` with:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   COPILOTKIT_DEBUG=true
   ```

## Running Tests

### Quick Start - Run All Tests
```bash
npm run test:all
```

### Individual Test Categories

#### Unit Tests
```bash
# Run once
npm test

# Watch mode (for development)
npm run test:watch

# With coverage report
npm run test:coverage
```

#### End-to-End Tests
```bash
# Headless mode
npm run test:e2e

# With browser UI (for debugging)
npm run test:e2e:ui
```

#### Live API Integration Tests
```bash
# Specific API tests
npm run test:api

# Or run directly with Playwright
npx playwright test __tests__/e2e/copilotkit-integration.spec.ts
```

## Live API Integration Tests - Deep Dive

The live API tests (`copilotkit-integration.spec.ts`) validate the complete Socratic Langflow Architect workflow with real API calls.

### Test Scenarios Covered

#### 1. Complete Socratic Workflow Journey
Tests the full user journey for creating a customer support chatbot:

```typescript
// Example API call tested:
{
  messages: [
    { role: 'user', content: 'I want to create a customer support chatbot for my e-commerce business' }
  ],
  actions: [
    {
      name: 'analyze_workflow_requirements',
      parameters: {
        domain: 'e-commerce customer support',
        complexity: 'moderate',
        requirements: 'Create a chatbot that can handle customer inquiries about orders, returns, and product information'
      }
    }
  ]
}
```

**Validations:**
- ✅ API returns 200 status
- ✅ Response contains proper OpenAI choice structure
- ✅ Analysis includes domain-specific questions
- ✅ Recommended components are relevant

#### 2. Dynamic Socratic Questioning
Tests the question generation for different scenarios:

- **E-commerce Automation**: "I want to automate my email marketing"
- **Data Processing**: "I need to process large datasets of customer feedback"  
- **Content Generation**: "Simple blog content generator"

**Validations:**
- ✅ Questions adapt to domain and complexity
- ✅ Expertise level influences question depth
- ✅ Responses contain actual question markers (?)
- ✅ Keywords match expected domain terminology

#### 3. Langflow JSON Generation
Tests the generation of valid Langflow workflow JSON:

```typescript
// Example workflow generation:
{
  workflow_description: 'E-commerce customer support chatbot with OpenAI integration',
  components: 'ChatInput, OpenAI Model, Conditional Logic, Knowledge Base Search, ChatOutput'
}
```

**Validations:**
- ✅ Generated JSON has proper Langflow structure
- ✅ Nodes contain required properties (id, type, position, data)
- ✅ Edges properly connect nodes (source, target)
- ✅ Workflow description matches requirements

#### 4. Error Handling and Performance
Tests API resilience and performance characteristics:

**Error Scenarios:**
- Invalid action parameters
- Malformed requests
- Missing required fields

**Performance Metrics:**
- Average response time < 15 seconds
- Maximum response time < 30 seconds
- 100% API call success rate (with valid API key)

### API Test Results Interpretation

#### Success Indicators
- ✅ All API calls return 200 status
- ✅ Responses contain valid OpenAI choice structures
- ✅ Generated content is contextually relevant
- ✅ Socratic questions contain domain-specific terminology
- ✅ Langflow JSON validates against schema

#### Performance Benchmarks
- **Acceptable**: < 10 seconds average response time
- **Good**: < 5 seconds average response time  
- **Excellent**: < 3 seconds average response time

#### Common Issues and Solutions

**Issue**: API tests skipped
**Solution**: Verify `OPENAI_API_KEY` is set in `.env.local`

**Issue**: Long response times
**Solution**: Check OpenAI API status and network connectivity

**Issue**: Invalid JSON in responses
**Solution**: Review prompt engineering in API route handlers

## Test Data and Scenarios

### Predefined Test Scenarios

The test suite includes comprehensive scenarios for different workflow types:

#### Chatbot Workflows
- **Simple**: Basic FAQ chatbot for websites
- **Moderate**: Customer support with context and API integration
- **Complex**: Advanced AI assistant with analytics

#### Data Processing Workflows  
- **Simple**: CSV processing and summaries
- **Moderate**: Document pipeline with OCR
- **Complex**: Real-time streaming with validation

#### Automation Workflows
- **Simple**: Email notification automation
- **Moderate**: Order fulfillment with approvals
- **Complex**: Multi-integration business processes

### Custom Test Scenarios

You can add custom test scenarios by modifying the test files:

```typescript
// In copilotkit-integration.spec.ts
const customScenario = {
  userInput: 'Your custom workflow description',
  expectedDomain: 'your domain',
  expectedComplexity: 'simple|moderate|complex',
  expectedQuestions: ['keyword1', 'keyword2'],
  expectedComponents: ['Component1', 'Component2']
}
```

## Summary

The Socratic Langflow Architect test suite provides comprehensive validation of:

- ✅ **Frontend Components** - React component behavior and UI interactions
- ✅ **API Integration** - CopilotKit and OpenAI API communication
- ✅ **Socratic Methodology** - Question generation and workflow analysis
- ✅ **Langflow Generation** - Valid JSON workflow creation
- ✅ **Performance** - Response times and reliability
- ✅ **Error Handling** - Graceful failure and recovery

This ensures that the application correctly implements the Socratic questioning methodology and produces valid Langflow workflows for users across different domains and complexity levels.
