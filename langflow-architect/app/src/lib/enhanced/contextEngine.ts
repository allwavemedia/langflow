/**
 * Context Engine for Enhanced Prompting - Phase 2 Implementation
 * Provides context fusion and grounded prompting capabilities
 */

export interface ContextSource {
  type: 'user' | 'docs' | 'search' | 'mcp';
  content: string;
  metadata?: Record<string, any>;
  timestamp?: number;
  confidence?: number;
}

export interface ContextFusionResult {
  sources: ContextSource[];
  fusedContext: string;
  metadata: {
    totalSources: number;
    docsWeight: number;
    searchWeight: number;
    userWeight: number;
  };
}

export class ContextEngine {
  private sources: ContextSource[] = [];

  /**
   * Add context from user interaction
   */
  addUserContext(content: string, metadata?: Record<string, any>): void {
    this.sources.push({
      type: 'user',
      content,
      metadata,
      timestamp: Date.now(),
      confidence: 1.0
    });
  }

  /**
   * Add context from Langflow documentation
   */
  addDocsContext(content: string, metadata?: Record<string, any>): void {
    this.sources.push({
      type: 'docs',
      content,
      metadata,
      timestamp: Date.now(),
      confidence: 0.9 // High confidence for official docs
    });
  }

  /**
   * Add context from web search results
   */
  addSearchContext(content: string, metadata?: Record<string, any>): void {
    this.sources.push({
      type: 'search',
      content,
      metadata,
      timestamp: Date.now(),
      confidence: 0.7 // Medium confidence for search results
    });
  }

  /**
   * Fuse all context sources into a unified context
   */
  fuseContext(): ContextFusionResult {
    const docsSources = this.sources.filter(s => s.type === 'docs');
    const searchSources = this.sources.filter(s => s.type === 'search');
    const userSources = this.sources.filter(s => s.type === 'user');

    // Prioritize official docs, then user context, then search
    const prioritizedSources = [
      ...docsSources,
      ...userSources,
      ...searchSources
    ];

    const fusedContent = prioritizedSources
      .map(source => source.content)
      .join('\n\n');

    return {
      sources: this.sources,
      fusedContext: fusedContent,
      metadata: {
        totalSources: this.sources.length,
        docsWeight: docsSources.length / this.sources.length,
        searchWeight: searchSources.length / this.sources.length,
        userWeight: userSources.length / this.sources.length
      }
    };
  }

  /**
   * Clear all context sources
   */
  reset(): void {
    this.sources = [];
  }
}

// Export singleton instance
export const contextEngine = new ContextEngine();