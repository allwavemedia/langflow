// DocsIngestionService - Phase 2: Documentation grounding and schema compliance
// Implements Langflow docs ingestion client (GitHub API) + cache with ETag/versioning

interface GitHubApiResponse {
  content: string;
  sha: string;
  url: string;
  html_url: string;
  download_url: string;
  encoding: string;
}

interface CachedDocument {
  content: string;
  etag: string;
  lastModified: Date;
  sha: string;
  url: string;
  version: string;
}

interface DocsIngestOptions {
  baseUrl?: string;
  githubToken?: string;
  cacheTtl?: number;
  enableWebhook?: boolean;
}

interface DocumentationEntry {
  path: string;
  content: string;
  type: 'markdown' | 'json' | 'yaml' | 'mdx';
  category: 'components' | 'api-reference' | 'concepts' | 'configuration' | 'tutorials';
  lastUpdated: Date;
  version: string;
}

export class DocsIngestionService {
  private cache: Map<string, CachedDocument> = new Map();
  private readonly baseUrl: string;
  private readonly githubToken?: string;
  private readonly cacheTtl: number;
  private readonly enableWebhook: boolean;

  constructor(options: DocsIngestOptions = {}) {
    this.baseUrl = options.baseUrl || 'https://api.github.com/repos/langflow-ai/langflow/contents/docs/docs';
    this.githubToken = options.githubToken || process.env.GITHUB_TOKEN;
    this.cacheTtl = options.cacheTtl || parseInt(process.env.DOCS_CACHE_TTL_MS || '3600000'); // 1 hour default
    this.enableWebhook = options.enableWebhook ?? true;
  }

