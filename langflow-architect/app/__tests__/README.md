# Test Suite Documentation

## Socratic Langflow Architect - Comprehensive Test Suite

This test suite provides comprehensive coverage for the Socratic Langflow Architect application, including unit tests, integration tests, end-to-end tests, and performance tests.

## Test Structure

```
__tests__/
├── components/           # React component tests
│   └── Home.test.tsx    # Main page component tests
├── api/                 # API route tests
│   └── copilotkit.test.ts # CopilotKit API endpoint tests
├── e2e/                 # End-to-end tests
│   ├── main-interface.spec.ts      # Main UI functionality
│   ├── copilotkit-integration.spec.ts # CopilotKit integration
│   └── performance.spec.ts         # Performance tests
└── utils/               # Utility functions and helpers
    ├── action-handlers.test.ts     # CopilotKit action handler tests
    └── test-helpers.ts            # Shared test utilities
```

## Test Categories

### 1. Unit Tests (`npm run test`)
- **Component Tests**: Test React components in isolation
- **Action Handler Tests**: Test CopilotKit action handler logic
- **Utility Function Tests**: Test helper functions and utilities

**Coverage Areas:**
- Component rendering and state management
- CopilotKit action registration and execution
- Workflow analysis logic
- Question generation algorithms
- Langflow JSON generation
- Error handling and edge cases

### 2. Integration Tests
- **API Integration**: Test CopilotKit API endpoints
- **Component Integration**: Test component interaction with CopilotKit
- **Environment Configuration**: Test environment variable handling

### 3. End-to-End Tests (`npm run test:e2e`)
- **User Interface**: Complete user interaction workflows
- **Responsive Design**: Multi-device compatibility testing
- **Accessibility**: WCAG compliance verification
- **Performance**: Load times, memory usage, and responsiveness

### 4. Performance Tests
- **Load Performance**: Page load time measurement
- **Memory Management**: Memory leak detection
- **Network Efficiency**: Resource loading optimization
- **Responsive Performance**: Multi-viewport performance testing

## Test Commands

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run end-to-end tests with UI
npm run test:e2e:ui

# Run all tests (unit + e2e)
npm run test:all
```

## Test Features

### Comprehensive Coverage
- ✅ Component rendering and functionality
- ✅ CopilotKit integration and actions
- ✅ API endpoint testing
- ✅ Responsive design verification
- ✅ Accessibility compliance
- ✅ Performance benchmarking
- ✅ Error handling and edge cases
- ✅ Cross-browser compatibility
- ✅ Network condition simulation
- ✅ Memory leak detection

### Advanced Testing Patterns
- **Mocking**: Comprehensive mocking of external dependencies
- **Fixtures**: Reusable test data and scenarios
- **Helpers**: Shared utility functions for complex test scenarios
- **Accessibility**: Automated accessibility testing
- **Performance**: Lighthouse-style performance auditing
- **Visual**: Layout and responsive design verification

### Test Data and Scenarios

#### Workflow Categories Tested
- **Simple**: Basic workflows with minimal complexity
- **Moderate**: Multi-step workflows with conditional logic
- **Complex**: Advanced workflows with monitoring and scalability

#### User Expertise Levels
- **Beginner**: Basic questions and simple guidance
- **Intermediate**: Detailed technical questions
- **Advanced**: Architectural and optimization questions

#### Domain Coverage
- E-commerce systems
- Healthcare workflows
- Financial services
- Content generation
- Data processing
- Automation workflows

## Mock Data and Fixtures

### Mock Workflow Data
```typescript
{
  description: 'E-commerce product recommendation system',
  category: 'automation',
  complexity: 'moderate',
  timestamp: '2025-01-01T00:00:00.000Z'
}
```

### Mock Questions
- Workflow triggers and data sources
- Error handling and validation
- Integration requirements
- Performance considerations

### Mock Langflow JSON
Complete Langflow workflow structures with:
- Input/Output nodes
- LLM processing components
- Conditional logic nodes
- Data transformation steps

## Performance Benchmarks

### Load Time Targets
- Initial page load: < 5 seconds
- Viewport changes: < 1 second
- API responses: < 2 seconds

### Memory Usage Targets
- Initial memory footprint: < 50MB
- Memory growth after 10 reloads: < 50MB additional
- No memory leaks detected

### Accessibility Standards
- WCAG 2.1 AA compliance
- Proper heading hierarchy (h1 → h2 → h3)
- Semantic HTML structure
- Keyboard navigation support

## CI/CD Integration

### GitHub Actions Ready
```yaml
- name: Run Tests
  run: |
    npm ci
    npm run test:coverage
    npm run test:e2e
```

### Test Reporting
- Jest coverage reports (HTML, LCOV)
- Playwright test reports (HTML)
- Performance metrics tracking
- Accessibility audit results

## Environment Configuration

### Test Environment Variables
```bash
OPENAI_API_KEY=test-api-key
COPILOTKIT_DEBUG=true
NODE_ENV=test
```

### Browser Configuration
- Chromium (primary)
- Firefox (compatibility)
- WebKit (Safari compatibility)

## Maintenance and Updates

### Regular Test Updates
1. **Weekly**: Review test coverage and add missing scenarios
2. **Monthly**: Update performance benchmarks
3. **Quarterly**: Review and update accessibility standards
4. **Release**: Full regression testing suite

### Test Quality Metrics
- **Coverage Target**: > 90% line coverage
- **Performance**: All tests complete in < 10 minutes
- **Reliability**: < 1% flaky test rate
- **Maintainability**: DRY principles and shared utilities

## Troubleshooting

### Common Issues
1. **Environment Variables**: Ensure `.env.local` is properly configured
2. **Port Conflicts**: Verify localhost:3000 is available for E2E tests
3. **Dependencies**: Run `npm ci` for clean dependency installation
4. **Timeouts**: Increase timeout values for slower systems

### Debug Commands
```bash
# Debug specific test
npm run test -- --testNamePattern="specific test name"

# Debug E2E with browser UI
npm run test:e2e:ui

# Run tests with verbose output
npm run test -- --verbose
```

This comprehensive test suite ensures the Socratic Langflow Architect application is robust, performant, accessible, and maintainable across all supported platforms and use cases.
