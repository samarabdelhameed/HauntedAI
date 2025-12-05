# 🤝 Contributing to HauntedAI

Thank you for your interest in contributing to HauntedAI! This document provides guidelines and information for contributors.

## 🎯 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be respectful** and inclusive to all contributors
- **Be constructive** in discussions and feedback
- **Be collaborative** and help others learn
- **Be patient** with newcomers and questions

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git
- Basic knowledge of TypeScript, React, and NestJS

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/hauntedai-platform.git
   cd hauntedai-platform
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   
   # Add your API keys (see README.md for details)
   ```

4. **Start Development**
   ```bash
   # Start all services
   docker-compose up -d
   
   # Or start individual services
   npm run dev
   ```

5. **Verify Setup**
   ```bash
   # Run tests
   npm test
   
   # Check API
   curl http://localhost:3001/health
   
   # Check frontend
   open http://localhost:3000
   ```

## 📋 How to Contribute

### 🐛 Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template**
3. **Include detailed information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots/logs if applicable

### 💡 Suggesting Features

1. **Check existing feature requests**
2. **Use the feature request template**
3. **Provide clear description**:
   - Problem it solves
   - Proposed solution
   - Alternative solutions considered
   - Additional context

### 🔧 Code Contributions

#### Types of Contributions

- **Bug fixes** - Fix existing issues
- **Features** - Add new functionality
- **Documentation** - Improve docs and examples
- **Tests** - Add or improve test coverage
- **Performance** - Optimize existing code
- **Refactoring** - Improve code structure

#### Development Workflow

1. **Create Issue** (if not exists)
   - Describe the problem/feature
   - Get feedback from maintainers
   - Ensure it aligns with project goals

2. **Create Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number
   ```

3. **Make Changes**
   - Follow coding standards (see below)
   - Write/update tests
   - Update documentation
   - Test thoroughly

4. **Commit Changes**
   ```bash
   # Use conventional commits
   git commit -m "feat: add new agent type"
   git commit -m "fix: resolve memory leak in metrics"
   git commit -m "docs: update API documentation"
   ```

5. **Push and Create PR**
   ```bash
   git push origin your-branch-name
   ```
   - Create Pull Request on GitHub
   - Use the PR template
   - Link related issues

6. **Code Review**
   - Address feedback promptly
   - Make requested changes
   - Keep discussions constructive

7. **Merge**
   - Maintainer will merge after approval
   - Branch will be deleted automatically

## 📏 Coding Standards

### TypeScript Guidelines

- **Use strict TypeScript** - Enable all strict checks
- **Type everything** - Avoid `any`, use proper types
- **Use interfaces** - Define clear contracts
- **Export types** - Make types reusable

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  username: string;
  walletAddress?: string;
}

