// Epic 6.4 Story 6.4.1 - Domain Detection CopilotKit Action
// Provides intelligent domain detection and expertise activation

import { CopilotAction } from "@copilotkit/react-core";
import { DomainExpertiseEngine } from "../../enhanced/domainExpertise";
import { ContextEngine } from "../../enhanced/contextEngine";

export const domainDetectionAction: CopilotAction = {
  name: "detect_domain_expertise",
  description: "Automatically detect user's domain and activate appropriate expertise for specialized guidance",
  parameters: {
    user_input: {
      type: "string",
      description: "Current user input to analyze for domain indicators and context clues"
    },
    conversation_history: {
      type: "array",
      description: "Previous conversation messages for enhanced context analysis",
      items: {
        type: "object",
        properties: {
          role: { type: "string", enum: ["user", "assistant", "system"] },
          content: { type: "string" },
          timestamp: { type: "string", optional: true }
        }
      },
      optional: true
    },
    force_redetection: {
      type: "boolean",
      description: "Force re-detection even if domain was previously detected",
      optional: true
    },
    target_expertise_level: {
      type: "string",
      description: "Target expertise level for guidance adaptation",
      enum: ["beginner", "intermediate", "expert"],
      optional: true
    }
  },
  handler: async ({ user_input, conversation_history = [], force_redetection = false, target_expertise_level }) => {
    try {
      // Initialize domain expertise engine with Epic 5 context engine
      const contextEngine = new ContextEngine({
        enableDocumentationGrounding: true,
        enableWebSearch: false,
        prioritizeOfficialDocs: true
      });
      
      const domainEngine = new DomainExpertiseEngine(contextEngine);

      // Prepare conversation context
      const conversationContext = {
        currentInput: user_input,
        history: conversation_history.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: msg.timestamp
        }))
      };

      // Detect domain from conversation context
      const domainContext = await domainEngine.detectDomain(conversationContext);

      // Activate domain-specific expertise if confidence is sufficient
      let domainActivation = null;
      if (domainContext.confidence >= 0.6) {
        domainActivation = await domainEngine.activateDomainExpertise(domainContext.domain);
        
        // Override expertise level if specified
        if (target_expertise_level) {
          domainActivation.expertise_level = target_expertise_level as 'beginner' | 'intermediate' | 'expert';
        }
      }

      // Get domain-specific compliance requirements
      const complianceRequirements = domainEngine.getDomainCompliance(domainContext.domain);

      // Prepare response with comprehensive domain analysis
      return {
        detected_domain: domainContext.domain,
        confidence: Math.round(domainContext.confidence * 100) / 100,
        subdomains: domainContext.subdomains,
        expertise_areas: domainContext.expertiseAreas,
        compliance_requirements: domainContext.complianceRequirements,
        detection_timestamp: domainContext.detectionTimestamp,
        
        // Domain activation details
        activation_status: domainActivation ? "activated" : "insufficient_confidence",
        expertise_level: domainActivation?.expertise_level || "intermediate",
        available_tools: domainActivation?.available_tools || [],
        recommended_patterns: domainActivation?.recommended_patterns || [],
        
        // Compliance framework details
        compliance_framework: complianceRequirements.map(req => ({
          regulation: req.regulation,
          applicability: req.applicability,
          description: req.description,
          validation_rules: req.validationRules
        })),
        
        // Guidance for next steps
        guidance: {
          suggested_questions: generateSuggestedQuestions(domainContext.domain, domainActivation?.expertise_level || "intermediate"),
          recommended_components: domainActivation?.available_tools || [],
          integration_patterns: domainActivation?.recommended_patterns || [],
          compliance_considerations: domainContext.complianceRequirements.length > 0 
            ? `This domain requires compliance with: ${domainContext.complianceRequirements.join(', ')}`
            : "No specific compliance requirements detected"
        },
        
        // Domain metadata for UI updates
        ui_updates: {
          show_compliance_panel: domainContext.complianceRequirements.length > 0,
          highlight_domain_indicators: true,
          enable_specialized_components: domainActivation !== null,
          adaptive_complexity: domainActivation?.expertise_level || "intermediate"
        }
      };
      
    } catch (error) {
      console.error("Domain detection error:", error);
      return {
        detected_domain: "general",
        confidence: 0,
        error: true,
        error_message: "Failed to detect domain expertise",
        guidance: {
          suggested_questions: [
            "Could you describe your industry or domain?",
            "What type of workflow are you trying to build?",
            "Are there any specific compliance requirements you need to consider?"
          ]
        }
      };
    }
  }
};

