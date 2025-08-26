# 🤖 CopilotKit API Documentation

## Socratic Langflow Architect - AI Actions & Integration

This document provides comprehensive documentation for the CopilotKit actions implemented in the Socratic Langflow Architect application.

## Overview

The Socratic Langflow Architect uses CopilotKit to provide an intelligent, conversational interface for creating Langflow workflows through Socratic questioning methodology.

### Core Principles

- **Socratic Methodology**: AI guides users through thoughtful questions rather than direct answers
- **Iterative Refinement**: Multiple rounds of questions and responses to clarify requirements
- **Intelligent Analysis**: AI analyzes complexity and domain to generate appropriate questions
- **Workflow Generation**: Automatic creation of complete Langflow JSON based on conversation

## API Endpoint

**Base URL**: `http://localhost:3000/api/copilotkit`

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
X-CopilotKit-Runtime-Version: 1.10.2
```

## Available Actions

### 1. Analyze Workflow Requirements

**Action Name**: `analyze_workflow_requirements`

**Description**: Analyzes user requirements and suggests workflow structure for Langflow using Socratic questioning principles.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `domain` | string | ✅ | The domain or industry for the workflow (e.g., "e-commerce", "healthcare", "finance") |
| `complexity` | string | ✅ | The complexity level: "simple", "moderate", or "complex" |
| `requirements` | string | ✅ | Detailed description of specific requirements |

#### Example Request

```json
{
  "action": "analyze_workflow_requirements",
  "parameters": {
    "domain": "e-commerce",
    "complexity": "moderate", 
    "requirements": "customer support chatbot with FAQ handling, order tracking, and escalation to human agents"
  }
}
```

#### Example Response

```json
{
  "questions": [
    "What specific types of customer inquiries do you handle most frequently?",
    "How do you currently track and manage customer orders?", 
    "What criteria should trigger escalation to human agents?",
    "Do you have existing knowledge bases or FAQs to integrate?",
    "What customer data do you need to access during conversations?"
  ],
  "analysis": {
    "domain_complexity": "moderate",
    "estimated_nodes": 8,
    "suggested_components": ["input_processor", "intent_classifier", "order_lookup", "faq_search", "escalation_logic"]
  },
  "next_steps": "Please answer these questions to help me design the optimal workflow structure."
}
```

#### Complexity-Based Question Generation

**Simple Workflows** (3-5 nodes):
- Basic input/output flows
- Single-purpose applications
- Minimal branching logic

**Moderate Workflows** (6-12 nodes):
- Multi-step processes
- Conditional branching
- External API integrations

**Complex Workflows** (13+ nodes):
- Advanced decision trees
- Multiple data sources
- Error handling and recovery
- Performance optimization

### 2. Generate Workflow Questions

**Action Name**: `generate_workflow_questions`

**Description**: Generates follow-up Socratic questions based on user responses to previous questions.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `domain` | string | ✅ | The workflow domain |
| `current_question` | string | ✅ | The previous question asked |
| `user_response` | string | ✅ | User's response to the previous question |
| `context` | string | ✅ | Overall context of the workflow being designed |

#### Example Request

```json
{
  "action": "generate_workflow_questions", 
  "parameters": {
    "domain": "e-commerce",
    "current_question": "What specific types of customer inquiries do you handle?",
    "user_response": "We handle orders, returns, product questions, and shipping inquiries",
    "context": "customer support chatbot development"
  }
}
```

#### Example Response

```json
{
  "follow_up_questions": [
    "How do you currently prioritize these different types of inquiries?",
    "What information do you need to collect from customers for each inquiry type?",
    "Are there specific business rules for handling returns vs. new orders?"
  ],
  "insights": [
    "Multiple inquiry types suggest need for intent classification",
    "Order and return handling will require database integration",
    "Shipping inquiries may need real-time tracking API integration"
  ],
  "workflow_implications": {
    "required_nodes": ["intent_classifier", "order_handler", "return_processor", "shipping_tracker"],
    "data_requirements": ["customer_id", "order_number", "product_catalog"],
    "external_apis": ["order_management_system", "shipping_provider"]
  }
}
```

### 3. Generate Langflow JSON

**Action Name**: `generate_langflow_json`

**Description**: Creates a complete Langflow workflow JSON based on the accumulated conversation and requirements.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `domain` | string | ✅ | The workflow domain |
| `complexity` | string | ✅ | Complexity level determined from analysis |
| `requirements` | string | ✅ | Complete requirements description |
| `user_responses` | string | ✅ | Concatenated user responses from the conversation |

#### Example Request

```json
{
  "action": "generate_langflow_json",
  "parameters": {
    "domain": "e-commerce", 
    "complexity": "moderate",
    "requirements": "customer support chatbot with FAQ, order tracking, and human escalation",
    "user_responses": "Handle orders, returns, product questions; Use Shopify platform; Escalate after 3 failed attempts; Integrate with existing CRM"
  }
}
```

#### Example Response

```json
{
  "workflow_json": "{\"nodes\":[{\"id\":\"input_1\",\"type\":\"ChatInput\",\"position\":{\"x\":100,\"y\":100},\"data\":{\"input_value\":\"\",\"template\":{\"sender_type\":\"User\",\"sender_name\":\"User\",\"session_id\":\"\",\"should_store_message\":true,\"message\":{\"load_from_db\":false,\"type\":\"str\",\"required\":true,\"placeholder\":\"\",\"list\":false,\"show\":true,\"value\":\"\",\"name\":\"message\"}}}},{\"id\":\"intent_2\",\"type\":\"ConditionalRouter\",\"position\":{\"x\":300,\"y\":100},\"data\":{\"template\":{\"rules\":[\"order_inquiry\",\"return_request\",\"product_question\",\"general_support\"]}}},{\"id\":\"order_handler_3\",\"type\":\"APIRequest\",\"position\":{\"x\":500,\"y\":50},\"data\":{\"template\":{\"url\":\"https://api.shopify.com/orders\",\"method\":\"GET\"}}},{\"id\":\"faq_search_4\",\"type\":\"VectorStore\",\"position\":{\"x\":500,\"y\":150},\"data\":{\"template\":{\"collection_name\":\"faq_database\"}}},{\"id\":\"escalation_5\",\"type\":\"ConditionalRouter\",\"position\":{\"x\":700,\"y\":100},\"data\":{\"template\":{\"condition\":\"failed_attempts > 3\"}}},{\"id\":\"output_6\",\"type\":\"ChatOutput\",\"position\":{\"x\":900,\"y\":100},\"data\":{\"template\":{\"sender_type\":\"Machine\",\"sender_name\":\"Assistant\",\"session_id\":\"\",\"message\":{\"type\":\"str\",\"required\":true,\"value\":\"\",\"name\":\"message\"}}}}],\"edges\":[{\"id\":\"e1-2\",\"source\":\"input_1\",\"target\":\"intent_2\",\"sourceHandle\":\"output\",\"targetHandle\":\"input\"},{\"id\":\"e2-3\",\"source\":\"intent_2\",\"target\":\"order_handler_3\",\"sourceHandle\":\"order_inquiry\",\"targetHandle\":\"input\"},{\"id\":\"e2-4\",\"source\":\"intent_2\",\"target\":\"faq_search_4\",\"sourceHandle\":\"product_question\",\"targetHandle\":\"input\"},{\"id\":\"e3-5\",\"source\":\"order_handler_3\",\"target\":\"escalation_5\",\"sourceHandle\":\"output\",\"targetHandle\":\"input\"},{\"id\":\"e4-5\",\"source\":\"faq_search_4\",\"target\":\"escalation_5\",\"sourceHandle\":\"output\",\"targetHandle\":\"input\"},{\"id\":\"e5-6\",\"source\":\"escalation_5\",\"target\":\"output_6\",\"sourceHandle\":\"output\",\"targetHandle\":\"input\"}]}",
  "metadata": {
    "total_nodes": 6,
    "total_edges": 6,
    "complexity_score": 7.5,
    "estimated_tokens": 1200,
    "required_integrations": ["Shopify API", "Vector Database", "CRM System"]
  },
  "documentation": {
    "workflow_description": "A moderate complexity customer support chatbot that processes customer inquiries through intent classification, handles orders via Shopify API, searches FAQ database for product questions, and escalates to human agents when needed.",
    "node_descriptions": {
      "input_1": "Receives customer messages",
      "intent_2": "Classifies customer intent (order, return, product, general)",
      "order_handler_3": "Handles order-related inquiries via Shopify API",
      "faq_search_4": "Searches FAQ database for product information",
      "escalation_5": "Determines if human escalation is needed",
      "output_6": "Sends response back to customer"
    },
    "setup_instructions": [
      "Configure Shopify API credentials",
      "Setup FAQ vector database",
      "Configure escalation rules and thresholds",
      "Test all API integrations"
    ]
  }
}
```

## Frontend Integration

### CopilotKit Hooks

The frontend uses CopilotKit React hooks to integrate with these actions:

#### useCopilotAction Hook

```typescript
import { useCopilotAction } from "@copilotkit/react-core";

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
    // Trigger workflow analysis
    // This calls the analyze_workflow_requirements action internally
  },
});
```

#### useCopilotReadable Hook

```typescript
import { useCopilotReadable } from "@copilotkit/react-core";

