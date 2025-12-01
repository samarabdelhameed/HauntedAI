---
title: Testing Standards for HauntedAI
inclusion: always
---

# Testing Standards for HauntedAI

**Managed by Kiro** | Property-Based Testing & Quality Assurance

## Purpose

This steering document defines comprehensive testing standards for the HauntedAI platform. All code MUST follow these standards to ensure correctness and reliability.

## Testing Philosophy

We use a dual testing approach:
1. **Property-Based Testing (PBT)**: Verify universal properties across all inputs
2. **Unit Testing**: Verify specific examples and edge cases

Both are essential and complement each other.

## Property-Based Testing Standards

### When to Use PBT

Use property-based tests for:
- Universal properties that should hold for all valid inputs
- Round-trip operations (serialize/deserialize, encode/decode)
- Invariants that must be preserved
- State transitions that follow specific patterns
- Data transformations that preserve certain characteristics

### PBT Configuration

```typescript
// Minimum 100 iterations per property test
await fc.assert(
  fc.asyncProperty(/* ... */),
  { numRuns: 100 }
);
```

### Property Test Format

Every property test MUST include:

```typescript
// Feature: haunted-ai, Property X: [property description]
// Validates: Requirements Y.Z
describe('Property X: [property name]', () => {
  it('should [behavior description]', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generators
        fc.record({
          field: fc.string(),
          // ...
        }),
        async (input) => {
          // Reset mocks
          jest.clearAllMocks();
          
          // Test logic
          // ...
          
          // Assertions
          expect(/* ... */).toBe(/* ... */);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Common Property Patterns

#### 1. Round-Trip Properties
```typescript
// For any value, encoding then decoding should return the same value
encode(decode(x)) === x
```

#### 2. Invariant Properties
```typescript
// For any operation, certain properties remain constant
operation(x).invariant === x.invariant
```

#### 3. Idempotence Properties
```typescript
// Doing it twice = doing it once
f(f(x)) === f(x)
```

#### 4. Metamorphic Properties
```typescript
// Relationships between operations
len(filter(x)) <= len(x)
```

## Unit Testing Standards

### When to Use Unit Tests

Use unit tests for:
- Specific examples that demonstrate correct behavior
- Edge cases (empty inputs, boundary values, null/undefined)
- Error conditions and exception handling
- Integration points between components
- Mocking external dependencies

### Unit Test Structure

```typescript
describe('ComponentName', () => {
  let service: ServiceType;
  
  beforeEach(async () => {
    // Setup
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should handle specific case', async () => {
    // Arrange
    const input = /* ... */;
    
    // Act
    const result = await service.method(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

## Test Organization

### File Naming
- Property tests: `*.property.test.ts`
- Unit tests: `*.spec.ts` or `*.test.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `test-e2e-*.js`

### Test Location
- Co-locate tests with source files when possible
- Use `__tests__` directory for complex test suites
- Keep E2E tests in project root or `test/` directory

## Mock Management

### Rules for Mocking

1. **Reset mocks between iterations**:
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});

// Or in property tests
await fc.asyncProperty(/* ... */, async (input) => {
  jest.clearAllMocks();
  // ...
});
```

2. **Verify mock calls**:
```typescript
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith(expectedArgs);
```

3. **Don't over-mock**: Test real functionality when possible

## Coverage Requirements

- **Minimum coverage**: 80%
- **Property tests**: 100 iterations minimum
- **Critical paths**: 100% coverage required
- **Error handling**: All error paths must be tested

## Test Execution

### Running Tests

```bash
# All tests
npm test

# Property tests only
npm run test:property

# Unit tests only
npm run test:unit

# With coverage
npm run test:coverage

# Specific file
npm test -- filename.test.ts --runInBand --no-coverage
```

### CI/CD Integration

Tests MUST pass before:
- Committing code (pre-commit hook)
- Merging PRs (CI pipeline)
- Deploying to any environment

## Performance Standards

### Test Performance

- Individual tests should complete in < 1 second
- Property tests with 100 iterations should complete in < 5 seconds
- Full test suite should complete in < 2 minutes

### Optimization Tips

- Use `--runInBand` for faster execution in CI
- Mock expensive operations (API calls, database queries)
- Use test databases with minimal data
- Parallelize independent test suites

## Error Handling in Tests

### Testing Error Conditions

```typescript
// Test that errors are thrown
await expect(service.method(invalidInput)).rejects.toThrow();

// Test specific error messages
await expect(service.method(invalidInput))
  .rejects.toThrow('Expected error message');

// Test error types
await expect(service.method(invalidInput))
  .rejects.toThrow(CustomError);
```

### Testing Error Recovery

```typescript
it('should retry on failure', async () => {
  mockFn
    .mockRejectedValueOnce(new Error('First failure'))
    .mockRejectedValueOnce(new Error('Second failure'))
    .mockResolvedValueOnce('Success');
    
  const result = await serviceWithRetry.method();
  
  expect(mockFn).toHaveBeenCalledTimes(3);
  expect(result).toBe('Success');
});
```

## Documentation Requirements

Every test file MUST include:
- Purpose comment at the top
- Links to requirements being validated
- Property descriptions for PBT
- Example inputs/outputs for complex tests

## Kiro Integration

This testing approach showcases Kiro's capabilities:

- ✅ **Spec-driven**: Tests derived from design.md properties
- ✅ **Property-based**: Formal correctness verification
- ✅ **Automated**: Hooks run tests on save
- ✅ **Documented**: Clear traceability to requirements
- ✅ **Maintainable**: Consistent patterns across codebase

## Quality Checklist

Before committing tests:

- [ ] All property tests run 100+ iterations
- [ ] All tests have descriptive names
- [ ] All tests link to requirements
- [ ] Mocks are properly reset
- [ ] Error cases are covered
- [ ] Tests are fast (< 1s each)
- [ ] Coverage meets minimum 80%
- [ ] Documentation is complete

---

**Managed by Kiro** | HauntedAI Platform | Hackathon 2024
