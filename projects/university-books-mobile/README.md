# University Books Mobile

Modern Angular mobile application for the University Books platform, built with AWS Amplify Gen 2 and following Angular 19 best practices.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run start:university-books-mobile
```

Navigate to `http://localhost:4200/`

## 📚 Documentation

**Complete documentation:** [`/docs/mobile-app/`](../../docs/mobile-app/)

### Essential Reads

- **[WHERE-IS-WHAT.md](../../docs/mobile-app/WHERE-IS-WHAT.md)** - 🎯 Quick reference: find models, services, configs
- **[NAMING-CLARIFICATION.md](../../docs/mobile-app/NAMING-CLARIFICATION.md)** - 📚 Understand API Types vs Domain Models
- **[PROJECT-STRUCTURE.md](../../docs/mobile-app/PROJECT-STRUCTURE.md)** - 📂 Complete project structure
- **[ARCHITECTURE.md](../../docs/mobile-app/ARCHITECTURE.md)** - 🏗️ Architecture decisions & patterns

### Integration Guides

- **[AWS Backend Integration](../../docs/AWS-BACKEND-INTEGRATION-GUIDE.md)** - API Gateway + Cognito setup
- **[Angular Implementation](../../docs/ANGULAR-IMPLEMENTATION-GUIDE.md)** - Angular best practices

## 🏗️ Architecture

Built following official AWS Amplify Gen 2 and Angular 19 (2025) best practices:

```
src/app/
├── core/                    Singleton services & app-wide resources
│   ├── models/              Domain models (business logic)
│   ├── services/            Business services (AuthService)
│   ├── config/              Configurations (Amplify, API client)
│   └── generated/           Auto-generated OpenAPI client
│
├── shared/                  Reusable components
└── features/                Feature modules (lazy-loaded)
    └── auth/                Authentication feature
```

## ✨ Features

- ✅ **AWS Cognito Authentication** - JWT-based auth with auto token refresh
- ✅ **Type-safe API Client** - Auto-generated from OpenAPI schema
- ✅ **Domain Models** - Business logic separated from API types
- ✅ **Feature-based Structure** - Angular best practice organization
- ✅ **AWS Amplify Gen 2** - TypeScript-first backend definitions
- ✅ **Clean Architecture** - Core/Shared/Features separation

## 🛠️ Setup

### Prerequisites

- Node.js 20+
- Angular CLI 19+
- AWS Account (for Cognito)

### Environment Configuration

Create `.env.local` (gitignored):

```bash
# API Configuration
VITE_API_BASE_URL=https://your-api.execute-api.eu-south-1.amazonaws.com/dev
VITE_DEV_API_KEY=your-api-key-for-development

# AWS Cognito Configuration
VITE_COGNITO_USER_POOL_ID=eu-south-1_xxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxx

# Feature Flags
VITE_ENABLE_DEBUG_LOGGING=true
```

See `.env.example` for all available variables.

### Development Scripts

```bash
# Start dev server
npm run start:university-books-mobile

# Build for production
npm run build

# Update API client from schema
npm run schema:update

# Download schema only
npm run schema:fetch

# Generate TypeScript client only
npm run schema:generate
```

## 📦 Key Concepts

### Domain Models vs API Types

This project uses **two separate types** of models:

**Domain Models** (`core/models/`) - Business logic
```typescript
class Document {
  get fileSizeFormatted(): string { ... }
  get isPdf(): boolean { ... }
  static fromApiMetadata(api): Document { ... }
}
```

**API Types** (`core/generated/models/`) - Auto-generated interfaces
```typescript
type DocumentMetadata = {
  documentId: string;
  fileName: string;
  fileSize: number;
}
```

→ See [NAMING-CLARIFICATION.md](../../docs/mobile-app/NAMING-CLARIFICATION.md) for details

### Auto-Generated Code

The `core/generated/` directory contains TypeScript code auto-generated from OpenAPI schema:

- **Models**: 19 TypeScript interfaces
- **Services**: HTTP client methods
- **Core**: OpenAPI client internals

⚠️ **Never modify generated code manually!** Regenerate with `npm run schema:update`

## 🔒 Security

- ✅ Secrets in `.env.local` (gitignored)
- ✅ JWT tokens auto-refreshed by Amplify
- ✅ Type-safe environment variables
- ✅ API Key only for development (Cognito for production)

## 📈 Performance

Current bundle size:
- **Raw**: 397 KB
- **Compressed**: 108 KB

Features:
- Lazy loading for feature modules
- Tree shaking enabled
- Optimized build configuration

## 🧪 Testing (Future)

```bash
# Unit tests
npm run test

# E2E tests
npm run e2e
```

## 🚀 Deployment

Built artifacts are in `dist/university-books-mobile/`

Deploy to:
- AWS Amplify Hosting (recommended)
- S3 + CloudFront
- Vercel / Netlify

## 🐛 Troubleshooting

**Build errors?** → Check that all environment variables are set in `.env.local`

**API calls failing?** → Verify API_BASE_URL and credentials

**Can't find models?** → Read [WHERE-IS-WHAT.md](../../docs/mobile-app/WHERE-IS-WHAT.md)

**Type errors?** → Regenerate API client: `npm run schema:update`

## 📚 Learn More

- [Official Docs](../../docs/mobile-app/)
- [AWS Amplify Angular](https://docs.amplify.aws/angular/)
- [Angular Style Guide](https://angular.dev/style-guide)

## 📝 License

Private - Mariano Scada

---

**Stack**: Angular 19 + AWS Amplify Gen 2 + TypeScript + Tailwind CSS
**Updated**: December 2025
