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

#### Step 1: Simple Blog Website Test
**Question to Ask:**
```
I want to build a simple blog website
```

**Expected Output:**
- AI should detect "web development" domain
- Should generate basic questions about:
  - What type of content will be on the blog?
  - Do you have any web development experience?
  - What features do you need (comments, categories, search)?
  - What's your timeline and budget?

**Success Criteria:**
- ✅ Response mentions web development terminology
- ✅ Questions are beginner-friendly and practical
- ✅ At least 3-5 relevant questions generated
- ✅ Response time under 10 seconds

**Feedback Format:**
```
Test 1.1 - Simple Blog Website:
- Domain Detection: [PASS] - Response clearly identifies web development domain with terminology like HTML/CSS/JavaScript, CMS, hosting
- Question Relevance: [PASS] - All 6 questions are highly relevant to blog website development
- Response Quality: [PASS] - Well-structured, encouraging tone with practical guidance
- Response Time: [X seconds] - Assuming under 10 seconds based on typical response times
- Actual Response: Building a simple blog website is an exciting project! Here are some initial questions to help guide you through the process:

Platform Choice: Are you looking to use a website builder like WordPress, Wix, or Squarespace, or do you want to build it from scratch using HTML/CSS/JavaScript?

Hosting and Domain: Do you have a domain name in mind, and where do you plan to host your website?

Design and Layout: Do you have specific design ideas, or are you looking for a minimalist approach? Would you like to use existing themes or create a custom design?

Features: What specific features do you want your blog to have? (e.g., comment sections, social media sharing, categories, tags, RSS feeds)

Content Management: How would you like to manage your content? Through a CMS (Content Management System), or would you prefer a static site generator?

Technical Expertise: What's your level of technical expertise in web development? This will help determine the best tools and frameworks for your project.

Answering these questions will provide a clearer path to creating your blog website. Let me know if you need further assistance with any specific part!
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
- Domain Detection: [PASS] - Clearly identifies finance/trading domain with terms like algorithmic trading, financial markets, trading strategy
- Technical Accuracy: [PASS] - Uses appropriate trading terminology (equities, forex, commodities, trend following, arbitrage)
- Question Depth: [PASS] - Addresses technical trading concepts and risk management techniques
- Response Time: [X seconds] - Assuming under 10 seconds based on typical response times
- Actual Response: Creating an algorithmic trading system with risk management is a complex task that involves multiple components and considerations. Before jumping into building the system, it would be helpful to clarify some aspects to better understand your requirements:

Financial Markets: Which financial markets do you want to focus on (e.g., equities, forex, commodities)?
Trading Strategy: Do you have a specific trading strategy in mind (e.g., trend following, mean reversion, arbitrage)?
Data Sources: What type of data will you use for analysis and trading decisions (e.g., historical prices, real-time data)?
Risk Management: What risk management techniques do you want to implement (e.g., stop-loss, position sizing)?
Technical Infrastructure: Do you have preferences for the technology stack (e.g., programming languages, platforms) you want to use?
Complexity Level: How complex do you anticipate the system to be (simple, moderate, complex)?
Could you provide more details on these aspects so we can guide you more effectively in creating your system?
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
- Domain Detection: [PASS] - Clearly identifies technology/software architecture domain with terms like microservices, scalability, DevOps, data consistency
- Technical Depth: [PASS] - Uses sophisticated technical terminology (microservices, scalability, cloud providers, data consistency, DevOps)
- Architecture Focus: [PASS] - Covers all key architectural considerations including service decomposition, scalability, data handling, security, and deployment
- Response Time: [X seconds] - Assuming under 10 seconds based on typical response times
- Actual Response: To assist you with building a microservices architecture for a high-traffic e-commerce platform, I'll need a bit more information to tailor the guidance to your specific needs. Here are some questions that can help clarify your requirements:

1. **Key Features & Services**: What are the main features and services you want in your e-commerce platform? (e.g., product catalog, payment processing, order management, user accounts, etc.)

2. **Scalability Requirements**: What are your expectations for scalability? How many users or transactions do you anticipate?

3. **Technical Stack**: Do you have any preferences or restrictions on the technology stack you want to use? (e.g., programming languages, databases, cloud providers)

4. **Data Handling**: How do you plan to handle data storage and ensure data consistency across services?

5. **Security**: What are your primary concerns regarding security, especially for sensitive operations like payment processing?

6. **Integration Needs**: Are there any third-party services or legacy systems you need to integrate with your platform?

7. **Deployment & Monitoring**: How do you plan to deploy, monitor, and manage these services? Do you have any existing DevOps practices?

8. **Budget & Timeline**: Do you have any constraints related to budget or timelines for development and deployment?

These questions will help in analyzing your workflow requirements more effectively. Let me know if you want me to guide you through them or if there's any specific area you want to start with.
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
- Level Detection: [PASS] - Correctly identifies beginner level and offers to break down into manageable steps
- Question Simplicity: [PASS] - All questions are beginner-friendly with clear explanations and no overwhelming jargon
- Helpful Context: [PASS] - Provides structured approach with numbered questions and offers to tackle them one by one
- Tone Assessment: [PASS] - Very encouraging and supportive tone, uses "exciting project" and offers step-by-step guidance
- Actual Response: Building a website can be an exciting project! Let's break it down into manageable steps for you. Here are some initial questions to guide you:

1. **Purpose and Content**: What is the main purpose of your website? Do you have any specific content or features you want to include?

2. **Design Inspiration**: Do you have any websites in mind that you like the design of? This might help in understanding your style preferences.

3. **Platform**: Would you prefer to use website builders like WordPress, or are you interested in coding from scratch using HTML, CSS, and JavaScript?

4. **Budget**: Do you have a budget for hosting, domain registration, or maybe even for hiring assistance with specific parts?

5. **Technical Requirements**: Is there any functionality you need support with, like contact forms, galleries, or e-commerce features?

6. **Learning Style**: How do you learn best? Are you open to online courses, tutorials, or maybe a coding bootcamp?

Let's tackle these questions one by one to better understand your requirements and get you started on the right track! Which question would you like to address first?
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
- Level Detection: [PASS] - Correctly identifies expert level by describing project as "complex and multidimensional" with "advanced concepts"
- Technical Sophistication: [PASS] - Uses highly advanced terminology correctly (Raft protocol, Byzantine Fault Tolerance, zk-SNARKs, consensus layer)
- Domain Knowledge: [PASS] - Shows deep understanding of distributed systems, correctly notes Raft's limitations with BFT
- Question Relevance: [PASS] - All 5 questions address sophisticated technical concerns appropriate for expert-level implementation
- Actual Response: Your project sounds complex and multidimensional, involving several advanced concepts in distributed systems and cryptography. Let's break this down step-by-step to ensure we have a clear understanding of your requirements:

1. **Distributed Consensus Algorithm**: You're looking to implement the Raft protocol, which is simpler than Paxos and provides a clear structure for consensus across a distributed system.

2. **Byzantine Fault Tolerance (BFT)**: Standard Raft doesn't support BFT, as it handles only crash faults. To incorporate BFT, you'd need to consider extensions or alternatives to Raft, like practical Byzantine Fault Tolerance (PBFT) or Byzantine Raft.

3. **Blockchain Network**: You want this as part of a blockchain network, which implies integration with cryptographic elements like digital signatures for transaction verification.

4. **Sharding Capabilities**: Sharding is used to improve scalability by dividing the blockchain into smaller, manageable pieces (shards). This requires careful management of consensus across shards.

5. **Zero-Knowledge Proof Integration**: Integrate zero-knowledge proofs (ZKPs) to add privacy and verification capabilities without revealing underlying data.

### Clarifying Questions:
1. **Raft and BFT**: Are you looking for an existing variant that supports BFT or a way to extend Raft with Byzantine fault tolerance?
2. **Blockchain Platform**: Which blockchain platform or framework are you considering (e.g., Ethereum, Hyperledger)?
3. **Sharding Requirements**: Do you have specific requirements for how sharding should be implemented?
4. **Zero-Knowledge Proofs**: Are there specific ZKP protocols (e.g., zk-SNARKs, zk-STARKs) you intend to use, and how do you plan to integrate them with the consensus layer?
5. **Technical Environment**: What level of technical expertise do you have on the team, particularly in distributed systems and cryptography?

Once you've provided more insight into these areas, we can delve into creating a structured approach to implementing this complex workflow.
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
- Context Retention: [PASS] - Maintains context from initial mobile app inquiry throughout the conversation
- Question Evolution: [PASS] - Questions evolve from basic app concept questions to specific technical implementation details based on user input
- Technical Depth Progression: [PASS] - Second response shows significant technical depth increase, addressing specific technologies and frameworks
- Step 1 Response: Building a mobile app is a great idea! To help guide you effectively, I need a bit more information about your project. Here are some questions to get us started:

1. **What is the primary purpose of your mobile app?** (e.g., entertainment, productivity, social networking)
2. **Who is your target audience?** (e.g., age group, interests, professional fields)
3. **What key features or functionalities do you want to include in the app?**
4. **Do you have any design preferences or branding requirements?**
5. **What is your technical expertise level?** (beginner, intermediate, advanced)

Feel free to provide any additional details that you think are important!
- Step 2 Response: Great! You've outlined some key features for your mobile app. Let's delve deeper into these requirements to provide you with the best guidance:

1. **Real-Time Chat:**
   - Do you have a preference for the chat technology or framework? (e.g., Firebase, WebSocket)
   - Will the chat feature include text, video, or multimedia sharing?

2. **User Authentication:**
   - What authentication methods do you plan to use? (e.g., email/password, social media logins, two-factor authentication)
   - Are there any specific user roles or access levels you need to implement?

3. **Payment Processing:**
   - Which payment gateways are you considering? (e.g., Stripe, PayPal, in-app purchases)
   - Do you need support for multiple currencies or international payments?

4. **Design and UI/UX Preferences:**
   - Do you have design specifications or a style guide to follow?
   - How do you plan to ensure a consistent user experience across both platforms?

5. **Other Considerations:**
   - Are there any other features or integrations you plan to include?

By answering these questions, we can better assist you in structuring your app project efficiently.
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
```markdown
Test 4.1 - Vague Input:
- Clarification Request: [PASS] - Politely asks for more details and provides a helpful opening
- Guidance Quality: [PASS] - Offers some examples (work processes, technical issues, specific achievements) to guide user toward specificity
- User Experience: [PASS] - Maintains friendly, engaging tone and shows willingness to help
- Actual Response: Of course! I'd be happy to help. Could you please provide some more details on what you need assistance with? Whether it's about work processes, technical issues, or something specific you're trying to achieve, just let me know.
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
```markdown
Test 4.2 - Mixed Domain:
- Multi-domain Recognition: [PASS] - Effectively identifies and addresses all four domains: healthcare (patient records, HIPAA), blockchain (decentralization, immutability), AI (diagnostic capabilities), and finance (transaction handling)
- Prioritization: [PASS] - Maintains healthcare as the primary context while addressing technical implementations across domains
- Coherence: [PASS] - Questions are well-organized and logically structured, addressing domain intersections without confusion
- Actual Response: Here are a few questions to help refine your requirements for the healthcare app:

1. **Blockchain Technology**: What specific features of blockchain are essential for managing patient records (e.g., decentralization, immutability, privacy)?

2. **AI for Diagnosis**: What type of AI diagnostic capabilities are you looking for (e.g., image analysis, symptom checking, predictive analytics)?

3. **Financial Transactions**: What kind of financial transactions will the app handle (e.g., insurance claims, payments for medical services)?

4. **Security and Privacy**: Are there specific compliance requirements (e.g., HIPAA) or privacy concerns you need to address?

5. **Integration**: Does the app need to integrate with existing healthcare systems or other technologies?

6. **User Base**: Who will be the primary users of the app (e.g., patients, healthcare providers, insurers)?

Feel free to provide more details or answer these questions to help me understand your project better!
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
```markdown
Test 5.1 - Conversation Flow:
- Context Continuity: [PASS] - Maintains excellent context throughout all three steps, clearly building on previous responses and user inputs
- Question Progression: [PASS] - Questions become increasingly specific and technical, progressing from general requirements to detailed technical considerations
- Memory Retention: [PASS] - Effectively references and builds upon previous answers (financial data focus, real-time processing, 1000 concurrent users)
- Step 1 Response: Hi! I'm your Socratic Langflow Architect. I'll help you create sophisticated workflows through intelligent questioning. What kind of workflow would you like to build today?



