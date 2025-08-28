// Epic 6.4 - Domain Expertise Engine
// Intelligent domain detection and expertise activation system
// Integrates with Epic 5 Context Engine for enhanced domain awareness

import { ContextEngine, ContextAnalysis } from './contextEngine';

// Domain expertise types
export interface DomainContext {
  domain: string;
  confidence: number;
  subdomains: string[];
  expertiseAreas: string[];
  complianceRequirements: string[];
  detectionTimestamp: string;
}

export interface ComplianceRequirement {
  regulation: string;
  applicability: 'required' | 'recommended' | 'optional';
  description: string;
  validationRules: string[];
}

export interface ExpertisePattern {
  keywords: string[];
  phrases: string[];
  context_indicators: string[];
  confidence_weight: number;
}

export interface DomainDefinition {
  name: string;
  aliases: string[];
  patterns: ExpertisePattern;
  compliance: ComplianceRequirement[];
  specialized_components: string[];
  integration_patterns: string[];
}

// Domain expertise activation results
export interface DomainActivation {
  activated_domain: string;
  expertise_level: 'beginner' | 'intermediate' | 'expert';
  available_tools: string[];
  compliance_framework: ComplianceRequirement[];
  recommended_patterns: string[];
}

/**
 * Domain Expertise Engine - Epic 6.4 Story 6.4.1
 * 
 * Provides intelligent domain detection and expertise activation
 * based on conversation context and user input patterns.
 */
export class DomainExpertiseEngine {
  private contextEngine: ContextEngine;
  private domainDefinitions: Map<string, DomainDefinition> = new Map();
  private activeDomains: Map<string, DomainContext> = new Map();

  constructor(contextEngine?: ContextEngine) {
    this.contextEngine = contextEngine || new ContextEngine();
    this.initializeDomainDefinitions();
  }

