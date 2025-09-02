# Manual Testing Guide: Langflow Architect Socratic Questioning System

## Overview
This guide provides step-by-step manual testing instructions for the Langflow Architect application's Socratic questioning system. Follow these tests to validate the AI-powered questioning engine and provide structured feedback.

## Prerequisites
1. **Application Running**: Ensure the app is running at `http://localhost:3000`
2. **Clean State**: Start with a fresh browser session (clear cache/cookies)
3. **Documentation Ready**: Have this guide open for reference

## Test Structure
Each test includes:
- **Question to Ask**: Exact text to type in the chat
- **Expected Output**: What the AI should respond with
- **Success Criteria**: How to determine if the test passed
- **Feedback Format**: How to report results

---

## Test Suite 1: Basic Questioning Engine

### Test 1.1: Domain Detection and Question Generation
**Objective**: Verify the system can detect domain expertise and generate appropriate questions.

#### Step 1: Healthcare Domain Test
**Question to Ask:**
```
I need help building a patient data workflow for a healthcare system
```

**Expected Output:**
- AI should detect "healthcare" domain
- Should generate domain-specific questions about:
  - HIPAA compliance requirements
  - Patient data types needed
  - Integration with existing systems
  - Security and privacy concerns

**Success Criteria:**
- ✅ Response mentions healthcare/medical terminology
- ✅ Questions are domain-specific (not generic)
- ✅ At least 3-5 relevant questions generated
- ✅ Response time under 10 seconds

**Feedback Format:**
```
Test 1.1 - Healthcare Domain:
- Domain Detection: [PASS/FAIL] - [Brief description]
- Question Relevance: [PASS/FAIL] - [Brief description]  
- Response Quality: [PASS/FAIL] - [Brief description]
- Response Time: [X seconds]
- Actual Response: [Copy the full AI response here]
```

---

#### Step 2: Finance Domain Test
**Question to Ask:**
```
I want to create an algorithmic trading system with risk management
```

**Expected Output:**
- AI should detect "finance/trading" domain
- Should generate questions about:
  - Trading strategies and algorithms
  - Risk management parameters
  - Regulatory compliance (SEC, FINRA)
  - Market data requirements
  - Performance metrics

**Success Criteria:**
- ✅ Response mentions finance/trading terminology
- ✅ Questions address technical trading concepts
- ✅ Includes risk management considerations
- ✅ Response time under 10 seconds

**Feedback Format:**
```
Test 1.2 - Finance Domain:
- Domain Detection: [PASS/FAIL] - [Brief description]
- Technical Accuracy: [PASS/FAIL] - [Brief description]
- Question Depth: [PASS/FAIL] - [Brief description]  
- Response Time: [X seconds]
- Actual Response: [Copy the full AI response here]
```

---

### Test 1.3: Technology Domain Test
**Question to Ask:**
```
I need to build a microservices architecture for a high-traffic e-commerce platform
```

**Expected Output:**
- AI should detect "technology/software architecture" domain
- Should generate questions about:
  - Service decomposition strategies
  - Database architecture (SQL vs NoSQL)
  - API design and communication patterns
  - Scalability and performance requirements
  - DevOps and deployment strategies

**Success Criteria:**
- ✅ Response uses appropriate technical terminology
- ✅ Questions cover architectural considerations
- ✅ Addresses scalability concerns
- ✅ Response time under 10 seconds

**Feedback Format:**
```
Test 1.3 - Technology Domain:
- Domain Detection: [PASS/FAIL] - [Brief description]
- Technical Depth: [PASS/FAIL] - [Brief description]
- Architecture Focus: [PASS/FAIL] - [Brief description]
- Response Time: [X seconds]
- Actual Response: [Copy the full AI response here]
```

---

## Test Suite 2: Expertise Level Detection

### Test 2.1: Beginner Level Detection
**Question to Ask:**
```
I'm new to programming and want to build a simple website. I don't know where to start.
```

**Expected Output:**
- AI should detect beginner level
- Should ask basic, foundational questions:
  - What type of website content?
  - Do you have any programming experience?
  - What's your timeline and budget?
  - Would you prefer a website builder or custom code?