/**
 * Generate domain-specific suggested questions
 */
function generateSuggestedQuestions(domain: string, expertiseLevel: string): string[] {
  const questionBank = {
    healthcare: {
      beginner: [
        "What type of healthcare data will your workflow process?",
        "Do you need to comply with HIPAA regulations?",
        "Are you working with patient records or clinical data?",
        "What healthcare systems do you need to integrate with?"
      ],
      intermediate: [
        "How will you ensure PHI data encryption in transit and at rest?",
        "What FHIR resources do you need to work with?",
        "How will you implement audit logging for compliance?",
        "What clinical decision support features do you need?"
      ],
      expert: [
        "What are your specific HL7 message processing requirements?",
        "How will you handle DICOM image processing workflows?",
        "What are your requirements for clinical data interchange standards?",
        "How will you implement risk-based authentication for sensitive data access?"
      ]
    },
    finance: {
      beginner: [
        "What type of financial data will you be processing?",
        "Do you need PCI-DSS compliance for payment processing?",
        "Are you building trading, banking, or payment workflows?",
        "What financial regulations apply to your use case?"
      ],
      intermediate: [
        "How will you implement fraud detection in your payment flows?",
        "What are your requirements for transaction monitoring?",
        "How will you handle KYC/AML compliance checking?",
        "What risk assessment algorithms do you need to implement?"
      ],
      expert: [
        "What are your specific regulatory reporting requirements (SOX, MiFID, etc.)?",
        "How will you implement real-time risk calculations?",
        "What are your requirements for algorithmic trading compliance?",
        "How will you handle market data processing and distribution?"
      ]
    },
    manufacturing: {
      beginner: [
        "What manufacturing processes are you trying to optimize?",
        "Do you need to integrate with existing ERP systems?",
        "Are you working with IoT sensors or industrial equipment?",
        "What quality control measures do you need to implement?"
      ],
      intermediate: [
        "How will you implement predictive maintenance algorithms?",
        "What are your requirements for real-time production monitoring?",
        "How will you handle supply chain optimization?",
        "What Industry 4.0 standards do you need to comply with?"
      ],
      expert: [
        "What are your requirements for digital twin implementation?",
        "How will you handle cyber-physical system integration?",
        "What are your specific OEE optimization strategies?",
        "How will you implement advanced process control algorithms?"
      ]
    },
    technology: {
      beginner: [
        "What type of application are you building?",
        "Do you need cloud deployment capabilities?",
        "What programming languages and frameworks are you using?",
        "Do you have any specific integration requirements?"
      ],
      intermediate: [
        "How will you handle authentication and authorization?",
        "What are your API design and integration patterns?",
        "How will you implement monitoring and observability?",
        "What are your requirements for CI/CD pipeline integration?"
      ],
      expert: [
        "What are your microservices architecture patterns?",
        "How will you implement event-driven architecture?",
        "What are your requirements for distributed system design?",
        "How will you handle service mesh and container orchestration?"
      ]
    }
  };

  const defaultQuestions = [
    "What is the main goal of your workflow?",
    "What systems do you need to integrate with?",
    "Are there any specific technical requirements?",
    "What compliance or regulatory considerations apply?"
  ];

  return questionBank[domain as keyof typeof questionBank]?.[expertiseLevel as keyof typeof questionBank.healthcare] || defaultQuestions;
}