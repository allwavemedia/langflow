// Epic 6.4 - Domain Expertise Type Definitions
// Type definitions for domain detection and expertise activation

export type ExpertiseLevel = 'beginner' | 'intermediate' | 'expert';

export type ComplianceApplicability = 'required' | 'recommended' | 'optional';

export type RegulationType = 
  | 'HIPAA' 
  | 'GDPR' 
  | 'SOX' 
  | 'PCI-DSS' 
  | 'FDA_21_CFR_Part_11'
  | 'ISO_9001'
  | 'ISO_27001'
  | 'SOC_2'
  | 'CCPA';

export interface DomainKeywords {
  primary: string[];
  secondary: string[];
  technical: string[];
  regulatory: string[];
}

export interface DomainMetadata {
  industry_sector: string;
  typical_use_cases: string[];
  common_technologies: string[];
  regulatory_environment: RegulationType[];
  expertise_requirements: ExpertiseLevel[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  metadata?: {
    domain_hints?: string[];
    expertise_indicators?: string[];
    compliance_mentions?: string[];
  };
}

export interface ConversationContext {
  currentInput: string;
  history: ConversationMessage[];
  previousContext?: import('./contextEngine').ContextAnalysis;
  session_id?: string;
  user_profile?: UserProfile;
}

export interface UserProfile {
  expertise_level?: ExpertiseLevel;
  known_domains?: string[];
  preferred_complexity?: 'simple' | 'detailed' | 'technical';
  compliance_awareness?: RegulationType[];
  role?: string;
  organization_type?: string;
}

export interface DomainDetectionResult {
  primary_domain: string;
  confidence: number;
  alternative_domains: Array<{
    domain: string;
    confidence: number;
    reasoning: string;
  }>;
  domain_indicators: {
    keywords_found: string[];
    phrases_matched: string[];
    context_signals: string[];
  };
  expertise_level_detected: ExpertiseLevel;
  compliance_context: ComplianceContext;
}

export interface ComplianceContext {
  applicable_regulations: RegulationType[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  mandatory_requirements: string[];
  recommended_practices: string[];
  potential_violations: string[];
}

export interface ExpertiseActivationConfig {
  domain: string;
  expertise_level: ExpertiseLevel;
  enable_compliance_checks: boolean;
  enable_domain_patterns: boolean;
  enable_specialized_tools: boolean;
  progressive_disclosure: boolean;
}

export interface DomainSpecificGuidance {
  recommended_components: string[];
  integration_patterns: string[];
  best_practices: string[];
  common_pitfalls: string[];
  compliance_requirements: ComplianceRequirement[];
  testing_strategies: string[];
  monitoring_recommendations: string[];
}

export interface ComplianceRequirement {
  regulation: RegulationType;
  applicability: ComplianceApplicability;
  description: string;
  validationRules: string[];
  implementation_guidance?: string;
  documentation_requirements?: string[];
  audit_considerations?: string[];
}

export interface DomainExpertiseMetrics {
  detection_accuracy: number;
  activation_success_rate: number;
  user_satisfaction_score: number;
  compliance_coverage: number;
  false_positive_rate: number;
  processing_time_ms: number;
}

// Event types for domain expertise system
export interface DomainDetectionEvent {
  type: 'domain_detected' | 'domain_changed' | 'expertise_activated';
  timestamp: string;
  session_id: string;
  domain: string;
  confidence: number;
  previous_domain?: string;
  metadata?: Record<string, any>;
}

export interface ComplianceValidationEvent {
  type: 'compliance_check' | 'violation_detected' | 'recommendation_provided';
  timestamp: string;
  session_id: string;
  regulation: RegulationType;
  status: 'passed' | 'failed' | 'warning';
  details: string;
  recommended_actions?: string[];
}

// Configuration interfaces
export interface DomainExpertiseConfig {
  enabled_domains: string[];
  default_expertise_level: ExpertiseLevel;
  compliance_strictness: 'lenient' | 'moderate' | 'strict';
  detection_threshold: number;
  cache_duration_minutes: number;
  enable_learning: boolean;
  fallback_domain: string;
}

export interface DomainPattern {
  name: string;
  type: 'keyword' | 'phrase' | 'regex' | 'semantic';
  pattern: string | RegExp;
  weight: number;
  context_required?: boolean;
  minimum_occurrences?: number;
}

// Advanced domain expertise interfaces
export interface DomainKnowledgeBase {
  domain: string;
  version: string;
  last_updated: string;
  knowledge_areas: KnowledgeArea[];
  expert_patterns: ExpertPattern[];
  compliance_mappings: ComplianceMapping[];
}

export interface KnowledgeArea {
  area: string;
  concepts: string[];
  relationships: Array<{
    from: string;
    to: string;
    type: 'depends_on' | 'related_to' | 'conflicts_with';
  }>;
  expertise_requirements: ExpertiseLevel;
}

export interface ExpertPattern {
  pattern_id: string;
  name: string;
  description: string;
  triggers: DomainPattern[];
  activation_conditions: string[];
  guidance: DomainSpecificGuidance;
  success_metrics: string[];
}

export interface ComplianceMapping {
  regulation: RegulationType;
  domain_scope: string[];
  automated_checks: string[];
  manual_reviews: string[];
  documentation_templates: string[];
  risk_categories: Array<{
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    mitigation_strategies: string[];
  }>;
}

// Machine learning and adaptive system interfaces
export interface LearningData {
  session_id: string;
  user_feedback: {
    domain_accuracy: number; // 1-5 scale
    guidance_relevance: number; // 1-5 scale
    complexity_appropriateness: number; // 1-5 scale
    overall_satisfaction: number; // 1-5 scale
  };
  actual_domain?: string;
  actual_expertise_level?: ExpertiseLevel;
  corrections: Array<{
    field: string;
    suggested_value: any;
    actual_value: any;
  }>;
}

export interface AdaptiveBehavior {
  user_id: string;
  learned_preferences: {
    preferred_domains: string[];
    complexity_preference: 'simple' | 'detailed' | 'technical';
    compliance_focus_areas: RegulationType[];
    communication_style: 'formal' | 'casual' | 'technical';
  };
  interaction_patterns: {
    common_questions: string[];
    typical_workflows: string[];
    frequent_integrations: string[];
  };
  performance_metrics: {
    accuracy_improvement: number;
    user_satisfaction_trend: number[];
    engagement_level: number;
  };
}

// Integration with CopilotKit and Epic 5 infrastructure
export interface CopilotKitDomainAction {
  name: string;
  description: string;
  domain: string;
  expertise_level: ExpertiseLevel;
  parameters: Record<string, {
    type: string;
    description: string;
    required?: boolean;
    enum?: string[];
  }>;
  handler: (params: any) => Promise<any>;
  compliance_considerations?: ComplianceRequirement[];
}

export interface EnhancedContextIntegration {
  context_engine_version: string;
  domain_expertise_version: string;
  integration_patterns: string[];
  data_flow: Array<{
    from: string;
    to: string;
    data_type: string;
    transformation?: string;
  }>;
  performance_optimizations: string[];
}