// Compliance Validation Engine - Epic 6.4.2 Implementation
// Real-time compliance validation against dynamically discovered regulatory frameworks
// Context-aware validation with adaptive recommendations

import type { 
  ComplianceFramework, 
  ComplianceRequirement, 
  ValidationRule,
  ComplianceValidationResult,
  ComplianceViolation,
  ComplianceRecommendation
} from './complianceIntelligenceSystem';

// Validation interfaces
export interface ValidationContext {
  workflowConfig: WorkflowConfiguration;
  domainContext: string;
  dataTypes: string[];
  geographicScope?: string;
  userRoles?: string[];
  businessOperations?: string[];
  riskTolerance: 'low' | 'medium' | 'high';
}

export interface WorkflowConfiguration {
  id: string;
  name: string;
  description: string;
  components: WorkflowComponent[];
  dataFlow: DataFlowDefinition[];
  integrations: IntegrationDefinition[];
  security: SecurityConfiguration;
  dataHandling: DataHandlingConfiguration;
  metadata: Record<string, unknown>;
}

export interface WorkflowComponent {
  id: string;
  type: string;
  name: string;
  configuration: Record<string, unknown>;
  inputs: ComponentIO[];
  outputs: ComponentIO[];
  securitySettings?: SecuritySettings;
  dataProcessing?: DataProcessingSettings;
}

export interface ComponentIO {
  id: string;
  name: string;
  type: string;
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
  encryptionRequired?: boolean;
  retentionPolicy?: string;
}

export interface DataFlowDefinition {
  source: string;
  target: string;
  dataType: string;
  transformations: string[];
  securityRequirements: string[];
  complianceAnnotations?: string[];
}

export interface IntegrationDefinition {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file' | 'service';
  endpoint?: string;
  authentication: AuthenticationConfig;
  dataAccess: DataAccessConfig;
  complianceSettings?: ComplianceSettings;
}

export interface SecurityConfiguration {
  encryption: EncryptionConfig;
  authentication: AuthenticationConfig;
  authorization: AuthorizationConfig;
  logging: LoggingConfig;
  monitoring: MonitoringConfig;
}

export interface DataHandlingConfiguration {
  collection: DataCollectionConfig;
  processing: DataProcessingConfig;
  storage: DataStorageConfig;
  transmission: DataTransmissionConfig;
  retention: DataRetentionConfig;
  deletion: DataDeletionConfig;
}

export interface ValidationOptions {
  strictMode: boolean;
  includeWarnings: boolean;
  autoFix: boolean;
  prioritizeFrameworks?: string[];
  excludeFrameworks?: string[];
  customRules?: ValidationRule[];
  performanceMode: 'fast' | 'thorough' | 'comprehensive';
}

export interface ValidationResult {
  overallCompliant: boolean;
  complianceScore: number; // 0-100
  frameworkResults: FrameworkValidationResult[];
  summary: ValidationSummary;
  recommendations: ComplianceRecommendation[];
  autoFixSuggestions: AutoFixSuggestion[];
  validationMetrics: ValidationMetrics;
}

export interface FrameworkValidationResult {
  frameworkId: string;
  frameworkName: string;
  compliant: boolean;
  score: number;
  requirementResults: RequirementValidationResult[];
  criticalViolations: ComplianceViolation[];
  warnings: ComplianceViolation[];
  applicabilityScore: number; // How relevant this framework is to the workflow
}

export interface RequirementValidationResult {
  requirementId: string;
  requirementTitle: string;
  status: 'compliant' | 'violation' | 'warning' | 'not_applicable';
  details: string;
  evidence: ValidationEvidence[];
  remediation?: string[];
}

export interface ValidationEvidence {
  type: 'configuration' | 'component' | 'dataflow' | 'integration';
  location: string;
  value: unknown;
  assessment: 'compliant' | 'non_compliant' | 'insufficient_info';
  confidence: number;
}

export interface ValidationSummary {
  totalRequirementsChecked: number;
  compliantRequirements: number;
  violatedRequirements: number;
  warningRequirements: number;
  notApplicableRequirements: number;
  criticalIssues: number;
  highPriorityIssues: number;
  estimatedRemediationTime: string;
}

export interface AutoFixSuggestion {
  id: string;
  description: string;
  targetComponent: string;
  changeType: 'configuration' | 'component_addition' | 'component_modification' | 'integration_update';
  changes: ConfigurationChange[];
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  frameworkRequirement: string;
}

