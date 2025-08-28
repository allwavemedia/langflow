"""Unit tests for Socratic Langflow Architect Agent."""

import pytest
import json
from datetime import datetime
from unittest.mock import patch, AsyncMock

from langflow.agent.state_manager import StateManager, WorkflowStage
from langflow.agent.controller import SocraticController
from langflow.agent.socratic_engine import SocraticEngine


class TestStateManager:
    """Test cases for StateManager class."""
    
    def test_initialization(self):
        """Test StateManager initializes with correct default values."""
        state_manager = StateManager()
        state = state_manager.get_state()
        
        assert state["is_first_interaction"] is True
        assert state["selected_workflow_category"] is None
        assert state["conversation_history"] == []
        assert state["current_workflow_stage"] == WorkflowStage.FRAMING.value
        assert state["user_goal"] is None
        assert isinstance(state["gathered_requirements"], dict)
        assert isinstance(state["research_findings"], dict)
        assert isinstance(state["decision_history"], list)
        assert isinstance(state["langflow_graph_state"], dict)
        assert "created_at" in state
        assert "updated_at" in state
    
    def test_first_interaction_flag(self):
        """Test first interaction flag management."""
        state_manager = StateManager()
        
        # Initially should be first interaction
        assert state_manager.is_first_interaction() is True
        
        # After marking complete, should be False
        state_manager.mark_first_interaction_complete()
        assert state_manager.is_first_interaction() is False
    
    def test_workflow_category_management(self):
        """Test workflow category setting and retrieval."""
        state_manager = StateManager()
        
        # Initially should be None
        assert state_manager.get_workflow_category() is None
        
        # Set and retrieve category
        test_category = "chatbot"
        state_manager.set_workflow_category(test_category)
        assert state_manager.get_workflow_category() == test_category
    
    def test_conversation_history(self):
        """Test conversation history management."""
        state_manager = StateManager()
        
        # Initially empty
        assert state_manager.get_conversation_history() == []
        
        # Add entries
        state_manager.add_conversation_entry("user", "Hello")
        state_manager.add_conversation_entry("assistant", "Hi there!")
        
        history = state_manager.get_conversation_history()
        assert len(history) == 2
        assert history[0]["role"] == "user"
        assert history[0]["message"] == "Hello"
        assert history[1]["role"] == "assistant"
        assert history[1]["message"] == "Hi there!"
        assert "timestamp" in history[0]
    
    def test_workflow_stage_management(self):
        """Test workflow stage setting and retrieval."""
        state_manager = StateManager()
        
        # Initially should be FRAMING
        assert state_manager.get_workflow_stage() == WorkflowStage.FRAMING
        
        # Change to INQUIRY
        state_manager.set_workflow_stage(WorkflowStage.INQUIRY)
        assert state_manager.get_workflow_stage() == WorkflowStage.INQUIRY
    
    def test_json_serialization(self):
        """Test JSON export and import functionality."""
        state_manager = StateManager()
        
        # Modify some state
        state_manager.set_workflow_category("data analysis")
        state_manager.add_conversation_entry("user", "Test message")
        
        # Export to JSON
        json_str = state_manager.to_json()
        assert isinstance(json_str, str)
        
        # Create new state manager and import
        new_state_manager = StateManager()
        new_state_manager.from_json(json_str)
        
        # Verify state was imported correctly
        assert new_state_manager.get_workflow_category() == "data analysis"
        history = new_state_manager.get_conversation_history()
        assert len(history) == 1
        assert history[0]["message"] == "Test message"


