# Enhanced Langflow Architect Testing Scenarios

## Overview
This document provides comprehensive testing scenarios for the enhanced Langflow Architect application that includes:
- Context Understanding Engine with domain classification
- MCP Server integration for external knowledge sources
- Web search integration (Tavily + DuckDuckGo)
- Knowledge cache and attribution system
- Enhanced prompt engineering with external context

**Testing Philosophy**: The Langflow Architect is designed as a **universal workflow creation assistant** that adapts intelligently to ANY domain, technology stack, or use case. Testing scenarios cover diverse domains to validate this universal capability.

## Prerequisites

### Required Environment Variables
Create or update your `.env.local` file with the following:

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional (enhances search capabilities)
TAVILY_API_KEY=your_tavily_api_key_here

# Configuration
ENABLE_WEB_SEARCH=true
CACHE_TTL_SECONDS=3600
MAX_CACHE_SIZE=500
```

### Setting Up Microsoft Docs MCP Server

**Important**: The Microsoft Docs MCP server provides access to official Microsoft documentation and is perfect for testing M365, Azure, and Microsoft technology workflows.

#### MCP Server Information:
- **Repository**: https://github.com/microsoftdocs/mcp
- **Purpose**: Access to Microsoft documentation, Azure guides, M365 resources
- **Domains**: Microsoft 365, Azure, Windows, .NET, PowerShell, etc.

#### How to Add the Microsoft Docs MCP Server:

1. **Open the Langflow Architect application** at http://localhost:3000

2. **Use the MCP Server Management Action** in the CopilotKit chat:
   - Type: "Can you help me manage MCP servers?"
   - The assistant will offer to help with MCP server management

3. **Add the Microsoft Docs MCP Server** using this configuration:
   ```json
   {
     "id": "microsoft-docs",
     "name": "Microsoft Documentation MCP Server",
     "description": "Access to official Microsoft documentation, Azure guides, and M365 resources",
     "endpoint": "https://api.microsoftdocs.mcp.io",
     "domains": ["microsoft365", "azure", "dotnet", "powershell", "windows"],
     "capabilities": ["search", "documentation", "guides"],
     "authentication": {
       "type": "none"
     },
     "userAdded": true
   }
   ```

4. **Verify the server** by testing it with the management action

---

## Test Scenario 1: E-commerce Product Catalog Management

### Background Context
You are building an e-commerce platform and need a workflow for automated product catalog management, including inventory updates, price optimization, and product recommendations.

### Test Instructions

1. **Open the application** at http://localhost:3000

2. **Start the conversation** with this prompt:
   ```
   I'm building an e-commerce platform that sells electronics and need to create a Langflow workflow for automated product catalog management. The workflow should handle inventory updates from suppliers, dynamic pricing based on market conditions, product categorization using AI, and generate personalized product recommendations for customers. We use Shopify as our platform and need integration with payment processing.
   ```

3. **Expected Behavior**:
   - The system should detect "e-commerce" domain with high confidence
   - Should identify technology stack components (Shopify, payment processing)
   - Should query MCP servers for e-commerce best practices
   - Should perform web search for current e-commerce trends and pricing strategies
   - Should provide domain-specific questions about product types, categorization, pricing models

4. **Follow-up interactions**:
   - Answer questions about product categories (e.g., "We sell laptops, smartphones, gaming equipment")
   - Specify integration requirements (e.g., "We need real-time inventory sync and automated pricing")
   - Request specific AI recommendation features

---

## Test Scenario 2: Educational Content Creation Workflow

### Background Context
You are an educational institution looking to create automated workflows for course content generation, student assessment, and learning analytics.

### Test Instructions

1. **Start with an educational workflow request**:
   ```
   I work for an online education platform and need to create a Langflow workflow for automated course content creation. The workflow should generate quiz questions from course materials, provide automated essay grading, track student learning progress, and create personalized learning paths. We use Canvas LMS and want to integrate with various content sources and assessment tools.
   ```

2. **Expected Enhanced Behavior**:
   - Should classify as "education" domain
   - Should detect Canvas LMS and assessment technology requirements
   - Should query MCP servers for educational technology best practices
   - Should search for current educational AI and learning analytics trends
   - Should generate questions about assessment types, content sources, and learning objectives

3. **Progressive Complexity Testing**:
   - Request beginner-level questions for basic course setup
   - Then request advanced questions about learning analytics and AI assessment
   - Verify questions adapt to educational domain expertise

---

## Test Scenario 3: Financial Data Processing & Compliance

### Background Context
Testing the system's ability to handle financial domain requirements with regulatory compliance needs across multiple data sources.

### Test Instructions

1. **Financial workflow request**:
   ```
   I'm developing a financial analytics platform that needs to process trading data, perform risk assessment, generate compliance reports for SEC and FINRA regulations, and provide real-time fraud detection. The workflow should integrate with multiple data providers, handle high-frequency trading data, and ensure audit trails for all transactions.
   ```

2. **Expected Multi-Domain Integration**:
   - Should detect financial services domain with regulatory compliance requirements
   - Should identify trading and risk management technology stack
   - Should query MCP servers for financial compliance guidance
   - Should search for current SEC/FINRA requirements and fraud detection methods
   - Should provide sophisticated questions about data sources, compliance frameworks, and risk models

---

## Test Scenario 4: Manufacturing Quality Control Automation

### Background Context
Testing industrial/manufacturing domain recognition and IoT integration capabilities.

### Test Instructions

1. **Manufacturing workflow request**:
   ```
   I need a Langflow workflow for our manufacturing plant's quality control system. The workflow should collect data from IoT sensors on production lines, perform automated quality inspection using computer vision, trigger alerts for defects, manage inventory of raw materials, and generate production reports. We use Siemens PLCs and need integration with our ERP system.
   ```

2. **Expected Behavior**:
   - Should recognize manufacturing/industrial domain
   - Should identify IoT, computer vision, and ERP technology requirements
   - Should search for manufacturing quality control best practices
   - Should generate questions about sensor types, quality standards, and production processes

---

## Test Scenario 5: Content Management & Publishing Workflow

### Background Context
Testing media/publishing domain with content workflow automation needs.

### Test Instructions

1. **Content management request**:
   ```
   I'm creating a content management workflow for our digital publishing company. We need automated content ingestion from multiple sources, AI-powered content summarization, automated social media posting, SEO optimization, content moderation, and performance analytics. The workflow should integrate with WordPress, social media APIs, and Google Analytics.
   ```

2. **Expected Behavior**:
   - Should detect content management/publishing domain
   - Should identify CMS and social media technology stack
   - Should provide questions about content types, publishing schedules, and analytics requirements

---

## Test Scenario 6: Healthcare Document Management (Compliance Example)

### Background Context
This scenario tests the system's ability to handle domain-specific compliance requirements. You are representing a healthcare organization to test compliance-aware workflow creation.

### Test Instructions

1. **Open the application** at http://localhost:3000

2. **Start the conversation** with this prompt:
   ```
   I'm working for a healthcare organization and need to create a Langflow workflow for processing patient documents. We use Microsoft 365 SharePoint Online for document storage and need to ensure HIPAA compliance. The workflow should automatically categorize incoming medical documents, extract key information, and store them in the appropriate SharePoint libraries with proper metadata.
   ```

3. **Expected Behavior**:
   - The system should detect "healthcare" domain with high confidence
   - Should identify HIPAA compliance requirements
   - Should recognize Microsoft 365/SharePoint technology stack
   - Should query the Microsoft Docs MCP server for SharePoint best practices
   - Should perform web search for current HIPAA compliance guidelines
   - Should provide domain-specific questions about document types, categorization rules, etc.

4. **Follow-up interactions**:
   - Answer the generated questions about document types (e.g., "We process lab results, radiology reports, patient intake forms")
   - Specify technical requirements (e.g., "We need automated metadata extraction and approval workflows")
   - Ask for specific SharePoint integration guidance

5. **Verify Enhanced Features**:
   - Check that MCP server knowledge appears in responses
   - Look for web search results about current compliance standards
   - Verify source attribution in the UI
   - Check cache statistics in the enhancement panel

---

## Test Scenario 7: Azure DevOps CI/CD Pipeline with Advanced Features

### Background Context
You're a DevOps engineer at a fintech company building a complex CI/CD pipeline for a trading application that requires SOX compliance and multi-cloud deployment.

### Test Instructions

1. **Start with a complex workflow request**:
   ```
   I need to create a sophisticated Langflow workflow for our fintech trading application CI/CD pipeline. We're using Azure DevOps, need SOX compliance for financial regulations, and want to deploy across Azure and AWS. The workflow should include automated testing, security scanning, compliance validation, and progressive deployment with rollback capabilities.
   ```

2. **Expected Enhanced Behavior**:
   - Should classify as "finance" domain with compliance requirements
   - Should detect Azure/AWS multi-cloud technology stack
   - Should identify SOX compliance framework
   - Should query Microsoft Docs MCP for Azure DevOps best practices
   - Should search web for current SOX compliance requirements for CI/CD
   - Should generate advanced-level questions due to complexity

3. **Progressive Question Testing**:
   - Request intermediate-level questions: "Can you generate intermediate-level questions for this DevOps workflow?"
   - Then request advanced-level questions: "Now give me advanced-level questions"
   - Verify the questions increase in technical complexity and specificity

4. **MCP Server Integration Testing**:
   - Ask: "What are the latest Azure DevOps security recommendations?"
   - Verify that responses include MCP server knowledge
   - Check source attribution showing Microsoft Docs server

---

## Test Scenario 8: E-commerce Automation with Multiple Knowledge Sources

### Background Context
Testing the system's ability to combine web search, MCP server knowledge, and context understanding for an e-commerce automation workflow.

### Test Instructions

1. **Multi-domain workflow request**:
   ```
   I'm building an e-commerce platform automation workflow that needs to integrate with Microsoft Power Platform for customer relationship management, handle PCI DSS compliance for payment processing, and automate inventory management across multiple suppliers. The workflow should use AI for demand forecasting and dynamic pricing.
   ```

2. **Expected Multi-Source Integration**:
   - Should detect e-commerce domain with PCI DSS compliance needs
   - Should identify Microsoft Power Platform in technology stack
   - Should query MCP server for Power Platform integration guides
   - Should search web for current PCI DSS requirements and AI pricing strategies
   - Should cache and attribute information from multiple sources

3. **Source Attribution Verification**:
   - Check that responses clearly show:
     - Web search results with confidence scores
     - MCP server knowledge attribution
     - Cache hit/miss statistics
   - Verify the knowledge attribution component displays all sources

---

## Test Scenario 9: MCP Server Management and Configuration

### Testing MCP Server Lifecycle

1. **List Current Servers**:
   ```
   Can you show me all available MCP servers and their status?
   ```

2. **Test Server Connectivity**:
   ```
   Please test the Microsoft Docs MCP server connectivity
   ```

3. **Add Additional Server** (simulated):
   ```
   I want to add a custom MCP server for our internal documentation. Here's the configuration:
   {
     "id": "internal-docs",
     "name": "Internal Company Documentation",
     "description": "Access to internal company policies and procedures",
     "endpoint": "https://docs.company.internal",
     "domains": ["internal", "policies", "procedures"],
     "capabilities": ["search", "policies"],
     "authentication": {"type": "api_key"},
     "userAdded": true
   }
   ```

4. **Verify Enhanced Statistics**:
   ```
   Show me the enhancement statistics including cache performance and search provider status
   ```

---

## Test Scenario 10: Edge Cases and Fallback Testing

### Testing Graceful Degradation

1. **Test with limited API access** (temporarily disable TAVILY_API_KEY):
   - Should fall back to DuckDuckGo search
   - Should still provide MCP server integration
   - Should clearly indicate fallback mode in attribution

2. **Test with no external access**:
   - Should fall back to context engine and local knowledge
   - Should maintain conversational flow
   - Should provide clear error messaging about unavailable features

3. **Test context evolution**:
   ```
   Start with: "I need a simple chatbot"
   Then evolve: "Actually, it's for a hospital patient support system"
   Then add: "And it needs to integrate with our Epic EHR system"
   ```
   - Verify context understanding evolves
   - Check that domain classification updates
   - Ensure compliance requirements are added

---

## Verification Checklist

### ✅ Core Functionality
- [ ] Application loads without errors at http://localhost:3000
- [ ] CopilotKit chat interface is responsive
- [ ] Domain classification works with high accuracy
- [ ] Questions are generated appropriately for expertise level

### ✅ MCP Server Integration
- [ ] Microsoft Docs MCP server can be added successfully
- [ ] Server status and health monitoring works
- [ ] MCP knowledge appears in responses with proper attribution
- [ ] Server management actions (list, test, toggle) function correctly

### ✅ Web Search Integration
- [ ] Web search results appear in responses
- [ ] Tavily API integration works (if API key provided)
- [ ] DuckDuckGo fallback functions correctly
- [ ] Search results have confidence scores and source attribution

### ✅ Knowledge Cache & Attribution
- [ ] Cache statistics are displayed and update
- [ ] Source attribution component shows all knowledge sources
- [ ] Cache hit/miss rates are tracked
- [ ] TTL-based cache invalidation works

### ✅ Enhanced UI Features
- [ ] Three-panel dashboard layout functions
- [ ] Current Analysis panel shows domain detection and compliance alerts
- [ ] Enhancement Statistics panel displays cache and search metrics
- [ ] Guiding Questions panel adapts to context and expertise level
- [ ] KnowledgeAttribution component displays transparent source information

### ✅ Compliance & Security
- [ ] HIPAA compliance alerts appear for healthcare workflows
- [ ] GDPR considerations shown for EU-related workflows
- [ ] SOX compliance noted for financial workflows
- [ ] PCI DSS requirements identified for payment processing workflows

### ✅ Error Handling & Fallbacks
- [ ] Application continues to function without API keys
- [ ] Clear error messages when enhanced features unavailable
- [ ] Graceful degradation maintains core Socratic questioning
- [ ] Multiple fallback layers work correctly

---

## Expected Performance Metrics

- **Domain Classification Accuracy**: >90% for clear domain indicators
- **Cache Hit Rate**: Target >70% for repeated similar queries
- **Response Time**: <3 seconds for enhanced analysis
- **MCP Server Response**: <2 seconds for knowledge queries
- **Web Search Integration**: <5 seconds for search result incorporation

---

## Troubleshooting Common Issues

### Issue: MCP Server Not Responding
**Solution**: Check server configuration and network connectivity. Use the test action to verify.

### Issue: Web Search Not Working
**Solution**: Verify API keys in .env.local file. Check that ENABLE_WEB_SEARCH=true.

### Issue: Cache Statistics Not Updating
**Solution**: Ensure multiple queries are made. Cache updates may take time to reflect.

### Issue: Domain Classification Incorrect
**Solution**: Provide more specific domain indicators in your test prompts.

---

## Success Criteria

The enhanced Langflow Architect is functioning correctly when:
1. All test scenarios complete without errors across diverse domains
2. Domain classification accurately identifies context for each use case (e-commerce, education, healthcare, finance, manufacturing, etc.)
3. MCP server integration provides relevant knowledge for the specific domain
4. Web search enhances responses with current information relevant to the domain
5. Source attribution is transparent and complete
6. Context understanding adapts to conversation requirements for any industry
7. Compliance frameworks are correctly identified when applicable to the domain
8. Fallback mechanisms maintain application functionality
9. Performance metrics meet or exceed targets across all domains
10. The system demonstrates universal adaptability rather than domain-specific focus

This testing document ensures comprehensive validation of the **universal workflow creation capabilities** while providing realistic scenarios that demonstrate the application's ability to intelligently adapt to any domain, technology stack, or use case requirement.
