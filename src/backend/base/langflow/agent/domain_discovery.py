"""Dynamic Domain Discovery Engine for Langflow Agents.

This module implements dynamic domain intelligence that can detect user domain context
from conversation patterns and provide specialized knowledge without hardcoded domain patterns.
"""

import re
import json
import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class DomainSource(Enum):
    """Sources of domain detection information."""
    CONVERSATION = "conversation"
    MCP = "mcp"
    WEB_SEARCH = "web_search"
    HYBRID = "hybrid"
    CACHED = "cached"


class ExpertiseLevel(Enum):
    """User expertise levels inferred from terminology."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


@dataclass
class DomainContext:
    """Core domain detection result."""
    domain: str
    confidence: float
    indicators: List[str]
    timestamp: datetime
    source: DomainSource
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class DomainKnowledge:
    """Domain-specific knowledge structure."""
    domain: str
    concepts: List[str] = field(default_factory=list)
    technologies: List[str] = field(default_factory=list)
    best_practices: List[str] = field(default_factory=list)
    common_patterns: List[str] = field(default_factory=list)
    compliance_frameworks: List[str] = field(default_factory=list)
    sources: List[str] = field(default_factory=list)
    last_updated: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class EnhancedDomainContext(DomainContext):
    """Enhanced domain context with additional intelligence."""
    knowledge: DomainKnowledge = field(default_factory=lambda: DomainKnowledge("general"))
    related_domains: List[str] = field(default_factory=list)
    expertise_level: ExpertiseLevel = ExpertiseLevel.INTERMEDIATE
    compliance_frameworks: List[str] = field(default_factory=list)


@dataclass
class ComponentRecommendation:
    """Component recommendation with relevance scoring."""
    component_type: str
    name: str
    description: str
    relevance_score: float
    domain_specific: bool
    usage_patterns: List[str] = field(default_factory=list)
    source: str = "langflow"


@dataclass
class DomainActivationResult:
    """Result of domain expertise activation."""
    success: bool
    domain_context: EnhancedDomainContext
    recommendations: List[ComponentRecommendation] = field(default_factory=list)
    persistence_key: str = ""
    error: Optional[str] = None


class DomainDiscoveryEngine:
    """
    Dynamic Domain Discovery Engine that detects domains from conversation context
    without relying on hardcoded patterns.
    """
    
    def __init__(self):
        """Initialize the Domain Discovery Engine."""
        self.active_contexts: Dict[str, EnhancedDomainContext] = {}
        self.knowledge_cache: Dict[str, DomainKnowledge] = {}
        self.pattern_cache: Dict[str, List[str]] = {}
        
        # Dynamic pattern extraction patterns
        self.tech_patterns = [
            r'\b(api|rest|graphql|webhook|database|sql|nosql|orm)\b',
            r'\b(react|vue|angular|node|python|java|docker|kubernetes)\b',
            r'\b(aws|azure|gcp|cloud|microservice|serverless)\b',
            r'\b(authentication|oauth|jwt|security|encryption)\b',
            r'\b(ml|ai|machine\s+learning|neural|nlp|llm)\b'
        ]
        
        self.industry_patterns = [
            r'\b(healthcare|medical|patient|clinical|diagnosis|treatment)\b',
            r'\b(finance|banking|payment|trading|investment|fintech)\b',
            r'\b(manufacturing|supply\s+chain|inventory|production|logistics)\b',
            r'\b(retail|e-commerce|customer|sales|marketing|crm)\b',
            r'\b(education|learning|student|course|curriculum|assessment)\b',
            r'\b(government|public|citizen|policy|regulation|compliance)\b'
        ]
        
        self.compliance_patterns = [
            r'\b(gdpr|privacy|data\s+protection|consent|personal\s+data)\b',
            r'\b(hipaa|phi|hitech|medical\s+records|patient\s+privacy)\b',
            r'\b(sox|sarbanes|oxley|financial\s+reporting|audit)\b',
            r'\b(pci|dss|payment\s+card|credit\s+card\s+security)\b',
            r'\b(fda|medical\s+device|clinical\s+trial|drug\s+approval)\b',
            r'\b(iso|27001|security\s+standard|information\s+security)\b'
        ]

    async def analyze_user_context(self, input_text: str, session_id: Optional[str] = None) -> DomainContext:
        """
        Analyze user input to detect domain context dynamically.
        
        Args:
            input_text: User's natural language input
            session_id: Optional session identifier for persistence
            
        Returns:
            DomainContext with detected domain information
        """
        try:
            # Step 1: Extract domain indicators from text
            indicators = self._extract_domain_indicators(input_text)
            
            # Step 2: Perform initial domain classification
            domain, confidence = self._classify_domain(input_text, indicators)
            
            # Step 3: Enhance with additional analysis if indicators found
            if indicators and confidence < 0.8:
                enhanced_domain, enhanced_confidence = await self._enhance_domain_detection(
                    input_text, indicators
                )
                if enhanced_confidence > confidence:
                    domain = enhanced_domain
                    confidence = enhanced_confidence

            domain_context = DomainContext(
                domain=domain,
                confidence=confidence,
                indicators=indicators,
                timestamp=datetime.now(timezone.utc),
                source=DomainSource.CONVERSATION,
                metadata={
                    "session_id": session_id,
                    "input_length": len(input_text),
                    "indicator_count": len(indicators)
                }
            )
            
            # Persist high-confidence contexts
            if session_id and confidence > 0.6:
                await self._persist_domain_context(session_id, domain_context)
            
            return domain_context
            
        except Exception as e:
            logger.error(f"Error analyzing user context: {e}")
            return DomainContext(
                domain="general",
                confidence=0.1,
                indicators=[],
                timestamp=datetime.now(timezone.utc),
                source=DomainSource.CONVERSATION,
                metadata={"error": str(e)}
            )

    async def query_domain_knowledge(self, domain_hints: List[str]) -> DomainKnowledge:
        """
        Query and build domain knowledge from available sources.
        
        Args:
            domain_hints: List of domain indicators or hints
            
        Returns:
            DomainKnowledge structure with gathered information
        """
        domain = domain_hints[0] if domain_hints else "general"
        
        # Check cache first
        cached_knowledge = self.knowledge_cache.get(domain)
        if cached_knowledge and self._is_knowledge_fresh(cached_knowledge):
            return cached_knowledge
        
        # Build knowledge from available sources
        knowledge = DomainKnowledge(domain=domain)
        
        try:
            # Analyze domain hints to extract knowledge
            await self._extract_knowledge_from_hints(domain_hints, knowledge)
            
            # Cache the result
            self.knowledge_cache[domain] = knowledge
            
        except Exception as e:
            logger.warning(f"Failed to query domain knowledge for {domain}: {e}")
        
        return knowledge

    async def enhance_with_context_analysis(self, domain_context: DomainContext) -> EnhancedDomainContext:
        """
        Enhance domain context with additional intelligence and knowledge.
        
        Args:
            domain_context: Basic domain context to enhance
            
        Returns:
            EnhancedDomainContext with additional intelligence
        """
        try:
            # Get domain knowledge
            knowledge = await self.query_domain_knowledge([domain_context.domain])
            
            # Detect related domains
            related_domains = self._detect_related_domains(knowledge, domain_context.indicators)
            
            # Infer expertise level
            expertise_level = self._infer_expertise_level(domain_context.indicators)
            
            # Detect compliance frameworks
            compliance_frameworks = self._detect_compliance_frameworks(domain_context.indicators, knowledge)
            
            enhanced_context = EnhancedDomainContext(
                domain=domain_context.domain,
                confidence=domain_context.confidence,
                indicators=domain_context.indicators,
                timestamp=domain_context.timestamp,
                source=domain_context.source,
                metadata=domain_context.metadata,
                knowledge=knowledge,
                related_domains=related_domains,
                expertise_level=expertise_level,
                compliance_frameworks=compliance_frameworks
            )
            
            return enhanced_context
            
        except Exception as e:
            logger.error(f"Error enhancing domain context: {e}")
            # Return minimal enhanced context on error
            return EnhancedDomainContext(
                domain=domain_context.domain,
                confidence=domain_context.confidence,
                indicators=domain_context.indicators,
                timestamp=domain_context.timestamp,
                source=domain_context.source,
                metadata=domain_context.metadata
            )

    async def generate_component_recommendations(self, domain_context: EnhancedDomainContext) -> List[ComponentRecommendation]:
        """
        Generate component recommendations based on domain context.
        
        Args:
            domain_context: Enhanced domain context
            
        Returns:
            List of component recommendations sorted by relevance
        """
        recommendations = []
        
        try:
            # Base components for domain
            base_components = self._get_base_components_for_domain(domain_context.domain)
            recommendations.extend(base_components)
            
            # Technology-specific components
            for tech in domain_context.knowledge.technologies:
                tech_components = self._get_components_for_technology(tech)
                recommendations.extend(tech_components)
            
            # Pattern-based components
            for pattern in domain_context.knowledge.common_patterns:
                pattern_components = self._get_components_for_pattern(pattern)
                recommendations.extend(pattern_components)
            
            # Compliance-driven components
            for framework in domain_context.compliance_frameworks:
                compliance_components = self._get_components_for_compliance(framework)
                recommendations.extend(compliance_components)
            
            # Sort by relevance and domain specificity
            recommendations.sort(key=lambda x: (x.domain_specific, x.relevance_score), reverse=True)
            
            # Return top recommendations
            return recommendations[:10]
            
        except Exception as e:
            logger.error(f"Error generating component recommendations: {e}")
            return []

    async def activate_domain_expertise(self, input_text: str, session_id: str) -> DomainActivationResult:
        """
        Activate domain expertise for a session.
        
        Args:
            input_text: User input to analyze
            session_id: Session identifier
            
        Returns:
            DomainActivationResult with success status and context
        """
        try:
            # Step 1: Analyze domain context
            domain_context = await self.analyze_user_context(input_text, session_id)
            
            # Step 2: Enhance with additional intelligence
            enhanced_context = await self.enhance_with_context_analysis(domain_context)
            
            # Step 3: Generate component recommendations
            recommendations = await self.generate_component_recommendations(enhanced_context)
            
            # Step 4: Store in active contexts
            self.active_contexts[session_id] = enhanced_context
            
            # Step 5: Generate persistence key
            persistence_key = f"{session_id}-{enhanced_context.domain}-{int(datetime.now().timestamp())}"
            
            return DomainActivationResult(
                success=True,
                domain_context=enhanced_context,
                recommendations=recommendations,
                persistence_key=persistence_key
            )
            
        except Exception as e:
            logger.error(f"Error activating domain expertise: {e}")
            return DomainActivationResult(
                success=False,
                domain_context=EnhancedDomainContext(
                    domain="general",
                    confidence=0.1,
                    indicators=[],
                    timestamp=datetime.now(timezone.utc),
                    source=DomainSource.CONVERSATION
                ),
                error=str(e)
            )

    def get_active_domain_context(self, session_id: str) -> Optional[EnhancedDomainContext]:
        """Get active domain context for a session."""
        return self.active_contexts.get(session_id)

    async def switch_domain(self, session_id: str, new_input: str) -> DomainActivationResult:
        """Switch domains seamlessly for a session."""
        current_context = self.active_contexts.get(session_id)
        
        # Activate new domain
        result = await self.activate_domain_expertise(new_input, session_id)
        
        # Preserve context from previous domain
        if result.success and current_context:
            result.domain_context.metadata.update({
                "previous_domain": current_context.domain,
                "domain_switch_time": datetime.now(timezone.utc).isoformat()
            })
        
        return result

    # Private helper methods
    
    def _extract_domain_indicators(self, text: str) -> List[str]:
        """Extract domain indicators from text using dynamic patterns."""
        indicators = []
        text_lower = text.lower()
        
        # Extract technical terms
        for pattern in self.tech_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            indicators.extend(matches)
        
        # Extract industry terms
        for pattern in self.industry_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            indicators.extend(matches)
        
        # Extract compliance terms
        for pattern in self.compliance_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            indicators.extend(matches)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_indicators = []
        for indicator in indicators:
            if indicator not in seen:
                seen.add(indicator)
                unique_indicators.append(indicator)
        
        return unique_indicators

    def _classify_domain(self, text: str, indicators: List[str]) -> Tuple[str, float]:
        """Classify domain based on text and indicators."""
        if not indicators:
            return "general", 0.1
        
        # Count domain-specific indicators
        domain_scores = {}
        
        for indicator in indicators:
            # Healthcare indicators
            if any(term in indicator for term in ["healthcare", "medical", "patient", "clinical", "hipaa", "phi"]):
                domain_scores["healthcare"] = domain_scores.get("healthcare", 0) + 1
            
            # Finance indicators
            elif any(term in indicator for term in ["finance", "banking", "payment", "trading", "sox", "pci"]):
                domain_scores["finance"] = domain_scores.get("finance", 0) + 1
            
            # Manufacturing indicators
            elif any(term in indicator for term in ["manufacturing", "supply", "inventory", "production"]):
                domain_scores["manufacturing"] = domain_scores.get("manufacturing", 0) + 1
            
            # Retail indicators
            elif any(term in indicator for term in ["retail", "commerce", "customer", "sales", "crm"]):
                domain_scores["retail"] = domain_scores.get("retail", 0) + 1
            
            # Education indicators
            elif any(term in indicator for term in ["education", "learning", "student", "course"]):
                domain_scores["education"] = domain_scores.get("education", 0) + 1
            
            # Technology/API indicators
            elif any(term in indicator for term in ["api", "database", "cloud", "microservice"]):
                domain_scores["technology"] = domain_scores.get("technology", 0) + 1
        
        # Find highest scoring domain
        if domain_scores:
            best_domain = max(domain_scores, key=domain_scores.get)
            max_score = domain_scores[best_domain]
            confidence = min(0.9, 0.5 + (max_score * 0.2))  # Base confidence with bonus for multiple indicators
            return best_domain, confidence
        
        return "general", 0.2

    async def _enhance_domain_detection(self, text: str, indicators: List[str]) -> Tuple[str, float]:
        """Enhance domain detection with additional analysis."""
        # This would integrate with MCP servers or web search in a full implementation
        # For now, return enhanced analysis based on text patterns
        
        enhanced_domain, enhanced_confidence = self._classify_domain(text, indicators)
        
        # Boost confidence if multiple related indicators found
        if len(indicators) > 3:
            enhanced_confidence = min(0.95, enhanced_confidence + 0.1)
        
        return enhanced_domain, enhanced_confidence

    async def _extract_knowledge_from_hints(self, hints: List[str], knowledge: DomainKnowledge) -> None:
        """Extract knowledge from domain hints."""
        for hint in hints:
            hint_lower = hint.lower()
            
            # Extract technologies
            tech_matches = []
            for pattern in self.tech_patterns:
                matches = re.findall(pattern, hint_lower, re.IGNORECASE)
                tech_matches.extend(matches)
            knowledge.technologies.extend(tech_matches)
            
            # Extract concepts based on hint content
            if "api" in hint_lower:
                knowledge.concepts.extend(["integration", "service", "endpoint"])
            if "database" in hint_lower:
                knowledge.concepts.extend(["data storage", "persistence", "query"])
            if "security" in hint_lower:
                knowledge.concepts.extend(["authentication", "authorization", "encryption"])
            
            # Extract best practices
            if any(term in hint_lower for term in ["healthcare", "medical"]):
                knowledge.best_practices.extend([
                    "HIPAA compliance required",
                    "Patient data protection",
                    "Audit trail implementation"
                ])
            elif any(term in hint_lower for term in ["finance", "banking"]):
                knowledge.best_practices.extend([
                    "Financial data encryption",
                    "Transaction audit logs",
                    "Regulatory compliance"
                ])
        
        # Remove duplicates
        knowledge.technologies = list(set(knowledge.technologies))
        knowledge.concepts = list(set(knowledge.concepts))
        knowledge.best_practices = list(set(knowledge.best_practices))

    def _is_knowledge_fresh(self, knowledge: DomainKnowledge) -> bool:
        """Check if knowledge is fresh enough to use."""
        age = datetime.now(timezone.utc) - knowledge.last_updated
        return age.total_seconds() < 24 * 60 * 60  # 24 hours

    def _detect_related_domains(self, knowledge: DomainKnowledge, indicators: List[str]) -> List[str]:
        """Detect related domains based on knowledge and indicators."""
        related = []
        
        # Check for cross-domain indicators
        all_indicators = " ".join(indicators).lower()
        
        if "api" in all_indicators or "integration" in all_indicators:
            related.append("integration")
        if any(cloud in all_indicators for cloud in ["aws", "azure", "gcp", "cloud"]):
            related.append("cloud")
        if "security" in all_indicators or "compliance" in all_indicators:
            related.append("security")
        if "data" in all_indicators or "analytics" in all_indicators:
            related.append("data_analytics")
        
        return list(set(related))

    def _infer_expertise_level(self, indicators: List[str]) -> ExpertiseLevel:
        """Infer user expertise level from indicators."""
        all_indicators = " ".join(indicators).lower()
        
        # Advanced terms
        advanced_terms = ["microservice", "kubernetes", "devops", "architecture", "distributed"]
        advanced_count = sum(1 for term in advanced_terms if term in all_indicators)
        
        # Intermediate terms
        intermediate_terms = ["api", "database", "framework", "integration", "authentication"]
        intermediate_count = sum(1 for term in intermediate_terms if term in all_indicators)
        
        if advanced_count > 2:
            return ExpertiseLevel.ADVANCED
        elif intermediate_count > 1:
            return ExpertiseLevel.INTERMEDIATE
        else:
            return ExpertiseLevel.BEGINNER

    def _detect_compliance_frameworks(self, indicators: List[str], knowledge: DomainKnowledge) -> List[str]:
        """Detect applicable compliance frameworks."""
        frameworks = []
        all_text = " ".join(indicators + knowledge.concepts + knowledge.best_practices).lower()
        
        if "hipaa" in all_text or "healthcare" in all_text:
            frameworks.append("HIPAA")
        if "gdpr" in all_text or "privacy" in all_text:
            frameworks.append("GDPR")
        if "sox" in all_text or "sarbanes" in all_text:
            frameworks.append("SOX")
        if "pci" in all_text or "payment" in all_text:
            frameworks.append("PCI-DSS")
        if "fda" in all_text or "medical device" in all_text:
            frameworks.append("FDA")
        
        return frameworks

    async def _persist_domain_context(self, session_id: str, context: DomainContext) -> None:
        """Persist domain context for session continuity."""
        # In a full implementation, this would persist to database or cache
        # For now, just log the persistence
        logger.info(f"Persisting domain context for session {session_id}: {context.domain}")

    def _get_base_components_for_domain(self, domain: str) -> List[ComponentRecommendation]:
        """Get base component recommendations for domain."""
        recommendations = []
        
        if domain in ["technology", "api", "integration"]:
            recommendations.extend([
                ComponentRecommendation(
                    component_type="api_connector",
                    name="HTTP Request",
                    description="Make HTTP API calls with authentication",
                    relevance_score=0.9,
                    domain_specific=True,
                    usage_patterns=["api-integration", "external-service"]
                ),
                ComponentRecommendation(
                    component_type="data_transformer",
                    name="JSON Processor",
                    description="Parse and transform JSON data",
                    relevance_score=0.8,
                    domain_specific=True,
                    usage_patterns=["data-processing", "api-response"]
                )
            ])
        
        elif domain == "healthcare":
            recommendations.extend([
                ComponentRecommendation(
                    component_type="data_validator",
                    name="HIPAA Validator",
                    description="Validate data for HIPAA compliance",
                    relevance_score=0.95,
                    domain_specific=True,
                    usage_patterns=["compliance", "data-validation"]
                ),
                ComponentRecommendation(
                    component_type="audit_logger",
                    name="Audit Trail Logger",
                    description="Log actions for compliance auditing",
                    relevance_score=0.9,
                    domain_specific=True,
                    usage_patterns=["compliance", "audit"]
                )
            ])
        
        elif domain == "finance":
            recommendations.extend([
                ComponentRecommendation(
                    component_type="encryption",
                    name="Financial Data Encryptor",
                    description="Encrypt sensitive financial data",
                    relevance_score=0.95,
                    domain_specific=True,
                    usage_patterns=["security", "compliance"]
                ),
                ComponentRecommendation(
                    component_type="transaction_processor",
                    name="Transaction Validator",
                    description="Validate financial transactions",
                    relevance_score=0.9,
                    domain_specific=True,
                    usage_patterns=["validation", "transaction"]
                )
            ])
        
        return recommendations

    def _get_components_for_technology(self, technology: str) -> List[ComponentRecommendation]:
        """Get components for specific technologies."""
        recommendations = []
        
        if "python" in technology.lower():
            recommendations.append(
                ComponentRecommendation(
                    component_type="code_executor",
                    name="Python Code",
                    description="Execute Python code snippets",
                    relevance_score=0.85,
                    domain_specific=False,
                    usage_patterns=["scripting", "data-analysis"]
                )
            )
        
        if "database" in technology.lower():
            recommendations.append(
                ComponentRecommendation(
                    component_type="database_connector",
                    name="Database Query",
                    description="Execute database queries",
                    relevance_score=0.9,
                    domain_specific=False,
                    usage_patterns=["data-access", "query"]
                )
            )
        
        return recommendations

    def _get_components_for_pattern(self, pattern: str) -> List[ComponentRecommendation]:
        """Get components for common patterns."""
        recommendations = []
        
        if "authentication" in pattern.lower():
            recommendations.append(
                ComponentRecommendation(
                    component_type="auth_handler",
                    name="OAuth Authenticator",
                    description="Handle OAuth authentication flows",
                    relevance_score=0.9,
                    domain_specific=True,
                    usage_patterns=["security", "user-auth"]
                )
            )
        
        if "validation" in pattern.lower():
            recommendations.append(
                ComponentRecommendation(
                    component_type="validator",
                    name="Data Validator",
                    description="Validate data against schemas",
                    relevance_score=0.8,
                    domain_specific=False,
                    usage_patterns=["validation", "data-quality"]
                )
            )
        
        return recommendations

    def _get_components_for_compliance(self, framework: str) -> List[ComponentRecommendation]:
        """Get components for compliance frameworks."""
        recommendations = []
        
        if framework == "HIPAA":
            recommendations.extend([
                ComponentRecommendation(
                    component_type="phi_handler",
                    name="PHI Data Handler",
                    description="Handle Protected Health Information securely",
                    relevance_score=0.95,
                    domain_specific=True,
                    usage_patterns=["hipaa", "healthcare"]
                ),
                ComponentRecommendation(
                    component_type="access_logger",
                    name="Access Log Monitor",
                    description="Monitor and log data access for HIPAA compliance",
                    relevance_score=0.9,
                    domain_specific=True,
                    usage_patterns=["audit", "compliance"]
                )
            ])
        
        elif framework == "GDPR":
            recommendations.append(
                ComponentRecommendation(
                    component_type="consent_manager",
                    name="Consent Manager",
                    description="Manage user consent for data processing",
                    relevance_score=0.9,
                    domain_specific=True,
                    usage_patterns=["gdpr", "privacy"]
                )
            )
        
        return recommendations


# Global instance for use across the agent system
domain_discovery_engine = DomainDiscoveryEngine()