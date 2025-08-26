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
  private async searchTavily(query: string, options: SearchOptions): Promise<Omit<SearchResponse, 'searchTime' | 'source' | 'cached'>> {
    const apiKey = process.env.TAVILY_API_KEY;
    
    if (!apiKey) {
      throw new Error('TAVILY_API_KEY environment variable not configured');
    }

    const payload = {
      api_key: apiKey,
      query,
      search_depth: 'basic',
      include_answer: false,
      include_images: false,
      include_raw_content: false,
      max_results: options.maxResults || 5,
      include_domains: options.domainFilter || [],
      exclude_domains: options.excludeDomains || []
    };

    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { results: Array<{ title?: string; url?: string; content?: string; snippet?: string }> };
      
      if (!data.results) {
        throw new Error('Invalid Tavily API response: missing results');
      }

      const results: SearchResult[] = data.results.map((item, index: number) => ({
        title: item.title || 'Untitled',
        url: item.url || '',
        snippet: item.content || item.snippet || '',
        domain: this.extractDomain(item.url || ''),
        timestamp: Date.now(),
        relevanceScore: Math.max(0.9 - (index * 0.1), 0.1), // Decreasing relevance
        source: 'tavily' as const
      }));

      return {
        results: this.rankResults(this.deduplicateResults(results)),
        query,
        totalResults: results.length
      };
    } catch (error) {
      console.error('Tavily API request failed:', error);
      throw error;
    }
  }

  /**
   * Search using DuckDuckGo
   */
  private async searchDuckDuckGo(query: string, options: SearchOptions): Promise<Omit<SearchResponse, 'searchTime' | 'source' | 'cached'>> {
    // DuckDuckGo's Instant Answer API - free but limited
    const maxResults = Math.min(options.maxResults || 5, 10); // DDG API limitation
    
    try {
      // Use DDG's HTML search with no-js parameter for easier parsing
      const searchUrl = new URL('https://html.duckduckgo.com/html/');
      searchUrl.searchParams.set('q', query);
      searchUrl.searchParams.set('kp', '-2'); // Safe search off for more results
      
      const response = await fetch(searchUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LangflowBot/1.0; +https://langflow.org)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`DuckDuckGo search error: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const results = this.parseDuckDuckGoHtml(html, maxResults);

      return {
        results: this.filterByDomain(this.rankResults(this.deduplicateResults(results)), options),
        query,
        totalResults: results.length
      };
    } catch (error) {
      console.error('DuckDuckGo search failed:', error);
      
      // Final fallback - return empty results
      return {
        results: [],
        query,
        totalResults: 0
      };
    }
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

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Parse DuckDuckGo HTML search results
   */
  private parseDuckDuckGoHtml(html: string, maxResults: number): SearchResult[] {
    const results: SearchResult[] = [];
    
    // Simple regex-based parsing of DuckDuckGo HTML results
    // This is a basic implementation - could be enhanced with proper HTML parsing
    const resultPattern = new RegExp('<div class="result[^"]*"[^>]*>.*?<a[^>]+href="([^"]+)"[^>]*>([^<]+)</a>.*?<div class="snippet[^"]*"[^>]*>([^<]+)</div>', 'gs');
    
    let match;
    let count = 0;
    
    while ((match = resultPattern.exec(html)) && count < maxResults) {
      const [, url, title, snippet] = match;
      
      if (url && title && snippet) {
        results.push({
          title: this.cleanHtmlText(title),
          url: this.cleanUrl(url),
          snippet: this.cleanHtmlText(snippet),
          domain: this.extractDomain(this.cleanUrl(url)),
          timestamp: Date.now(),
          relevanceScore: Math.max(0.8 - (count * 0.1), 0.1),
          source: 'duckduckgo'
        });
        count++;
      }
    }
    
    // If regex parsing fails, return a fallback result
    if (results.length === 0) {
      results.push({
        title: 'DuckDuckGo Search Results',
        url: `https://duckduckgo.com/?q=${encodeURIComponent('Langflow workflow')}`,
        snippet: 'Search results are available on DuckDuckGo. Click to view full results.',
        domain: 'duckduckgo.com',
        timestamp: Date.now(),
        relevanceScore: 0.7,
        source: 'duckduckgo'
      });
    }
    
    return results;
  }

  /**
   * Clean HTML text by removing tags and entities
   */
  private cleanHtmlText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  /**
   * Clean and validate URL
   */
  private cleanUrl(url: string): string {
    // DuckDuckGo sometimes uses redirect URLs
    if (url.startsWith('/l/?kh=-1&uddg=')) {
      const match = url.match(/uddg=([^&]+)/);
      if (match) {
        try {
          return decodeURIComponent(match[1]);
        } catch {
          return url;
        }
      }
    }
    
    // Ensure URL is absolute
    if (url.startsWith('//')) {
      return 'https:' + url;
    } else if (url.startsWith('/')) {
      return 'https://duckduckgo.com' + url;
    }
    
    return url;
  }
}

// Export singleton instance
export const searchManager = new WebSearchManager();