/**
 * MCP Tool Utilities
 * Based on CopilotKit's official MCP tool utilities
 */

import { McpServerConfig } from '@/types/mcp';

/**
 * JSON Schema property definition
 */
export interface JsonSchemaProperty {
  type?: string;
  description?: string;
  enum?: unknown[];
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

/**
 * Represents a tool provided by an MCP server
 * Matches CopilotKit's MCPTool interface exactly
 */
export interface MCPTool {
  description?: string;
  schema?: {
    parameters?: {
      properties?: Record<string, JsonSchemaProperty>;
      required?: string[];
      jsonSchema?: Record<string, JsonSchemaProperty>;
    };
  };
  execute(params: Record<string, unknown>): Promise<unknown>;
}

/**
 * Generate enhanced instructions for using MCP tools
 * Based on CopilotKit's generateMcpToolInstructions function
 */
export function generateMcpToolInstructions(toolsMap: Record<string, MCPTool>): string {
  if (!toolsMap || Object.keys(toolsMap).length === 0) {
    return "";
  }

  const toolEntries = Object.entries(toolsMap);

  // Generate documentation for each tool
  const toolsDoc = toolEntries
    .map(([name, tool]) => {
      let paramsDoc = "    No parameters required";

      try {
        if (tool.schema && typeof tool.schema === "object") {
          const schema = tool.schema;
          const toolParameters = schema.parameters?.jsonSchema || schema.parameters;
          const properties = toolParameters?.properties || (schema as Record<string, unknown>).properties as Record<string, JsonSchemaProperty>;
          const requiredParams = (toolParameters?.required || (schema as Record<string, unknown>).required || []) as string[];

          if (properties) {
            const paramsList = Object.entries(properties).map(([paramName, propSchema]) => {
              const propDetails = propSchema;
              const requiredMark = requiredParams.includes(paramName) ? "*" : "";
              let typeInfo = propDetails.type || "any";
              let description = propDetails.description ? ` - ${propDetails.description}` : "";

              // Enhanced type display for complex schemas
              if (typeInfo === "array" && propDetails.items) {
                const itemType = propDetails.items.type || "object";
                if (itemType === "object" && propDetails.items.properties) {
                  const itemProps = Object.keys(propDetails.items.properties).join(", ");
                  typeInfo = `array<object>`;
                  description =
                    description +
                    (description ? " " : " - ") +
                    `Array of objects with properties: ${itemProps}`;
                } else {
                  typeInfo = `array<${itemType}>`;
                }
              }

              // Handle enums
              if (propDetails.enum && Array.isArray(propDetails.enum)) {
                const enumValues = propDetails.enum.join(" | ");
                description = description + (description ? " " : "") + `Allowed values: ${enumValues}`;
              }

              // Handle objects with properties
              if (typeInfo === "object" && propDetails.properties) {
                const objectProperties = Object.keys(propDetails.properties).join(", ");
                description =
                  description + (description ? " " : "") + `Object with properties: ${objectProperties}`;
              }

              return `    - ${paramName}${requiredMark} (${typeInfo})${description}`;
            });

            if (paramsList.length > 0) {
              paramsDoc = paramsList.join("\n");
            }
          }
        }
      } catch (e) {
        console.error(`Error parsing schema for tool ${name}:`, e);
      }

      return `- ${name}: ${tool.description || ""}
${paramsDoc}`;
    })
    .join("\n\n");

  return `You have access to the following external tools provided by Model Context Protocol (MCP) servers:

${toolsDoc}

When using these tools:
1. Only provide valid parameters according to their type requirements
2. Required parameters are marked with *
3. For array parameters, provide data in the correct array format
4. For object parameters, include all required nested properties
5. For enum parameters, use only the allowed values listed
6. Format API calls correctly with the expected parameter structure
7. Always check tool responses to determine your next action`;
}

/**
 * Extract CopilotKit-compatible parameters from an MCP tool schema
 * Based on CopilotKit's extractParametersFromSchema function
 */
export interface Parameter {
  name: string;
  type: string;
  description?: string;
  required: boolean;
}

export function extractParametersFromSchema(
  toolOrSchema?: MCPTool | MCPTool["schema"],
): Parameter[] {
  const parameters: Parameter[] = [];

  // Handle either full tool object or just schema
  const schema =
    "schema" in (toolOrSchema || {})
      ? (toolOrSchema as MCPTool).schema
      : (toolOrSchema as MCPTool["schema"]);

  const toolParameters = schema?.parameters?.jsonSchema || schema?.parameters;
  const properties = toolParameters?.properties;
  const requiredParams = new Set((toolParameters?.required || []) as string[]);

  if (!properties) {
    return parameters;
  }

  for (const paramName in properties) {
    if (Object.prototype.hasOwnProperty.call(properties, paramName)) {
      const paramDef = (properties as Record<string, JsonSchemaProperty>)[paramName];

      // Enhanced type extraction with support for complex types
      let type = paramDef.type || "string";
      let description = paramDef.description || "";

      // Handle arrays with items
      if (type === "array" && paramDef.items) {
        const itemType = paramDef.items.type || "object";
        if (itemType === "object" && paramDef.items.properties) {
          // For arrays of objects, describe the structure
          const itemProperties = Object.keys(paramDef.items.properties).join(", ");
          description =
            description +
            (description ? " " : "") +
            `Array of objects with properties: ${itemProperties}`;
        } else {
          // For arrays of primitives
          type = `array<${itemType}>`;
        }
      }

      // Handle enums
      if (paramDef.enum && Array.isArray(paramDef.enum)) {
        const enumValues = paramDef.enum.join(" | ");
        description = description + (description ? " " : "") + `Allowed values: ${enumValues}`;
      }

      // Handle objects with properties
      if (type === "object" && paramDef.properties) {
        const objectProperties = Object.keys(paramDef.properties).join(", ");
        description =
          description + (description ? " " : "") + `Object with properties: ${objectProperties}`;
      }

      parameters.push({
        name: paramName,
        type: type,
        description: description,
        required: requiredParams.has(paramName),
      });
    }
  }

  return parameters;
}

/**
 * Normalize tool arguments - detects and fixes common patterns in LLM tool calls
 * Based on CopilotKit's MCP client patterns
 */
export function normalizeToolArgs(args: Record<string, unknown>): Record<string, unknown> {
  // Handle double-nested params: { params: { params: { actual data } } }
  if (
    "params" in args &&
    args.params !== null &&
    typeof args.params === "object"
  ) {
    const paramsObj = args.params as Record<string, unknown>;
    if ("params" in paramsObj) {
      console.log("Detected double-nested params, fixing structure");
      return paramsObj;
    }
  }

  return args;
}

/**
 * Process arguments to handle cases where JSON strings might be passed instead of objects
 */
export function processStringifiedJsonArgs(
  args: Record<string, unknown>
): Record<string, unknown> {
  const processed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(args)) {
    if (typeof value === "string") {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(value);
        processed[key] = parsed;
      } catch {
        // Not JSON, keep as string
        processed[key] = value;
      }
    } else {
      processed[key] = value;
    }
  }

  return processed;
}

