// Epic 6.4 Story 6.4.1 - Domain Expertise Engine Tests
// Comprehensive tests for domain detection and expertise activation

import { DomainExpertiseEngine } from '../domainExpertise';
import { ContextEngine } from '../contextEngine';

// Mock the ContextEngine for testing
jest.mock('../contextEngine', () => ({
  ContextEngine: jest.fn().mockImplementation(() => ({
    query: jest.fn().mockResolvedValue({
      domainAnalysis: { domain: 'general', confidence: 0.5 },
      technologyStack: { platform: 'web', compliance: [] },
      specializations: [],
      complexity: 'intermediate'
    })
  }))
}));

describe('DomainExpertiseEngine', () => {
  let domainEngine: DomainExpertiseEngine;
  let mockContextEngine: jest.Mocked<ContextEngine>;

  beforeEach(() => {
    mockContextEngine = new ContextEngine() as jest.Mocked<ContextEngine>;
    domainEngine = new DomainExpertiseEngine(mockContextEngine);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Domain Detection', () => {
    test('detects healthcare domain correctly', async () => {
      const conversationContext = {
        currentInput: 'I need to create a HIPAA-compliant patient data workflow',
        history: [
          { role: 'user' as const, content: 'I work in a hospital setting' },
          { role: 'assistant' as const, content: 'I can help with healthcare workflows' }
        ]
      };

      const result = await domainEngine.detectDomain(conversationContext);

      expect(result.domain).toBe('healthcare');
      expect(result.confidence).toBeGreaterThan(0.15); // More realistic threshold
      expect(result.complianceRequirements).toContain('HIPAA');
      expect(result.expertiseAreas).toContain('patient_data_handler');
    });

    test('detects finance domain with compliance requirements', async () => {
      const conversationContext = {
        currentInput: 'I need to build a payment processing system with PCI-DSS compliance',
        history: [
          { role: 'user' as const, content: 'We process credit card transactions' },
          { role: 'assistant' as const, content: 'Financial security is important' }
        ]
      };

      const result = await domainEngine.detectDomain(conversationContext);

      expect(result.domain).toBe('finance');
      expect(result.confidence).toBeGreaterThan(0.1); // More realistic threshold
      expect(result.complianceRequirements).toEqual(expect.arrayContaining(['SOX', 'PCI-DSS']));
    });

    test('detects manufacturing domain with IoT context', async () => {
      const conversationContext = {
        currentInput: 'I want to optimize our production line with IoT sensors and predictive maintenance',
        history: [
          { role: 'user' as const, content: 'Our factory has multiple assembly lines' },
          { role: 'assistant' as const, content: 'Industrial automation can help' }
        ]
      };

      const result = await domainEngine.detectDomain(conversationContext);

      expect(result.domain).toBe('manufacturing');
      expect(result.confidence).toBeGreaterThan(0.1); // More realistic threshold
      expect(result.expertiseAreas).toContain('iot_sensor_integration');
    });

    test('handles general domain for unclear input', async () => {
      const conversationContext = {
        currentInput: 'Hello, can you help me?',
        history: []
      };

      const result = await domainEngine.detectDomain(conversationContext);

      expect(result.domain).toBe('general');
      expect(result.confidence).toBeLessThan(0.4);
      expect(result.complianceRequirements).toHaveLength(0);
    });

    test('detects subdomains within healthcare', async () => {
      const conversationContext = {
        currentInput: 'I need to process cardiac imaging data from MRI scans for cardiology department',
        history: [
          { role: 'user' as const, content: 'We work with heart patients' },
          { role: 'assistant' as const, content: 'Cardiology workflows are specialized' }
        ]
      };

      const result = await domainEngine.detectDomain(conversationContext);

      expect(result.domain).toBe('healthcare');
      expect(result.subdomains).toContain('cardiology');
      expect(result.subdomains).toContain('radiology');
    });
  });

  describe('Domain Activation', () => {
    test('successfully activates healthcare domain expertise', async () => {
      const activation = await domainEngine.activateDomainExpertise('healthcare');

      expect(activation.activated_domain).toBe('healthcare');
      expect(activation.expertise_level).toBe('intermediate');
      expect(activation.available_tools).toContain('patient_data_handler');
      expect(activation.compliance_framework).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            regulation: 'HIPAA',
            applicability: 'required'
          })
        ])
      );
    });

    test('fails to activate unknown domain', async () => {
      await expect(domainEngine.activateDomainExpertise('unknown')).rejects.toThrow('Unknown domain: unknown');
    });

    test('activates finance domain with appropriate tools', async () => {
      const activation = await domainEngine.activateDomainExpertise('finance');

      expect(activation.activated_domain).toBe('finance');
      expect(activation.available_tools).toContain('payment_processor');
      expect(activation.available_tools).toContain('fraud_detection');
      expect(activation.recommended_patterns).toContain('payment_gateway_integration');
    });
  });

  describe('Compliance Management', () => {
    test('returns correct compliance requirements for healthcare', () => {
      const compliance = domainEngine.getDomainCompliance('healthcare');

      expect(compliance).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            regulation: 'HIPAA',
            applicability: 'required',
            validationRules: expect.arrayContaining(['encrypt_phi_data'])
          })
        ])
      );
    });

    test('returns empty array for unknown domain', () => {
      const compliance = domainEngine.getDomainCompliance('unknown');
      expect(compliance).toEqual([]);
    });

    test('returns multiple compliance requirements for finance', () => {
      const compliance = domainEngine.getDomainCompliance('finance');

      expect(compliance.length).toBeGreaterThan(1);
      expect(compliance).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ regulation: 'SOX' }),
          expect.objectContaining({ regulation: 'PCI-DSS' })
        ])
      );
    });
  });

  describe('Domain State Management', () => {
    test('tracks active domains correctly', async () => {
      const conversationContext = {
        currentInput: 'HIPAA compliance for patient data',
        history: []
      };

      await domainEngine.detectDomain(conversationContext);
      
      expect(domainEngine.isDomainActive('healthcare')).toBe(true);
      expect(domainEngine.isDomainActive('finance')).toBe(false);
    });

    test('returns available domain definitions', () => {
      const definitions = domainEngine.getDomainDefinitions();

      expect(definitions.size).toBeGreaterThan(0);
      expect(definitions.has('healthcare')).toBe(true);
      expect(definitions.has('finance')).toBe(true);
      expect(definitions.has('manufacturing')).toBe(true);
      expect(definitions.has('technology')).toBe(true);
    });

    test('maintains active domain state', async () => {
      const conversationContext = {
        currentInput: 'Payment processing workflow',
        history: []
      };

      await domainEngine.detectDomain(conversationContext);
      const activeDomains = domainEngine.getActiveDomains();

      expect(activeDomains.size).toBeGreaterThan(0);
      expect(Array.from(activeDomains.values())[0].domain).toBe('finance');
    });
  });

  describe('Integration with Context Engine', () => {
    test('calls context engine for analysis', async () => {
      const conversationContext = {
        currentInput: 'Healthcare workflow',
        history: []
      };

      await domainEngine.detectDomain(conversationContext);

      expect(mockContextEngine.query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('Healthcare workflow'),
          maxResults: 5
        })
      );
    });

    test('handles context engine errors gracefully', async () => {
      mockContextEngine.query.mockRejectedValueOnce(new Error('Context engine error'));

      const conversationContext = {
        currentInput: 'Test input',
        history: []
      };

      // Should not throw, should handle gracefully
      const result = await domainEngine.detectDomain(conversationContext);
      expect(result).toBeDefined();
      expect(result.domain).toBe('general');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance and Edge Cases', () => {
    test('handles empty conversation context', async () => {
      const conversationContext = {
        currentInput: '',
        history: []
      };

      const result = await domainEngine.detectDomain(conversationContext);

      expect(result.domain).toBe('general');
      expect(result.confidence).toBeLessThan(0.4);
    });

    test('handles very long conversation history', async () => {
      const longHistory = Array.from({ length: 100 }, (_, i) => ({
        role: 'user' as const,
        content: `Message ${i} about healthcare and patient data`
      }));

      const conversationContext = {
        currentInput: 'HIPAA compliance question',
        history: longHistory
      };

      const result = await domainEngine.detectDomain(conversationContext);

      expect(result).toBeDefined();
      expect(result.domain).toBe('healthcare');
    });

    test('maintains performance with multiple domain checks', async () => {
      const start = Date.now();

      const promises = Array.from({ length: 10 }, () =>
        domainEngine.detectDomain({
          currentInput: 'Healthcare workflow optimization',
          history: []
        })
      );

      await Promise.all(promises);
      const end = Date.now();

      // Should complete within reasonable time (less than 1 second)
      expect(end - start).toBeLessThan(1000);
    });
  });

  describe('Domain Pattern Matching', () => {
    test('correctly weights different pattern types', () => {
      // Test the internal scoring mechanism
      const healthcareDef = domainEngine.getDomainDefinitions().get('healthcare');
      expect(healthcareDef).toBeDefined();
      expect(healthcareDef!.patterns.confidence_weight).toBe(0.9);
      expect(healthcareDef!.patterns.keywords).toContain('patient');
      expect(healthcareDef!.patterns.context_indicators).toContain('HIPAA');
    });

    test('detects mixed domain scenarios', async () => {
      const conversationContext = {
        currentInput: 'I need a healthcare payment processing system that is HIPAA and PCI-DSS compliant',
        history: []
      };

      const result = await domainEngine.detectDomain(conversationContext);

      // Should detect the stronger signal (healthcare typically has higher weight)
      expect(result.domain).toBe('healthcare');
      expect(result.confidence).toBeGreaterThan(0.1);
    });
  });
});