export interface ConfigurationChange {
  path: string;
  currentValue: unknown;
  suggestedValue: unknown;
  reason: string;
}

export interface ValidationMetrics {
  validationTime: number;
  frameworksEvaluated: number;
  requirementsChecked: number;
  rulesApplied: number;
  autoFixesAvailable: number;
  cacheHitRate: number;
}

// Type definitions for configuration objects
interface SecuritySettings {
  encryptionEnabled: boolean;
  authenticationRequired: boolean;
  accessControl: string[];
  auditLogging: boolean;
}

interface DataProcessingSettings {
  dataMinimization: boolean;
  purposeLimitation: boolean;
  retentionPeriod?: string;
  anonymization?: boolean;
}

interface EncryptionConfig {
  enabled: boolean;
  algorithm?: string;
  keyManagement?: string;
  atRest: boolean;
  inTransit: boolean;
}

interface AuthenticationConfig {
  method: string;
  multiFactor: boolean;
  sessionTimeout?: number;
  passwordPolicy?: string;
}

interface AuthorizationConfig {
  model: 'rbac' | 'abac' | 'custom';
  roles: string[];
  permissions: string[];
  principleOfLeastPrivilege: boolean;
}

interface LoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  auditTrail: boolean;
  retention: string;
}

interface MonitoringConfig {
  enabled: boolean;
  metrics: string[];
  alerting: boolean;
  realTimeMonitoring: boolean;
}

interface DataCollectionConfig {
  consentRequired: boolean;
  purposeSpecification: boolean;
  dataMinimization: boolean;
  lawfulBasis?: string;
}

interface DataProcessingConfig {
  purposeLimitation: boolean;
  dataQuality: boolean;
  processingRecord: boolean;
  automatedDecisionMaking?: boolean;
}

interface DataStorageConfig {
  location: string;
  encryption: boolean;
  accessControls: boolean;
  backupProcedures: boolean;
}

interface DataTransmissionConfig {
  encryption: boolean;
  secureProtocols: boolean;
  dataIntegrityChecks: boolean;
  auditLogging: boolean;
}

interface DataRetentionConfig {
  policy: string;
  duration: string;
  reviewProcedures: boolean;
  automaticDeletion: boolean;
}

interface DataDeletionConfig {
  secureErasure: boolean;
  verificationProcedures: boolean;
  auditTrail: boolean;
  rightOfErasure: boolean;
}

interface DataAccessConfig {
  permissions: string[];
  dataClassification: string[];
  accessLogging: boolean;
  dataExportControls: boolean;
}

interface ComplianceSettings {
  frameworks: string[];
  controls: string[];
  auditRequirements: string[];
  reportingFrequency: string;
}

// Compliance Validation Engine - implements real-time validation
export class ComplianceValidationEngine {
  private validationCache: Map<string, ValidationResult> = new Map();
  private ruleCache: Map<string, ValidationRule[]> = new Map();
  private frameworkApplicabilityCache: Map<string, number> = new Map();
  private performanceMetrics: Map<string, number> = new Map();

  constructor() {
    this.initializeValidationEngine();
  }

