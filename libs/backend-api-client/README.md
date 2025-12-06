# @university-books/backend-api-client

Auto-generated TypeScript API client from OpenAPI 3.1.0 schema.

## 📦 What's Inside

This library contains **auto-generated** TypeScript code that provides type-safe HTTP clients for all backend endpoints.

### Generated Code

- **19 Models** (TypeScript interfaces): `LoginRequest`, `DocumentMetadata`, etc.
- **2 Services** (HTTP clients): `AuthenticationService`, `DocumentsService`
- **Core** (OpenAPI client): Error handling, request logic

## 🎯 Purpose

This is a **shared library** used by all Angular projects in the monorepo that communicate with the same backend:

- `university-books-mobile` (current)
- `university-books-web` (future)
- `university-books-admin` (future)

**Why a shared library?**
- ✅ Single source of truth for API types
- ✅ Type safety guaranteed across all projects
- ✅ One `npm run schema:update` updates all consumers
- ✅ No code duplication

## 🚀 Usage

### Import in Your Project

```typescript
// Import models (TypeScript interfaces)
import { LoginRequest, LoginResponse, DocumentMetadata } from '@university-books/backend-api-client';

// Import services (HTTP clients)
import { AuthenticationService, DocumentsService } from '@university-books/backend-api-client';

// Import core (OpenAPI config, errors)
import { OpenAPI, ApiError } from '@university-books/backend-api-client';
```

### Examples

#### Login Example

```typescript
import { AuthenticationService, LoginRequest } from '@university-books/backend-api-client';

const credentials: LoginRequest = {
  username: 'user@example.com',
  password: 'password123'
};

const response = await AuthenticationService.postV1AuthLogin({
  requestBody: credentials
});

console.log(response.accessToken);
```

#### Document Upload Example

```typescript
import { DocumentsService, PresignedUrlRequest } from '@university-books/backend-api-client';

const request: PresignedUrlRequest = {
  fileName: 'document.pdf',
  contentType: 'application/pdf'
};

const { uploadUrl, documentId } = await DocumentsService.postV1DocumentsPresignedUrl({
  requestBody: request
});

// Upload file to S3
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type }
});
```

## ⚙️ Configuration

The API client needs to be configured before use:

```typescript
import { OpenAPI } from '@university-books/backend-api-client';

// Set base URL
OpenAPI.BASE = 'https://api.example.com';

// Set authentication token
OpenAPI.TOKEN = async () => {
  const session = await getAuthSession();
  return session.accessToken;
};
```

See `projects/university-books-mobile/src/app/core/config/api-client.config.ts` for complete example.

## 🔄 Regeneration

**⚠️ IMPORTANT: This is a LIBRARY - treat it as a stable dependency!**

All code is auto-generated from the OpenAPI schema, but follows **enterprise best practices**:

### When to Regenerate

**Only regenerate when:**
- ✅ Backend API has breaking changes
- ✅ New endpoints or models are added
- ✅ Field types change
- ❌ **NOT** on every build or PR

### How to Regenerate

```bash
# 1. Download latest schema from backend (requires API keys in .env.local)
npm run schema:fetch

# 2. Generate TypeScript code
npm run schema:generate

# 3. Or combined:
npm run schema:update

# 4. Verify changes
git diff libs/backend-api-client/src/generated/

# 5. Commit the generated code
git add libs/backend-api-client/src/generated/
git commit -m "chore(api-client): update from backend schema vX.Y.Z"
```

### Why Generated Code is Committed

Following **Angular, AWS SDK, and enterprise patterns**:
- ✅ Generated code is **stable** and **deterministic**
- ✅ CI/CD can build without API keys
- ✅ Developers don't need backend access
- ✅ Version control tracks API changes
- ✅ Build is **fast** and **reliable**

**This is the same approach used by:**
- `@angular/*` packages (generated code committed)
- `aws-sdk` (generated clients committed)
- `@prisma/client` (generated schema committed)

## 📂 Structure

```
libs/backend-api-client/
├── src/
│   ├── generated/              🤖 Auto-generated (DO NOT EDIT)
│   │   ├── models/             TypeScript interfaces
│   │   ├── services/           HTTP client methods
│   │   └── core/               OpenAPI client internals
│   └── index.ts                Public exports
├── README.md                   This file
└── package.json
```

## 🔒 Important Rules

### ✅ DO
- Import from `@university-books/backend-api-client`
- Use the generated types and services
- Regenerate after backend schema changes (manual process)
- Commit generated code changes (library pattern)
- Review diffs before committing
- Document schema version in commit message

### ❌ DON'T
- Modify files in `generated/` directory manually
- Copy-paste generated code to other projects
- Create your own API types (use generated ones)
- Auto-regenerate on every build (performance killer)
- Regenerate without testing

## 📚 Available Exports

### Models (Interfaces)

- `ChangePasswordRequest`
- `ChangePasswordResponse`
- `DocumentMetadata`
- `DocumentStatus`
- `ErrorResponse`
- `ForgotPasswordRequest`
- `ForgotPasswordResponse`
- `LoginRequest`
- `LoginResponse`
- `LogoutResponse`
- `MessageResponse`
- `PresignedUrlRequest`
- `PresignedUrlResponse`
- `RefreshTokenRequest`
- `RefreshTokenResponse`
- `RegisterRequest`
- `RegisterResponse`
- `ResetPasswordRequest`
- `ResetPasswordResponse`

### Services (HTTP Clients)

- `AuthenticationService`
  - `postV1AuthLogin()`
  - `postV1AuthRegister()`
  - `postV1AuthRefreshToken()`
  - `postV1AuthForgotPassword()`
  - `postV1AuthResetPassword()`
  - `postV1AuthChangePassword()`
  - `postV1AuthLogout()`

- `DocumentsService`
  - `postV1DocumentsPresignedUrl()`

### Core

- `OpenAPI` - Configuration object
- `ApiError` - Error class
- `CancelablePromise` - Promise wrapper
- `CancelError` - Cancel error class

## 🐛 Troubleshooting

**Import errors?**
→ Check that path mapping in `tsconfig.json` is correct:
```json
{
  "paths": {
    "@university-books/backend-api-client": ["./libs/backend-api-client/src/public-api.ts"]
  }
}
```

**Type errors after schema update?**
→ Restart your IDE/editor to reload TypeScript

**Build errors?**
→ Ensure all projects are using the library, not local copies

## 📖 Documentation

- [WHERE-IS-WHAT.md](../../docs/mobile-app/WHERE-IS-WHAT.md) - Find models, services, configs
- [NAMING-CLARIFICATION.md](../../docs/mobile-app/NAMING-CLARIFICATION.md) - API Types vs Domain Models
- [AWS Backend Integration Guide](../../docs/AWS-BACKEND-INTEGRATION-GUIDE.md)

## 📝 Version

**OpenAPI Version:** 3.1.0
**API Version:** 1.0.0
**Generator:** openapi-typescript-codegen
**Last Generated:** Auto-updated on each `npm run schema:update`

---

**This is a shared library** - Changes affect all consuming projects!