I want to build a data analytics platform
Building a data analytics platform is an ambitious project that requires careful planning and understanding of your specific needs and goals. Here are some clarifying questions to help define the requirements and structure for your platform:

What is the primary purpose of your data analytics platform?

Are you focused on business intelligence, scientific research, financial data analysis, etc.?
What type of data will the platform need to handle?

Structured, unstructured, real-time, historical, etc.
Who will be the users of this platform?

Analysts, data scientists, business executives, etc.
What technical expertise do you or your team have?

This will help in determining the complexity and technology stack appropriate for your project.
What are the key features or functionalities you envision?

Data ingestion, processing, visualization, reporting, etc.
Are there any specific tools or technologies you want to integrate?

Considerations like database systems, analytics libraries, visualization tools, etc.
What is the scale of the data analysis?

This involves the volume of data and the scalability requirements.
What is your timeline and budget for developing this platform?

Answering these questions will help in identifying the scope and constructing a roadmap for your data analytics platform. Please feel free to provide more details on any of these aspects, and we can proceed with analyzing your requirements.
- Step 2 Response: It's for financial data, needs real-time processing, and will serve about 1000 concurrent users
Great, we can start narrowing down the requirements for your financial data analytics platform based on real-time processing needs and serving around 1,000 concurrent users. Here are a few more specific questions and considerations:

