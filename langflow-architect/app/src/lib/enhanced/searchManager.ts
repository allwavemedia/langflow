// SearchManager - Phase 2: Web search integration with attribution
// Create SearchManager that abstracts Tavily + DuckDuckGo with domain filters, dedupe, ranking, and per-result attribution

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: 'tavily' | 'duckduckgo';
  score: number;
  timestamp: Date;
  domain: string;
  metadata?: Record<string, any>;
}

interface SearchOptions {
  maxResults?: number;
  domainFilter?: string[];
  excludeDomains?: string[];
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  language?: string;
  safeSearch?: boolean;
  timeout?: number;
}

interface SearchMetrics {
  totalQueries: number;
  tavilyQueries: number;
  duckduckgoQueries: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  lastQuery: Date | null;
}

interface CachedSearchResult {
  results: SearchResult[];
  timestamp: Date;
  query: string;
  options: SearchOptions;
}

interface TavilyResponse {
  results: Array<{
    title: string;
    url: string;
    content: string;
    score: number;
    raw_content?: string;
  }>;
}

interface DuckDuckGoResponse {
  results: Array<{
    title: string;
    href: string;
    body: string;
  }>;
}

export class SearchManager {
  private cache: Map<string, CachedSearchResult> = new Map();
  private metrics: SearchMetrics;
  private readonly cacheTtl: number;
  private readonly tavilyApiKey?: string;
  private readonly searchTimeout: number;
  private readonly enableCaching: boolean;

  constructor() {
    this.tavilyApiKey = process.env.TAVILY_API_KEY;
    this.searchTimeout = parseInt(process.env.SEARCH_TIMEOUT_MS || '5000');
    this.cacheTtl = parseInt(process.env.SEARCH_CACHE_TTL_MS || '1800000'); // 30 minutes default
    this.enableCaching = process.env.SEARCH_ENABLE_CACHE !== 'false';
    
    this.metrics = {
      totalQueries: 0,
      tavilyQueries: 0,
      duckduckgoQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      lastQuery: null
    };

    this.loadCacheFromStorage();
  }

