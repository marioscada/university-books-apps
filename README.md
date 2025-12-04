# 📚 University Books Mobile App

Angular + Ionic mobile application with AWS Cognito authentication - Clean Architecture starter.

## 🎯 Overview

Modern mobile application starter built with:
- **Angular 19** - Latest framework with standalone components
- **Ionic 7+** (Ready) - Cross-platform mobile UI
- **AWS Cognito** (TODO) - Secure authentication
- **Clean Architecture** - SOLID principles and design patterns
- **TypeScript 5.6** - Type-safe development

**Status**: 🚧 Clean slate - Ready for implementation

## 📁 Project Structure

```
university-books-apps/
├── projects/
│   └── university-books-mobile/       # Main mobile app
│       └── src/
│           ├── app/
│           │   ├── core/              # Core business logic (TODO)
│           │   │   └── auth/          # Authentication (TODO)
│           │   │       ├── models/         # (empty)
│           │   │       ├── services/       # (empty)
│           │   │       ├── guards/         # (empty)
│           │   │       ├── interceptors/   # api-key.interceptor.ts
│           │   │       └── repositories/   # (empty)
│           │   ├── features/          # Feature modules (TODO)
│           │   │   └── auth/          # Auth UI (TODO)
│           │   │       ├── containers/     # (empty)
│           │   │       ├── components/     # (empty)
│           │   │       └── pages/          # (empty)
│           │   ├── app.component.ts
│           │   ├── app.config.ts
│           │   └── app.routes.ts
│           ├── environments/          # Environment configs
│           │   ├── environment.ts          # Dev config (clean)
│           │   └── environment.prod.ts     # Prod config (clean)
│           └── assets/
├── libs/
│   └── auth/                          # Auth library (reusable)
├── docs/
│   ├── ANGULAR-IMPLEMENTATION-GUIDE.md  # ⭐ Clean Architecture guide
│   ├── FUTURE-INTEGRATIONS.md           # Libraries reference
│   └── archive/                         # Archived docs
└── scripts/
    ├── configure-project.js
    └── upload-to-s3.js
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.19.0
- **npm** >= 9.0.0
- **Angular CLI** >= 19.0.0
- **Ionic CLI** >= 7.0.0 (optional, for mobile)

### Installation

```bash
# Clone repository
git clone https://github.com/marioscada/university-books-apps.git
cd university-books-apps

# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at `http://localhost:4200`

## 📜 Available Scripts

### Development

```bash
npm start              # Start dev server (university-books-mobile)
npm run watch          # Build with watch mode
npm test               # Run unit tests
npm run test:ci        # Run tests in CI mode (headless)
```

### Build

```bash
npm run build          # Production build
```

### Linting

```bash
npm run lint           # Lint university-books-mobile
npm run lint:auth      # Lint auth library
npm run lint:all       # Lint all projects
```

### Auth Library

```bash
npm run build:auth     # Build auth library
```

## 🏗️ Architecture

### Clean Architecture Layers

This project follows Clean Architecture principles as described in `docs/ANGULAR-IMPLEMENTATION-GUIDE.md`:

#### 1. **Infrastructure Layer** (Storage)
- Ionic Storage for secure local persistence
- iOS Keychain / Android Keystore
- Abstraction via `IStorage` interface

#### 2. **Core Domain Layer** (Business Logic)
- **Auth Module**: Cognito authentication services
  - `TokenService`: JWT token management
  - `AuthStateService`: RxJS state management
  - `AuthService`: Authentication orchestrator
- **Repositories**: Data access abstractions
- **Guards**: Route protection
- **Interceptors**: HTTP middleware

#### 3. **Presentation Layer** (UI)
- **Features**: Feature-specific components
  - Smart components (containers) - Logic & state
  - Dumb components (presentational) - UI only
- **Shared**: Reusable components & services

### Design Patterns

- ✅ **Repository Pattern** - Data access abstraction
- ✅ **Observer Pattern** - RxJS reactive programming
- ✅ **Interceptor Pattern** - HTTP middleware
- ✅ **Guard Pattern** - Route protection
- ✅ **Facade Pattern** - Simplified subsystem access
- ✅ **Dependency Inversion** - Interface-based dependencies

### SOLID Principles

