# Mundapdari Project - Claude Code Context Guide

This file provides comprehensive context for Claude Code instances working on the Mundapdari project.

## Project Overview

**Mundapdari (문답다리)** is a Korean family communication service that facilitates daily Q&A between family members, particularly targeting parent-child relationships. The platform sends one question daily via KakaoTalk and creates weekly summary cards to strengthen family bonds.

## High-Level Architecture

### Tech Stack
- **Backend**: Node.js/Express with SQLite (dev) → PostgreSQL (prod)
- **Frontend**: React with TypeScript, Zustand state management
- **Integration**: KakaoTalk API for messaging, AWS for cloud services
- **Security**: JWT authentication, phone number encryption, environment-based config

### Key Design Patterns
- **Database Abstraction**: BaseModel class supports both SQLite and PostgreSQL
- **Security-First**: All sensitive data encrypted, comprehensive .gitignore
- **Environment-Driven**: Development vs production configurations
- **State Management**: Zustand with persistence for frontend auth state
- **API Design**: RESTful with comprehensive error handling

## Project Structure

```
Mundapdari/
├── backend/              # Node.js/Express API server
│   ├── src/
│   │   ├── config/      # Environment and database configuration
│   │   ├── models/      # Database models with dual DB support
│   │   └── ...
├── frontend/            # React TypeScript application
│   ├── src/
│   │   ├── stores/      # Zustand state management
│   │   └── ...
├── database/            # SQLite database files
├── .env.example         # Environment template with security guides
└── TECHNICAL_ARCHITECTURE.md  # Detailed system documentation
```

## Key Configuration Files

### Backend Configuration (`backend/src/config/index.js`)
- Dual database support (SQLite/PostgreSQL)
- JWT and encryption key management
- KakaoTalk and AWS integration settings
- Environment-specific validation

### Database Models (`backend/src/models/index.js`)
- BaseModel class with CRUD operations
- Cross-database compatibility (PostgreSQL/SQLite)
- Transaction support and error handling
- Comprehensive logging for debugging

### Authentication Store (`frontend/src/stores/authStore.ts`)
- Zustand-based state management
- JWT token persistence
- User registration/login flows
- Error handling with toast notifications

## Development Workflow

### Git Performance Optimizations
The project has been optimized for fast commits:
- Husky pre-commit hooks with conditional execution
- Optimized lint-staged configuration (Prettier only)
- Performance-focused ESLint and Prettier configurations
- Commit time reduced from 4.2s to <1s

### Environment Security
- Comprehensive .gitignore protecting sensitive data
- Environment variables for all external services
- Encryption keys and JWT secrets properly managed
- Security guidelines in .env.example

### Common Commands
```bash
# Development
npm run dev          # Start development servers
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Run tests

# Database
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset database

# Git (optimized)
git commit -m "message"  # Fast commits with optimized hooks
```

## SuperClaude Integration

This project is designed to work with SuperClaude framework:
- Comprehensive SUPERCLAUDE_GUIDE.md for development workflows
- Persona-based development (frontend, backend, security, etc.)
- MCP server integration for enhanced development experience
- Performance-optimized Git workflow for efficient commits

## Key Business Logic

### User Flow
1. **Registration**: Phone-based with encryption
2. **Pairing**: Family member connection system
3. **Daily Questions**: Automated KakaoTalk delivery
4. **Responses**: Web-based answer collection
5. **Weekly Cards**: Automated summary generation

### Security Considerations
- Phone numbers encrypted at rest
- JWT-based authentication with refresh tokens
- Rate limiting and CORS configuration
- Environment-based security settings

## Database Design

### Dual Database Strategy
- **Development**: SQLite for simplicity and portability
- **Production**: PostgreSQL for scalability and features
- **BaseModel**: Unified interface handling both databases
- **Migrations**: Support for both database types

### Key Entities
- Users (encrypted phone numbers, JWT auth)
- Pairs (family relationships)
- Questions (daily prompts)
- Answers (user responses)
- WeeklyCards (generated summaries)

## Integration Points

### KakaoTalk API
- Message sending for daily questions
- User authentication integration
- Rate limiting compliance

### AWS Services
- S3 for image storage (weekly cards)
- Potential CloudWatch for monitoring
- Regional deployment (ap-northeast-2)

## Performance Considerations

### Frontend
- Bundle size optimization targets
- Mobile-first responsive design
- State persistence with Zustand
- Error boundary implementations

### Backend
- Database query optimization
- Connection pooling configuration
- Caching strategies
- Error handling and logging

## Development Notes for Claude Code

1. **Always check environment variables** before implementing external API integrations
2. **Use BaseModel class** for all database operations to maintain cross-DB compatibility
3. **Follow existing patterns** in authentication store for state management
4. **Maintain security-first approach** - never commit sensitive data
5. **Test both SQLite and PostgreSQL** when modifying database operations
6. **Use SuperClaude personas** for domain-specific development tasks
7. **Leverage optimized Git workflow** for efficient development cycles

## Project Status

This is an active development project with:
- Core MVP architecture established
- Security and performance optimizations implemented
- Comprehensive documentation and guides
- SuperClaude integration for enhanced development

See TECHNICAL_ARCHITECTURE.md for detailed system specifications and SUPERCLAUDE_GUIDE.md for comprehensive development workflows.