  async ingestDocumentation(): Promise<DocumentationEntry[]> {
    try {
      console.log('Starting Langflow documentation ingestion...');
      
      const directories = [
        'Components',
        'API-Reference', 
        'Concepts',
        'Configuration',
        'Tutorials'
      ];

      const documentationEntries: DocumentationEntry[] = [];
      
      for (const directory of directories) {
        const entries = await this.ingestDirectory(directory);
        documentationEntries.push(...entries);
      }

      console.log(`Successfully ingested ${documentationEntries.length} documentation entries`);
      return documentationEntries;
      
    } catch (error) {
      console.error('Documentation ingestion failed:', error);
      throw new Error(`Documentation ingestion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async ingestDirectory(directory: string): Promise<DocumentationEntry[]> {
    const directoryUrl = `${this.baseUrl}/${directory}`;
    const headers = this.getRequestHeaders();
    
    try {
      const response = await fetch(directoryUrl, { headers });
      
      if (!response.ok) {
        console.warn(`Failed to fetch directory ${directory}: ${response.status}`);
        return [];
      }

      const files = await response.json() as Array<{ name: string; path: string; type: string; download_url: string }>;
      const documentationEntries: DocumentationEntry[] = [];

      for (const file of files) {
        if (file.type === 'file' && this.isDocumentationFile(file.name)) {
          try {
            const entry = await this.processDocumentationFile(file, directory);
            if (entry) {
              documentationEntries.push(entry);
            }
          } catch (error) {
            console.warn(`Failed to process file ${file.name}:`, error);
          }
        }
      }

      return documentationEntries;
      
    } catch (error) {
      console.error(`Error ingesting directory ${directory}:`, error);
      return [];
    }
  }

  private async processDocumentationFile(
    file: { name: string; path: string; type: string; download_url: string }, 
    directory: string
  ): Promise<DocumentationEntry | null> {
    const cacheKey = file.path;
    const cached = this.cache.get(cacheKey);
    
    // Check if we have a fresh cached version
    if (cached && this.isCacheFresh(cached)) {
      return {
        path: file.path,
        content: cached.content,
        type: this.getFileType(file.name),
        category: this.getCategoryFromDirectory(directory),
        lastUpdated: cached.lastModified,
        version: cached.version
      };
    }

    try {
      const headers = this.getRequestHeaders();
      
      // Add ETag for conditional requests
      if (cached?.etag) {
        headers['If-None-Match'] = cached.etag;
      }

      const response = await fetch(file.download_url, { headers });
      
      // If not modified, return cached version
      if (response.status === 304 && cached) {
        cached.lastModified = new Date(); // Update access time
        return {
          path: file.path,
          content: cached.content,
          type: this.getFileType(file.name),
          category: this.getCategoryFromDirectory(directory),
          lastUpdated: cached.lastModified,
          version: cached.version
        };
      }

      if (!response.ok) {
        console.warn(`Failed to fetch file ${file.name}: ${response.status}`);
        return null;
      }

      const content = await response.text();
      const etag = response.headers.get('etag') || '';
      const lastModified = new Date(response.headers.get('last-modified') || Date.now());
      
      // Cache the document
      const cachedDoc: CachedDocument = {
        content,
        etag,
        lastModified,
        sha: response.headers.get('x-git-commit-sha') || '',
        url: file.download_url,
        version: this.extractVersionFromContent(content)
      };
      
      this.cache.set(cacheKey, cachedDoc);

      return {
        path: file.path,
        content,
        type: this.getFileType(file.name),
        category: this.getCategoryFromDirectory(directory),
        lastUpdated: lastModified,
        version: cachedDoc.version
      };
      
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      return null;
    }
  }

  private getRequestHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Langflow-Architect/1.0'
    };

    if (this.githubToken) {
      headers['Authorization'] = `token ${this.githubToken}`;
    }

    return headers;
  }

  private isDocumentationFile(filename: string): boolean {
    const extensions = ['.md', '.mdx', '.json', '.yaml', '.yml'];
    return extensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  private getFileType(filename: string): 'markdown' | 'json' | 'yaml' | 'mdx' {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.mdx')) return 'mdx';
    if (lower.endsWith('.md')) return 'markdown';
    if (lower.endsWith('.json')) return 'json';
    if (lower.endsWith('.yaml') || lower.endsWith('.yml')) return 'yaml';
    return 'markdown'; // default
  }

  private getCategoryFromDirectory(directory: string): 'components' | 'api-reference' | 'concepts' | 'configuration' | 'tutorials' {
    const mapping: Record<string, 'components' | 'api-reference' | 'concepts' | 'configuration' | 'tutorials'> = {
      'Components': 'components',
      'API-Reference': 'api-reference',
      'Concepts': 'concepts', 
      'Configuration': 'configuration',
      'Tutorials': 'tutorials'
    };
    
    return mapping[directory] || 'concepts';
  }

  private isCacheFresh(cached: CachedDocument): boolean {
    const now = Date.now();
    const cacheAge = now - cached.lastModified.getTime();
    return cacheAge < this.cacheTtl;
  }

  private extractVersionFromContent(content: string): string {
    // Try to extract version from frontmatter or content
    const versionMatch = content.match(/version:\s*['"]?([^'"\\n]+)['"]?/i);
    if (versionMatch) {
      return versionMatch[1];
    }
    
    // Fallback to current date as version
    return new Date().toISOString().split('T')[0];
  }

  // Webhook endpoint support for real-time updates
  async handleWebhookUpdate(payload: any): Promise<boolean> {
    if (!this.enableWebhook) {
      return false;
    }

    try {
      // GitHub webhook payload processing
      if (payload.commits) {
        const docsChanges = payload.commits.some((commit: any) => 
          commit.modified?.some((file: string) => file.startsWith('docs/docs/')) ||
          commit.added?.some((file: string) => file.startsWith('docs/docs/')) ||
          commit.removed?.some((file: string) => file.startsWith('docs/docs/'))
        );

        if (docsChanges) {
          console.log('Documentation changes detected, refreshing cache...');
          await this.refreshCache();
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Webhook processing error:', error);
      return false;
    }
  }

  async refreshCache(): Promise<void> {
    console.log('Refreshing documentation cache...');
    this.cache.clear();
    await this.ingestDocumentation();
  }

  getCacheStatistics(): {
    totalDocuments: number;
    cacheSize: number;
    freshDocuments: number;
    lastRefresh: Date | null;
  } {
    const documents = Array.from(this.cache.values());
    const freshDocuments = documents.filter(doc => this.isCacheFresh(doc));
    
    return {
      totalDocuments: documents.length,
      cacheSize: this.cache.size,
      freshDocuments: freshDocuments.length,
      lastRefresh: documents.length > 0 ? 
        new Date(Math.max(...documents.map(doc => doc.lastModified.getTime()))) : 
        null
    };
  }

  // Search through cached documentation
  searchDocumentation(query: string, category?: string): DocumentationEntry[] {
    const results: DocumentationEntry[] = [];
    const searchTerms = query.toLowerCase().split(' ');

    for (const [path, cached] of this.cache) {
      const entry: DocumentationEntry = {
        path,
        content: cached.content,
        type: this.getFileType(path),
        category: this.getCategoryFromDirectory(path.split('/')[0]),
        lastUpdated: cached.lastModified,
        version: cached.version
      };

      // Filter by category if specified
      if (category && entry.category !== category) {
        continue;
      }

      // Check if content matches search terms
      const contentLower = cached.content.toLowerCase();
      const pathLower = path.toLowerCase();
      
      const matches = searchTerms.some(term => 
        contentLower.includes(term) || pathLower.includes(term)
      );

      if (matches) {
        results.push(entry);
      }
    }

    return results.slice(0, 20); // Limit results
  }
}

export const docsIngestionService = new DocsIngestionService();