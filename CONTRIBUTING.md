# Contributing to HauntedAI

Thank you for your interest in contributing to HauntedAI! 👻

## Development Setup

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### Getting Started

1. **Fork and clone the repository**
```bash
git clone https://github.com/samarabdelhameed/HauntedAI.git
cd HauntedAI
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. **Start development environment**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

5. **Run database migrations**
```bash
npm run db:migrate
```

6. **Start development servers**
```bash
npm run dev
```

## Project Structure

```
HauntedAI/
├── apps/
│   ├── api/              # NestJS API Gateway
│   ├── web/              # Next.js Frontend
│   ├── agents/           # AI Agent Services
│   │   ├── story-agent/
│   │   ├── asset-agent/
│   │   ├── code-agent/
│   │   ├── deploy-agent/
│   │   └── orchestrator/
│   ├── blockchain/       # Smart Contracts
│   ├── storage/          # Storacha Integration
│   └── shared/           # Shared Types
├── .kiro/                # Kiro Specs & Config
└── docker-compose.dev.yml
```

## Coding Standards

### TypeScript
- Use TypeScript for all code
- Enable strict mode
- Avoid `any` types
- Use interfaces for data structures

### Code Style
- Follow ESLint rules
- Use Prettier for formatting
- Run `npm run lint:fix` before committing
- Run `npm run format` to format code

### Naming Conventions
- **Files**: kebab-case (e.g., `user-service.ts`)
- **Classes**: PascalCase (e.g., `UserService`)
- **Functions**: camelCase (e.g., `getUserById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)

### Git Commit Messages
Follow conventional commits:
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

## Testing

### Running Tests
```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Property-based tests
npm run test:property

# With coverage
npm run test:coverage
```

### Writing Tests

#### Unit Tests
```typescript
describe('UserService', () => {
  it('should create a new user', async () => {
    const user = await userService.create({ username: 'test' });
    expect(user.username).toBe('test');
  });
});
```

#### Property-Based Tests
```typescript
// Feature: haunted-ai, Property X: Description
// Validates: Requirements Y.Z
it('should maintain invariant', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string(),
      async (input) => {
        // Test logic
      }
    ),
    { numRuns: 100 }
  );
});
```

## Pull Request Process

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
- Write clean, documented code
- Add tests for new features
- Update documentation

3. **Test your changes**
```bash
npm run lint
npm test
```

4. **Commit your changes**
```bash
git add .
git commit -m "feat: Add your feature"
```

5. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

6. **Create a Pull Request**
- Provide a clear description
- Reference related issues
- Wait for review

## Code Review Guidelines

### For Contributors
- Respond to feedback promptly
- Make requested changes
- Keep PRs focused and small

### For Reviewers
- Be respectful and constructive
- Focus on code quality
- Check for test coverage
- Verify documentation

## Development Workflow

### Adding a New Feature

1. **Create Kiro Spec**
```bash
# Create spec files in .kiro/specs/feature-name/
- requirements.md
- design.md
- tasks.md
```

2. **Implement Feature**
- Follow the task list
- Write tests alongside code
- Update documentation

3. **Test Thoroughly**
- Unit tests
- Property-based tests
- Integration tests

4. **Submit PR**

### Fixing a Bug

1. **Write a failing test**
2. **Fix the bug**
3. **Verify test passes**
4. **Submit PR**

## Database Migrations

### Creating a Migration
```bash
npm run db:migrate --workspace=apps/api
```

### Applying Migrations
```bash
npm run db:push --workspace=apps/api
```

## Docker Commands

### Start services
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Stop services
```bash
docker-compose -f docker-compose.dev.yml down
```

### View logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Rebuild services
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

## Troubleshooting

### Port already in use
```bash
# Find process using port
lsof -i :3001
# Kill process
kill -9 <PID>
```

### Database connection issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d postgres
npm run db:push
```

### Node modules issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Getting Help

- **Discord**: [Join our community](https://discord.gg/hauntedai)
- **GitHub Issues**: [Report bugs or request features](https://github.com/samarabdelhameed/HauntedAI/issues)
- **Documentation**: [Read the docs](./.kiro/specs/)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to HauntedAI! 👻**
