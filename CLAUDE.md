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

## UX Improvements (2025-08-22)

### Summary
Comprehensive UX/UI improvements addressing user confusion and enhancing overall user experience.

### Key Improvements

#### 1. Login/Registration Flow Clarification
**Problem**: Users confused by "초대받고 가입하기" vs "회원가입" buttons
**Solution**: 
- Changed to "새로 시작하기" vs "이미 사용 중이에요 (로그인)"
- Added clear explanatory text for each option
- File: `frontend/src/pages/WelcomePage.tsx`

#### 2. Default Question System
**Problem**: "오늘의 질문이 준비되지 않았어요" message when no server questions available
**Solution**:
- Created 17 default questions across 5 categories (daily, family, memory, future, emotion)
- Automatic fallback to default questions when server questions unavailable
- "다른 질문으로 바꾸기" functionality for user preference
- Files: `frontend/src/utils/defaultQuestions.ts`, `frontend/src/pages/HomePage.tsx`

#### 3. Icon Button Text Conversion
**Problem**: Ambiguous plus (+) and settings icons requiring user interpretation
**Solution**:
- Converted icon buttons to clear text: "가족 초대", "설정"
- Enhanced visual design with background and hover effects
- File: `frontend/src/pages/HomePage.tsx`

#### 4. Enhanced Settings Modal
**Problem**: No user information access or settings functionality
**Solution**:
- Comprehensive settings modal with user information display
- Shows: name, role, connection status, invite code
- Clear action buttons: "닫기", "로그아웃"
- File: `frontend/src/pages/HomePage.tsx`

### Technical Implementation

#### Default Questions System
```typescript
// Core functionality for fallback questions
export const DEFAULT_QUESTIONS: DefaultQuestion[] = [
  // 17 carefully curated questions across 5 categories
];

export const getRandomDefaultQuestion = (): DefaultQuestion => {
  // Random selection algorithm
};
```

#### State Management
- Local state management for default question answers
- Seamless integration with existing server question flow
- Clear distinction between server and default questions

### User Impact
- ✅ **Reduced Confusion**: Clear button labeling eliminates guesswork
- ✅ **Always Available**: Default questions ensure users can always engage
- ✅ **Better Information Access**: Settings modal provides complete user context
- ✅ **Improved Accessibility**: Text buttons improve usability for all users

### Testing Results
All improvements tested via automated browser testing with Playwright:
- WelcomePage navigation flow ✅
- RegisterPage form completion ✅
- HomePage default question generation ✅
- Question switching functionality ✅
- Answer submission for default questions ✅
- Settings modal display and functionality ✅

## Design System & UI Components

### Color System (Updated 2025-08-22)
**Brand Colors**: Warm orange-coral palette based on official logo
- **Primary**: Orange gradient (`#E8A158` → `#E17B7B`) - main brand color
- **Secondary**: Coral shades (`#E17B7B` series) - supporting warm tones
- **Accent**: Amber tones - highlights and CTAs
- **Semantic**: Success (green), Warning (orange), Error (red) - system feedback

**Key Design Principles**:
- Mobile-first responsive design
- 60+ user friendly accessibility
- Touch-optimized (44px minimum targets)
- Warm, family-oriented color palette
- Korean typography optimization

### UI Component Library

#### Core UI Components (`/components/ui/`)

**Interactive Components**:
- **Button** (`Button.tsx`) - Primary action component with 8 variants (primary, secondary, accent, success, warning, error, ghost, outline) and 3 sizes
- **FAB** (`FAB.tsx`) - Floating Action Button for primary actions, supports variants and positioning
- **Chip** (`Chip.tsx`) - Selection and tagging component with clickable states and multiple variants

**Form Components**:
- **Input** (`Input.tsx`) - Text input with validation states, labels, and error handling
- **Textarea** (`Textarea.tsx`) - Multi-line text input with auto-resize capabilities

**Display Components**:
- **Card** (`Card.tsx`) - Content container with elevation and rounded corners
- **Avatar** (`Avatar.tsx`) - User representation with sizes, status indicators, and group support
  - **AvatarGroup** - Multiple avatar display with overflow handling
- **Badge** (`Badge.tsx`) - Notification and count indicators
  - **BadgeWrapper** - Wrapper for applying badges to other components

**Feedback Components**:
- **LoadingSpinner** (`LoadingSpinner.tsx`) - Loading states with multiple sizes and optional messages
- **Modal** (`Modal.tsx`) - Overlay dialogs with backdrop and focus management

**Specialized Components**:
- **ExistingAccountModal** (`ExistingAccountModal.tsx`) - Account conflict resolution dialog
- **VisuallyHidden** (`VisuallyHidden.tsx`) - Screen reader only content
- **SkipToContent** (`SkipToContent.tsx`) - Accessibility navigation aid

#### Layout Components (`/components/layout/`)

**Navigation & Structure**:
- **Navbar** (`Navbar.tsx`) - Main navigation with responsive mobile menu
- **Footer** (`Footer.tsx`) - Site footer with social links and legal info
  - **BottomNavigation** - Mobile-optimized bottom navigation
- **Hero** (`Hero.tsx`) - Landing section with multiple variants (default, centered, split, minimal)
  - **WelcomeHero**, **LoginHero**, **ErrorHero** - Specialized hero variants
- **Layout** (`Layout.tsx`) - Main application wrapper with outlet support
- **ProtectedRoute** (`ProtectedRoute.tsx`) - Authentication guard for private routes

### Component Usage Guidelines

#### When to Add New Components

**Always Ask First**: Before creating any new UI component, discuss with the team:
1. **What component** needs to be created?
2. **Why is it necessary** - what problem does it solve?
3. **Where will it be used** - specific pages/features?
4. **Does it fit** the existing design system?

**Component Categories**:
- **Core UI**: Basic interactive elements (buttons, inputs, etc.)
- **Layout**: Page structure and navigation
- **Specialized**: Domain-specific components for family communication
- **Utility**: Accessibility and developer experience helpers

#### Existing Component Usage

**Standard Patterns**:
```tsx
// Import from index barrel
import { Button, Input, Card, Avatar } from '@/components/ui';

// Use consistent props
<Button variant="primary" size="large" fullWidth>
  Primary Action
</Button>

// Follow accessibility patterns
<Input 
  label="사용자 이름"
  required
  error={validationError}
  onChange={handleChange}
/>
```

**Color System Integration**:
- All components automatically use the warm orange-coral brand palette
- Primary actions use the orange→coral gradient
- Semantic colors (success, warning, error) maintain consistent meaning
- Mobile-optimized touch targets and spacing

### Component Development Rules

1. **Consistency First**: Follow existing component patterns and props
2. **Accessibility Required**: All components must support screen readers and keyboard navigation
3. **Mobile Optimized**: 44px minimum touch targets, responsive design
4. **Type Safety**: Full TypeScript support with proper prop interfaces
5. **Brand Aligned**: Use established color system and design tokens
6. **Performance Conscious**: Optimize for bundle size and render performance

## Project Status

This is an active development project with:
- Core MVP architecture established
- Security and performance optimizations implemented
- **Enhanced UX/UI with user-centered improvements** ⭐️
- **Complete UI component library with warm brand colors** 🎨
- **Comprehensive design system documentation** 📖
- SuperClaude integration for enhanced development

See TECHNICAL_ARCHITECTURE.md for detailed system specifications and SUPERCLAUDE_GUIDE.md for comprehensive development workflows.