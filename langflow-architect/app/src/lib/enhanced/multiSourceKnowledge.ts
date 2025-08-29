// Multi-Source Knowledge Integration – Extracted pattern implementation
// Aggregates knowledge from MCP, Web Search, and Conversation Context with confidence scoring and synthesis

import { mcpManager } from './mcpManager';
import { searchManager } from './searchManager';

export type KnowledgeSourceType = 'mcp' | 'web_search' | 'conversation' | 'cache';

export interface KnowledgeSource {
  id: string;
  type: KnowledgeSourceType;
  confidence: number;
  lastUpdated: Date;
  label?: string;
}

export interface SynthesizedKnowledge {
  summary: string;
  concepts: string[];
  technologies: string[];
  bestPractices: string[];
  patterns: string[];
}

export interface KnowledgeResult {
  content: SynthesizedKnowledge;
  sources: KnowledgeSource[];
  confidence: number;
  synthesizedData: SynthesizedKnowledge;
  attribution?: string[];
  responseTimeMs?: number;
}

export interface MultiSourceOptions {
  domain?: string;
  maxWebResults?: number;
  timeoutMs?: number;
  enableWeb?: boolean;
  enableMcp?: boolean;
}

interface CacheEntry {
  result: KnowledgeResult;
  timestamp: number;
}

export class MultiSourceKnowledge {
  private cache = new Map<string, CacheEntry>();
  private readonly ttlMs: number;

  constructor(ttlMs: number = 15 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  async queryMultipleSources(query: string, context: string, options: MultiSourceOptions = {}): Promise<KnowledgeResult> {
    const start = Date.now();
    const cacheKey = this.buildCacheKey(query, context, options);
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const domain = options.domain || 'general';
    const timeout = options.timeoutMs ?? 3000;
    const enableWeb = options.enableWeb ?? true;
    const enableMcp = options.enableMcp ?? true;

    const sources: KnowledgeSource[] = [];
    let confidence = 0;

    // 1) MCP
    let mcpPayload: Array<{ content: string; source: string; timestamp: string }> = [];
    if (enableMcp) {
      try {
        const mcpRes = await mcpManager.queryServers(query, domain, { timeout, fallbackServers: [] });
        if (mcpRes.success && mcpRes.results.length > 0) {
          mcpPayload = mcpRes.results as typeof mcpPayload;
          sources.push({ id: 'mcp', type: 'mcp', confidence: 0.6, lastUpdated: new Date(), label: mcpRes.sources.join(', ') });
          confidence = Math.max(confidence, 0.6);
        }
  } catch {
        // ignore, graceful degradation
      }
    }

    // 2) Web
    let webAttribution: string[] = [];
    let webPayload: Array<{ title: string; url: string; snippet: string } > = [];
    if (enableWeb) {
      try {
        const web = await searchManager.search(query, { maxResults: options.maxWebResults ?? 5, timeRange: 'year' });
        if (web.results.length > 0) {
          webPayload = web.results.map(r => ({ title: r.title, url: r.url, snippet: r.snippet }));
          webAttribution = web.attribution;
          sources.push({ id: 'web', type: 'web_search', confidence: 0.5, lastUpdated: new Date(), label: web.sources.join(', ') });
          confidence = Math.max(confidence, 0.65); // stack boosts confidence modestly
        }
  } catch {
        // ignore
      }
    }

    // 3) Conversation (lightweight analysis from input/context only)
    const convContent = this.buildConversationKnowledge(query, context);
    if (convContent.summary.length > 0) {
      sources.push({ id: 'conversation', type: 'conversation', confidence: 0.4, lastUpdated: new Date() });
      confidence = Math.max(confidence, 0.7); // 3-source cross validation
    }

    // 4) Synthesize
    const synthesized = this.synthesize(mcpPayload, webPayload, convContent);

    const result: KnowledgeResult = {
      content: synthesized,
      sources,
      confidence: Math.min(1, confidence),
      synthesizedData: synthesized,
      attribution: webAttribution,
      responseTimeMs: Date.now() - start
    };

    this.setCached(cacheKey, result);
    return result;
  }

  // Basic synthesis strategy: extract and dedupe signals from MCP + Web + Conversation
  private synthesize(
    mcp: Array<{ content: string }>,
    web: Array<{ title: string; url: string; snippet: string }>,
    conv: SynthesizedKnowledge
  ): SynthesizedKnowledge {
    const technologies: string[] = [];
    const concepts: string[] = [];
    const bestPractices: string[] = [];
    const patterns: string[] = [];

    const eatText = (text: string) => {
      const lower = text.toLowerCase();
      // tech
      const tech = lower.match(/\b(react|vue|angular|node|python|java|docker|kubernetes|aws|azure|gcp|api|database|graphql)\b/g) || [];
      technologies.push(...tech);
      // concepts
      const conc = lower.match(/\b(workflow|automation|integration|service|component|architecture|pattern|validation)\b/g) || [];
      concepts.push(...conc);
      // best practices triggers
      if (lower.includes('best practice') || lower.includes('recommendation') || lower.includes('guideline')) {
        bestPractices.push(text.slice(0, 200));
      }
      // pattern triggers
      if (lower.includes('pattern') || lower.includes('example') || lower.includes('template')) {
        patterns.push(text.slice(0, 200));
      }
    };

    mcp.forEach(r => eatText(r.content));
    web.forEach(r => eatText(`${r.title} ${r.snippet}`));

    const combined: SynthesizedKnowledge = {
      summary: this.buildSummary(technologies, concepts, conv),
      technologies: this.unique([...(conv.technologies || []), ...technologies]),
      concepts: this.unique([...(conv.concepts || []), ...concepts]),
      bestPractices: this.unique([...(conv.bestPractices || []), ...bestPractices]),
      patterns: this.unique([...(conv.patterns || []), ...patterns])
    };

    return combined;
  }

  private buildConversationKnowledge(query: string, context: string): SynthesizedKnowledge {
    const base = `${query} ${context}`;
    const lower = base.toLowerCase();
    const technologies = lower.match(/\b(react|vue|angular|node|python|java|docker|kubernetes|aws|azure|gcp|api|database|graphql)\b/g) || [];
    const concepts = lower.match(/\b(workflow|automation|integration|api|service|component|validation)\b/g) || [];
    const patterns: string[] = [];
    const bestPractices: string[] = [];

    return {
      summary: base.trim().slice(0, 200),
      technologies: this.unique(technologies),
      concepts: this.unique(concepts),
      patterns,
      bestPractices
    };
  }

  private buildSummary(tech: string[], conc: string[], conv: SynthesizedKnowledge): string {
    const techStr = this.unique(tech).slice(0, 5).join(', ');
    const concStr = this.unique(conc).slice(0, 5).join(', ');
    const base = conv.summary ? `Context mentions: ${conv.summary}` : '';
    return [base, techStr ? `Tech: ${techStr}` : '', concStr ? `Concepts: ${concStr}` : '']
      .filter(Boolean)
      .join(' | ')
      .slice(0, 300);
  }

  private buildCacheKey(query: string, context: string, options: MultiSourceOptions): string {
    return JSON.stringify({ q: query.trim().toLowerCase(), c: context.trim().toLowerCase(), o: options });
  }

  private getCached(key: string): KnowledgeResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return entry.result;
  }

  private setCached(key: string, result: KnowledgeResult): void {
    this.cache.set(key, { result, timestamp: Date.now() });
    if (this.cache.size > 500) {
      const first = this.cache.keys().next().value;
      if (first) this.cache.delete(first);
    }
  }

  private unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
  }
}

export const multiSourceKnowledge = new MultiSourceKnowledge();