class TestSocraticController:
    """Test cases for SocraticController class."""
    
    def test_initialization(self):
        """Test SocraticController initializes correctly."""
        controller = SocraticController()
        
        assert isinstance(controller.state_manager, StateManager)
        assert len(controller.WORKFLOW_CATEGORIES) >= 4
        assert "chatbot" in controller.WORKFLOW_CATEGORIES
        assert "data analysis" in controller.WORKFLOW_CATEGORIES
        assert "RAG workflow" in controller.WORKFLOW_CATEGORIES
        assert "content generation" in controller.WORKFLOW_CATEGORIES
    
    def test_first_interaction_introduction(self):
        """Test agent introduces itself correctly on first interaction."""
        controller = SocraticController()
        
        # Process first interaction
        response = controller.process_user_input("Hello")
        
        # Verify introduction components
        assert "Socratic Langflow Architect" in response["message"]
        assert "categories" in response
        assert len(response["categories"]) >= 4
        assert response["stage"] == "framing"
        assert response["requires_selection"] is True
        
        # Verify state changes
        assert controller.state_manager.is_first_interaction() is False
    
    def test_category_presentation_format(self):
        """Test workflow categories are presented as numbered options."""
        controller = SocraticController()
        
        response = controller.process_user_input("Hi")
        message = response["message"]
        
        # Check for numbered list format
        assert "1. chatbot" in message
        assert "2. data analysis" in message
        assert "3. RAG workflow" in message
        assert "4. content generation" in message
    
    def test_category_selection_numeric(self):
        """Test category selection using numeric input."""
        controller = SocraticController()
        
        # Complete first interaction
        controller.process_user_input("Hello")
        
        # Test numeric selection
        response = controller.process_user_input("1")
        
        assert "chatbot" in response["message"]
        assert response["selected_category"] == "chatbot"
        assert response["stage"] == "inquiry"
        assert controller.state_manager.get_workflow_category() == "chatbot"
    
    def test_category_selection_text(self):
        """Test category selection using text input."""
        controller = SocraticController()
        
        # Complete first interaction
        controller.process_user_input("Hello")
        
        # Test text selection
        response = controller.process_user_input("I want to build a chatbot")
        
        assert "chatbot" in response["message"]
        assert response["selected_category"] == "chatbot"
        assert controller.state_manager.get_workflow_category() == "chatbot"
    
    def test_invalid_category_selection(self):
        """Test handling of invalid category selection."""
        controller = SocraticController()
        
        # Complete first interaction
        controller.process_user_input("Hello")
        
        # Test invalid selection
        response = controller.process_user_input("something invalid")
        
        assert "didn't understand" in response["message"] or "understand" in response["message"]
        assert response["stage"] == "framing"
        assert response["requires_selection"] is True
        assert controller.state_manager.get_workflow_category() is None
    
    def test_conversation_history_tracking(self):
        """Test that conversation history is properly tracked."""
        controller = SocraticController()
        
        # Process multiple interactions
        controller.process_user_input("Hello")
        controller.process_user_input("1")
        
        history = controller.state_manager.get_conversation_history()
        
        # Should have 4 entries: user hello, assistant intro, user "1", assistant category confirmation
        assert len(history) >= 4
        assert history[0]["role"] == "user"
        assert history[0]["message"] == "Hello"
        assert history[1]["role"] == "assistant"
    
    def test_state_persistence(self):
        """Test that state persists correctly between interactions."""
        controller = SocraticController()
        
        # Complete category selection
        controller.process_user_input("Hello")
        controller.process_user_input("2")  # data analysis
        
        # Verify state is maintained
        state = controller.get_current_state()
        assert state["is_first_interaction"] is False
        assert state["selected_workflow_category"] == "data analysis"
        assert len(state["conversation_history"]) >= 4
    
    def test_reset_conversation(self):
        """Test conversation reset functionality."""
        controller = SocraticController()
        
        # Make some changes
        controller.process_user_input("Hello")
        controller.process_user_input("1")
        
        # Reset
        controller.reset_conversation()
        
        # Verify reset state
        assert controller.state_manager.is_first_interaction() is True
        assert controller.state_manager.get_workflow_category() is None
        assert controller.state_manager.get_conversation_history() == []