  async search(query: string, options: SearchOptions = {}): Promise<{
    results: SearchResult[];
    sources: string[];
    attribution: string[];
    responseTime: number;
    cached: boolean;
  }> {
    const startTime = Date.now();
    this.metrics.totalQueries++;
    this.metrics.lastQuery = new Date();

    // Check cache first
    const cacheKey = this.generateCacheKey(query, options);
    const cached = this.getCachedResult(cacheKey);
    
    if (cached && this.enableCaching) {
      this.metrics.cacheHits++;
      return {
        results: cached.results,
        sources: [...new Set(cached.results.map(r => r.source))],
        attribution: this.generateAttribution(cached.results),
        responseTime: Date.now() - startTime,
        cached: true
      };
    }

    this.metrics.cacheMisses++;

    try {
      // Execute searches in parallel with fallback strategy
      const searchPromises: Promise<SearchResult[]>[] = [];
      
      // Primary: Tavily (if API key available)
      if (this.tavilyApiKey) {
        searchPromises.push(this.searchTavily(query, options));
      }
      
      // Fallback: DuckDuckGo
      searchPromises.push(this.searchDuckDuckGo(query, options));

      // Wait for all searches with timeout
      const searchResults = await Promise.allSettled(searchPromises);
      
      // Combine and deduplicate results
      let allResults: SearchResult[] = [];
      
      for (const result of searchResults) {
        if (result.status === 'fulfilled') {
          allResults.push(...result.value);
        }
      }

      // Deduplicate, rank, and filter results
      const deduplicatedResults = this.deduplicateResults(allResults);
      const rankedResults = this.rankResults(deduplicatedResults, query);
      const filteredResults = this.applyFilters(rankedResults, options);
      
      // Limit results
      const maxResults = options.maxResults || 10;
      const finalResults = filteredResults.slice(0, maxResults);

      // Cache the results
      if (this.enableCaching) {
        this.cacheResult(cacheKey, {
          results: finalResults,
          timestamp: new Date(),
          query,
          options
        });
      }

      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime);

      return {
        results: finalResults,
        sources: [...new Set(finalResults.map(r => r.source))],
        attribution: this.generateAttribution(finalResults),
        responseTime,
        cached: false
      };

    } catch (error) {
      console.error('Search error:', error);
      
      // Return empty results with error indication
      return {
        results: [],
        sources: [],
        attribution: [`Search error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        responseTime: Date.now() - startTime,
        cached: false
      };
    }
  }

  private async searchTavily(query: string, options: SearchOptions): Promise<SearchResult[]> {
    if (!this.tavilyApiKey) {
      throw new Error('Tavily API key not available');
    }

    this.metrics.tavilyQueries++;

    try {
      const searchParams = new URLSearchParams({
        q: query,
        format: 'json',
        num_results: String(options.maxResults || 10)
      });

      if (options.domainFilter?.length) {
        searchParams.append('include_domains', options.domainFilter.join(','));
      }

      if (options.excludeDomains?.length) {
        searchParams.append('exclude_domains', options.excludeDomains.join(','));
      }

      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.tavilyApiKey}`
        },
        body: JSON.stringify({
          query,
          max_results: options.maxResults || 10,
          include_domains: options.domainFilter,
          exclude_domains: options.excludeDomains,
          include_answer: false,
          include_raw_content: false
        }),
        signal: AbortSignal.timeout(this.searchTimeout)
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status}`);
      }

      const data: TavilyResponse = await response.json();
      
      return data.results.map(result => ({
        title: result.title,
        url: result.url,
        snippet: result.content,
        source: 'tavily' as const,
        score: result.score || 0.5,
        timestamp: new Date(),
        domain: new URL(result.url).hostname,
        metadata: {
          tavilyScore: result.score
        }
      }));

    } catch (error) {
      console.warn('Tavily search failed:', error);
      return [];
    }
  }

  private async searchDuckDuckGo(query: string, options: SearchOptions): Promise<SearchResult[]> {
    this.metrics.duckduckgoQueries++;

    try {
      // DuckDuckGo Instant Answer API (free, no API key required)
      const searchParams = new URLSearchParams({
        q: query,
        format: 'json',
        no_html: '1',
        skip_disambig: '1'
      });

      if (options.safeSearch !== false) {
        searchParams.append('safe_search', 'moderate');
      }

      const response = await fetch(`https://api.duckduckgo.com/?${searchParams}`, {
        signal: AbortSignal.timeout(this.searchTimeout),
        headers: {
          'User-Agent': 'Langflow-Architect/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`DuckDuckGo API error: ${response.status}`);
      }

      const data = await response.json();
      const results: SearchResult[] = [];
      
      // Process different types of DuckDuckGo results
      if (data.RelatedTopics) {
        data.RelatedTopics.forEach((topic: any, index: number) => {
          if (topic.FirstURL && topic.Text) {
            results.push({
              title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 100),
              url: topic.FirstURL,
              snippet: topic.Text,
              source: 'duckduckgo' as const,
              score: Math.max(0.8 - (index * 0.1), 0.1),
              timestamp: new Date(),
              domain: new URL(topic.FirstURL).hostname,
              metadata: {
                ddgIndex: index
              }
            });
          }
        });
      }

      // Add instant answer if available
      if (data.Answer && data.AnswerType) {
        results.unshift({
          title: `${data.AnswerType}: ${data.Answer}`,
          url: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          snippet: data.Answer,
          source: 'duckduckgo' as const,
          score: 0.9,
          timestamp: new Date(),
          domain: 'duckduckgo.com',
          metadata: {
            answerType: data.AnswerType,
            instantAnswer: true
          }
        });
      }

