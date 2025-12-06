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

**⚠️ NEVER modify files in this library manually!**

All code is auto-generated from the OpenAPI schema. To update:

```bash
# Download latest schema and regenerate client
npm run schema:update

# Or step by step:
npm run schema:fetch      # Download schema from backend
npm run schema:generate   # Generate TypeScript code
```

The code will be regenerated in `libs/backend-api-client/src/generated/`

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
- Import from `'api-client'`
- Use the generated types and services
- Regenerate after backend schema changes
- Report issues if generated code has problems

### ❌ DON'T
- Modify files in `generated/` directory
- Copy-paste generated code to other projects
- Create your own API types (use generated ones)
- Commit `generated/` to git (it's gitignored)

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
