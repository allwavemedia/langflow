/**
 * GitHub Documentation Manager
 * Provides access to Langflow documentation via GitHub API
 * Features: Search, fetch, cache, and parse documentation content
 */

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubSearchResult[];
}

export interface GitHubFileResponse extends GitHubFile {
  content?: string;
  encoding?: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

export interface GitHubSearchResult {
  name: string;
  path: string;
  sha: string;
  url: string;
  git_url: string;
  html_url: string;
  repository: {
    name: string;
    full_name: string;
    html_url: string;
  };
  score: number;
  file_size?: number;
  language?: string;
  last_modified?: string;
}

export interface DocumentationSearchOptions {
  query: string;
  fileExtensions?: string[];
  paths?: string[];
  maxResults?: number;
  includeContent?: boolean;
}

export interface DocumentationResult {
  file: GitHubFile;
  content: string;
  relevanceScore: number;
  sections: DocumentationSection[];
  lastModified: string;
  url: string;
}

export interface DocumentationSection {
  title: string;
  content: string;
  level: number;
  anchor: string;
}

export interface GitHubDocsCache {
  [key: string]: {
    data: DocumentationResult | DocumentationResult[];
    timestamp: number;
    ttl: number;
  };
}

class GitHubDocsManager {
  private static instance: GitHubDocsManager;
  private cache: GitHubDocsCache = {};
  private readonly baseUrl = 'https://api.github.com';
  private readonly repo = 'logspace-ai/langflow';
  private readonly defaultBranch = 'main';
  private readonly cacheTTL = 1000 * 60 * 30; // 30 minutes
  private readonly apiKey = process.env.GITHUB_TOKEN;

  private constructor() {}

  static getInstance(): GitHubDocsManager {
    if (!GitHubDocsManager.instance) {
      GitHubDocsManager.instance = new GitHubDocsManager();
    }
    return GitHubDocsManager.instance;
  }

  /**
   * Search for documentation files in the Langflow repository
   */
  async searchDocumentation(options: DocumentationSearchOptions): Promise<DocumentationResult[]> {
    const { query, fileExtensions = ['md', 'mdx'], paths = ['docs/', 'README'], maxResults = 10, includeContent = true } = options;
    
    try {
      // Build search query
      const extensionQuery = fileExtensions.map(ext => `extension:${ext}`).join(' OR ');
      const pathQuery = paths.map(path => `path:${path}`).join(' OR ');
      const searchQuery = `${query} repo:${this.repo} (${extensionQuery}) (${pathQuery})`;

      // Check cache first
      const cacheKey = `search:${searchQuery}:${maxResults}:${includeContent}`;
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return cached as DocumentationResult[];
      }

      // Search GitHub API
      const searchUrl = `${this.baseUrl}/search/code?q=${encodeURIComponent(searchQuery)}&per_page=${maxResults}`;
      const searchResponse = await this.makeGitHubRequest(searchUrl) as unknown as GitHubSearchResponse;
      
      if (!searchResponse.items || searchResponse.items.length === 0) {
        return [];
      }

      // Process search results
      const results: DocumentationResult[] = [];
      
      for (const item of searchResponse.items) {
        try {
          let content = '';
          let sections: DocumentationSection[] = [];
          
          if (includeContent) {
            // Fetch file content
            const fileContent = await this.fetchFileContent(item.path);
            content = fileContent;
            sections = this.parseMarkdownSections(content);
          }

          const result: DocumentationResult = {
            file: {
              name: item.name,
              path: item.path,
              sha: item.sha,
              size: item.file_size || 0,
              url: item.url,
              html_url: item.html_url,
              git_url: item.git_url,
              download_url: `https://raw.githubusercontent.com/${this.repo}/${this.defaultBranch}/${item.path}`,
              type: 'file'
            },
            content,
            relevanceScore: item.score,
            sections,
            lastModified: new Date().toISOString(), // GitHub search doesn't return last modified
            url: item.html_url
          };

          results.push(result);
        } catch (error) {
          console.warn(`Failed to process search result for ${item.path}:`, error);
        }
      }

      // Cache results
      this.setCachedResult(cacheKey, results);
      
      return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      console.error('GitHub documentation search failed:', error);
      return [];
    }
  }

