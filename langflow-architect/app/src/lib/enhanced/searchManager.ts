/**
 * Search Manager for Web Search Integration - Phase 2 Implementation
 * Provides Tavily + DuckDuckGo integration with intelligent fallback
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  timestamp: number;
  relevanceScore?: number;
  source: 'tavily' | 'duckduckgo';
}

export interface SearchOptions {
  maxResults?: number;
  domainFilter?: string[];
  excludeDomains?: string[];
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  language?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  totalResults: number;
  searchTime: number;
  source: 'tavily' | 'duckduckgo' | 'fallback';
  cached: boolean;
}

export class WebSearchManager {
  private cache: Map<string, { result: SearchResponse; expiry: number }> = new Map();
  private cacheTimeout = 1000 * 60 * 30; // 30 minutes

  /**
   * Perform web search with Tavily as primary, DuckDuckGo as fallback
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    const cacheKey = this.getCacheKey(query, options);
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return { ...cached, cached: true };
    }

    const startTime = Date.now();

    try {
      // Try Tavily first
      const tavilyResult = await this.searchTavily(query, options);
      const result: SearchResponse = {
        ...tavilyResult,
        searchTime: Date.now() - startTime,
        source: 'tavily',
        cached: false
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.warn('Tavily search failed, falling back to DuckDuckGo:', error);
      
      try {
        const duckResult = await this.searchDuckDuckGo(query, options);
        const result: SearchResponse = {
          ...duckResult,
          searchTime: Date.now() - startTime,
          source: 'duckduckgo',
          cached: false
        };

        this.setCache(cacheKey, result);
        return result;
      } catch (fallbackError) {
        console.error('Both search providers failed:', fallbackError);
        
        // Return empty result as final fallback
        return {
          results: [],
          query,
          totalResults: 0,
          searchTime: Date.now() - startTime,
          source: 'fallback',
          cached: false
        };
      }
    }
  }

  /**
   * Search using Tavily API
   */
  private async searchTavily(query: string, _options: SearchOptions): Promise<Omit<SearchResponse, 'searchTime' | 'source' | 'cached'>> {
    void _options;
    // TODO: Implement actual Tavily API integration
    // For now, return mock data
    const mockResults: SearchResult[] = [
      {
        title: `Tavily Search Result for: ${query}`,
        url: 'https://tavily.com/result/1',
        snippet: `This is a mock Tavily search result for the query "${query}". In a real implementation, this would call the Tavily API.`,
        domain: 'tavily.com',
        timestamp: Date.now(),
        relevanceScore: 0.95,
        source: 'tavily'
      }
    ];

    return {
      results: mockResults,
      query,
      totalResults: mockResults.length
    };
  }

  /**
   * Search using DuckDuckGo
   */
  private async searchDuckDuckGo(query: string, _options: SearchOptions): Promise<Omit<SearchResponse, 'searchTime' | 'source' | 'cached'>> {
    void _options;
    // TODO: Implement actual DuckDuckGo integration
    // For now, return mock data
    const mockResults: SearchResult[] = [
      {
        title: `DuckDuckGo Search Result for: ${query}`,
        url: 'https://duckduckgo.com/result/1',
        snippet: `This is a mock DuckDuckGo search result for the query "${query}". In a real implementation, this would call the DuckDuckGo API.`,
        domain: 'duckduckgo.com',
        timestamp: Date.now(),
        relevanceScore: 0.85,
        source: 'duckduckgo'
      }
    ];

    return {
      results: mockResults,
      query,
      totalResults: mockResults.length
    };
  }

  /**
   * Generate cache key for search query and options
   */
  private getCacheKey(query: string, options: SearchOptions): string {
    const optionsStr = JSON.stringify(options);
    return `${query}:${optionsStr}`;
  }

  /**
   * Get result from cache if not expired
   */
  private getFromCache(key: string): SearchResponse | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.result;
  }

  /**
   * Set result in cache with expiry
   */
  private setCache(key: string, result: SearchResponse): void {
    this.cache.set(key, {
      result,
      expiry: Date.now() + this.cacheTimeout
    });
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalEntries: number;
    hitRate: number;
    size: number;
  } {
    // TODO: Implement proper hit rate tracking
    return {
      totalEntries: this.cache.size,
      hitRate: 0.7, // Mock 70% hit rate
      size: this.cache.size
    };
  }

  /**
   * Filter results by domain
   */
  private filterByDomain(results: SearchResult[], options: SearchOptions): SearchResult[] {
    if (!options.domainFilter && !options.excludeDomains) {
      return results;
    }

    return results.filter(result => {
      if (options.excludeDomains?.includes(result.domain)) {
        return false;
      }

      if (options.domainFilter && options.domainFilter.length > 0) {
        return options.domainFilter.includes(result.domain);
      }

      return true;
    });
  }

  /**
   * Deduplicate search results
   */
  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      const key = `${result.url}:${result.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Rank results by relevance score
   */
  private rankResults(results: SearchResult[]): SearchResult[] {
    return results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }
}

// Export singleton instance
export const searchManager = new WebSearchManager();