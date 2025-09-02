"""Socratic Engine for generating clarifying questions.

This module implements the core Socratic questioning capability, taking conversation
state and generating appropriate follow-up questions to guide users toward clarity.
Enhanced with Dynamic Domain Discovery for intelligent context-aware questioning.
"""

from typing import Dict, Any, List, Optional
import re
import asyncio
from enum import Enum
from .domain_discovery import domain_discovery_engine, DomainContext, EnhancedDomainContext


class QuestionType(Enum):
    """Types of questions the Socratic Engine can generate."""
    INITIAL_CATEGORY = "initial_category"  # First question after category selection
    CLARIFYING = "clarifying"             # Follow-up clarifying questions
    CONCEPT_EXPLORATION = "concept_exploration"  # Explore identified concepts deeper


class SocraticEngine:
    """
    Core Socratic questioning engine that generates clarifying questions
    based on conversation state and user input.
    """
    
    # Category-specific initial questions
    INITIAL_QUESTIONS = {
        "chatbot": [
            "What kind of conversations do you want your chatbot to have with users?",
            "Who is your target audience for this chatbot?",
            "What specific problems should your chatbot help users solve?",
            "What tone or personality should your chatbot have?"
        ],
        "data analysis": [
            "What type of data are you working with?",
            "What insights or patterns are you hoping to discover?",
            "What decisions will this analysis help you make?",
            "How will you be using the results of this analysis?"
        ],
        "RAG workflow": [
            "What kind of documents or knowledge base will you be searching through?",
            "What types of questions do users need to ask about this information?",
            "How current does the information need to be?",
            "What level of detail should the answers provide?"
        ],
        "content generation": [
            "What type of content do you want to generate?",
            "Who is the intended audience for this content?",
            "What style or tone should the content have?",
            "What information or inputs will you provide to generate the content?"
        ]
    }
    
    # Keywords that indicate specific concepts to explore
    CONCEPT_KEYWORDS = {
        "business": ["business", "company", "enterprise", "commercial", "revenue"],
        "technical": ["api", "database", "integration", "technical", "system"],
        "user_experience": ["user", "experience", "interface", "usability", "design"],
        "automation": ["automate", "automatic", "workflow", "process", "task"],
        "real_time": ["real-time", "live", "instant", "immediate", "streaming"],
        "security": ["secure", "security", "private", "confidential", "protect"],
        "scale": ["scale", "scalable", "performance", "volume", "growth"]
    }
    
    # Follow-up question templates based on identified concepts
    CONCEPT_QUESTIONS = {
        "business": [
            "How does this fit into your business goals?",
            "What's the expected business impact or ROI?",
            "Who are the key stakeholders for this project?"
        ],
        "technical": [
            "What existing systems does this need to integrate with?",
            "Are there any technical constraints I should know about?",
            "What's your current technical infrastructure like?"
        ],
        "user_experience": [
            "What does a successful user interaction look like?",
            "How tech-savvy are your typical users?",
            "What would make this really valuable for your users?"
        ],
        "automation": [
            "What manual processes are you hoping to automate?",
            "How often does this process need to run?",
            "What triggers should start this automation?"
        ],
        "real_time": [
            "How quickly do you need responses or results?",
            "What happens if there's a delay in processing?",
            "How will users know when new information is available?"
        ],
        "security": [
            "What kind of sensitive information will be handled?",
            "What security or compliance requirements do you have?",
            "Who should have access to this system?"
        ],
        "scale": [
            "How many users do you expect?",
            "What's the expected volume of data or requests?",
            "How quickly do you anticipate growth?"
        ]
    }
    
    def __init__(self):
        """Initialize the Socratic Engine."""
        self.question_history = []
        self.domain_context_cache = {}  # Cache for domain contexts by session
    
    def generate_initial_question(self, category: str) -> str:
        """
        Generate the first question after category selection.
        
        Args:
            category: The selected workflow category
            
        Returns:
            Initial question string for the category
        """
        if category not in self.INITIAL_QUESTIONS:
            return "Can you tell me more about what you're trying to accomplish?"
        
        # Return the first question for the category
        question = self.INITIAL_QUESTIONS[category][0]
        self.question_history.append({
            "type": QuestionType.INITIAL_CATEGORY.value,
            "category": category,
            "question": question
        })
        
        return question
    
    def parse_user_response(self, user_input: str) -> Dict[str, Any]:
        """
        Parse user response to identify key concepts and entities.
        
        Args:
            user_input: User's natural language response
            
        Returns:
            Dictionary containing parsed concepts and metadata
        """
        user_input_lower = user_input.lower()
        
        # Extract identified concepts
        identified_concepts = []
        for concept, keywords in self.CONCEPT_KEYWORDS.items():
            for keyword in keywords:
                if keyword in user_input_lower:
                    identified_concepts.append(concept)
                    break
        
        # Remove duplicates while preserving order
        identified_concepts = list(dict.fromkeys(identified_concepts))
        
        # Extract potential entities (simple pattern matching)
        entities = self._extract_entities(user_input)
        
        # Calculate input complexity (for question selection)
        complexity = self._assess_complexity(user_input)
        
        return {
            "original_input": user_input,
            "identified_concepts": identified_concepts,
            "entities": entities,
            "complexity": complexity,
            "word_count": len(user_input.split())
        }
    
    def generate_clarifying_question(self, parsed_response: Dict[str, Any], 
                                   conversation_history: List[Dict[str, Any]],
                                   category: str) -> str:
        """
        Generate a clarifying question based on parsed user response.
        
        Args:
            parsed_response: Result from parse_user_response
            conversation_history: Previous conversation turns
            category: Selected workflow category
            
        Returns:
            Clarifying question string
        """
        identified_concepts = parsed_response.get("identified_concepts", [])
        complexity = parsed_response.get("complexity", "medium")
        
        # If concepts were identified, ask about the most relevant one
        if identified_concepts:
            primary_concept = identified_concepts[0]
            questions = self.CONCEPT_QUESTIONS.get(primary_concept, [])
            
            if questions:
                # Select question based on conversation history to avoid repetition
                question = self._select_non_repetitive_question(questions, conversation_history)
                self.question_history.append({
                    "type": QuestionType.CONCEPT_EXPLORATION.value,
                    "concept": primary_concept,
                    "question": question
                })
                return question
        
        # Fallback to generic clarifying questions based on complexity
        if complexity == "low":
            fallback_questions = [
                "Can you give me a specific example of how you'd use this?",
                "What would success look like to you?",
                "What's the main challenge you're trying to solve?"
            ]
        else:
            fallback_questions = [
                "Which part of this is most important to get right?",
                "What would make the biggest difference for your users?",
                "Are there any constraints or limitations I should know about?"
            ]
        
        question = self._select_non_repetitive_question(fallback_questions, conversation_history)
        self.question_history.append({
            "type": QuestionType.CLARIFYING.value,
            "category": category,
            "question": question
        })
        
        return question
    
    def _extract_entities(self, text: str) -> List[str]:
        """Extract potential entities from text using simple patterns."""
        entities = []
        
        # Look for quoted phrases
        quoted_matches = re.findall(r'"([^"]*)"', text)
        entities.extend(quoted_matches)
        
        # Look for capitalized words (potential proper nouns)
        capitalized_matches = re.findall(r'\\b[A-Z][a-z]+\\b', text)
        # Filter out common words that might be capitalized
        common_words = {"I", "The", "A", "An", "This", "That", "These", "Those"}
        capitalized_matches = [word for word in capitalized_matches if word not in common_words]
        entities.extend(capitalized_matches)
        
        return list(set(entities))  # Remove duplicates
    
    def _assess_complexity(self, text: str) -> str:
        """Assess the complexity of user input."""
        word_count = len(text.split())
        sentence_count = len([s for s in text.split('.') if s.strip()])
        
        if word_count < 10 and sentence_count <= 1:
            return "low"
        elif word_count > 30 or sentence_count > 3:
            return "high"
        else:
            return "medium"
    
    def _select_non_repetitive_question(self, questions: List[str], 
                                      conversation_history: List[Dict[str, Any]]) -> str:
        """Select a question that hasn't been asked recently."""
        # Get recently asked questions
        recent_questions = set()
        for entry in conversation_history[-5:]:  # Check last 5 turns
            if entry.get("role") == "assistant":
                recent_questions.add(entry.get("message", "").lower())
        
        # Find a question that hasn't been asked recently
        for question in questions:
            if question.lower() not in recent_questions:
                return question
        
        # If all questions have been asked recently, return the first one
        return questions[0] if questions else "Can you tell me more about that?"
    
    def get_question_history(self) -> List[Dict[str, Any]]:
        """Get the history of questions generated by this engine."""
        return self.question_history.copy()
    
    def reset(self) -> None:
        """Reset the question history."""
        self.question_history = []
    
    async def generate_dynamic_question(self, user_input: str, session_id: Optional[str] = None, 
                                      conversation_history: Optional[List[Dict[str, Any]]] = None) -> str:
        """
        Generate a dynamic question using domain discovery intelligence.
        
        Args:
            user_input: User's natural language input
            session_id: Optional session identifier
            conversation_history: Previous conversation turns
            
        Returns:
            Intelligent question based on detected domain context
        """
        try:
            # Get or create domain context
            domain_context = await self._get_or_create_domain_context(user_input, session_id)
            
            # Generate question based on domain intelligence
            question = await self._generate_domain_aware_question(
                domain_context, user_input, conversation_history or []
            )
            
            # Track the question
            self.question_history.append({
                "type": QuestionType.CONCEPT_EXPLORATION.value,
                "domain": domain_context.domain,
                "confidence": domain_context.confidence,
                "question": question,
                "session_id": session_id
            })
            
            return question
            
        except Exception as e:
            # Fallback to traditional question generation
            parsed_response = self.parse_user_response(user_input)
            return self.generate_clarifying_question(
                parsed_response, conversation_history or [], "general"
            )
    
    async def get_domain_insights(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get domain insights for a session.
        
        Args:
            session_id: Session identifier
            
        Returns:
            Domain insights including context, recommendations, and expertise level
        """
        try:
            enhanced_context = domain_discovery_engine.get_active_domain_context(session_id)
            if not enhanced_context:
                return None
            
            # Generate component recommendations
            recommendations = await domain_discovery_engine.generate_component_recommendations(enhanced_context)
            
            return {
                "domain": enhanced_context.domain,
                "confidence": enhanced_context.confidence,
                "expertise_level": enhanced_context.expertise_level.value,
                "compliance_frameworks": enhanced_context.compliance_frameworks,
                "technologies": enhanced_context.knowledge.technologies,
                "concepts": enhanced_context.knowledge.concepts,
                "recommendations": [
                    {
                        "name": rec.name,
                        "description": rec.description,
                        "relevance_score": rec.relevance_score,
                        "domain_specific": rec.domain_specific
                    }
                    for rec in recommendations
                ],
                "related_domains": enhanced_context.related_domains
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    async def switch_domain_context(self, new_input: str, session_id: str) -> Dict[str, Any]:
        """
        Switch domain context for a session.
        
        Args:
            new_input: New user input indicating domain switch
            session_id: Session identifier
            
        Returns:
            Result of domain switch with new context information
        """
        try:
            result = await domain_discovery_engine.switch_domain(session_id, new_input)
            
            if result.success:
                # Update cached context
                self.domain_context_cache[session_id] = result.domain_context
                
                return {
                    "success": True,
                    "new_domain": result.domain_context.domain,
                    "confidence": result.domain_context.confidence,
                    "previous_domain": result.domain_context.metadata.get("previous_domain"),
                    "recommendations_count": len(result.recommendations)
                }
            else:
                return {"success": False, "error": result.error}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # Private helper methods for domain-aware questioning
    
    async def _get_or_create_domain_context(self, user_input: str, session_id: Optional[str]) -> EnhancedDomainContext:
        """Get existing domain context or create new one."""
        if session_id:
            # Check cache first
            cached_context = self.domain_context_cache.get(session_id)
            if cached_context:
                return cached_context
            
            # Check active contexts
            active_context = domain_discovery_engine.get_active_domain_context(session_id)
            if active_context:
                self.domain_context_cache[session_id] = active_context
                return active_context
        
        # Create new domain context
        activation_result = await domain_discovery_engine.activate_domain_expertise(
            user_input, session_id or "temp"
        )
        
        if activation_result.success:
            enhanced_context = activation_result.domain_context
            if session_id:
                self.domain_context_cache[session_id] = enhanced_context
            return enhanced_context
        
        # Fallback to basic context
        domain_context = await domain_discovery_engine.analyze_user_context(user_input, session_id)
        enhanced_context = await domain_discovery_engine.enhance_with_context_analysis(domain_context)
        return enhanced_context
    
    async def _generate_domain_aware_question(self, domain_context: EnhancedDomainContext, 
                                            user_input: str, conversation_history: List[Dict[str, Any]]) -> str:
        """Generate a question that's aware of the domain context."""
        
        # Domain-specific question templates
        domain_questions = {
            "healthcare": [
                "What type of healthcare data will your workflow process?",
                "Do you need to ensure HIPAA compliance for this workflow?",
                "Will this involve patient information or clinical data?",
                "What healthcare systems does this need to integrate with?"
            ],
            "finance": [
                "What type of financial data will be processed?",
                "Are there specific regulatory requirements to consider?",
                "Do you need real-time transaction processing?",
                "What financial systems need to be integrated?"
            ],
            "technology": [
                "What APIs or services do you need to integrate with?",
                "What's your preferred technology stack?",
                "Do you need real-time data processing?",
                "What authentication methods are required?"
            ],
            "education": [
                "What type of educational content will be processed?",
                "Who are the target learners for this workflow?",
                "Do you need to track learning progress or outcomes?",
                "What educational systems need integration?"
            ]
        }
        
        # Get domain-specific questions
        questions = domain_questions.get(domain_context.domain, [])
        
        # If we have domain-specific questions, use them
        if questions:
            # Select based on conversation history to avoid repetition
            question = self._select_non_repetitive_question(questions, conversation_history)
            return question
        
        # Fallback to technology or concept-based questions
        if domain_context.knowledge.technologies:
            tech = domain_context.knowledge.technologies[0]
            return f"I see you're working with {tech}. What specific capabilities do you need from this technology?"
        
        if domain_context.knowledge.concepts:
            concept = domain_context.knowledge.concepts[0]
            return f"You mentioned {concept}. Can you tell me more about how this fits into your workflow?"
        
        # Expertise-level adapted questions
        if domain_context.expertise_level.value == "beginner":
            return "What would you like this workflow to accomplish at a high level?"
        elif domain_context.expertise_level.value == "advanced":
            return "What are the key architectural considerations for this implementation?"
        else:
            return "What are the main components you think you'll need for this workflow?"