  /**
   * Fetch specific documentation file by path
   */
  async fetchDocumentationFile(filePath: string): Promise<DocumentationResult | null> {
    try {
      // Check cache first
      const cacheKey = `file:${filePath}`;
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return cached as DocumentationResult;
      }

      // Fetch file metadata
      const fileUrl = `${this.baseUrl}/repos/${this.repo}/contents/${filePath}`;
      const fileResponse = await this.makeGitHubRequest(fileUrl) as unknown as GitHubFileResponse;
      
      if (!fileResponse || fileResponse.type !== 'file') {
        return null;
      }

      // Fetch file content
      const content = await this.fetchFileContent(filePath);
      const sections = this.parseMarkdownSections(content);

      const result: DocumentationResult = {
        file: fileResponse,
        content,
        relevanceScore: 1.0,
        sections,
        lastModified: new Date().toISOString(),
        url: fileResponse.html_url
      };

      // Cache result
      this.setCachedResult(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error(`Failed to fetch documentation file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Search for specific topics within documentation
   */
  async searchTopics(topic: string, options: { maxResults?: number; includeCode?: boolean } = {}): Promise<DocumentationResult[]> {
    const { maxResults = 5, includeCode = false } = options;
    
    // Define topic-specific search paths
    const topicPaths: Record<string, string[]> = {
      'components': ['docs/components/', 'docs/docs/Components/'],
      'api': ['docs/api/', 'docs/docs/API-Reference/'],
      'tutorial': ['docs/tutorial/', 'docs/docs/Tutorials/', 'docs/docs/Get-Started/'],
      'configuration': ['docs/config/', 'docs/docs/Configuration/'],
      'deployment': ['docs/deploy/', 'docs/docs/Deployment/'],
      'concepts': ['docs/concepts/', 'docs/docs/Concepts/'],
      'integrations': ['docs/integrations/', 'docs/docs/Integrations/'],
      'development': ['docs/dev/', 'docs/docs/Develop/']
    };

    // Get paths for the topic
    const searchPaths = topicPaths[topic.toLowerCase()] || ['docs/'];
    
    // Add code file extensions if requested
    const fileExtensions = includeCode ? ['md', 'mdx', 'py', 'ts', 'js'] : ['md', 'mdx'];

    return this.searchDocumentation({
      query: topic,
      fileExtensions,
      paths: searchPaths,
      maxResults,
      includeContent: true
    });
  }

  /**
   * Get documentation for specific Langflow components
   */
  async getComponentDocumentation(componentName: string): Promise<DocumentationResult[]> {
    const searchQueries = [
      `${componentName} component`,
      `class ${componentName}`,
      `def ${componentName}`,
      componentName
    ];

    const allResults: DocumentationResult[] = [];
    
    for (const query of searchQueries) {
      const results = await this.searchDocumentation({
        query,
        fileExtensions: ['md', 'mdx', 'py'],
        paths: ['docs/components/', 'docs/docs/Components/', 'src/backend/base/langflow/components/'],
        maxResults: 3,
        includeContent: true
      });
      
      allResults.push(...results);
    }

    // Remove duplicates and sort by relevance
    const uniqueResults = allResults.filter((result, index, self) => 
      index === self.findIndex(r => r.file.path === result.file.path)
    );

    return uniqueResults.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 5);
  }

  /**
   * Fetch raw file content from GitHub
   */
  private async fetchFileContent(filePath: string): Promise<string> {
    try {
      const rawUrl = `https://raw.githubusercontent.com/${this.repo}/${this.defaultBranch}/${filePath}`;
      const response = await fetch(rawUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      
      return await response.text();
    } catch (error) {
      console.error(`Failed to fetch content for ${filePath}:`, error);
      return '';
    }
  }

  /**
   * Make authenticated GitHub API request
   */
  private async makeGitHubRequest(url: string): Promise<Record<string, unknown>> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Langflow-Architect-App'
    };

    // Add authentication if token is available
    if (this.apiKey) {
      headers['Authorization'] = `token ${this.apiKey}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Parse markdown content into sections
   */
  private parseMarkdownSections(content: string): DocumentationSection[] {
    const sections: DocumentationSection[] = [];
    const lines = content.split('\n');
    let currentSection: DocumentationSection | null = null;
    
    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start new section
        const level = headerMatch[1].length;
        const title = headerMatch[2].trim();
        const anchor = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
        
        currentSection = {
          title,
          content: '',
          level,
          anchor
        };
      } else if (currentSection) {
        // Add line to current section
        currentSection.content += line + '\n';
      }
    }
    
    // Add final section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections.map(section => ({
      ...section,
      content: section.content.trim()
    }));
  }

  /**
   * Get cached result if still valid
   */
  private getCachedResult(key: string): DocumentationResult | DocumentationResult[] | null {
    const cached = this.cache[key];
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cached result with TTL
   */
  private setCachedResult(key: string, data: DocumentationResult | DocumentationResult[]): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl: this.cacheTTL
    };
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach(key => {
      if (now - this.cache[key].timestamp >= this.cache[key].ttl) {
        delete this.cache[key];
      }
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { totalEntries: number; validEntries: number; hitRate: number } {
    const totalEntries = Object.keys(this.cache).length;
    const now = Date.now();
    const validEntries = Object.values(this.cache).filter(
      entry => now - entry.timestamp < entry.ttl
    ).length;
    
    return {
      totalEntries,
      validEntries,
      hitRate: totalEntries > 0 ? validEntries / totalEntries : 0
    };
  }
}

// Export singleton instance
export const githubDocsManager = GitHubDocsManager.getInstance();