  /**
   * Initialize domain definitions for major industries
   */
  private initializeDomainDefinitions(): void {
    // Healthcare domain definition
    this.domainDefinitions.set('healthcare', {
      name: 'Healthcare',
      aliases: ['medical', 'hospital', 'clinic', 'patient care', 'health tech'],
      patterns: {
        keywords: [
          'patient', 'medical', 'healthcare', 'hospital', 'clinic', 
          'diagnosis', 'treatment', 'medication', 'doctor', 'nurse',
          'ehr', 'emr', 'fhir', 'hl7', 'dicom', 'phi', 'pii'
        ],
        phrases: [
          'patient data', 'medical records', 'healthcare workflow',
          'clinical decision', 'medical device', 'patient privacy',
          'health information', 'clinical trial', 'medical research'
        ],
        context_indicators: [
          'HIPAA', 'FDA', 'clinical', 'therapeutic', 'pharmaceutical',
          'biomedical', 'radiology', 'pathology', 'cardiology'
        ],
        confidence_weight: 0.9
      },
      compliance: [
        {
          regulation: 'HIPAA',
          applicability: 'required',
          description: 'Health Insurance Portability and Accountability Act',
          validationRules: [
            'encrypt_phi_data',
            'audit_trail_required',
            'access_controls_mandatory',
            'data_minimization'
          ]
        },
        {
          regulation: 'FDA_21_CFR_Part_11',
          applicability: 'recommended',
          description: 'FDA regulations for electronic records and signatures',
          validationRules: [
            'electronic_signature_validation',
            'audit_trail_integrity',
            'system_validation'
          ]
        }
      ],
      specialized_components: [
        'patient_data_handler',
        'fhir_integration',
        'phi_encryption',
        'clinical_decision_support'
      ],
      integration_patterns: [
        'hl7_messaging',
        'fhir_api_integration',
        'dicom_processing',
        'secure_messaging'
      ]
    });

    // Finance domain definition
    this.domainDefinitions.set('finance', {
      name: 'Finance',
      aliases: ['financial', 'banking', 'investment', 'fintech', 'trading'],
      patterns: {
        keywords: [
          'financial', 'banking', 'investment', 'trading', 'transaction',
          'payment', 'credit', 'loan', 'portfolio', 'risk', 'compliance',
          'audit', 'kyc', 'aml', 'regulatory', 'capital', 'asset'
        ],
        phrases: [
          'financial data', 'transaction processing', 'risk assessment',
          'compliance reporting', 'fraud detection', 'payment processing',
          'investment analysis', 'credit scoring', 'regulatory compliance'
        ],
        context_indicators: [
          'SOX', 'PCI-DSS', 'Basel', 'MiFID', 'GDPR', 'CCPA',
          'SEC', 'FINRA', 'OCC', 'FCA', 'regulatory'
        ],
        confidence_weight: 0.85
      },
      compliance: [
        {
          regulation: 'SOX',
          applicability: 'required',
          description: 'Sarbanes-Oxley Act financial reporting requirements',
          validationRules: [
            'financial_data_integrity',
            'audit_trail_complete',
            'access_controls_segregated',
            'change_management_documented'
          ]
        },
        {
          regulation: 'PCI-DSS',
          applicability: 'required',
          description: 'Payment Card Industry Data Security Standard',
          validationRules: [
            'cardholder_data_protection',
            'secure_payment_processing',
            'network_security_controls',
            'vulnerability_management'
          ]
        }
      ],
      specialized_components: [
        'payment_processor',
        'fraud_detection',
        'risk_calculator',
        'compliance_reporter'
      ],
      integration_patterns: [
        'payment_gateway_integration',
        'banking_api_connectivity',
        'regulatory_reporting',
        'secure_transaction_processing'
      ]
    });

    // Manufacturing domain definition
    this.domainDefinitions.set('manufacturing', {
      name: 'Manufacturing',
      aliases: ['industrial', 'production', 'factory', 'assembly', 'automation'],
      patterns: {
        keywords: [
          'manufacturing', 'production', 'assembly', 'quality', 'automation',
          'machinery', 'equipment', 'maintenance', 'supply chain', 'inventory',
          'iot', 'sensors', 'plc', 'scada', 'mes', 'erp'
        ],
        phrases: [
          'production line', 'quality control', 'supply chain management',
          'predictive maintenance', 'inventory optimization', 'process automation',
          'industrial iot', 'machine learning', 'operational efficiency'
        ],
        context_indicators: [
          'ISO9001', 'Six Sigma', 'Lean', 'OEE', 'TPM', 'Kaizen',
          'Industry 4.0', 'digital twin', 'cyber-physical'
        ],
        confidence_weight: 0.8
      },
      compliance: [
        {
          regulation: 'ISO_9001',
          applicability: 'recommended',
          description: 'Quality management systems requirements',
          validationRules: [
            'quality_management_system',
            'process_documentation',
            'continuous_improvement',
            'customer_satisfaction'
          ]
        },
        {
          regulation: 'ISO_27001',
          applicability: 'recommended',
          description: 'Information security management',
          validationRules: [
            'information_security_controls',
            'risk_assessment_process',
            'security_incident_management'
          ]
        }
      ],
      specialized_components: [
        'iot_sensor_integration',
        'predictive_analytics',
        'quality_monitoring',
        'supply_chain_optimizer'
      ],
      integration_patterns: [
        'iot_device_connectivity',
        'erp_system_integration',
        'scada_data_collection',
        'real_time_monitoring'
      ]
    });

    // Technology/Software domain definition
    this.domainDefinitions.set('technology', {
      name: 'Technology',
      aliases: ['software', 'tech', 'development', 'devops', 'cloud'],
      patterns: {
        keywords: [
          'software', 'application', 'development', 'coding', 'programming',
          'api', 'database', 'cloud', 'devops', 'automation', 'ci/cd',
          'microservices', 'containers', 'kubernetes', 'docker'
        ],
        phrases: [
          'software development', 'application deployment', 'api integration',
          'cloud infrastructure', 'devops pipeline', 'automated testing',
          'microservices architecture', 'container orchestration'
        ],
        context_indicators: [
          'AWS', 'Azure', 'GCP', 'REST', 'GraphQL', 'OAuth',
          'JWT', 'SSL/TLS', 'HTTPS', 'Git', 'CI/CD'
        ],
        confidence_weight: 0.75
      },
      compliance: [
        {
          regulation: 'GDPR',
          applicability: 'recommended',
          description: 'General Data Protection Regulation',
          validationRules: [
            'data_protection_by_design',
            'user_consent_management',
            'data_portability',
            'right_to_erasure'
          ]
        },
        {
          regulation: 'SOC_2',
          applicability: 'recommended',
          description: 'Service Organization Control 2',
          validationRules: [
            'security_controls',
            'availability_monitoring',
            'processing_integrity',
            'confidentiality_protection'
          ]
        }
      ],
      specialized_components: [
        'api_gateway',
        'authentication_service',
        'logging_system',
        'monitoring_dashboard'
      ],
      integration_patterns: [
        'rest_api_integration',
        'oauth_authentication',
        'webhook_processing',
        'event_driven_architecture'
      ]
    });
  }