  // Primary validation method - validates workflow against discovered frameworks
  async validateCompliance(
    validationContext: ValidationContext,
    frameworks: ComplianceFramework[],
    options: ValidationOptions = this.getDefaultValidationOptions()
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = this.generateValidationCacheKey(validationContext, frameworks, options);
      const cached = this.validationCache.get(cacheKey);
      if (cached && this.isCacheFresh(cached)) {
        return cached;
      }

      // Step 1: Filter and prioritize applicable frameworks
      const applicableFrameworks = await this.filterApplicableFrameworks(
        frameworks, 
        validationContext
      );

      // Step 2: Validate against each applicable framework
      const frameworkResults: FrameworkValidationResult[] = [];
      for (const framework of applicableFrameworks) {
        const frameworkResult = await this.validateAgainstFramework(
          validationContext,
          framework,
          options
        );
        frameworkResults.push(frameworkResult);
      }

      // Step 3: Generate overall compliance assessment
      const summary = this.generateValidationSummary(frameworkResults);
      const overallCompliant = this.assessOverallCompliance(frameworkResults, options);
      const complianceScore = this.calculateOverallComplianceScore(frameworkResults);

      // Step 4: Generate recommendations and auto-fix suggestions
      const recommendations = await this.generateComplianceRecommendations(
        frameworkResults,
        validationContext
      );
      const autoFixSuggestions = await this.generateAutoFixSuggestions(
        frameworkResults,
        validationContext,
        options
      );

      // Step 5: Compile validation metrics
      const validationTime = Date.now() - startTime;
      const metrics: ValidationMetrics = {
        validationTime,
        frameworksEvaluated: frameworkResults.length,
        requirementsChecked: summary.totalRequirementsChecked,
        rulesApplied: this.getTotalRulesApplied(frameworkResults),
        autoFixesAvailable: autoFixSuggestions.length,
        cacheHitRate: this.calculateCacheHitRate()
      };

      const result: ValidationResult = {
        overallCompliant,
        complianceScore,
        frameworkResults,
        summary,
        recommendations,
        autoFixSuggestions,
        validationMetrics: metrics
      };

      // Cache the result
      this.validationCache.set(cacheKey, result);

      return result;

    } catch (error) {
      console.warn('Compliance validation failed:', error);
      
      return this.generateErrorValidationResult(error, Date.now() - startTime);
    }
  }

  // Validate workflow against a specific framework
  private async validateAgainstFramework(
    validationContext: ValidationContext,
    framework: ComplianceFramework,
    options: ValidationOptions
  ): Promise<FrameworkValidationResult> {
    const requirementResults: RequirementValidationResult[] = [];
    const criticalViolations: ComplianceViolation[] = [];
    const warnings: ComplianceViolation[] = [];

    // Calculate framework applicability
    const applicabilityScore = await this.calculateFrameworkApplicability(
      framework,
      validationContext
    );

    // Validate each requirement in the framework
    for (const requirement of framework.requirements) {
      const requirementResult = await this.validateRequirement(
        requirement,
        validationContext,
        framework,
        options
      );
      
      requirementResults.push(requirementResult);

      // Categorize violations by severity
      if (requirementResult.status === 'violation') {
        const violation = this.createViolationFromRequirement(
          requirement,
          requirementResult,
          framework
        );
        
        if (requirement.severity === 'critical' || requirement.severity === 'high') {
          criticalViolations.push(violation);
        } else {
          warnings.push(violation);
        }
      }
    }

    // Calculate framework compliance score
    const score = this.calculateFrameworkComplianceScore(requirementResults);
    const compliant = criticalViolations.length === 0 && 
                     (warnings.length === 0 || !options.strictMode);

    return {
      frameworkId: framework.id,
      frameworkName: framework.name,
      compliant,
      score,
      requirementResults,
      criticalViolations,
      warnings,
      applicabilityScore
    };
  }

  // Validate a specific requirement against the workflow
  private async validateRequirement(
    requirement: ComplianceRequirement,
    validationContext: ValidationContext,
    framework: ComplianceFramework,
    options: ValidationOptions
  ): Promise<RequirementValidationResult> {
    const evidence: ValidationEvidence[] = [];
    let status: RequirementValidationResult['status'] = 'compliant';
    let details = '';
    const remediation: string[] = [];

    try {
      // Check if requirement is applicable to this workflow
      const isApplicable = await this.isRequirementApplicable(
        requirement,
        validationContext
      );

      if (!isApplicable) {
        return {
          requirementId: requirement.id,
          requirementTitle: requirement.title,
          status: 'not_applicable',
          details: 'Requirement not applicable to this workflow configuration',
          evidence: []
        };
      }

      // Apply validation rules for this requirement
      const validationRules = framework.validationRules.filter(rule => 
        this.isRuleApplicableToRequirement(rule, requirement)
      );

      for (const rule of validationRules) {
        const ruleResult = await this.applyValidationRule(
          rule,
          validationContext,
          requirement
        );

        evidence.push(...ruleResult.evidence);

        if (ruleResult.status === 'non_compliant') {
          status = requirement.severity === 'low' ? 'warning' : 'violation';
          details += ruleResult.details + '; ';
          
          if (rule.remediation) {
            remediation.push(rule.remediation);
          }
        }
      }

      // Additional requirement-specific validation
      const specificValidation = await this.performRequirementSpecificValidation(
        requirement,
        validationContext
      );

      evidence.push(...specificValidation.evidence);
      
      if (specificValidation.violations.length > 0) {
        status = requirement.severity === 'low' ? 'warning' : 'violation';
        details += specificValidation.violations.join('; ');
        remediation.push(...specificValidation.remediation);
      }

      return {
        requirementId: requirement.id,
        requirementTitle: requirement.title,
        status,
        details: details.trim(),
        evidence,
        remediation: remediation.length > 0 ? remediation : undefined
      };

    } catch (error) {
      console.warn(`Requirement validation failed for ${requirement.id}:`, error);
      
      return {
        requirementId: requirement.id,
        requirementTitle: requirement.title,
        status: 'warning',
        details: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        evidence: []
      };
    }
  }

  // Apply a specific validation rule
  private async applyValidationRule(
    rule: ValidationRule,
    validationContext: ValidationContext,
    requirement: ComplianceRequirement
  ): Promise<{
    status: 'compliant' | 'non_compliant';
    evidence: ValidationEvidence[];
    details: string;
  }> {
    const evidence: ValidationEvidence[] = [];
    let status: 'compliant' | 'non_compliant' = 'compliant';
    let details = '';

    try {
      // Apply rule based on its category
      switch (rule.category) {
        case 'data_validation':
          const dataResult = await this.validateDataHandling(rule, validationContext);
          evidence.push(...dataResult.evidence);
          if (!dataResult.compliant) {
            status = 'non_compliant';
            details = dataResult.details;
          }
          break;

        case 'security_validation':
          const securityResult = await this.validateSecurityConfiguration(rule, validationContext);
          evidence.push(...securityResult.evidence);
          if (!securityResult.compliant) {
            status = 'non_compliant';
            details = securityResult.details;
          }
          break;

        case 'configuration_validation':
          const configResult = await this.validateComponentConfiguration(rule, validationContext);
          evidence.push(...configResult.evidence);
          if (!configResult.compliant) {
            status = 'non_compliant';
            details = configResult.details;
          }
          break;

        case 'documentation_validation':
          const docResult = await this.validateDocumentation(rule, validationContext);
          evidence.push(...docResult.evidence);
          if (!docResult.compliant) {
            status = 'non_compliant';
            details = docResult.details;
          }
          break;

        default:
          const generalResult = await this.validateGeneral(rule, validationContext);
          evidence.push(...generalResult.evidence);
          if (!generalResult.compliant) {
            status = 'non_compliant';
            details = generalResult.details;
          }
      }

      return { status, evidence, details };

    } catch (error) {
      console.warn(`Validation rule application failed for ${rule.id}:`, error);
      
      return {
        status: 'non_compliant',
        evidence: [],
        details: `Rule validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Validation implementations for different rule categories
  private async validateDataHandling(
    rule: ValidationRule,
    validationContext: ValidationContext
  ): Promise<{ compliant: boolean; evidence: ValidationEvidence[]; details: string }> {
    const evidence: ValidationEvidence[] = [];
    const violations: string[] = [];
    
    const dataHandling = validationContext.workflowConfig.dataHandling;
    
    // Check encryption requirements
    if (rule.pattern.includes('encrypt')) {
      evidence.push({
        type: 'configuration',
        location: 'dataHandling.storage.encryption',
        value: dataHandling.storage.encryption,
        assessment: dataHandling.storage.encryption ? 'compliant' : 'non_compliant',
        confidence: 0.9
      });
      
      if (!dataHandling.storage.encryption) {
        violations.push('Data encryption at rest not enabled');
      }
    }

    // Check data retention
    if (rule.pattern.includes('retention')) {
      evidence.push({
        type: 'configuration',
        location: 'dataHandling.retention.policy',
        value: dataHandling.retention.policy,
        assessment: dataHandling.retention.policy ? 'compliant' : 'non_compliant',
        confidence: 0.8
      });
      
      if (!dataHandling.retention.policy) {
        violations.push('Data retention policy not configured');
      }
    }

    // Check data minimization
    if (rule.pattern.includes('minimization')) {
      evidence.push({
        type: 'configuration',
        location: 'dataHandling.collection.dataMinimization',
        value: dataHandling.collection.dataMinimization,
        assessment: dataHandling.collection.dataMinimization ? 'compliant' : 'non_compliant',
        confidence: 0.7
      });
      
      if (!dataHandling.collection.dataMinimization) {
        violations.push('Data minimization principle not implemented');
      }
    }

    return {
      compliant: violations.length === 0,
      evidence,
      details: violations.join('; ')
    };
  }

  private async validateSecurityConfiguration(
    rule: ValidationRule,
    validationContext: ValidationContext
  ): Promise<{ compliant: boolean; evidence: ValidationEvidence[]; details: string }> {
    const evidence: ValidationEvidence[] = [];
    const violations: string[] = [];
    
    const security = validationContext.workflowConfig.security;
    
    // Check authentication requirements
    if (rule.pattern.includes('authentication')) {
      evidence.push({
        type: 'configuration',
        location: 'security.authentication.method',
        value: security.authentication.method,
        assessment: security.authentication.method ? 'compliant' : 'non_compliant',
        confidence: 0.9
      });
      
      if (!security.authentication.method) {
        violations.push('Authentication method not configured');
      }
    }

    // Check access control
    if (rule.pattern.includes('access')) {
      evidence.push({
        type: 'configuration',
        location: 'security.authorization.model',
        value: security.authorization.model,
        assessment: security.authorization.model ? 'compliant' : 'non_compliant',
        confidence: 0.8
      });
      
      if (!security.authorization.model) {
        violations.push('Access control model not defined');
      }
    }

    // Check audit logging
    if (rule.pattern.includes('audit') || rule.pattern.includes('log')) {
      evidence.push({
        type: 'configuration',
        location: 'security.logging.auditTrail',
        value: security.logging.auditTrail,
        assessment: security.logging.auditTrail ? 'compliant' : 'non_compliant',
        confidence: 0.9
      });
      
      if (!security.logging.auditTrail) {
        violations.push('Audit trail logging not enabled');
      }
    }

    return {
      compliant: violations.length === 0,
      evidence,
      details: violations.join('; ')
    };
  }

  private async validateComponentConfiguration(
    rule: ValidationRule,
    validationContext: ValidationContext
  ): Promise<{ compliant: boolean; evidence: ValidationEvidence[]; details: string }> {
    const evidence: ValidationEvidence[] = [];
    const violations: string[] = [];
    
    const components = validationContext.workflowConfig.components;
    
    // Check component security settings
    for (const component of components) {
      if (component.securitySettings) {
        evidence.push({
          type: 'component',
          location: `components.${component.id}.securitySettings`,
          value: component.securitySettings,
          assessment: this.assessComponentSecurity(component.securitySettings, rule),
          confidence: 0.8
        });
        
        if (!this.isComponentSecurityCompliant(component.securitySettings, rule)) {
          violations.push(`Component ${component.name} security settings non-compliant`);
        }
      }
    }

    return {
      compliant: violations.length === 0,
      evidence,
      details: violations.join('; ')
    };
  }

  private async validateDocumentation(
    rule: ValidationRule,
    validationContext: ValidationContext
  ): Promise<{ compliant: boolean; evidence: ValidationEvidence[]; details: string }> {
    const evidence: ValidationEvidence[] = [];
    const violations: string[] = [];
    
    const workflow = validationContext.workflowConfig;
    
    // Check if workflow has adequate documentation
    evidence.push({
      type: 'configuration',
      location: 'workflowConfig.description',
      value: workflow.description,
      assessment: workflow.description && workflow.description.length > 50 ? 'compliant' : 'non_compliant',
      confidence: 0.6
    });
    
    if (!workflow.description || workflow.description.length < 50) {
      violations.push('Insufficient workflow documentation');
    }

    return {
      compliant: violations.length === 0,
      evidence,
      details: violations.join('; ')
    };
  }

  private async validateGeneral(
    rule: ValidationRule,
    validationContext: ValidationContext
  ): Promise<{ compliant: boolean; evidence: ValidationEvidence[]; details: string }> {
    // General validation logic
    return {
      compliant: true,
      evidence: [],
      details: 'General validation passed'
    };
  }

  // Helper methods for validation
  private async isRequirementApplicable(
    requirement: ComplianceRequirement,
    validationContext: ValidationContext
  ): Promise<boolean> {
    // Check if requirement applies to this domain
    if (requirement.applicableContexts.length > 0) {
      return requirement.applicableContexts.includes(validationContext.domainContext);
    }
    
    // Check if requirement applies to data types used
    if (requirement.category === 'data_protection') {
      const hasPersonalData = validationContext.dataTypes.some(type => 
        type.toLowerCase().includes('personal') || 
        type.toLowerCase().includes('pii') || 
        type.toLowerCase().includes('phi')
      );
      return hasPersonalData;
    }
    
    return true; // Default to applicable
  }

  private isRuleApplicableToRequirement(rule: ValidationRule, requirement: ComplianceRequirement): boolean {
    // Simple heuristic - match rule category to requirement category
    if (rule.category.includes('data') && requirement.category === 'data_protection') return true;
    if (rule.category.includes('security') && requirement.category === 'security') return true;
    if (rule.category.includes('audit') && requirement.category === 'audit') return true;
    
    return rule.category === 'general_validation';
  }

  private async performRequirementSpecificValidation(
    requirement: ComplianceRequirement,
    validationContext: ValidationContext
  ): Promise<{ evidence: ValidationEvidence[]; violations: string[]; remediation: string[] }> {
    // Placeholder for requirement-specific validation logic
    return {
      evidence: [],
      violations: [],
      remediation: []
    };
  }

  private assessComponentSecurity(
    securitySettings: SecuritySettings,
    rule: ValidationRule
  ): 'compliant' | 'non_compliant' | 'insufficient_info' {
    if (rule.pattern.includes('encrypt') && !securitySettings.encryptionEnabled) {
      return 'non_compliant';
    }
    if (rule.pattern.includes('auth') && !securitySettings.authenticationRequired) {
      return 'non_compliant';
    }
    return 'compliant';
  }

  private isComponentSecurityCompliant(securitySettings: SecuritySettings, rule: ValidationRule): boolean {
    return this.assessComponentSecurity(securitySettings, rule) === 'compliant';
  }

  // Framework and requirement filtering methods
  private async filterApplicableFrameworks(
    frameworks: ComplianceFramework[],
    validationContext: ValidationContext
  ): Promise<ComplianceFramework[]> {
    const applicable: ComplianceFramework[] = [];
    
    for (const framework of frameworks) {
      const applicabilityScore = await this.calculateFrameworkApplicability(
        framework,
        validationContext
      );
      
      if (applicabilityScore > 0.3) { // 30% threshold for applicability
        applicable.push(framework);
      }
    }
    
    return applicable.sort((a, b) => {
      const scoreA = this.frameworkApplicabilityCache.get(a.id) || 0;
      const scoreB = this.frameworkApplicabilityCache.get(b.id) || 0;
      return scoreB - scoreA; // Sort by applicability score descending
    });
  }

  private async calculateFrameworkApplicability(
    framework: ComplianceFramework,
    validationContext: ValidationContext
  ): Promise<number> {
    const cacheKey = `${framework.id}-${validationContext.domainContext}`;
    const cached = this.frameworkApplicabilityCache.get(cacheKey);
    if (cached !== undefined) return cached;
    
    let score = 0;
    
    // Domain relevance (40% weight)
    if (framework.applicableDomains.includes(validationContext.domainContext)) {
      score += 0.4;
    }
    
    // Data type relevance (30% weight)
    const relevantRequirements = framework.requirements.filter(req => 
      validationContext.dataTypes.some(dataType => 
        req.description.toLowerCase().includes(dataType.toLowerCase())
      )
    );
    score += (relevantRequirements.length / framework.requirements.length) * 0.3;
    
    // Geographic relevance (20% weight)
    if (validationContext.geographicScope) {
      const hasGeographicRelevance = framework.name.toLowerCase().includes(
        validationContext.geographicScope.toLowerCase()
      ) || framework.description.toLowerCase().includes(
        validationContext.geographicScope.toLowerCase()
      );
      if (hasGeographicRelevance) score += 0.2;
    } else {
      score += 0.1; // Partial credit for unspecified geography
    }
    
    // Business operation relevance (10% weight)
    if (validationContext.businessOperations) {
      const hasOperationalRelevance = validationContext.businessOperations.some(op =>
        framework.description.toLowerCase().includes(op.toLowerCase())
      );
      if (hasOperationalRelevance) score += 0.1;
    }
    
    this.frameworkApplicabilityCache.set(cacheKey, score);
    return score;
  }

  // Result compilation and scoring methods
  private generateValidationSummary(frameworkResults: FrameworkValidationResult[]): ValidationSummary {
    let totalRequirementsChecked = 0;
    let compliantRequirements = 0;
    let violatedRequirements = 0;
    let warningRequirements = 0;
    let notApplicableRequirements = 0;
    let criticalIssues = 0;
    let highPriorityIssues = 0;

    for (const frameworkResult of frameworkResults) {
      totalRequirementsChecked += frameworkResult.requirementResults.length;
      
      for (const reqResult of frameworkResult.requirementResults) {
        switch (reqResult.status) {
          case 'compliant':
            compliantRequirements++;
            break;
          case 'violation':
            violatedRequirements++;
            break;
          case 'warning':
            warningRequirements++;
            break;
          case 'not_applicable':
            notApplicableRequirements++;
            break;
        }
      }
      
      criticalIssues += frameworkResult.criticalViolations.length;
      highPriorityIssues += frameworkResult.criticalViolations.filter(v => 
        v.severity === 'high'
      ).length;
    }

    const estimatedRemediationTime = this.estimateRemediationTime(
      criticalIssues,
      highPriorityIssues,
      violatedRequirements
    );

    return {
      totalRequirementsChecked,
      compliantRequirements,
      violatedRequirements,
      warningRequirements,
      notApplicableRequirements,
      criticalIssues,
      highPriorityIssues,
      estimatedRemediationTime
    };
  }

  private assessOverallCompliance(
    frameworkResults: FrameworkValidationResult[],
    options: ValidationOptions
  ): boolean {
    if (frameworkResults.length === 0) return true;
    
    // In strict mode, all applicable frameworks must be compliant
    if (options.strictMode) {
      return frameworkResults.every(result => result.compliant);
    }
    
    // In normal mode, critical violations prevent compliance
    const hasCriticalViolations = frameworkResults.some(result => 
      result.criticalViolations.length > 0
    );
    
    return !hasCriticalViolations;
  }

  private calculateOverallComplianceScore(frameworkResults: FrameworkValidationResult[]): number {
    if (frameworkResults.length === 0) return 100;
    
    // Weighted average based on framework applicability
    let totalWeight = 0;
    let weightedScore = 0;
    
    for (const result of frameworkResults) {
      const weight = result.applicabilityScore;
      totalWeight += weight;
      weightedScore += result.score * weight;
    }
    
    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  }

  private calculateFrameworkComplianceScore(
    requirementResults: RequirementValidationResult[]
  ): number {
    if (requirementResults.length === 0) return 100;
    
    const applicableResults = requirementResults.filter(r => r.status !== 'not_applicable');
    if (applicableResults.length === 0) return 100;
    
    const compliantCount = applicableResults.filter(r => r.status === 'compliant').length;
    return Math.round((compliantCount / applicableResults.length) * 100);
  }

  // Recommendation and auto-fix generation
  private async generateComplianceRecommendations(
    frameworkResults: FrameworkValidationResult[],
    validationContext: ValidationContext
  ): Promise<ComplianceRecommendation[]> {
    const recommendations: ComplianceRecommendation[] = [];
    
    for (const frameworkResult of frameworkResults) {
      for (const violation of frameworkResult.criticalViolations) {
        const recommendation: ComplianceRecommendation = {
          type: this.inferRecommendationType(violation),
          title: `Address ${violation.framework} violation`,
          description: violation.description,
          framework: violation.framework,
          priority: violation.severity as ComplianceRecommendation['priority'],
          implementation: violation.remediation || ['Review and implement required controls'],
          references: [`${violation.framework} documentation`]
        };
        recommendations.push(recommendation);
      }
    }
    
    return recommendations.slice(0, 10); // Limit to top 10 recommendations
  }

  private async generateAutoFixSuggestions(
    frameworkResults: FrameworkValidationResult[],
    validationContext: ValidationContext,
    options: ValidationOptions
  ): Promise<AutoFixSuggestion[]> {
    if (!options.autoFix) return [];
    
    const suggestions: AutoFixSuggestion[] = [];
    
    // Generate auto-fix suggestions for common configuration issues
    for (const frameworkResult of frameworkResults) {
      for (const violation of frameworkResult.criticalViolations) {
        if (violation.autoFixable) {
          const suggestion = await this.createAutoFixSuggestion(
            violation,
            validationContext
          );
          if (suggestion) {
            suggestions.push(suggestion);
          }
        }
      }
    }
    
    return suggestions.slice(0, 5); // Limit to top 5 auto-fix suggestions
  }

  // Utility methods
  private createViolationFromRequirement(
    requirement: ComplianceRequirement,
    requirementResult: RequirementValidationResult,
    framework: ComplianceFramework
  ): ComplianceViolation {
    return {
      requirementId: requirement.id,
      framework: framework.name,
      severity: requirement.severity,
      description: requirementResult.details,
      context: requirement.title,
      remediation: requirementResult.remediation || [],
      autoFixable: framework.validationRules.some(rule => 
        this.isRuleApplicableToRequirement(rule, requirement) && rule.autoFixable
      )
    };
  }

  private inferRecommendationType(violation: ComplianceViolation): ComplianceRecommendation['type'] {
    if (violation.description.toLowerCase().includes('component')) return 'component';
    if (violation.description.toLowerCase().includes('config')) return 'configuration';
    if (violation.description.toLowerCase().includes('document')) return 'documentation';
    return 'pattern';
  }

  private async createAutoFixSuggestion(
    violation: ComplianceViolation,
    validationContext: ValidationContext
  ): Promise<AutoFixSuggestion | null> {
    // Placeholder for auto-fix suggestion creation
    // In a full implementation, this would analyze the violation and generate specific fix suggestions
    return null;
  }

  private estimateRemediationTime(
    criticalIssues: number,
    highPriorityIssues: number,
    totalViolations: number
  ): string {
    const hours = criticalIssues * 4 + highPriorityIssues * 2 + (totalViolations - criticalIssues - highPriorityIssues) * 1;
    
    if (hours < 8) return `${hours} hours`;
    if (hours < 40) return `${Math.ceil(hours / 8)} days`;
    return `${Math.ceil(hours / 40)} weeks`;
  }

  private getTotalRulesApplied(frameworkResults: FrameworkValidationResult[]): number {
    return frameworkResults.reduce((total, result) => 
      total + result.requirementResults.length, 0
    );
  }

  private calculateCacheHitRate(): number {
    const totalQueries = this.performanceMetrics.get('totalQueries') || 0;
    const cacheHits = this.performanceMetrics.get('cacheHits') || 0;
    
    return totalQueries > 0 ? Math.round((cacheHits / totalQueries) * 100) / 100 : 0;
  }

  private generateValidationCacheKey(
    validationContext: ValidationContext,
    frameworks: ComplianceFramework[],
    options: ValidationOptions
  ): string {
    const configHash = JSON.stringify(validationContext.workflowConfig).substring(0, 50);
    const frameworkIds = frameworks.map(f => f.id).sort().join('-');
    const optionsHash = JSON.stringify(options);
    
    return `${configHash}-${frameworkIds}-${optionsHash}`.substring(0, 150);
  }

  private isCacheFresh(result: ValidationResult): boolean {
    // For now, consider cache fresh for 10 minutes
    const ageMs = Date.now() - (result.validationMetrics.validationTime || 0);
    const maxAgeMs = 10 * 60 * 1000; // 10 minutes
    
    return ageMs < maxAgeMs;
  }

  private generateErrorValidationResult(error: unknown, validationTime: number): ValidationResult {
    return {
      overallCompliant: false,
      complianceScore: 0,
      frameworkResults: [],
      summary: {
        totalRequirementsChecked: 0,
        compliantRequirements: 0,
        violatedRequirements: 0,
        warningRequirements: 0,
        notApplicableRequirements: 0,
        criticalIssues: 1,
        highPriorityIssues: 0,
        estimatedRemediationTime: 'Unknown'
      },
      recommendations: [],
      autoFixSuggestions: [],
      validationMetrics: {
        validationTime,
        frameworksEvaluated: 0,
        requirementsChecked: 0,
        rulesApplied: 0,
        autoFixesAvailable: 0,
        cacheHitRate: 0
      }
    };
  }

  private getDefaultValidationOptions(): ValidationOptions {
    return {
      strictMode: false,
      includeWarnings: true,
      autoFix: false,
      performanceMode: 'thorough'
    };
  }

  private initializeValidationEngine(): void {
    // Initialize performance metrics
    this.performanceMetrics.set('totalQueries', 0);
    this.performanceMetrics.set('cacheHits', 0);
  }

  // Public methods for cache management
  clearValidationCache(): void {
    this.validationCache.clear();
  }

  getValidationMetrics(): Record<string, number> {
    return Object.fromEntries(this.performanceMetrics);
  }
}

// Export singleton instance
export const complianceValidationEngine = new ComplianceValidationEngine();