- **S**ingle Responsibility - Each class has one job
- **O**pen/Closed - Open for extension, closed for modification
- **L**iskov Substitution - Interfaces are interchangeable
- **I**nterface Segregation - Small, focused interfaces
- **D**ependency Inversion - Depend on abstractions

## 🔐 Authentication

### AWS Cognito Integration

Authentication is handled via AWS Cognito User Pools:

1. **Login Flow**: Email/Password with Cognito
2. **Token Management**: Access, ID, and Refresh tokens
3. **Secure Storage**: Tokens stored in Ionic Storage (encrypted)
4. **Auto-refresh**: Token refresh before expiration
5. **Route Protection**: Auth guards for private routes

### Environment Configuration

Configure AWS Cognito in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_XXXXXXXXX',
    userPoolWebClientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
    apiKey: 'your-api-key-here',
  },
  api: {
    baseUrl: 'https://api.university-books.com',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
};
```

## 🧪 Testing

### Unit Tests

```bash
npm test               # Run tests in watch mode
npm run test:ci        # Run tests in CI (headless)
```

Tests are written using:
- **Karma** - Test runner
- **Jasmine** - Testing framework
- **Chrome Headless** - Browser for CI

### Test Coverage

Coverage reports are generated in `/coverage` directory.

## 📦 Building for Production

### Web Build

```bash
npm run build
```

Output: `dist/university-books-mobile/`

### Mobile Build (iOS/Android)

```bash
# Add platforms
ionic capacitor add ios
ionic capacitor add android

# Build and sync
npm run build
ionic capacitor sync

# Open in Xcode/Android Studio
ionic capacitor open ios
ionic capacitor open android
```

## 🔧 Configuration

### HTTP Interceptors

Current interceptors:
1. **API Key Interceptor** - Adds `x-api-key` header (temporary)

**TODO**:
- Auth Interceptor for Cognito JWT tokens
- Error Interceptor for global error handling
- Loading Interceptor for loading states

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ANGULAR-IMPLEMENTATION-GUIDE.md](docs/ANGULAR-IMPLEMENTATION-GUIDE.md) | Clean Architecture, SOLID, Design Patterns |
| [FUTURE-INTEGRATIONS.md](docs/FUTURE-INTEGRATIONS.md) | Libraries and future enhancements |

## 🛠️ Tech Stack

### Core

| Package | Version | Purpose |
|---------|---------|---------|
| Angular | 19.0.0 | Framework |
| RxJS | 7.8.0 | Reactive programming |
| TypeScript | 5.6.2 | Language |
| Zone.js | 0.15.0 | Change detection |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| ESLint | 9.39.1 | Linting |
| Karma | 6.4.0 | Test runner |
| Jasmine | 5.4.0 | Testing framework |
| Tailwind CSS | 3.4.18 | Utility-first CSS |

### Future Integrations

See `docs/FUTURE-INTEGRATIONS.md` for:
- Ionic Framework
- AWS Amplify (Cognito)
- NgRx (State Management)
- Angular Material

## 🚧 Implementation Roadmap

### Phase 1: Infrastructure Layer (Storage)
- [ ] Create `IStorage` interface
- [ ] Implement Ionic Storage service
- [ ] Add Ionic Storage module

### Phase 2: Core Domain Layer (Auth)
- [ ] Create auth models and interfaces
- [ ] Implement TokenService (JWT management)
- [ ] Implement AuthStateService (RxJS state)
- [ ] Implement AuthService (Cognito integration)
- [ ] Create auth repository

### Phase 3: HTTP & Guards
- [ ] Implement Auth Interceptor (JWT tokens)
- [ ] Create Auth Guard (route protection)
- [ ] Add error handling interceptor

### Phase 4: Presentation Layer (UI)
- [ ] Create login page (container)
- [ ] Create login form (component)
- [ ] Create register page
- [ ] Add routing and navigation

### Phase 5: Testing & Polish
- [ ] Unit tests for services
- [ ] Integration tests for auth flow
- [ ] E2E tests
- [ ] Polish UI/UX

## 📄 License

Copyright © 2025 Mariano Scada

## 🤝 Contributing

This is a private project. For questions or issues, contact the author.

## 📞 Support

For support, contact: marianoscada@example.com

---

**Version:** 1.0.0
**Last Updated:** December 2025
**Author:** Mariano Scada