useCopilotReadable({
  description: "Current workflow analysis and questions",
  value: {
    workflowData,
    currentQuestions,
  },
});
```

## Error Handling

### Common Error Responses

#### Missing Parameters
```json
{
  "errors": [
    {
      "message": "Missing required parameter: domain",
      "extensions": {
        "code": "BAD_REQUEST"
      }
    }
  ]
}
```

#### Invalid Complexity Level
```json
{
  "errors": [
    {
      "message": "Invalid complexity level. Must be: simple, moderate, or complex",
      "extensions": {
        "code": "VALIDATION_ERROR"
      }
    }
  ]
}
```

#### OpenAI API Error
```json
{
  "errors": [
    {
      "message": "OpenAI API request failed",
      "extensions": {
        "code": "EXTERNAL_SERVICE_ERROR",
        "details": "Rate limit exceeded"
      }
    }
  ]
}
```

## Testing the API

### Using Playwright Tests

The live integration tests validate all API actions:

```bash
# Run complete API validation
npx playwright test __tests__/e2e/copilotkit-live-integration.spec.ts
```

### Manual Testing with curl

```bash
# Test endpoint availability
curl -X POST http://localhost:3000/api/copilotkit \
  -H "Content-Type: application/json" \
  -d '{"test": "connectivity"}'