**Success Criteria:**
- ✅ Questions are beginner-friendly (no jargon)
- ✅ Covers fundamental concepts
- ✅ Provides helpful context/explanations
- ✅ Encouraging and supportive tone

**Feedback Format:**
```
Test 2.1 - Beginner Level:
- Level Detection: [PASS/FAIL] - [Brief description]
- Question Simplicity: [PASS/FAIL] - [Brief description]
- Helpful Context: [PASS/FAIL] - [Brief description]
- Tone Assessment: [PASS/FAIL] - [Brief description]
- Actual Response: [Copy the full AI response here]
```

---

### Test 2.2: Expert Level Detection
**Question to Ask:**
```
I need to implement a distributed consensus algorithm using Raft protocol with Byzantine fault tolerance for a blockchain network with sharding capabilities and zero-knowledge proof integration.
```

**Expected Output:**
- AI should detect expert level
- Should ask sophisticated technical questions:
  - Specific consensus requirements and network assumptions
  - Byzantine fault tolerance threshold parameters
  - Sharding strategy and cross-shard communication
  - ZK-proof integration points and verification costs
  - Performance and scalability targets

**Success Criteria:**
- ✅ Questions match expert-level complexity
- ✅ Uses advanced technical terminology correctly
- ✅ Addresses sophisticated architectural concerns
- ✅ Shows understanding of domain complexity

**Feedback Format:**
```
Test 2.2 - Expert Level:
- Level Detection: [PASS/FAIL] - [Brief description]
- Technical Sophistication: [PASS/FAIL] - [Brief description]
- Domain Knowledge: [PASS/FAIL] - [Brief description]
- Question Relevance: [PASS/FAIL] - [Brief description]
- Actual Response: [Copy the full AI response here]
```

---

## Test Suite 3: Adaptive Questioning

### Test 3.1: Follow-up Question Adaptation
**Multi-step Test:**

**Step 1 - Initial Question:**
```
I want to build a mobile app
```

**Step 2 - Follow-up Response:**
```
It's for iOS and Android, needs real-time chat, user authentication, and payment processing
```

**Expected Behavior:**
- First response should ask basic clarifying questions
- Second response should adapt to the technical requirements mentioned
- Questions should become more specific about:
  - Real-time chat implementation (WebSocket, Firebase, etc.)
  - Authentication methods (OAuth, JWT, biometric)
  - Payment gateway integration (Stripe, Square, etc.)
  - Cross-platform development approach

**Success Criteria:**
- ✅ Questions evolve based on user input
- ✅ Second set of questions is more technical
- ✅ Addresses specific technologies mentioned
- ✅ Shows contextual understanding

**Feedback Format:**
```
Test 3.1 - Adaptive Questioning:
- Context Retention: [PASS/FAIL] - [Brief description]
- Question Evolution: [PASS/FAIL] - [Brief description]
- Technical Depth Progression: [PASS/FAIL] - [Brief description]
- Step 1 Response: [Copy first AI response here]
- Step 2 Response: [Copy second AI response here]
```

---

## Test Suite 4: Error Handling and Edge Cases

### Test 4.1: Vague Input Handling
**Question to Ask:**
```
I need help with stuff
```

**Expected Output:**
- AI should politely ask for clarification
- Should provide examples of how to be more specific
- Should offer different domain options
- Should maintain helpful tone

**Success Criteria:**
- ✅ Doesn't provide generic unhelpful response
- ✅ Guides user toward more specific input
- ✅ Offers concrete examples
- ✅ Maintains engagement

**Feedback Format:**
```
Test 4.1 - Vague Input:
- Clarification Request: [PASS/FAIL] - [Brief description]
- Guidance Quality: [PASS/FAIL] - [Brief description]
- User Experience: [PASS/FAIL] - [Brief description]
- Actual Response: [Copy the full AI response here]
```

---

### Test 4.2: Mixed Domain Input
**Question to Ask:**
```
I need a healthcare app that uses blockchain for patient records and AI for diagnosis, plus it needs to handle financial transactions
```

**Expected Output:**
- AI should recognize multiple domains (healthcare, blockchain, AI, finance)
- Should prioritize primary domain (healthcare)
- Should ask questions that address domain intersections
- Should handle complexity appropriately

