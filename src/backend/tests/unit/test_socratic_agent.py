"""Unit tests for Socratic Langflow Architect Agent."""

import pytest
import json
from datetime import datetime
from unittest.mock import patch

from langflow.agent.state_manager import StateManager, WorkflowStage
from langflow.agent.controller import SocraticController


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


if __name__ == "__main__":
    pytest.main([__file__])