  /**
   * Detect domain from conversation context and user input
   */
  async detectDomain(conversationContext: {
    currentInput: string;
    history: Array<{ role: string; content: string }>;
    previousContext?: ContextAnalysis;
  }): Promise<DomainContext> {
    try {
      // Combine current input with conversation history for analysis
      const fullContext = [
        conversationContext.currentInput,
        ...conversationContext.history.map(msg => msg.content)
      ].join(' ');

      // Get enhanced context analysis from Epic 5 infrastructure (catch errors)
      let contextAnalysis;
      try {
        contextAnalysis = await this.contextEngine.query({
          query: fullContext,
          maxResults: 5
        });
      } catch (error) {
        console.warn('Context engine error, proceeding with basic analysis:', error);
        // Continue with domain detection even if context engine fails
      }

      // Analyze for domain indicators
      const domainScores = new Map<string, number>();

      for (const [domainName, domainDef] of this.domainDefinitions) {
        const score = this.calculateDomainScore(fullContext, domainDef);
        if (score > 0.1) { // Lower minimum confidence threshold
          domainScores.set(domainName, score);
        }
      }

      // Find highest scoring domain
      let bestDomain = 'general';
      let bestScore = 0.1; // Lower threshold - any scoring domain beats general
      let expertiseAreas: string[] = [];
      let complianceRequirements: string[] = [];

      for (const [domain, score] of domainScores) {
        if (score > bestScore) {
          bestDomain = domain;
          bestScore = score;
          
          const domainDef = this.domainDefinitions.get(domain);
          if (domainDef) {
            expertiseAreas = domainDef.specialized_components;
            complianceRequirements = domainDef.compliance
              .filter(c => c.applicability === 'required')
              .map(c => c.regulation);
          }
        }
      }

      // Detect subdomains within the primary domain
      const subdomains = this.detectSubdomains(fullContext, bestDomain);

      const domainContext: DomainContext = {
        domain: bestDomain,
        confidence: bestScore,
        subdomains,
        expertiseAreas,
        complianceRequirements,
        detectionTimestamp: new Date().toISOString()
      };

      // Cache the detected domain context
      const contextKey = this.generateContextKey(conversationContext);
      this.activeDomains.set(contextKey, domainContext);

      return domainContext;
    } catch (error) {
      console.error('Domain detection failed:', error);
      // Return a basic general domain context on error
      return {
        domain: 'general',
        confidence: 0,
        subdomains: [],
        expertiseAreas: [],
        complianceRequirements: [],
        detectionTimestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Calculate domain confidence score based on pattern matching
   */
  private calculateDomainScore(text: string, domainDef: DomainDefinition): number {
    const lowercaseText = text.toLowerCase();
    let score = 0;

    // Score based on keyword matches
    const keywordMatches = domainDef.patterns.keywords.filter(keyword =>
      lowercaseText.includes(keyword.toLowerCase())
    ).length;
    if (domainDef.patterns.keywords.length > 0) {
      score += (keywordMatches / domainDef.patterns.keywords.length) * 0.4;
    }

    // Score based on phrase matches  
    const phraseMatches = domainDef.patterns.phrases.filter(phrase =>
      lowercaseText.includes(phrase.toLowerCase())
    ).length;
    if (domainDef.patterns.phrases.length > 0) {
      score += (phraseMatches / domainDef.patterns.phrases.length) * 0.3;
    }

    // Score based on context indicators
    const contextMatches = domainDef.patterns.context_indicators.filter(indicator =>
      lowercaseText.includes(indicator.toLowerCase())
    ).length;
    if (domainDef.patterns.context_indicators.length > 0) {
      score += (contextMatches / domainDef.patterns.context_indicators.length) * 0.3;
    }

    // Apply domain-specific confidence weight
    const finalScore = score * domainDef.patterns.confidence_weight;

    return Math.min(finalScore, 1.0); // Cap at 1.0
  }

  /**
   * Detect subdomains within a primary domain
   */
  private detectSubdomains(text: string, primaryDomain: string): string[] {
    const subdomains: string[] = [];
    const lowercaseText = text.toLowerCase();

    // Healthcare subdomains
    if (primaryDomain === 'healthcare') {
      const healthcareSubdomains = [
        { name: 'cardiology', keywords: ['heart', 'cardiac', 'cardiovascular', 'ecg', 'ekg'] },
        { name: 'radiology', keywords: ['imaging', 'scan', 'xray', 'mri', 'ct', 'ultrasound'] },
        { name: 'pharmacy', keywords: ['medication', 'prescription', 'drug', 'pharmaceutical', 'dosage'] },
        { name: 'lab', keywords: ['laboratory', 'blood test', 'specimen', 'pathology', 'analysis'] }
      ];

      for (const subdomain of healthcareSubdomains) {
        if (subdomain.keywords.some(keyword => lowercaseText.includes(keyword))) {
          subdomains.push(subdomain.name);
        }
      }
    }

    // Finance subdomains
    if (primaryDomain === 'finance') {
      const financeSubdomains = [
        { name: 'trading', keywords: ['trade', 'market', 'stock', 'forex', 'commodity'] },
        { name: 'lending', keywords: ['loan', 'credit', 'mortgage', 'lending', 'borrowing'] },
        { name: 'payments', keywords: ['payment', 'transaction', 'transfer', 'remittance'] },
        { name: 'insurance', keywords: ['insurance', 'policy', 'claim', 'underwriting', 'actuarial'] }
      ];

      for (const subdomain of financeSubdomains) {
        if (subdomain.keywords.some(keyword => lowercaseText.includes(keyword))) {
          subdomains.push(subdomain.name);
        }
      }
    }

    return subdomains;
  }

  /**
   * Activate domain-specific expertise and tools
   */
  async activateDomainExpertise(domain: string): Promise<DomainActivation> {
    const domainDef = this.domainDefinitions.get(domain);
    
    if (!domainDef) {
      throw new Error(`Unknown domain: ${domain}`);
    }

    // Determine expertise level based on conversation complexity
    const expertiseLevel = this.determineExpertiseLevel(domain);

    const activation: DomainActivation = {
      activated_domain: domain,
      expertise_level: expertiseLevel,
      available_tools: domainDef.specialized_components,
      compliance_framework: domainDef.compliance,
      recommended_patterns: domainDef.integration_patterns
    };

    return activation;
  }

  /**
   * Determine user expertise level for adaptive interaction
   */
  private determineExpertiseLevel(domain: string): 'beginner' | 'intermediate' | 'expert' {
    // This would typically analyze conversation patterns, technical terminology usage,
    // and question complexity. For now, defaulting to intermediate.
    // TODO: Implement ML-based expertise detection in future iteration
    return 'intermediate';
  }

  /**
   * Generate a unique context key for caching
   */
  private generateContextKey(context: {
    currentInput: string;
    history: Array<{ role: string; content: string }>;
  }): string {
    const content = context.currentInput + context.history.map(h => h.content).join('');
    // Simple hash function for context key
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `context_${Math.abs(hash)}`;
  }

  /**
   * Get all available domain definitions
   */
  getDomainDefinitions(): Map<string, DomainDefinition> {
    return new Map(this.domainDefinitions);
  }

  /**
   * Get current active domains
   */
  getActiveDomains(): Map<string, DomainContext> {
    return new Map(this.activeDomains);
  }

  /**
   * Check if a specific domain is currently active
   */
  isDomainActive(domain: string): boolean {
    return Array.from(this.activeDomains.values()).some(ctx => ctx.domain === domain);
  }

  /**
   * Get compliance requirements for a specific domain
   */
  getDomainCompliance(domain: string): ComplianceRequirement[] {
    const domainDef = this.domainDefinitions.get(domain);
    return domainDef ? domainDef.compliance : [];
  }
}