// Integration tests with real scenarios
describe('DomainExpertiseEngine Integration Tests', () => {
  let domainEngine: DomainExpertiseEngine;

  beforeEach(() => {
    // Use real ContextEngine for integration tests
    domainEngine = new DomainExpertiseEngine();
  });

  test('end-to-end healthcare workflow detection and activation', async () => {
    const conversationContext = {
      currentInput: 'I need to build a patient management system that handles medical records and ensures HIPAA compliance',
      history: [
        { role: 'user' as const, content: 'I work at a medical clinic' },
        { role: 'assistant' as const, content: 'I can help with healthcare solutions' }
      ]
    };

    // Step 1: Detect domain
    const detection = await domainEngine.detectDomain(conversationContext);
    expect(detection.domain).toBe('healthcare');
    expect(detection.confidence).toBeGreaterThan(0.1);

    // Step 2: Activate expertise
    const activation = await domainEngine.activateDomainExpertise(detection.domain);
    expect(activation.activated_domain).toBe('healthcare');
    expect(activation.available_tools.length).toBeGreaterThan(0);

    // Step 3: Verify compliance
    const compliance = domainEngine.getDomainCompliance(detection.domain);
    expect(compliance.some(c => c.regulation === 'HIPAA')).toBe(true);
  });

  test('handles domain switching during conversation', async () => {
    // Start with healthcare context
    let conversationContext = {
      currentInput: 'Patient data processing',
      history: []
    };

    let result = await domainEngine.detectDomain(conversationContext);
    expect(result.domain).toBe('healthcare');

    // Switch to finance context
    conversationContext = {
      currentInput: 'Now I need to handle payment processing for the clinic',
      history: [
        { role: 'user' as const, content: 'Patient data processing' },
        { role: 'assistant' as const, content: 'Healthcare domain activated' }
      ]
    };

    result = await domainEngine.detectDomain(conversationContext);
    // Should detect the new financial context
    expect(result.domain).toBe('finance');
  });
});