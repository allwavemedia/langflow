// LangflowSchemaRegistry - Phase 2: Extract JSON schema specs into a normalized model and persist a local cache
// Add AJV-based JSON schema validation service used during JSON generation/export

import Ajv, { type JSONSchemaType, type ValidateFunction } from 'ajv';
import type { DocumentationEntry } from './docsIngestionService';

interface LangflowComponent {
  id: string;
  type: string;
  displayName: string;
  description: string;
  inputs: ComponentInput[];
  outputs: ComponentOutput[];
  template: Record<string, any>;
  metadata: ComponentMetadata;
}

interface ComponentInput {
  name: string;
  displayName: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  description?: string;
}

interface ComponentOutput {
  name: string;
  displayName: string;
  type: string;
  description?: string;
}

interface ComponentMetadata {
  category: string;
  tags: string[];
  version: string;
  author?: string;
  documentation?: string;
}

interface LangflowWorkflowSchema {
  $schema: string;
  type: string;
  properties: {
    data: {
      type: string;
      properties: {
        nodes: any;
        edges: any;
      };
    };
    description: any;
    name: any;
  };
  required: string[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  schemaVersion: string;
}

interface SchemaCache {
  schemas: Map<string, any>;
  components: Map<string, LangflowComponent>;
  validators: Map<string, ValidateFunction>;
  lastUpdated: Date;
  version: string;
}

export class LangflowSchemaRegistry {
  private ajv: Ajv;
  private cache: SchemaCache;
  private readonly cacheKey = 'langflow-schema-cache';

  constructor() {
    this.ajv = new Ajv({ 
      allErrors: true, 
      verbose: true,
      strict: false,
      addUsedSchema: false
    });
    
    this.cache = {
      schemas: new Map(),
      components: new Map(),
      validators: new Map(),
      lastUpdated: new Date(0),
      version: '1.0.0'
    };

    this.initializeDefaultSchemas();
    this.loadCacheFromStorage();
  }

