"""State Manager for Socratic Langflow Architect.

Manages conversation state including user goals, requirements, and workflow progress.
"""

from typing import Dict, Any, Optional, List
from enum import Enum
import json
from datetime import datetime


class WorkflowStage(Enum):
    """Defines the current stage of the conversation workflow."""
    FRAMING = "framing"
    INQUIRY = "inquiry"
    RESEARCH = "research"
    GENERATION = "generation"


class StateManager:
    """Manages conversation state and provides context to other modules."""
    
    def __init__(self):
        """Initialize the state manager with default values."""
        self._state: Dict[str, Any] = {
            "is_first_interaction": True,
            "selected_workflow_category": None,
            "conversation_history": [],
            "current_workflow_stage": WorkflowStage.FRAMING.value,
            "user_goal": None,
            "gathered_requirements": {},
            "research_findings": {},
            "decision_history": [],
            "langflow_graph_state": {},
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            # New fields for inquiry stage
            "inquiry_focus_area": None,
            "extracted_concepts": [],
            "question_history": [],
            "conversation_depth": 0,
            "last_parsed_response": {}
        }
    
    def get_state(self) -> Dict[str, Any]:
        """Get the complete current state."""
        return self._state.copy()
    
    def is_first_interaction(self) -> bool:
        """Check if this is the user's first interaction."""
        return self._state.get("is_first_interaction", True)
    
    def mark_first_interaction_complete(self) -> None:
        """Mark that the first interaction has been completed."""
        self._state["is_first_interaction"] = False
        self._update_timestamp()
    
    def set_workflow_category(self, category: str) -> None:
        """Set the selected workflow category."""
        self._state["selected_workflow_category"] = category
        self._update_timestamp()
    
    def get_workflow_category(self) -> Optional[str]:
        """Get the selected workflow category."""
        return self._state.get("selected_workflow_category")
    
    def add_conversation_entry(self, role: str, message: str) -> None:
        """Add an entry to the conversation history."""
        entry = {
            "role": role,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        self._state["conversation_history"].append(entry)
        self._update_timestamp()
    
    def get_conversation_history(self) -> List[Dict[str, Any]]:
        """Get the conversation history."""
        return self._state.get("conversation_history", [])
    
    def set_workflow_stage(self, stage: WorkflowStage) -> None:
        """Set the current workflow stage."""
        self._state["current_workflow_stage"] = stage.value
        self._update_timestamp()
    
    def get_workflow_stage(self) -> WorkflowStage:
        """Get the current workflow stage."""
        stage_value = self._state.get("current_workflow_stage", WorkflowStage.FRAMING.value)
        return WorkflowStage(stage_value)
    
    def set_user_goal(self, goal: str) -> None:
        """Set the user's stated goal."""
        self._state["user_goal"] = goal
        self._update_timestamp()
    
    def get_user_goal(self) -> Optional[str]:
        """Get the user's stated goal."""
        return self._state.get("user_goal")
    
    def update_requirements(self, requirements: Dict[str, Any]) -> None:
        """Update gathered requirements."""
        self._state["gathered_requirements"].update(requirements)
        self._update_timestamp()
    
    def get_requirements(self) -> Dict[str, Any]:
        """Get gathered requirements."""
        return self._state.get("gathered_requirements", {})
    
    def add_research_finding(self, key: str, data: Any) -> None:
        """Add research findings."""
        self._state["research_findings"][key] = data
        self._update_timestamp()
    
    def get_research_findings(self) -> Dict[str, Any]:
        """Get research findings."""
        return self._state.get("research_findings", {})
    
    def add_decision(self, decision: str, reasoning: str) -> None:
        """Add a decision to the decision history."""
        decision_entry = {
            "decision": decision,
            "reasoning": reasoning,
            "timestamp": datetime.now().isoformat()
        }
        self._state["decision_history"].append(decision_entry)
        self._update_timestamp()
    
    def get_decision_history(self) -> List[Dict[str, Any]]:
        """Get the decision history."""
        return self._state.get("decision_history", [])
    
    def update_langflow_graph_state(self, graph_data: Dict[str, Any]) -> None:
        """Update the current Langflow graph construction state."""
        self._state["langflow_graph_state"].update(graph_data)
        self._update_timestamp()
    
    def get_langflow_graph_state(self) -> Dict[str, Any]:
        """Get the current Langflow graph construction state."""
        return self._state.get("langflow_graph_state", {})
    
    def _update_timestamp(self) -> None:
        """Update the last modified timestamp."""
        self._state["updated_at"] = datetime.now().isoformat()
    
    def to_json(self) -> str:
        """Export state as JSON string."""
        return json.dumps(self._state, indent=2)
    
    def from_json(self, json_str: str) -> None:
        """Load state from JSON string."""
        try:
            loaded_state = json.loads(json_str)
            self._state.update(loaded_state)
            self._update_timestamp()
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON format: {e}")
    
    def reset(self) -> None:
        """Reset the state manager to initial state."""
        self.__init__()
    
    # New methods for inquiry stage support
    
    def set_inquiry_focus_area(self, focus_area: str) -> None:
        """Set the current inquiry focus area."""
        self._state["inquiry_focus_area"] = focus_area
        self._update_timestamp()
    
    def get_inquiry_focus_area(self) -> Optional[str]:
        """Get the current inquiry focus area."""
        return self._state.get("inquiry_focus_area")
    
    def add_extracted_concepts(self, concepts: List[str]) -> None:
        """Add extracted concepts from user responses."""
        existing_concepts = self._state.get("extracted_concepts", [])
        # Add new concepts, avoiding duplicates
        for concept in concepts:
            if concept not in existing_concepts:
                existing_concepts.append(concept)
        self._state["extracted_concepts"] = existing_concepts
        self._update_timestamp()
    
    def get_extracted_concepts(self) -> List[str]:
        """Get all extracted concepts."""
        return self._state.get("extracted_concepts", [])
    
    def add_question_to_history(self, question_data: Dict[str, Any]) -> None:
        """Add a question to the question history."""
        self._state["question_history"].append(question_data)
        self._update_timestamp()
    
    def get_question_history(self) -> List[Dict[str, Any]]:
        """Get the question history."""
        return self._state.get("question_history", [])
    
    def increment_conversation_depth(self) -> None:
        """Increment the conversation depth counter."""
        self._state["conversation_depth"] = self._state.get("conversation_depth", 0) + 1
        self._update_timestamp()
    
    def get_conversation_depth(self) -> int:
        """Get the current conversation depth."""
        return self._state.get("conversation_depth", 0)
    
    def set_last_parsed_response(self, parsed_response: Dict[str, Any]) -> None:
        """Store the last parsed user response."""
        self._state["last_parsed_response"] = parsed_response
        self._update_timestamp()
    
    def get_last_parsed_response(self) -> Dict[str, Any]:
        """Get the last parsed user response."""
        return self._state.get("last_parsed_response", {})
