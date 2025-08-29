"""
Example integration of Dynamic Domain Discovery Engine with Langflow Agent System.

This example demonstrates how the new domain-aware capabilities can be used
in the existing Socratic Agent workflow.
"""

import asyncio
from langflow.agent.socratic_engine import SocraticEngine
from langflow.agent.domain_discovery import domain_discovery_engine


async def demonstrate_dynamic_domain_discovery():
    """Demonstrate the Dynamic Domain Discovery Engine in action."""
    
    print("=== Dynamic Domain Discovery Engine Demo ===\n")
    
    # Initialize the Socratic Engine
    engine = SocraticEngine()
    
    # Example 1: Healthcare workflow
    print("1. Healthcare Workflow Detection:")
    healthcare_input = "I need to build a workflow for processing patient medical records with HIPAA compliance and integration with our EHR system"
    
    question = await engine.generate_dynamic_question(healthcare_input, "demo_session_1")
    print(f"Input: {healthcare_input}")
    print(f"Generated Question: {question}")
    
    insights = await engine.get_domain_insights("demo_session_1")
    if insights:
        print(f"Detected Domain: {insights['domain']}")
        print(f"Confidence: {insights['confidence']:.2f}")
        print(f"Expertise Level: {insights['expertise_level']}")
        print(f"Compliance Frameworks: {insights['compliance_frameworks']}")
        print(f"Technologies: {insights['technologies']}")
        print(f"Recommended Components: {len(insights['recommendations'])}")
        for rec in insights['recommendations'][:3]:  # Show top 3
            print(f"  - {rec['name']}: {rec['description']} (Score: {rec['relevance_score']:.2f})")
    
    print("\n" + "-"*60 + "\n")
    
    # Example 2: Finance workflow
    print("2. Finance Workflow Detection:")
    finance_input = "I want to create a real-time trading system that processes financial transactions with SOX compliance and risk management"
    
    question = await engine.generate_dynamic_question(finance_input, "demo_session_2")
    print(f"Input: {finance_input}")
    print(f"Generated Question: {question}")
    
    insights = await engine.get_domain_insights("demo_session_2")
    if insights:
        print(f"Detected Domain: {insights['domain']}")
        print(f"Confidence: {insights['confidence']:.2f}")
        print(f"Expertise Level: {insights['expertise_level']}")
        print(f"Technologies: {insights['technologies']}")
        print(f"Recommended Components: {len(insights['recommendations'])}")
        for rec in insights['recommendations'][:3]:  # Show top 3
            print(f"  - {rec['name']}: {rec['description']} (Score: {rec['relevance_score']:.2f})")
    
    print("\n" + "-"*60 + "\n")
    
    # Example 3: Domain switching
    print("3. Domain Switching Demo:")
    session_id = "demo_session_switch"
    
    # Start with healthcare
    await engine.generate_dynamic_question("I need healthcare workflow", session_id)
    print("Started with healthcare domain")
    
    # Switch to technology/API domain
    switch_result = await engine.switch_domain_context(
        "Actually, I need to build a REST API with microservices architecture", session_id
    )
    
    if switch_result['success']:
        print(f"Successfully switched from {switch_result['previous_domain']} to {switch_result['new_domain']}")
        
        new_question = await engine.generate_dynamic_question(
            "Need OAuth authentication and database integration", session_id
        )
        print(f"New domain-aware question: {new_question}")
    
    print("\n" + "-"*60 + "\n")
    
    # Example 4: Traditional vs Dynamic comparison
    print("4. Traditional vs Dynamic Question Comparison:")
    
    # Traditional approach
    traditional_question = engine.generate_initial_question("chatbot")
    print(f"Traditional question for 'chatbot': {traditional_question}")
    
    # Dynamic approach
    dynamic_question = await engine.generate_dynamic_question(
        "I need an AI chatbot for customer service in our healthcare clinic to help patients schedule appointments",
        "demo_session_compare"
    )
    print(f"Dynamic question: {dynamic_question}")
    
    print("\n=== Demo Complete ===")


async def demonstrate_component_recommendations():
    """Demonstrate intelligent component recommendations."""
    
    print("\n=== Component Recommendation Demo ===\n")
    
    # Test different domains and their recommendations
    test_cases = [
        {
            "input": "I need HIPAA-compliant patient data processing",
            "expected_domain": "healthcare"
        },
        {
            "input": "Build a financial trading system with real-time data",
            "expected_domain": "finance"
        },
        {
            "input": "Create REST API with OAuth and database connections",
            "expected_domain": "technology"
        }
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"{i}. Testing: {case['input']}")
        
        # Activate domain expertise
        result = await domain_discovery_engine.activate_domain_expertise(
            case['input'], f"rec_session_{i}"
        )
        
        if result.success:
            print(f"   Domain: {result.domain_context.domain}")
            print(f"   Confidence: {result.domain_context.confidence:.2f}")
            print(f"   Components recommended: {len(result.recommendations)}")
            
            # Show domain-specific components
            domain_specific = [r for r in result.recommendations if r.domain_specific]
            if domain_specific:
                print(f"   Domain-specific components: {len(domain_specific)}")
                for rec in domain_specific[:2]:
                    print(f"     - {rec.name}: {rec.description}")
        
        print()


if __name__ == "__main__":
    asyncio.run(demonstrate_dynamic_domain_discovery())
    asyncio.run(demonstrate_component_recommendations())