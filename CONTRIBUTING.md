# Contributing to HauntedAI

Thank you for your interest in contributing to HauntedAI! This document provides guidelines and instructions for contributing.

## 🎯 Development Philosophy

HauntedAI follows **Spec-Driven Development** with **Property-Based Testing**:

1. **Requirements First**: Define what the system should do (EARS format)
2. **Properties Second**: Define correctness properties
3. **Tests Third**: Write property-based tests
4. **Code Last**: Implement to make tests pass

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git
- Kiro IDE (recommended)

### Setup

```bash
# Fork and clone
git clone https://github.com/yourusername/haunted-ai.git
cd haunted-ai

# Install dependencies
npm install

# Start services
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
cd apps/api
npm run db:migrate

# Run tests
npm test
```

## 📝 Contribution Workflow

### 1. Create an Issue

Before starting work, create an issue describing:
- What you want to add/fix
- Why it's needed
- How you plan to implement it

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Follow Spec-Driven Development

#### Step 1: Update Requirements

Edit `.kiro/specs/haunted-ai/requirements.md`:

```markdown
### Requirement X: Your Feature

**User Story:** As a [role], I want [feature], so that [benefit]

#### Acceptance Criteria

1. WHEN [trigger] THEN THE System SHALL [response]
2. WHEN [trigger] THEN THE System SHALL [response]
```

#### Step 2: Define Properties

Edit `.kiro/specs/haunted-ai/design.md`:

```markdown
**Property X: Your property name**
_For any_ [input], the system should [behavior].
**Validates: Requirements X.Y**
```

#### Step 3: Add Tasks

Edit `.kiro/specs/haunted-ai/tasks.md`:

```markdown
- [ ] X.Y Implement your feature
  - **Property X: Your property name**
  - **Validates: Requirements X.Y**
```

#### Step 4: Write Property Tests

Create `your-feature.property.test.ts`:

```typescript
// Feature: haunted-ai, Property X: Your property name
// Validates: Requirements X.Y
describe('Property X: Your property name', () => {
  it('should [behavior] for any [input]', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Your generators
        }),
        async (input) => {
          jest.clearAllMocks();
          
          // Your test logic
          
          expect(/* ... */).toBe(/* ... */);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Step 5: Implement Code

Write the minimum code needed to make tests pass.

### 4. Run Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- your-feature.property.test.ts --runInBand

# Run with coverage
npm run test:coverage
```

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add your feature

- Add requirements for feature X
- Define property X in design
- Implement property tests
- Add implementation

Validates: Requirements X.Y
Tests: Property X (100 iterations)
"
```

### 6. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create PR on GitHub
# Include:
# - Description of changes
# - Link to issue
# - Test results
# - Screenshots (if UI changes)
```

## 🧪 Testing Standards

### Property-Based Tests

**Required for:**
- Universal properties (holds for all inputs)
- Round-trip operations
- Invariants
- State transitions

**Format:**
```typescript
// Feature: haunted-ai, Property X: [description]
// Validates: Requirements X.Y
describe('Property X: [name]', () => {
  it('should [behavior]', async () => {
    await fc.assert(
      fc.asyncProperty(/* ... */),
      { numRuns: 100 }
    );
  });
});
```

### Unit Tests

**Required for:**
- Specific examples
- Edge cases
- Error conditions
- Integration points

**Format:**
```typescript
describe('ComponentName', () => {
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

### Test Requirements

- ✅ All property tests must run 100+ iterations
- ✅ All tests must have descriptive names
- ✅ All tests must link to requirements
- ✅ Mocks must be properly reset
- ✅ Coverage must be ≥ 80%

## 📐 Code Standards

### TypeScript

```typescript
// Use explicit types
function processLog(log: AgentLog): void {
  // ...
}

// Use interfaces for data structures
interface AgentLog {
  timestamp: Date;
  agentType: 'story' | 'asset' | 'code' | 'deploy';
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

// Use async/await, not callbacks
async function fetchData(): Promise<Data> {
  const response = await api.get('/data');
  return response.data;
}
```

### NestJS

```typescript
// Use dependency injection
@Injectable()
export class MyService {
  constructor(
    private readonly dependency: DependencyService,
  ) {}
}

// Use decorators for validation
export class CreateDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

// Use proper error handling
throw new NotFoundException('Resource not found');
```

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (no `I` prefix)

## 📚 Documentation

### Code Comments

```typescript
/**
 * Emit a log message to a room via Redis pub/sub
 * 
 * @param roomId - The room ID to emit to
 * @param agentType - The type of agent emitting the log
 * @param level - The log level
 * @param message - The log message
 * @param metadata - Optional metadata
 * 
 * Requirements: 5.1
 */
async emitLog(
  roomId: string,
  agentType: AgentLog['agentType'],
  level: AgentLog['level'],
  message: string,
  metadata?: Record<string, any>,
): Promise<void> {
  // ...
}
```

### README Updates

If your change affects:
- Setup process → Update README.md
- API endpoints → Update API docs
- Testing → Update testing guides

## 🔍 Code Review Process

### Before Requesting Review

- [ ] All tests pass
- [ ] Coverage ≥ 80%
- [ ] Code follows standards
- [ ] Documentation updated
- [ ] Commits are clean

### Review Checklist

Reviewers will check:
- [ ] Requirements are clear
- [ ] Properties are well-defined
- [ ] Tests are comprehensive
- [ ] Code is clean and maintainable
- [ ] Documentation is complete

## 🐛 Bug Reports

### Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: macOS/Linux/Windows
- Node: 20.x
- Browser: Chrome/Firefox/Safari

**Logs**
```
Paste relevant logs here
```

**Screenshots**
If applicable
```

## 💡 Feature Requests

### Template

```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Any other relevant information
```

## 🎯 Priority Labels

- `P0: Critical` - Blocking issues, security vulnerabilities
- `P1: High` - Important features, major bugs
- `P2: Medium` - Nice-to-have features, minor bugs
- `P3: Low` - Enhancements, documentation

## 📞 Getting Help

- **GitHub Issues**: For bugs and features
- **GitHub Discussions**: For questions and ideas
- **Discord**: [Join our server](https://discord.gg/haunted-ai)
- **Email**: dev@haunted-ai.com

## 🙏 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to HauntedAI!** 🎃👻