// ❌ Bad
const user: any = { id: 1, name: "test" };
```

### Code Style

- **Use Prettier** - Automatic formatting
- **Use ESLint** - Follow linting rules
- **Consistent naming**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and interfaces
  - `UPPER_CASE` for constants
  - `kebab-case` for files and folders

### Architecture Patterns

- **Follow NestJS patterns** - Use decorators, modules, services
- **Separation of concerns** - Keep business logic separate
- **Dependency injection** - Use NestJS DI container
- **Error handling** - Use proper exception filters

```typescript
// ✅ Good - Service with proper DI
@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}
  
  async create(data: CreateRoomDto): Promise<Room> {
    try {
      return await this.prisma.room.create({ data });
    } catch (error) {
      this.logger.error('Failed to create room', error);
      throw new InternalServerErrorException('Room creation failed');
    }
  }
}
```

### Testing Standards

- **Write tests** for all new code
- **Property-based tests** for core logic
- **Unit tests** for specific cases
- **Integration tests** for workflows

```typescript
// Property-based test example
describe('Property: Room creation', () => {
  it('should create room with valid input', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          inputText: fc.string({ minLength: 1, maxLength: 500 }),
        }),
        async ({ userId, inputText }) => {
          const room = await roomsService.create({ userId, inputText });
          
          expect(room.id).toBeDefined();
          expect(room.status).toBe('idle');
          expect(room.inputText).toBe(inputText);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Documentation Standards

- **JSDoc comments** for public APIs
- **README updates** for new features
- **API documentation** with Swagger decorators
- **Inline comments** for complex logic

```typescript
/**
 * Creates a new room for the authenticated user
 * @param createRoomDto - Room creation data
 * @param userId - Authenticated user ID
 * @returns Promise<Room> - Created room with metadata
 * @throws BadRequestException - Invalid input data
 * @throws InternalServerErrorException - Database error
 */
@ApiOperation({ summary: 'Create new room' })
@ApiResponse({ status: 201, description: 'Room created successfully' })
async create(@Body() createRoomDto: CreateRoomDto, @Request() req: any) {
  // Implementation
}
```

## 🧪 Testing Guidelines

### Running Tests

```bash
# All tests
npm test

# Property-based tests only
npm run test:property

# Unit tests only
npm run test:unit

# With coverage
npm run test:coverage

# Specific test file
npm test -- --testPathPattern=rooms.service.spec.ts
```

### Test Requirements

- **Minimum 80% coverage** for new code
- **Property tests** for core business logic
- **Unit tests** for edge cases and error handling
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows

### Test Structure

```typescript
describe('RoomsService', () => {
  let service: RoomsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RoomsService, PrismaService],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create room with valid data', async () => {
      // Test implementation
    });

    it('should throw error with invalid data', async () => {
      // Test implementation
    });
  });
});
```

## 📦 Project Structure

### Directory Organization

```
├── apps/
│   ├── api/                 # NestJS API Gateway
│   │   ├── src/
│   │   │   ├── modules/     # Feature modules
│   │   │   ├── common/      # Shared utilities
│   │   │   └── test/        # Test utilities
│   │   └── package.json
│   ├── web/                 # Next.js Frontend
│   │   ├── src/
│   │   │   ├── pages/       # Page components
│   │   │   ├── components/  # Reusable components
│   │   │   └── utils/       # Utility functions
│   │   └── package.json
│   ├── agents/              # AI Agent Services
│   │   ├── story-agent/     # Story generation
│   │   ├── asset-agent/     # Image generation
│   │   ├── code-agent/      # Code generation
│   │   └── deploy-agent/    # Deployment
│   ├── blockchain/          # Smart contracts
│   └── shared/              # Shared types
├── monitoring/              # Grafana & Prometheus
├── docs/                    # Documentation
└── .kiro/                   # Kiro configuration
```

### File Naming Conventions

- **Components**: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- **Services**: `kebab-case.service.ts` (e.g., `rooms.service.ts`)
- **Controllers**: `kebab-case.controller.ts`
- **Tests**: `*.spec.ts` for unit, `*.property.test.ts` for property
- **Types**: `kebab-case.types.ts` or `interfaces.ts`

## 🔄 Git Workflow

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: type(scope): description
feat(api): add room creation endpoint
fix(web): resolve wallet connection issue
docs(readme): update installation instructions
test(agents): add property tests for story generation
refactor(shared): extract common types
perf(api): optimize database queries
```

### Branch Naming

```bash
# Features
feature/add-new-agent-type
feature/web3-integration

# Bug fixes
fix/memory-leak-in-metrics
fix/issue-123-auth-error

# Documentation
docs/api-documentation
docs/contributing-guide

# Refactoring
refactor/extract-shared-utilities
refactor/improve-error-handling
```

### Pull Request Guidelines

1. **Use PR template** - Fill out all sections
2. **Link issues** - Reference related issues
3. **Describe changes** - What, why, and how
4. **Add screenshots** - For UI changes
5. **Test instructions** - How to test changes
6. **Breaking changes** - Document any breaking changes

## 🏷️ Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0) - Breaking changes
- **MINOR** (0.1.0) - New features, backward compatible
- **PATCH** (0.0.1) - Bug fixes, backward compatible

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] Release notes written

## 🆘 Getting Help

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Discord** - Real-time chat and community
- **Email** - team@hauntedai.com for private matters

### Resources

- **Documentation** - Check README.md and docs/
- **API Reference** - http://localhost:3001/api/docs
- **Architecture Guide** - `.kiro/steering/architecture-guidelines.md`
- **Testing Guide** - `.kiro/steering/testing-standards.md`

### Common Issues

1. **Docker not starting** - Check Docker daemon is running
2. **API keys missing** - Verify .env files are configured
3. **Tests failing** - Run `npm install` and check dependencies
4. **Port conflicts** - Check if ports 3000, 3001 are available

## 🎉 Recognition

Contributors will be recognized in:

- **README.md** - Contributors section
- **CHANGELOG.md** - Release notes
- **GitHub** - Contributor graphs and stats
- **Discord** - Special contributor role

## 📄 License

By contributing to HauntedAI, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to HauntedAI!** 🎃

*Together, we're building the future of autonomous AI content creation.*