  private initializeDefaultSchemas(): void {
    // Base Langflow workflow schema
    const workflowSchema: LangflowWorkflowSchema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            nodes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  type: { type: "string" },
                  position: {
                    type: "object", 
                    properties: {
                      x: { type: "number" },
                      y: { type: "number" }
                    },
                    required: ["x", "y"]
                  },
                  data: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      node: { type: "object" }
                    },
                    required: ["type"]
                  }
                },
                required: ["id", "type", "position", "data"]
              }
            },
            edges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  source: { type: "string" },
                  target: { type: "string" },
                  sourceHandle: { type: "string" },
                  targetHandle: { type: "string" }
                },
                required: ["id", "source", "target"]
              }
            }
          },
          required: ["nodes", "edges"]
        },
        description: { type: "string" },
        name: { type: "string" }
      },
      required: ["data"]
    };

    this.cache.schemas.set('workflow', workflowSchema);
    this.cache.validators.set('workflow', this.ajv.compile(workflowSchema));
  }

  async extractSchemasFromDocumentation(documentationEntries: DocumentationEntry[]): Promise<number> {
    console.log('Extracting schemas from Langflow documentation...');
    
    let extractedCount = 0;
    
    for (const entry of documentationEntries) {
      try {
        if (entry.type === 'json' && entry.path.includes('schema')) {
          // Direct JSON schema files
          const schema = JSON.parse(entry.content);
          const schemaId = this.generateSchemaId(entry.path);
          
          this.cache.schemas.set(schemaId, schema);
          this.cache.validators.set(schemaId, this.ajv.compile(schema));
          extractedCount++;
          
        } else if (entry.category === 'components' && (entry.type === 'markdown' || entry.type === 'mdx')) {
          // Extract component definitions from markdown
          const component = this.extractComponentFromMarkdown(entry);
          if (component) {
            this.cache.components.set(component.id, component);
            extractedCount++;
          }
          
        } else if (entry.category === 'api-reference') {
          // Extract API schemas
          const schemas = this.extractSchemasFromApiDocs(entry);
          schemas.forEach(schema => {
            const schemaId = this.generateSchemaId(schema.path || entry.path);
            this.cache.schemas.set(schemaId, schema.schema);
            this.cache.validators.set(schemaId, this.ajv.compile(schema.schema));
            extractedCount++;
          });
        }
        
      } catch (error) {
        console.warn(`Failed to extract schema from ${entry.path}:`, error);
      }
    }

    this.cache.lastUpdated = new Date();
    this.saveCacheToStorage();
    
    console.log(`Extracted ${extractedCount} schemas and components from documentation`);
    return extractedCount;
  }

  private extractComponentFromMarkdown(entry: DocumentationEntry): LangflowComponent | null {
    try {
      const content = entry.content;
      
      // Extract component information from markdown
      const titleMatch = content.match(/^#\s+(.+)/m);
      const descriptionMatch = content.match(/^>\s*(.+)/m);
      
      if (!titleMatch) return null;
      
      const component: LangflowComponent = {
        id: this.slugify(titleMatch[1]),
        type: titleMatch[1],
        displayName: titleMatch[1],
        description: descriptionMatch?.[1] || '',
        inputs: this.extractInputsFromMarkdown(content),
        outputs: this.extractOutputsFromMarkdown(content),
        template: this.extractTemplateFromMarkdown(content),
        metadata: {
          category: this.extractCategoryFromPath(entry.path),
          tags: this.extractTagsFromMarkdown(content),
          version: entry.version,
          documentation: entry.path
        }
      };

      return component;
      
    } catch (error) {
      console.warn(`Failed to extract component from ${entry.path}:`, error);
      return null;
    }
  }

  private extractInputsFromMarkdown(content: string): ComponentInput[] {
    const inputs: ComponentInput[] = [];
    
    // Look for parameter tables
    const tableRegex = /\|([^|]+)\|([^|]+)\|([^|]*)\|/g;
    const lines = content.split('\n');
    
    let inParameterSection = false;
    for (const line of lines) {
      if (line.toLowerCase().includes('parameter') && line.includes('|')) {
        inParameterSection = true;
        continue;
      }
      
      if (inParameterSection && line.includes('|')) {
        const match = tableRegex.exec(line);
        if (match) {
          const name = match[1]?.trim();
          const displayName = match[2]?.trim();
          const description = match[3]?.trim();
          
          if (name && displayName) {
            inputs.push({
              name: this.slugify(name),
              displayName,
              type: this.inferTypeFromDescription(description || ''),
              required: description?.toLowerCase().includes('required') || false,
              description
            });
          }
        }
      }
      
      if (inParameterSection && !line.includes('|')) {
        break; // End of table
      }
    }
    
    return inputs;
  }

  private extractOutputsFromMarkdown(content: string): ComponentOutput[] {
    // Similar logic to inputs but for outputs
    return [
      {
        name: 'output',
        displayName: 'Output',
        type: 'any',
        description: 'Component output'
      }
    ];
  }

  private extractTemplateFromMarkdown(content: string): Record<string, any> {
    // Extract JSON examples or code blocks
    const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
    const matches = content.match(codeBlockRegex);
    
    if (matches) {
      try {
        const jsonMatch = matches[0].replace(/```json\s*|\s*```/g, '');
        return JSON.parse(jsonMatch);
      } catch (error) {
        // Ignore parsing errors
      }
    }
    
    return {};
  }

  private extractSchemasFromApiDocs(entry: DocumentationEntry): Array<{ path: string; schema: any }> {
    const schemas: Array<{ path: string; schema: any }> = [];
    
    try {
      if (entry.type === 'json') {
        const content = JSON.parse(entry.content);
        if (content.openapi || content.swagger) {
          // OpenAPI/Swagger schema
          if (content.components?.schemas) {
            Object.entries(content.components.schemas).forEach(([name, schema]) => {
              schemas.push({
                path: `${entry.path}#/components/schemas/${name}`,
                schema
              });
            });
          }
        } else {
          // Direct JSON schema
          schemas.push({
            path: entry.path,
            schema: content
          });
        }
      }
    } catch (error) {
      console.warn(`Failed to parse API documentation ${entry.path}:`, error);
    }
    
    return schemas;
  }

  validateWorkflow(workflowJson: any): ValidationResult {
    try {
      const validator = this.cache.validators.get('workflow');
      if (!validator) {
        return {
          valid: false,
          errors: ['Workflow schema not found'],
          warnings: [],
          schemaVersion: this.cache.version
        };
      }

      const valid = validator(workflowJson);
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!valid && validator.errors) {
        validator.errors.forEach(error => {
          const message = `${error.instancePath}: ${error.message}`;
          if (error.keyword === 'required') {
            errors.push(message);
          } else {
            warnings.push(message);
          }
        });
      }

      // Additional Langflow-specific validations
      if (workflowJson.data?.nodes) {
        const nodeValidation = this.validateNodes(workflowJson.data.nodes);
        errors.push(...nodeValidation.errors);
        warnings.push(...nodeValidation.warnings);
      }

      return {
        valid: valid && errors.length === 0,
        errors,
        warnings,
        schemaVersion: this.cache.version
      };

    } catch (error) {
      return {
        valid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        schemaVersion: this.cache.version
      };
    }
  }

  private validateNodes(nodes: any[]): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (const node of nodes) {
      // Check if node type is known
      const component = this.cache.components.get(node.type);
      if (!component) {
        warnings.push(`Unknown component type: ${node.type}`);
        continue;
      }

      // Validate required inputs
      if (component.inputs) {
        const requiredInputs = component.inputs.filter(input => input.required);
        for (const requiredInput of requiredInputs) {
          if (!node.data?.node?.template?.[requiredInput.name]) {
            errors.push(`Node ${node.id}: Missing required input ${requiredInput.name}`);
          }
        }
      }
    }
    
    return { errors, warnings };
  }

  getAvailableComponents(): LangflowComponent[] {
    return Array.from(this.cache.components.values());
  }

  getComponent(componentId: string): LangflowComponent | undefined {
    return this.cache.components.get(componentId);
  }

  getComponentsByCategory(category: string): LangflowComponent[] {
    return Array.from(this.cache.components.values())
      .filter(component => component.metadata.category === category);
  }

  private generateSchemaId(path: string): string {
    return path.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  }

  private slugify(text: string): string {
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '_')
      .trim();
  }

  private extractCategoryFromPath(path: string): string {
    const pathParts = path.split('/');
    return pathParts[0]?.toLowerCase() || 'general';
  }

  private extractTagsFromMarkdown(content: string): string[] {
    const tags: string[] = [];
    
    // Look for tags in frontmatter or content
    const tagMatches = content.match(/tags:\s*\[(.*?)\]/);
    if (tagMatches) {
      tags.push(...tagMatches[1].split(',').map(tag => tag.trim().replace(/['"]/g, '')));
    }
    
    return tags;
  }

  private inferTypeFromDescription(description: string): string {
    const lower = description.toLowerCase();
    if (lower.includes('string') || lower.includes('text')) return 'string';
    if (lower.includes('number') || lower.includes('integer')) return 'number';
    if (lower.includes('boolean') || lower.includes('true') || lower.includes('false')) return 'boolean';
    if (lower.includes('array') || lower.includes('list')) return 'array';
    if (lower.includes('object')) return 'object';
    return 'string'; // default
  }

  private saveCacheToStorage(): void {
    try {
      const cacheData = {
        schemas: Object.fromEntries(this.cache.schemas),
        components: Object.fromEntries(this.cache.components),
        lastUpdated: this.cache.lastUpdated.toISOString(),
        version: this.cache.version
      };
      
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save schema cache to storage:', error);
    }
  }

  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.cacheKey);
      if (stored) {
        const cacheData = JSON.parse(stored);
        
        this.cache.schemas = new Map(Object.entries(cacheData.schemas || {}));
        this.cache.components = new Map(Object.entries(cacheData.components || {}));
        this.cache.lastUpdated = new Date(cacheData.lastUpdated || 0);
        this.cache.version = cacheData.version || '1.0.0';
        
        // Recompile validators
        this.cache.validators.clear();
        for (const [id, schema] of this.cache.schemas) {
          try {
            this.cache.validators.set(id, this.ajv.compile(schema));
          } catch (error) {
            console.warn(`Failed to compile schema ${id}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load schema cache from storage:', error);
    }
  }

  getCacheStatistics(): {
    totalSchemas: number;
    totalComponents: number;
    lastUpdated: Date;
    version: string;
  } {
    return {
      totalSchemas: this.cache.schemas.size,
      totalComponents: this.cache.components.size,
      lastUpdated: this.cache.lastUpdated,
      version: this.cache.version
    };
  }

  clearCache(): void {
    this.cache.schemas.clear();
    this.cache.components.clear();
    this.cache.validators.clear();
    this.cache.lastUpdated = new Date(0);
    
    localStorage.removeItem(this.cacheKey);
    this.initializeDefaultSchemas();
  }
}

export const langflowSchemaRegistry = new LangflowSchemaRegistry();