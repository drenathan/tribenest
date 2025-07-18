# Contributing to TribeNest

Thank you for your interest in contributing to TribeNest! We welcome contributions from the community and appreciate your help in making TribeNest better for indie artists and creators.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: Node.js 20+)
- **Docker** and Docker Compose
- **Git** with SSH access
- **PostgreSQL** 15+ (for local development)
- **Redis** 7+ (for local development)

### First Time Setup

1. **Fork the repository**

   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/tribenest.git
   cd tribenest
   ```

2. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/tribenest/tribenest.git
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. **Start development environment**

   ```bash
   # Using Docker (recommended)
   ./scripts/docker-dev.sh up

   # Or manually
   npm run dev
   ```

## Development Setup

### Docker Development (Recommended)

```bash
# Start all services
./scripts/docker-dev.sh up

# View logs
./scripts/docker-dev.sh logs

# Stop services
./scripts/docker-dev.sh down

# Rebuild containers
./scripts/docker-dev.sh build
```

### Manual Development

```bash
# Start backend
cd apps/backend
npm run dev

# Start client (in new terminal)
cd apps/client
npm run dev

# Start admin (in new terminal)
cd apps/admin
npm run dev
```

### Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database
npm run db:reset
```

## Project Structure

```
TribeNest/
├── apps/
│   ├── admin/                 # Admin dashboard (Vite + React)
│   │   ├── src/
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── routes/        # Application routes
│   │   │   ├── services/      # API services
│   │   │   └── types/         # TypeScript type definitions
│   ├── backend/               # API server (Express + TypeScript)
│   │   ├── src/
│   │   │   ├── db/           # Database models and migrations
│   │   │   ├── routes/       # API route handlers
│   │   │   ├── services/     # Business logic
│   │   │   ├── middlewares/  # Express middlewares
│   │   │   └── utils/        # Utility functions
│   └── client/                # Client app (Next.js)
│       ├── app/              # Next.js app directory
│       ├── components/       # Page components
│       └── services/         # API services
├── packages/
│   ├── frontend-shared/       # Shared components and utilities
│   │   ├── src/
│   │   │   ├── components/   # Shared UI components
│   │   │   ├── hooks/        # Shared React hooks
│   │   │   ├── utils/        # Shared utilities
│   │   │   └── types/        # Shared TypeScript types
│   ├── eslint-config/         # ESLint configurations
│   └── typescript-config/     # TypeScript configurations
└── scripts/                   # Build and deployment scripts
```

## Making Changes

### 1. Create a Feature Branch

```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create a new branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or
git checkout -b docs/your-documentation-update
```

### 2. Make Your Changes

- **Follow the code standards** (see below)
- **Write tests** for new functionality
- **Update documentation** as needed
- **Keep commits atomic** and well-described

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:backend
npm run test:client
npm run test:admin

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### 4. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add user profile management

- Add profile creation endpoint
- Add profile update functionality
- Add profile deletion with cascade
- Add comprehensive tests for profile operations

Closes #123"
```

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
git commit -m "feat(auth): add two-factor authentication"
git commit -m "fix(payment): resolve Stripe webhook validation issue"
git commit -m "docs: update API documentation for v2.0"
```

## Pull Request Process

### 1. Create a Pull Request

- **Target the `main` branch**
- **Use a descriptive title**
- **Fill out the PR template**
- **Link related issues**

### 2. PR Description Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] No new warnings

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)

Add screenshots to help explain your changes.

## Additional Notes

Any additional information or context.
```

### 3. Review Process

- **Automated checks** must pass (CI/CD)
- **Code review** required from maintainers
- **Address feedback** promptly
- **Squash commits** if requested

### 4. Merge Requirements

- ✅ **All tests pass**
- ✅ **Code review approved**
- ✅ **No merge conflicts**
- ✅ **Documentation updated**
- ✅ **Follows project standards**

## Code Standards

### TypeScript

- **Strict mode** enabled
- **Explicit types** for function parameters and returns
- **Interface over type** for object shapes
- **No `any` types** without justification
- **Proper error handling** with typed errors

```typescript
// Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

function createUser(profile: UserProfile): Promise<User> {
  // Implementation
}

// Bad
function createUser(profile: any): any {
  // Implementation
}
```

### React Components

- **Functional components** with hooks
- **Props interface** for all components
- **Proper TypeScript** typing
- **Consistent naming** conventions

```typescript
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit, className }) => {
  // Component implementation
};
```

### Backend Code

- **Service layer pattern** for business logic
- **Repository pattern** for data access
- **Proper error handling** with custom error classes
- **Input validation** with Zod schemas
- **JSDoc comments** for public APIs

```typescript
/**
 * Creates a new user profile
 * @param input - User profile data
 * @returns Promise<UserProfile>
 * @throws {ValidationError} When input is invalid
 * @throws {ConflictError} When profile already exists
 */
export async function createUserProfile(input: CreateUserProfileInput): Promise<UserProfile> {
  // Implementation
}
```

### Database

- **Migration files** for schema changes
- **Seed files** for test data
- **Proper indexing** for performance
- **Foreign key constraints** for data integrity

### Styling

- **Tailwind CSS** for styling
- **Consistent spacing** and colors
- **Responsive design** principles
- **Accessibility** considerations

## Testing

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

### Writing Tests

```typescript
describe("UserService", () => {
  describe("createUser", () => {
    it("should create a new user with valid data", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
      };

      const result = await userService.createUser(userData);

      expect(result).toMatchObject(userData);
      expect(result.id).toBeDefined();
    });

    it("should throw error for duplicate email", async () => {
      // Test implementation
    });
  });
});
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- userService.test.ts

# Run tests in watch mode
npm run test:watch
```

## Documentation

### Code Documentation

- **JSDoc comments** for functions and classes
- **README files** for each package
- **API documentation** with examples
- **Inline comments** for complex logic

### Documentation Standards

- **Clear and concise** writing
- **Code examples** for APIs
- **Step-by-step guides** for complex features
- **Regular updates** with code changes

## Community

### Getting Help

- **GitHub Issues** for bug reports and feature requests
- **GitHub Discussions** for questions and ideas
- **Discord/Slack** for real-time chat (if available)
- **Documentation** for self-help

### Contributing Guidelines

- **Be respectful** and inclusive
- **Help others** when you can
- **Share knowledge** and best practices
- **Follow the project's vision** and goals

### Recognition

- **Contributors list** in README
- **Release notes** credit for significant contributions
- **Community spotlight** for outstanding work
- **Swag and rewards** for major contributors

## License

By contributing to TribeNest, you agree that your contributions will be licensed under the same license as the project. Please see our [LICENSE](LICENSE) file for details.

## Questions?

If you have any questions about contributing, please:

1. Check the [documentation](https://docs.tribenest.co)
2. Search [existing issues](https://github.com/tribenest/tribenest/issues)
3. Start a [discussion](https://github.com/tribenest/tribenest/discussions)
4. Contact us at [contributing@tribenest.co](mailto:contributing@tribenest.co)

Thank you for contributing to TribeNest! 🎵✨