/**
 * Convert MCP server configuration to endpoint format
 * Compatible with CopilotKit's MCPEndpointConfig
 */
export function convertToMcpEndpointConfig(server: McpServerConfig): { endpoint: string; apiKey?: string } {
  return {
    endpoint: server.transport.url || '',
    apiKey: server.transport.headers?.Authorization?.replace('Bearer ', ''),
  };
}

/**
 * Validate MCP server URL format
 * Based on official CopilotKit patterns
 */
export function validateMcpServerUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Check for valid protocols
    if (!['http:', 'https:', 'ws:', 'wss:'].includes(urlObj.protocol)) {
      return false;
    }

    // Check for valid MCP endpoint patterns
    const validPatterns = [
      /\/sse$/,           // SSE endpoints
      /\/api$/,           // API endpoints
      /\/mcp$/,           // Generic MCP endpoints
      /\/copilotkit$/,    // CopilotKit endpoints
    ];

    return validPatterns.some(pattern => pattern.test(urlObj.pathname)) || 
           urlObj.pathname === '/' || 
           urlObj.pathname === '';
  } catch {
    return false;
  }
}

/**
 * Generate example MCP server configurations
 * Based on official CopilotKit documentation patterns
 */
export function getExampleMcpServers(): McpServerConfig[] {
  return [
    {
      id: 'copilotkit-official',
      name: 'CopilotKit Official',
      description: 'Official CopilotKit MCP server with development tools and documentation',
      transport: {
        type: 'sse' as const,
        url: 'https://mcp.copilotkit.ai/sse',
      },
      enabled: true,
      userAdded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        category: 'official',
        tags: ['official', 'development'],
      },
    },
    {
      id: 'composio-registry',
      name: 'Composio Registry',
      description: 'Registry of ready-to-use MCP servers with simple authentication',
      transport: {
        type: 'sse' as const,
        url: 'https://mcp.composio.dev',
      },
      enabled: false,
      userAdded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        category: 'registry',
        tags: ['registry', 'tools'],
      },
    },
  ];
}
