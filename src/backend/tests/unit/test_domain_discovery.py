"""Unit tests for Dynamic Domain Discovery Engine."""

import pytest
import asyncio
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

from langflow.agent.domain_discovery import (
    DomainDiscoveryEngine,
    DomainContext,
    DomainKnowledge,
    EnhancedDomainContext,
    ComponentRecommendation,
    DomainActivationResult,
    DomainSource,
    ExpertiseLevel
)


class TestDomainDiscoveryEngine:
    """Test cases for DomainDiscoveryEngine class."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.engine = DomainDiscoveryEngine()
    
    @pytest.mark.asyncio
    async def test_analyze_user_context_healthcare(self):
        """Test domain analysis for healthcare context."""
        input_text = "I need to build a workflow for processing patient medical records with HIPAA compliance"
        
        result = await self.engine.analyze_user_context(input_text, "test_session")
        
        assert isinstance(result, DomainContext)
        assert result.domain == "healthcare"
        assert result.confidence > 0.5
        assert "hipaa" in [indicator.lower() for indicator in result.indicators]
        assert "medical" in [indicator.lower() for indicator in result.indicators]
        assert result.source == DomainSource.CONVERSATION
    
    @pytest.mark.asyncio
    async def test_analyze_user_context_finance(self):
        """Test domain analysis for finance context."""
        input_text = "I want to create a trading system that processes financial transactions with SOX compliance"
        
        result = await self.engine.analyze_user_context(input_text, "test_session")
        
        assert isinstance(result, DomainContext)
        assert result.domain == "finance"
        assert result.confidence > 0.5
        assert "trading" in result.indicators
        assert "sox" in [indicator.lower() for indicator in result.indicators]
    
    @pytest.mark.asyncio
    async def test_analyze_user_context_technology(self):
        """Test domain analysis for technology/API context."""
        input_text = "I need to build a REST API that connects to multiple databases and uses microservices"
        
        result = await self.engine.analyze_user_context(input_text, "test_session")
        
        assert isinstance(result, DomainContext)
        assert result.domain == "technology"
        assert result.confidence > 0.5
        assert "api" in result.indicators
        assert "database" in result.indicators
        assert "microservice" in result.indicators
    
    @pytest.mark.asyncio
    async def test_analyze_user_context_general(self):
        """Test domain analysis for general/unclear context."""
        input_text = "I want to build something useful"
        
        result = await self.engine.analyze_user_context(input_text, "test_session")
        
        assert isinstance(result, DomainContext)
        assert result.domain == "general"
        assert result.confidence < 0.5
        assert len(result.indicators) == 0
    
    @pytest.mark.asyncio
    async def test_query_domain_knowledge_with_hints(self):
        """Test querying domain knowledge with hints."""
        hints = ["healthcare", "patient", "hipaa", "api"]
        
        knowledge = await self.engine.query_domain_knowledge(hints)
        
        assert isinstance(knowledge, DomainKnowledge)
        assert knowledge.domain == "healthcare"
        assert len(knowledge.technologies) > 0
        assert len(knowledge.concepts) > 0
        assert len(knowledge.best_practices) > 0
        assert "api" in knowledge.technologies
    
    @pytest.mark.asyncio
    async def test_enhance_with_context_analysis(self):
        """Test enhancing domain context with additional intelligence."""
        domain_context = DomainContext(
            domain="healthcare",
            confidence=0.8,
            indicators=["healthcare", "patient", "hipaa", "medical"],
            timestamp=datetime.now(timezone.utc),
            source=DomainSource.CONVERSATION
        )
        
        enhanced = await self.engine.enhance_with_context_analysis(domain_context)
        
        assert isinstance(enhanced, EnhancedDomainContext)
        assert enhanced.domain == "healthcare"
        assert enhanced.confidence == 0.8
        assert isinstance(enhanced.knowledge, DomainKnowledge)
        assert enhanced.expertise_level in [ExpertiseLevel.BEGINNER, ExpertiseLevel.INTERMEDIATE, ExpertiseLevel.ADVANCED]
        assert "HIPAA" in enhanced.compliance_frameworks
    
    @pytest.mark.asyncio
    async def test_generate_component_recommendations_healthcare(self):
        """Test generating component recommendations for healthcare domain."""
        enhanced_context = EnhancedDomainContext(
            domain="healthcare",
            confidence=0.9,
            indicators=["healthcare", "hipaa"],
            timestamp=datetime.now(timezone.utc),
            source=DomainSource.CONVERSATION,
            knowledge=DomainKnowledge(
                domain="healthcare",
                technologies=["api", "database"],
                concepts=["patient data", "compliance"],
                compliance_frameworks=["HIPAA"]
            ),
            compliance_frameworks=["HIPAA"]
        )
        
        recommendations = await self.engine.generate_component_recommendations(enhanced_context)
        
        assert isinstance(recommendations, list)
        assert len(recommendations) > 0
        
        # Check that we have domain-specific recommendations
        hipaa_components = [r for r in recommendations if "HIPAA" in r.name or "hipaa" in r.description.lower()]
        assert len(hipaa_components) > 0
        
        # Check recommendation structure
        for rec in recommendations:
            assert isinstance(rec, ComponentRecommendation)
            assert rec.relevance_score > 0
            assert rec.relevance_score <= 1.0
            assert len(rec.usage_patterns) > 0
    
    @pytest.mark.asyncio
    async def test_generate_component_recommendations_finance(self):
        """Test generating component recommendations for finance domain."""
        enhanced_context = EnhancedDomainContext(
            domain="finance",
            confidence=0.9,
            indicators=["finance", "trading"],
            timestamp=datetime.now(timezone.utc),
            source=DomainSource.CONVERSATION,
            knowledge=DomainKnowledge(
                domain="finance",
                technologies=["python", "database"],
                concepts=["transaction", "security"]
            )
        )
        
        recommendations = await self.engine.generate_component_recommendations(enhanced_context)
        
        assert isinstance(recommendations, list)
        assert len(recommendations) > 0
        
        # Check for finance-specific components
        finance_components = [r for r in recommendations if "financial" in r.name.lower() or "transaction" in r.name.lower()]
        assert len(finance_components) > 0
    
    @pytest.mark.asyncio
    async def test_activate_domain_expertise_success(self):
        """Test successful domain expertise activation."""
        input_text = "I need to build a healthcare workflow for patient data with HIPAA compliance"
        session_id = "test_session_123"
        
        result = await self.engine.activate_domain_expertise(input_text, session_id)
        
        assert isinstance(result, DomainActivationResult)
        assert result.success is True
        assert result.domain_context.domain == "healthcare"
        assert len(result.recommendations) > 0
        assert result.persistence_key != ""
        assert result.error is None
        
        # Check that the context is stored
        active_context = self.engine.get_active_domain_context(session_id)
        assert active_context is not None
        assert active_context.domain == "healthcare"
    
    @pytest.mark.asyncio
    async def test_switch_domain(self):
        """Test switching domains for a session."""
        session_id = "test_session_switch"
        
        # First activation - healthcare
        result1 = await self.engine.activate_domain_expertise(
            "I need healthcare workflow with HIPAA", session_id
        )
        assert result1.success
        assert result1.domain_context.domain == "healthcare"
        
        # Switch to finance domain
        result2 = await self.engine.switch_domain(
            session_id, "Now I need to build a financial trading system"
        )
        assert result2.success
        assert result2.domain_context.domain == "finance"
        assert result2.domain_context.metadata.get("previous_domain") == "healthcare"
        assert "domain_switch_time" in result2.domain_context.metadata
    
    def test_extract_domain_indicators_healthcare(self):
        """Test extracting domain indicators for healthcare."""
        text = "We need to process patient medical records while ensuring HIPAA compliance for our clinical workflow"
        
        indicators = self.engine._extract_domain_indicators(text)
        
        assert "patient" in indicators
        assert "medical" in indicators
        assert "hipaa" in indicators
        assert "clinical" in indicators
    
    def test_extract_domain_indicators_finance(self):
        """Test extracting domain indicators for finance."""
        text = "Our trading system needs PCI compliance for payment processing and financial data security"
        
        indicators = self.engine._extract_domain_indicators(text)
        
        assert "trading" in indicators
        assert "pci" in indicators
        assert "payment" in indicators
        assert "financial" in indicators
    
    def test_extract_domain_indicators_technology(self):
        """Test extracting domain indicators for technology."""
        text = "We're building a REST API with OAuth authentication that connects to PostgreSQL database"
        
        indicators = self.engine._extract_domain_indicators(text)
        
        assert "api" in indicators
        assert "oauth" in indicators
        assert "authentication" in indicators
        assert "database" in indicators
    
    def test_classify_domain_healthcare(self):
        """Test domain classification for healthcare indicators."""
        text = "patient medical workflow"
        indicators = ["patient", "medical", "healthcare", "hipaa"]
        
        domain, confidence = self.engine._classify_domain(text, indicators)
        
        assert domain == "healthcare"
        assert confidence > 0.5
    
    def test_classify_domain_finance(self):
        """Test domain classification for finance indicators."""
        text = "trading financial payment"
        indicators = ["trading", "financial", "payment", "sox"]
        
        domain, confidence = self.engine._classify_domain(text, indicators)
        
        assert domain == "finance"
        assert confidence > 0.5
    
    def test_classify_domain_general(self):
        """Test domain classification with no clear indicators."""
        text = "general workflow"
        indicators = []
        
        domain, confidence = self.engine._classify_domain(text, indicators)
        
        assert domain == "general"
        assert confidence <= 0.2
    
    def test_infer_expertise_level_beginner(self):
        """Test inferring beginner expertise level."""
        indicators = ["simple", "basic", "workflow"]
        
        level = self.engine._infer_expertise_level(indicators)
        
        assert level == ExpertiseLevel.BEGINNER
    
    def test_infer_expertise_level_intermediate(self):
        """Test inferring intermediate expertise level."""
        indicators = ["api", "database", "integration"]
        
        level = self.engine._infer_expertise_level(indicators)
        
        assert level == ExpertiseLevel.INTERMEDIATE
    
    def test_infer_expertise_level_advanced(self):
        """Test inferring advanced expertise level."""
        indicators = ["microservice", "kubernetes", "distributed", "architecture"]
        
        level = self.engine._infer_expertise_level(indicators)
        
        assert level == ExpertiseLevel.ADVANCED
    
    def test_detect_compliance_frameworks(self):
        """Test detecting compliance frameworks."""
        indicators = ["hipaa", "gdpr", "pci", "healthcare", "privacy"]
        knowledge = DomainKnowledge(domain="healthcare", concepts=["compliance", "security"])
        
        frameworks = self.engine._detect_compliance_frameworks(indicators, knowledge)
        
        assert "HIPAA" in frameworks
        assert "GDPR" in frameworks
        assert "PCI-DSS" in frameworks
    
    def test_detect_related_domains(self):
        """Test detecting related domains."""
        knowledge = DomainKnowledge(
            domain="healthcare",
            technologies=["api", "cloud"],
            concepts=["security", "integration"]
        )
        indicators = ["api", "security", "aws"]
        
        related = self.engine._detect_related_domains(knowledge, indicators)
        
        assert "integration" in related
        assert "cloud" in related
        assert "security" in related
    
    def test_get_base_components_for_healthcare(self):
        """Test getting base components for healthcare domain."""
        recommendations = self.engine._get_base_components_for_domain("healthcare")
        
        assert len(recommendations) > 0
        hipaa_found = any("HIPAA" in rec.name or "hipaa" in rec.description.lower() for rec in recommendations)
        assert hipaa_found
    
    def test_get_base_components_for_finance(self):
        """Test getting base components for finance domain."""
        recommendations = self.engine._get_base_components_for_domain("finance")
        
        assert len(recommendations) > 0
        finance_found = any("financial" in rec.name.lower() or "transaction" in rec.name.lower() for rec in recommendations)
        assert finance_found
    
    def test_get_components_for_technology(self):
        """Test getting components for specific technologies."""
        # Test Python technology
        python_components = self.engine._get_components_for_technology("python")
        assert len(python_components) > 0
        assert any("python" in rec.name.lower() for rec in python_components)
        
        # Test Database technology
        db_components = self.engine._get_components_for_technology("database")
        assert len(db_components) > 0
        assert any("database" in rec.name.lower() for rec in db_components)
    
    def test_get_components_for_pattern(self):
        """Test getting components for common patterns."""
        # Test authentication pattern
        auth_components = self.engine._get_components_for_pattern("authentication")
        assert len(auth_components) > 0
        assert any("auth" in rec.name.lower() for rec in auth_components)
        
        # Test validation pattern
        validation_components = self.engine._get_components_for_pattern("validation")
        assert len(validation_components) > 0
        assert any("validator" in rec.name.lower() for rec in validation_components)
    
    def test_get_components_for_compliance(self):
        """Test getting components for compliance frameworks."""
        # Test HIPAA compliance
        hipaa_components = self.engine._get_components_for_compliance("HIPAA")
        assert len(hipaa_components) > 0
        assert any("phi" in rec.name.lower() or "hipaa" in rec.description.lower() for rec in hipaa_components)
        
        # Test GDPR compliance
        gdpr_components = self.engine._get_components_for_compliance("GDPR")
        assert len(gdpr_components) > 0
        assert any("consent" in rec.name.lower() or "gdpr" in rec.description.lower() for rec in gdpr_components)


class TestDomainContextDataClasses:
    """Test cases for domain context data classes."""
    
    def test_domain_context_creation(self):
        """Test creating a DomainContext instance."""
        context = DomainContext(
            domain="healthcare",
            confidence=0.8,
            indicators=["healthcare", "patient"],
            timestamp=datetime.now(timezone.utc),
            source=DomainSource.CONVERSATION
        )
        
        assert context.domain == "healthcare"
        assert context.confidence == 0.8
        assert len(context.indicators) == 2
        assert context.source == DomainSource.CONVERSATION
    
    def test_domain_knowledge_creation(self):
        """Test creating a DomainKnowledge instance."""
        knowledge = DomainKnowledge(
            domain="finance",
            technologies=["python", "database"],
            concepts=["trading", "compliance"],
            best_practices=["audit logs", "encryption"]
        )
        
        assert knowledge.domain == "finance"
        assert len(knowledge.technologies) == 2
        assert len(knowledge.concepts) == 2
        assert len(knowledge.best_practices) == 2
    
    def test_enhanced_domain_context_creation(self):
        """Test creating an EnhancedDomainContext instance."""
        knowledge = DomainKnowledge(domain="healthcare")
        context = EnhancedDomainContext(
            domain="healthcare",
            confidence=0.9,
            indicators=["healthcare"],
            timestamp=datetime.now(timezone.utc),
            source=DomainSource.CONVERSATION,
            knowledge=knowledge,
            expertise_level=ExpertiseLevel.INTERMEDIATE
        )
        
        assert context.domain == "healthcare"
        assert context.expertise_level == ExpertiseLevel.INTERMEDIATE
        assert context.knowledge.domain == "healthcare"
    
    def test_component_recommendation_creation(self):
        """Test creating a ComponentRecommendation instance."""
        rec = ComponentRecommendation(
            component_type="validator",
            name="HIPAA Validator",
            description="Validates HIPAA compliance",
            relevance_score=0.9,
            domain_specific=True,
            usage_patterns=["compliance", "validation"]
        )
        
        assert rec.component_type == "validator"
        assert rec.name == "HIPAA Validator"
        assert rec.relevance_score == 0.9
        assert rec.domain_specific is True
        assert len(rec.usage_patterns) == 2
    
    def test_domain_activation_result_success(self):
        """Test creating a successful DomainActivationResult."""
        context = EnhancedDomainContext(
            domain="healthcare",
            confidence=0.8,
            indicators=["healthcare"],
            timestamp=datetime.now(timezone.utc),
            source=DomainSource.CONVERSATION
        )
        
        result = DomainActivationResult(
            success=True,
            domain_context=context,
            recommendations=[],
            persistence_key="test-key"
        )
        
        assert result.success is True
        assert result.domain_context.domain == "healthcare"
        assert result.persistence_key == "test-key"
        assert result.error is None
    
    def test_domain_activation_result_failure(self):
        """Test creating a failed DomainActivationResult."""
        context = EnhancedDomainContext(
            domain="general",
            confidence=0.1,
            indicators=[],
            timestamp=datetime.now(timezone.utc),
            source=DomainSource.CONVERSATION
        )
        
        result = DomainActivationResult(
            success=False,
            domain_context=context,
            error="Test error message"
        )
        
        assert result.success is False
        assert result.error == "Test error message"
        assert len(result.recommendations) == 0


if __name__ == "__main__":
    pytest.main([__file__])