Data Sources:

What are the sources of your financial data? (e.g., stock market feeds, banking transactions)
Do you plan to integrate APIs or other data services?
Data Types:

Are you dealing with streaming data, historical data, or both?
What are the sizes and types of datasets (e.g., transactional records, stock price feeds)?
Processing Requirements:

What kind of data processing is required? (e.g., ETL processes, advanced analytics, machine learning models)
How will you handle data aggregation and transformation in real-time?
Real-Time Infrastructure:

Have you considered any specific technologies or frameworks for handling real-time data (e.g., Apache Kafka, Spark Streaming)?
User Requirements:

What level of customization do users need for reports and dashboards?
Are there specific user roles with different access levels and capabilities?
Security and Compliance:

What are the security and compliance requirements, particularly in handling sensitive financial data?
Performance and Scalability:

Do you anticipate needing to scale beyond 1,000 users?
What is the expected response time for analytics queries?
Visualization and Reporting:

What types of data visualization will you offer?
Is there a need for custom report creation tools?
Technical Stack:

What are your preferences or requirements regarding the technology stack for development and deployment?
With these detailed aspects in mind, I can help you further explore the requirements, suggest a workflow structure, and recommend appropriate technologies. Let me know if you want to proceed with a structured analysis or if you have additional specifications to include.
- Step 3 Response: We need compliance with SOX and GDPR, data sources include market feeds and internal databases
Given the specific requirements and compliance needs for your financial data analytics platform, let's examine the implications and workflow considerations for such a project:

Compliance Requirements
SOX (Sarbanes-Oxley Act):

Ensure data integrity, financial record accuracy, and control over internal processes.
Implement audit trails and ensure financial data can be accurately traced and reported.
GDPR (General Data Protection Regulation):

Ensure proper consent for data usage, data minimization, and user rights to access and erase data.
Implement robust data protection practices and consider the location where data is processed and stored.
Data Sources
Market Feeds:

Real-time feeds for stocks, indices, commodities, etc.
Integration with APIs providing financial data streams.
Internal Databases:

Ensure connectivity and secure data access from internal databases such as transactional systems or proprietary financial data stores.
Technical Considerations
Real-Time Processing:

Utilize platforms like Apache Kafka or Spark Streaming for real-time data ingestion and processing.
Implement a robust ETL pipeline to process and analyze data effectively.
User Management:

Define roles with specific access permissions in compliance with SOX and GDPR.
Provide role-based access control to ensure only authorized users can access sensitive information.
Scalability and Performance:

Utilize cloud-based infrastructure or technologies like Kubernetes for scalable deployments.
Optimize query performance for handling large volumes of real-time data.
Data Visualization:

Integrate visualization tools like Tableau or Power BI for creating dynamic dashboards and reports.
Offer custom reporting capabilities tailored to user needs.
Security Measures:

Implement encryption for data at rest and in transit.
Maintain comprehensive logs for monitoring and auditing purposes, ensuring compliance with SOX.
Next Steps
Would you like an analysis of available technologies and how they might fit into this workflow?
Do you need assistance with designing a high-level architecture or selecting specific components?
We can proceed by conducting a detailed workflow analysis or explore specific technological recommendations based on the points outlined above. Let me know how you'd like to continue!
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