      return results.slice(0, options.maxResults || 10);

    } catch (error) {
      console.warn('DuckDuckGo search failed:', error);
      return [];
    }
  }

  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    const deduplicated: SearchResult[] = [];
    
    for (const result of results) {
      // Create a key for deduplication based on URL and title similarity
      const normalizedUrl = result.url.replace(/\/+$/, '').toLowerCase();
      const normalizedTitle = result.title.toLowerCase().trim();
      
      const key = `${normalizedUrl}:${normalizedTitle.substring(0, 50)}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(result);
      } else {
        // If we have a duplicate, keep the one with higher score
        const existingIndex = deduplicated.findIndex(r => 
          r.url.replace(/\/+$/, '').toLowerCase() === normalizedUrl
        );
        
        if (existingIndex >= 0 && deduplicated[existingIndex].score < result.score) {
          deduplicated[existingIndex] = result;
        }
      }
    }
    
    return deduplicated;
  }

  private rankResults(results: SearchResult[], query: string): SearchResult[] {
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    return results
      .map(result => {
        let relevanceScore = result.score;
        
        // Boost score based on query term matches in title and snippet
        const titleMatches = queryTerms.filter(term => 
          result.title.toLowerCase().includes(term)
        ).length;
        
        const snippetMatches = queryTerms.filter(term => 
          result.snippet.toLowerCase().includes(term)
        ).length;
        
        // Calculate relevance boost
        const titleBoost = (titleMatches / queryTerms.length) * 0.3;
        const snippetBoost = (snippetMatches / queryTerms.length) * 0.2;
        
        // Prefer more recent results slightly
        const ageInHours = (Date.now() - result.timestamp.getTime()) / (1000 * 60 * 60);
        const recencyBoost = Math.max(0, (24 - ageInHours) / 24) * 0.1;
        
        // Source preference (Tavily is generally more reliable)
        const sourceBoost = result.source === 'tavily' ? 0.1 : 0;
        
        relevanceScore += titleBoost + snippetBoost + recencyBoost + sourceBoost;
        
        return { ...result, score: Math.min(relevanceScore, 1.0) };
      })
      .sort((a, b) => b.score - a.score);
  }

  private applyFilters(results: SearchResult[], options: SearchOptions): SearchResult[] {
    let filtered = results;
    
    // Domain filtering
    if (options.domainFilter?.length) {
      filtered = filtered.filter(result => 
        options.domainFilter!.some(domain => result.domain.includes(domain))
      );
    }
    
    if (options.excludeDomains?.length) {
      filtered = filtered.filter(result => 
        !options.excludeDomains!.some(domain => result.domain.includes(domain))
      );
    }
    
    // Time range filtering (simplified)
    if (options.timeRange && options.timeRange !== 'all') {
      const now = Date.now();
      const timeRanges = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000
      };
      
      const cutoff = now - timeRanges[options.timeRange];
      filtered = filtered.filter(result => result.timestamp.getTime() > cutoff);
    }
    
    return filtered;
  }

  private generateAttribution(results: SearchResult[]): string[] {
    const attributions: string[] = [];
    const sourceGroups = new Map<string, SearchResult[]>();
    
    // Group results by source
    results.forEach(result => {
      if (!sourceGroups.has(result.source)) {
        sourceGroups.set(result.source, []);
      }
      sourceGroups.get(result.source)!.push(result);
    });
    
    // Generate attribution strings
    sourceGroups.forEach((sourceResults, source) => {
      const domains = [...new Set(sourceResults.map(r => r.domain))];
      const sourceLabel = source === 'tavily' ? 'Tavily' : 'DuckDuckGo';
      
      if (domains.length === 1) {
        attributions.push(`${sourceLabel}: ${domains[0]} (${sourceResults.length} result${sourceResults.length > 1 ? 's' : ''})`);
      } else {
        attributions.push(`${sourceLabel}: ${sourceResults.length} results from ${domains.length} domains`);
      }
    });
    
    return attributions;
  }

  private generateCacheKey(query: string, options: SearchOptions): string {
    const optionsStr = JSON.stringify(options);
    return `${query.toLowerCase().trim()}:${optionsStr}`;
  }

  private getCachedResult(cacheKey: string): CachedSearchResult | null {
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      const age = Date.now() - cached.timestamp.getTime();
      if (age < this.cacheTtl) {
        return cached;
      } else {
        this.cache.delete(cacheKey);
      }
    }
    
    return null;
  }

  private cacheResult(cacheKey: string, result: CachedSearchResult): void {
    this.cache.set(cacheKey, result);
    
    // Limit cache size
    if (this.cache.size > 1000) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.saveCacheToStorage();
  }

  private updateMetrics(responseTime: number): void {
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalQueries - 1) + responseTime) / 
      this.metrics.totalQueries;
  }

  private saveCacheToStorage(): void {
    try {
      const cacheData = Array.from(this.cache.entries()).slice(-100); // Keep only recent 100 entries
      localStorage.setItem('search-cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save search cache:', error);
    }
  }

  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem('search-cache');
      if (stored) {
        const cacheData: Array<[string, any]> = JSON.parse(stored);
        this.cache = new Map(cacheData.map(([key, value]) => [
          key,
          {
            ...value,
            timestamp: new Date(value.timestamp),
            results: value.results.map((r: any) => ({
              ...r,
              timestamp: new Date(r.timestamp)
            }))
          }
        ]));
      }
    } catch (error) {
      console.warn('Failed to load search cache:', error);
    }
  }

  getMetrics(): SearchMetrics {
    return { ...this.metrics };
  }

  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem('search-cache');
  }
}

export const searchManager = new SearchManager();