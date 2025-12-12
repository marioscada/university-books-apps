# Generated API Client

## ⚠️ Warning

**DO NOT MODIFY FILES IN THIS DIRECTORY!**

All files in this directory are **auto-generated** from the OpenAPI schema.
Any manual changes will be lost on the next generation.

## Regeneration

To regenerate this code after schema updates:

```bash
npm run schema:fetch    # Download latest schema
npm run schema:generate # Generate TypeScript code
# Or combined:
npm run schema:update   # Does both
```

## Usage

### Import Models

```typescript
import type { User, AuthTokens } from '@/lib/generated';
```

### Import Services

```typescript
import { AuthService, TemplatesService } from '@/lib/generated';

const authService = new AuthService();
const tokens = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});
```

### Configure OpenAPI Client

```typescript
import { OpenAPI } from '@/lib/generated';

// Set base URL
OpenAPI.BASE = 'https://api.example.com';

// Set token (JWT from Cognito)
OpenAPI.TOKEN = async () => {
  const session = await Auth.currentSession();
  return session.getAccessToken().getJwtToken();
};
```

## Documentation

See `docs/AWS-BACKEND-INTEGRATION-GUIDE.md` for complete integration guide.

## Generated Files Structure

```
generated/
├── index.ts              # Main barrel export
├── core/                 # OpenAPI client core
│   ├── OpenAPI.ts        # Configuration
│   ├── ApiError.ts       # Error handling
│   ├── request.ts        # HTTP request logic
│   └── ...
├── models/               # TypeScript interfaces
│   ├── User.ts
│   ├── AuthTokens.ts
│   └── ...
└── services/             # API client services
    ├── AuthService.ts
    ├── TemplatesService.ts
    └── ...
```

---

**Last Generated**: 2025-12-11T23:20:49.065Z
**Generator**: openapi-typescript-codegen
**Source Schema**: schemas/current.json
