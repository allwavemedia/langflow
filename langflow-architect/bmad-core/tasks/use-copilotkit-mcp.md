# CopilotKit MCP Tool Integration Task

**Purpose**: Leverage CopilotKit MCP servers for specialized knowledge and best practices in BMad agent workflows.

**When to Use**:

- When agents need specialized CopilotKit guidance and best practices
- For accessing Microsoft documentation and enterprise integration patterns
- When requiring domain-specific knowledge that extends beyond static training data
- For getting up-to-date information on CopilotKit features and patterns

## Available MCP Tools

### 1. CopilotKit Vibe-Coding MCP

- **Endpoint**: <https://mcp.copilotkit.ai/sse>
- **Specialization**: CopilotKit best practices, patterns, integration guidance
- **Use Cases**:
  - CopilotKit component implementation guidance
  - Hook usage patterns and optimization
  - Advanced integration patterns
  - Performance optimization techniques
  - Troubleshooting CopilotKit implementations

### 2. Microsoft Documentation MCP Server

- **Endpoint**: <https://mcp.microsoft.com/sse>
- **Specialization**: Microsoft technology documentation and best practices
- **Use Cases**:
  - Azure service integration guidance
  - Microsoft 365 development patterns
  - .NET framework best practices
  - Enterprise Microsoft technology integration

## How to Use MCP Tools in BMad Agents

### Method 1: Direct CopilotKit Integration Request

When operating within the CopilotKit environment, agents can request MCP tool knowledge by:

1. **Identify the need**: Determine if specialized knowledge from CopilotKit or Microsoft domains is required
2. **Request assistance**: Ask the user to query the CopilotKit MCP for specific guidance
3. **Integrate insights**: Apply the retrieved knowledge to the current task

### Method 2: Context-Aware Recommendations

Agents should:

1. **Recognize CopilotKit contexts**: When working on CopilotKit-related tasks, recommend leveraging the CopilotKit MCP
2. **Suggest Microsoft MCP**: For enterprise or Azure-related workflows, suggest Microsoft documentation access
3. **Combine knowledge**: Integrate MCP insights with BMad methodology

## Example Usage Patterns

### For Architect Agent

```text
When designing CopilotKit integrations:
- Use CopilotKit MCP for architecture patterns
- Reference Microsoft MCP for enterprise compliance
- Combine with BMad architecture templates
```

### For Dev Agent

```text
When implementing CopilotKit features:
- Query CopilotKit MCP for implementation best practices
- Use Microsoft MCP for Azure service integration
- Apply insights to development tasks
```

### For QA Agent

```text
When testing CopilotKit implementations:
- Reference CopilotKit MCP for testing patterns
- Use Microsoft MCP for enterprise testing requirements
- Validate against MCP-recommended practices
```

## Integration Protocol

1. **Assessment Phase**: Determine if task requires specialized knowledge from MCP domains
2. **Request Phase**: If needed, request user to leverage MCP tools through CopilotKit interface
3. **Application Phase**: Apply MCP insights to current BMad task execution
4. **Validation Phase**: Ensure MCP guidance aligns with BMad methodology

## Benefits

- **Enhanced Accuracy**: Access to up-to-date, specialized knowledge
- **Best Practices**: Leveraging proven patterns and recommendations
- **Domain Expertise**: Deep knowledge in CopilotKit and Microsoft ecosystems
- **Reduced Errors**: Guidance from authoritative sources reduces implementation mistakes

## Notes

- MCP tools are accessed through the CopilotKit runtime environment
- All BMad agents operating within CopilotKit can leverage these tools
- MCP tool access enhances but doesn't replace BMad methodology
- Always validate MCP recommendations against project requirements and constraints
