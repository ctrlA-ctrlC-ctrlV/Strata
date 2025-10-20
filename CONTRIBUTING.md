# Contributing to Strata Garden Rooms

Thank you for your interest in contributing to this project!

## Development Setup

1. **Prerequisites**
   - Node.js 20 LTS
   - MongoDB connection
   - Email provider credentials

2. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd Strata
   
   # Frontend setup
   cd frontend
   npm install
   npm run dev
   
   # Backend setup (in new terminal)
   cd backend
   npm install
   cp .env.example .env
   # Configure .env with your settings
   npm run dev
   ```

## Code Standards

- **Code Style**: Follow EditorConfig settings (2 spaces, LF endings)
- **Linting**: All code must pass ESLint checks
- **Testing**: Write tests for new features
- **Performance**: Maintain Lighthouse score ≥90
- **Accessibility**: Follow WCAG 2.1 AA guidelines

## Testing

```bash
# Unit tests
npm test

# E2E tests  
npm run e2e

# Accessibility tests
npm run test:a11y

# Performance budgets
npm run test:perf
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with tests
3. Ensure all CI checks pass
4. Update documentation as needed
5. Submit PR with clear description

## Architecture Guidelines

- **Static-First**: Prioritize static content with progressive enhancement
- **Performance**: Critical CSS inlined, images optimized
- **Security**: Follow CSP, input validation, rate limiting
- **Accessibility**: Keyboard navigation, screen reader support
- **Progressive Enhancement**: Core functionality works without JS

## Questions?

Feel free to open an issue for questions or discussions about the project architecture and implementation.