# Expected: 400 Bad Request (confirms endpoint is working)
```

### Integration Testing

```typescript
// Example integration test
test('should complete workflow generation flow', async ({ page }) => {
  // Navigate to application
  await page.goto('/')
  
  // Find chat input
  const chatInput = page.locator('textarea').first()
  
  // Send initial request
  await chatInput.fill('I want to create a customer support chatbot')
  await chatInput.press('Enter')
  
  // Wait for AI response with questions
  await page.waitForSelector('.ai-response')
  
  // Validate questions are generated
  const questions = await page.locator('.question-item').count()
  expect(questions).toBeGreaterThan(0)
})
```

## Performance Considerations

### Response Times
- **Simple workflows**: 2-5 seconds
- **Moderate workflows**: 5-10 seconds  
- **Complex workflows**: 10-30 seconds

### Rate Limiting
- OpenAI API limits apply
- Recommended: Implement request queuing for high traffic
- Consider caching for common workflow patterns

### Optimization Tips
1. **Batch related questions** to reduce API calls
2. **Cache domain-specific templates** for faster generation
3. **Pre-validate parameters** before OpenAI API calls
4. **Use streaming responses** for better user experience

## Next Steps

1. **Webhook Integration**: Add support for real-time workflow updates
2. **Template Library**: Pre-built templates for common use cases
3. **Version Control**: Track workflow iterations and changes
4. **Collaboration**: Multi-user workflow design sessions
5. **Analytics**: Usage patterns and optimization insights

---

**API Version**: 1.0.0  
**CopilotKit Version**: 1.10.2  
**Last Updated**: August 2025