**Success Criteria:**
- ✅ Identifies multiple domains
- ✅ Maintains coherent questioning approach
- ✅ Addresses domain intersections
- ✅ Doesn't get confused by complexity

**Feedback Format:**
```
Test 4.2 - Mixed Domain:
- Multi-domain Recognition: [PASS/FAIL] - [Brief description]
- Prioritization: [PASS/FAIL] - [Brief description]
- Coherence: [PASS/FAIL] - [Brief description]
- Actual Response: [Copy the full AI response here]
```

---

## Test Suite 5: User Experience

### Test 5.1: Conversation Flow
**Multi-step Conversation Test:**

**Step 1:**
```
I want to build a data analytics platform
```

**Step 2:** (Respond to AI's questions with)
```
It's for financial data, needs real-time processing, and will serve about 1000 concurrent users
```

**Step 3:** (Respond to next set of questions with)
```
We need compliance with SOX and GDPR, data sources include market feeds and internal databases
```

**Expected Behavior:**
- Each response should build on previous context
- Questions should become increasingly specific
- Should maintain conversation thread
- Should reference previous answers appropriately

**Success Criteria:**
- ✅ Maintains context throughout conversation
- ✅ Questions become more targeted
- ✅ References previous responses
- ✅ Logical progression of inquiry

**Feedback Format:**
```
Test 5.1 - Conversation Flow:
- Context Continuity: [PASS/FAIL] - [Brief description]
- Question Progression: [PASS/FAIL] - [Brief description]
- Memory Retention: [PASS/FAIL] - [Brief description]
- Step 1 Response: [Copy here]
- Step 2 Response: [Copy here]  
- Step 3 Response: [Copy here]
```

---

## Reporting Instructions

### How to Provide Feedback

1. **Create a Test Results Document** with the following format:

```markdown
# Manual Testing Results - [Date]

## Testing Environment
- Browser: [Chrome/Firefox/Safari/Edge + Version]
- OS: [Windows/Mac/Linux + Version]
- Screen Resolution: [e.g., 1920x1080]
- Time Started: [timestamp]
- Time Completed: [timestamp]

## Test Results Summary
- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Critical Issues: [X]

## Individual Test Results
[Insert each test result using the feedback formats above]

## Overall Assessment
- **Best Performing Areas**: [List what worked well]
- **Areas Needing Improvement**: [List issues found]
- **Critical Bugs**: [List any blocking issues]
- **User Experience Notes**: [General UX feedback]

## Additional Observations
[Any other notes, suggestions, or observations]
```

2. **Include Screenshots** for:
   - Any UI issues or unexpected behavior
   - Examples of good question generation
   - Error states or problems

3. **Response Time Tracking**: Note if any responses take longer than 15 seconds

4. **Browser Console**: Check for JavaScript errors (F12 → Console tab)

### Next Steps After Testing

1. **Share Results**: Provide the test results document
2. **Prioritize Issues**: We'll categorize findings by severity
3. **Plan Improvements**: Create action items for fixes
4. **Retest**: Schedule follow-up testing after improvements

---

## Quick Reference Commands

**Clear Chat History:**
```
Clear conversation and start fresh
```

**Test Specific Domain:**
```
I need help with [domain] specifically for [use case]
```

**Test Expertise Level:**
```
[Use technical jargon for expert test, simple language for beginner test]
```

**Test Follow-up:**
```
Based on your questions, here are more details: [provide specific technical details]
```

---

## Troubleshooting

**If the app won't load:**
1. Check if `npm run dev` is running
2. Verify `http://localhost:3000` is accessible
3. Clear browser cache and cookies
4. Try a different browser

**If chat doesn't respond:**
1. Check browser console for errors (F12)
2. Wait 30 seconds for response
3. Try refreshing the page
4. Check network connectivity

**If responses are poor quality:**
1. Note the specific input that caused issues
2. Try rephrasing the question
3. Document the exact response received
4. Include in feedback report

---

*This testing guide ensures comprehensive validation of the Socratic questioning system. Follow each test methodically and provide detailed feedback for optimal system improvement.*
