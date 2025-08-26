"""Controller/Orchestrator for Socratic Langflow Architect.

Central brain that receives user input, determines workflow stage, and manages conversational flow.
"""

from typing import Dict, Any, Optional, List
from .state_manager import StateManager, WorkflowStage
from .socratic_engine import SocraticEngine


class SocraticController:
    """Controller that orchestrates the Socratic Langflow Architect conversation."""
    
    # Predefined workflow categories as per requirements
    WORKFLOW_CATEGORIES = [
        "chatbot",
        "data analysis", 
        "RAG workflow",
        "content generation"
    ]
    
    def __init__(self):
        """Initialize the controller with a state manager and socratic engine."""
        self.state_manager = StateManager()
        self.socratic_engine = SocraticEngine()
    
    def process_user_input(self, user_input: str) -> Dict[str, Any]:
        """
        Process user input and return appropriate response.
        
        Args:
            user_input: The user's message
            
        Returns:
            Dictionary containing response message and any additional data
        """
        # Add user input to conversation history
        self.state_manager.add_conversation_entry("user", user_input)
        
        # Determine response based on current state
        if self.state_manager.is_first_interaction():
            response = self._handle_first_interaction()
        else:
            current_stage = self.state_manager.get_workflow_stage()
            if current_stage == WorkflowStage.FRAMING:
                response = self._handle_framing_stage(user_input)
            elif current_stage == WorkflowStage.INQUIRY:
                response = self._handle_inquiry_stage(user_input)
            else:
                # Placeholder for future stages
                response = self._handle_other_stages(current_stage)
        
        # Add response to conversation history
        self.state_manager.add_conversation_entry("assistant", response["message"])
        
        return response
    
    def _handle_first_interaction(self) -> Dict[str, Any]:
        """
        Handle the first interaction with introduction and category presentation.
        
        Returns:
            Response dictionary with introduction message and workflow categories
        """
        # Create introduction message
        introduction = self._format_introduction()
        
        # Present workflow categories
        categories_text = self._format_workflow_categories()
        
        # Combine introduction and categories
        full_message = f"{introduction}\n\n{categories_text}"
        
        # Mark first interaction as complete
        self.state_manager.mark_first_interaction_complete()
        
        return {
            "message": full_message,
            "categories": self.WORKFLOW_CATEGORIES,
            "stage": "framing",
            "requires_selection": True
        }
    
    def _format_introduction(self) -> str:
        """
        Format the agent introduction message.
        
        Returns:
            Formatted introduction string
        """
        return (
            "Hello! I'm the **Socratic Langflow Architect**, your AI partner for creating "
            "powerful workflow automations. I specialize in guiding you through the process "
            "of building Langflow workflows through thoughtful questions and collaborative design.\\n\\n"
            "My role is to understand your goals, explore the possibilities together, and help "
            "you create a functional workflow that meets your specific needs. I'll ask questions "
            "to clarify your requirements and provide guidance based on best practices."
        )
    
    def _format_workflow_categories(self) -> str:
        """
        Format workflow categories as numbered list.
        
        Returns:
            Formatted categories string
        """
        categories_header = "To get started, please select one of these common workflow categories:"
        
        numbered_categories = []
        for i, category in enumerate(self.WORKFLOW_CATEGORIES, 1):
            numbered_categories.append(f"{i}. {category}")
        
        categories_list = "\\n".join(numbered_categories)
        
        return f"{categories_header}\\n\\n{categories_list}\\n\\nWhich category best matches what you'd like to build?"
    
    def _handle_framing_stage(self, user_input: str) -> Dict[str, Any]:
        """
        Handle user input during the framing stage (category selection).
        
        Args:
            user_input: User's category selection or description
            
        Returns:
            Response dictionary
        """
        # Try to parse category selection
        selected_category = self._parse_category_selection(user_input)
        
        if selected_category:
            # Valid category selected
            self.state_manager.set_workflow_category(selected_category)
            self.state_manager.set_workflow_stage(WorkflowStage.INQUIRY)
            
            # Generate initial question for the category
            initial_question = self.socratic_engine.generate_initial_question(selected_category)
            
            return {
                "message": f"Great choice! You've selected **{selected_category}**. \\n\\n{initial_question}",
                "selected_category": selected_category,
                "stage": "inquiry",
                "requires_selection": False
            }
        else:
            # Invalid selection - ask for clarification
            categories_text = self._format_workflow_categories()
            return {
                "message": f"I didn't understand your selection. {categories_text}",
                "categories": self.WORKFLOW_CATEGORIES,
                "stage": "framing", 
                "requires_selection": True
            }
    
    def _parse_category_selection(self, user_input: str) -> Optional[str]:
        """
        Parse user input to extract category selection.
        
        Args:
            user_input: User's input string
            
        Returns:
            Selected category if valid, None otherwise
        """
        user_input = user_input.strip().lower()
        
        # Check for numeric selection (1, 2, 3, 4)
        if user_input.isdigit():
            selection_num = int(user_input)
            if 1 <= selection_num <= len(self.WORKFLOW_CATEGORIES):
                return self.WORKFLOW_CATEGORIES[selection_num - 1]
        
        # Check for direct category name match
        for category in self.WORKFLOW_CATEGORIES:
            if category.lower() in user_input or user_input in category.lower():
                return category
        
        return None
    
    def _handle_inquiry_stage(self, user_input: str) -> Dict[str, Any]:
        """
        Handle user input during the inquiry stage (after category selection).
        
        Args:
            user_input: User's response to questions
            
        Returns:
            Response dictionary with clarifying question
        """
        # Parse the user's response to extract concepts
        parsed_response = self.socratic_engine.parse_user_response(user_input)
        
        # Store parsed response in state
        self.state_manager.set_last_parsed_response(parsed_response)
        
        # Add extracted concepts to state
        if parsed_response.get("identified_concepts"):
            self.state_manager.add_extracted_concepts(parsed_response["identified_concepts"])
        
        # Increment conversation depth
        self.state_manager.increment_conversation_depth()
        
        # Generate clarifying question
        category = self.state_manager.get_workflow_category()
        if not category:
            category = "general"  # Fallback if no category set
            
        conversation_history = self.state_manager.get_conversation_history()
        
        clarifying_question = self.socratic_engine.generate_clarifying_question(
            parsed_response, 
            conversation_history, 
            category
        )
        
        return {
            "message": clarifying_question,
            "stage": "inquiry",
            "parsed_concepts": parsed_response.get("identified_concepts", []),
            "conversation_depth": self.state_manager.get_conversation_depth(),
            "requires_selection": False
        }
    
    def _handle_other_stages(self, stage: WorkflowStage) -> Dict[str, Any]:
        """
        Handle user input for stages other than first interaction, framing, and inquiry.
        Placeholder for future implementation.
        
        Args:
            stage: Current workflow stage
            
        Returns:
            Response dictionary
        """
        return {
            "message": f"Processing input for {stage.value} stage. (Placeholder for future implementation)",
            "stage": stage.value,
            "requires_selection": False
        }
    
    def get_current_state(self) -> Dict[str, Any]:
        """Get the current conversation state."""
        return self.state_manager.get_state()
    
    def reset_conversation(self) -> None:
        """Reset the conversation to initial state."""
        self.state_manager.reset()