class TestSocraticEngine:
    """Test cases for SocraticEngine class with domain discovery."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.engine = SocraticEngine()
    
    def test_initialization(self):
        """Test SocraticEngine initializes correctly."""
        assert hasattr(self.engine, 'question_history')
        assert hasattr(self.engine, 'domain_context_cache')
        assert len(self.engine.question_history) == 0
        assert len(self.engine.domain_context_cache) == 0
    
    def test_traditional_question_generation(self):
        """Test traditional question generation still works."""
        # Test initial question generation
        question = self.engine.generate_initial_question("chatbot")
        assert isinstance(question, str)
        assert len(question) > 0
        assert len(self.engine.question_history) == 1
        
        # Test clarifying question generation
        parsed_response = {
            "identified_concepts": ["business"],
            "complexity": "medium"
        }
        clarifying_question = self.engine.generate_clarifying_question(
            parsed_response, [], "chatbot"
        )
        assert isinstance(clarifying_question, str)
        assert len(clarifying_question) > 0
    
    @pytest.mark.asyncio
    async def test_generate_dynamic_question_healthcare(self):
        """Test dynamic question generation for healthcare context."""
        user_input = "I need to build a workflow for processing patient medical records with HIPAA compliance"
        session_id = "test_session_healthcare"
        
        question = await self.engine.generate_dynamic_question(user_input, session_id)
        
        assert isinstance(question, str)
        assert len(question) > 0
        assert len(self.engine.question_history) > 0
        
        # Check that the question is healthcare-aware
        question_lower = question.lower()
        healthcare_terms = ["healthcare", "patient", "medical", "hipaa", "clinical", "data", "workflow"]
        assert any(term in question_lower for term in healthcare_terms)
    
    @pytest.mark.asyncio
    async def test_generate_dynamic_question_finance(self):
        """Test dynamic question generation for finance context."""
        user_input = "I want to create a trading system that processes financial transactions"
        session_id = "test_session_finance"
        
        question = await self.engine.generate_dynamic_question(user_input, session_id)
        
        assert isinstance(question, str)
        assert len(question) > 0
        
        # Check that the question is finance-aware
        question_lower = question.lower()
        finance_terms = ["financial", "trading", "transaction", "regulatory", "compliance", "data", "system"]
        assert any(term in question_lower for term in finance_terms)
    
    @pytest.mark.asyncio
    async def test_get_domain_insights_with_active_context(self):
        """Test getting domain insights when context is active."""
        session_id = "test_session_insights"
        
        # First generate a dynamic question to create context
        await self.engine.generate_dynamic_question(
            "I need healthcare workflow with HIPAA compliance", session_id
        )
        
        # Get domain insights
        insights = await self.engine.get_domain_insights(session_id)
        
        assert insights is not None
        assert isinstance(insights, dict)
        assert "domain" in insights
        assert "confidence" in insights
        assert "expertise_level" in insights
        assert "recommendations" in insights
        assert insights["domain"] == "healthcare"
        assert insights["confidence"] > 0
    
    @pytest.mark.asyncio
    async def test_get_domain_insights_no_context(self):
        """Test getting domain insights when no context exists."""
        session_id = "test_session_no_context"
        
        insights = await self.engine.get_domain_insights(session_id)
        
        assert insights is None
    
    @pytest.mark.asyncio
    async def test_switch_domain_context(self):
        """Test switching domain context for a session."""
        session_id = "test_session_switch"
        
        # Start with healthcare
        await self.engine.generate_dynamic_question(
            "I need healthcare workflow with HIPAA", session_id
        )
        
        # Switch to finance
        switch_result = await self.engine.switch_domain_context(
            "Now I need financial trading system", session_id
        )
        
        assert isinstance(switch_result, dict)
        assert switch_result["success"] is True
        assert switch_result["new_domain"] == "finance"
        assert switch_result["previous_domain"] == "healthcare"
        assert "recommendations_count" in switch_result
    
    def test_parse_user_response(self):
        """Test parsing user response still works correctly."""
        user_input = "I need a business chatbot with real-time capabilities"
        
        parsed = self.engine.parse_user_response(user_input)
        
        assert isinstance(parsed, dict)
        assert "original_input" in parsed
        assert "identified_concepts" in parsed
        assert "entities" in parsed
        assert "complexity" in parsed
        assert "word_count" in parsed
        assert parsed["original_input"] == user_input
        assert parsed["word_count"] == len(user_input.split())
    
    def test_reset_functionality(self):
        """Test reset functionality."""
        # Add some history and cache
        self.engine.question_history.append({"test": "data"})
        self.engine.domain_context_cache["test"] = "context"
        
        # Reset
        self.engine.reset()
        
        # Check that history is cleared but cache is preserved
        assert len(self.engine.question_history) == 0
        # Cache should be preserved across resets for session continuity
        assert "test" in self.engine.domain_context_cache


    pytest.main([__file__])
