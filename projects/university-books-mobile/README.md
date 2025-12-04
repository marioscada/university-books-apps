# University Books Mobile

Modern Angular mobile application for the University Books platform.

## 🚀 Features

- ✅ **API Key Authentication** (temporary, for development)
- ✅ **Type-safe HTTP Client** with automatic error handling
- ✅ **Functional Interceptors** (modern Angular pattern)
- ✅ **Environment-based Configuration**
- ✅ **Retry Logic** with exponential backoff
- ✅ **Comprehensive Error Handling**
- 📱 Ready for **Cognito Authentication** (when implementing login)

## 📋 Prerequisites

- Node.js 18+ and npm
- Angular CLI 17+
- Backend API deployed with API Key enabled

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get API Key from Backend

In the backend repository (`ai-platform-university-books`):

```bash
./scripts/mobile-apps/university-books-mobile/get-api-key.sh dev
```

Copy the API Key displayed.

### 3. Configure Environment

**Option A: Using environment.local.ts (Recommended)**

Create `src/environments/environment.local.ts`:

```typescript
import { environment as base } from './environment';

export const environment = {
  ...base,
  api: {
    ...base.api,
    baseUrl: 'https://YOUR_API_ID.execute-api.eu-south-1.amazonaws.com/dev',
  },
  auth: {
    ...base.auth,
    apiKey: 'YOUR_ACTUAL_API_KEY_HERE', // Paste your API Key
  },
};
```

Update `angular.json` to use `environment.local.ts`:

```json
{
  "configurations": {
    "development": {
      "fileReplacements": [
        {
          "replace": "projects/university-books-mobile/src/environments/environment.ts",
          "with": "projects/university-books-mobile/src/environments/environment.local.ts"
        }
      ]
    }
  }
}
```

**Option B: Direct Edit (Not Recommended)**

Edit `src/environments/environment.ts` directly:

```typescript
export const environment = {
  // ...
  api: {
    baseUrl: 'https://YOUR_API_ID.execute-api.eu-south-1.amazonaws.com/dev',
    // ...
  },
  auth: {
    apiKey: 'YOUR_ACTUAL_API_KEY_HERE',
  },
};
```

⚠️ **Never commit API Keys to git!**

### 4. Run Development Server

```bash
npm run start:university-books-mobile
```

Navigate to `http://localhost:4200/`

## 🏗️ Architecture

### Project Structure

```
projects/university-books-mobile/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── interceptors/
│   │   │   │   └── api-key.interceptor.ts   # Auto-inject API Key
│   │   │   └── services/
│   │   │       └── api.service.ts            # Centralized API calls
│   │   ├── app.config.ts                     # App-wide providers
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   └── environments/
│       ├── environment.ts                     # Dev config
│       ├── environment.prod.ts                # Prod config
│       └── environment.local.ts               # Local overrides (gitignored)
```

### Key Files

#### 1. **environment.ts** - Configuration

```typescript
export const environment = {
  production: false,
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 30000,
    retryAttempts: 3,
  },
  auth: {
    apiKey: '', // Your API Key here
  },
  features: {
    enableDebugLogging: true,
  },
};
```

#### 2. **api-key.interceptor.ts** - Auto API Key Injection

Automatically adds `x-api-key` header to all API requests:

```typescript
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const apiKey = environment.auth.apiKey;
  if (apiKey && req.url.startsWith(environment.api.baseUrl)) {
    req = req.clone({ setHeaders: { 'x-api-key': apiKey } });
  }
  return next(req);
};
```

#### 3. **api.service.ts** - Type-safe API Calls

```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  getDocument(id: string): Observable<Document> {
    return this.get<Document>(`/v1/documents/${id}`);
  }
}
```

#### 4. **app.config.ts** - Providers Setup

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([apiKeyInterceptor])),
    // ... other providers
  ],
};
```

## 💡 Usage Examples

### Basic Component with API Call

```typescript
import { Component, inject, signal } from '@angular/core';
import { ApiService } from './core/services/api.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  template: `
    @if (loading()) {
      <p>Loading...</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else {
      <ul>
        @for (doc of documents(); track doc.id) {
          <li>{{ doc.fileName }} ({{ doc.fileSize }} bytes)</li>
        }
      </ul>
    }
  `,
})
export class DocumentsComponent {
  private api = inject(ApiService);

  documents = signal<Document[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.loading.set(true);
    this.api.getDocument('doc-123').subscribe({
      next: (doc) => {
        this.documents.set([doc]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
```

### Health Check

```typescript
this.api.healthCheck().subscribe({
  next: (response) => console.log('API Status:', response.status),
  error: (err) => console.error('API is down:', err),
});
```

### Document Upload

```typescript
uploadFile(file: File) {
  this.api.getPresignedUrl(file.name, file.type).subscribe({
    next: ({ uploadUrl, documentId }) => {
      // Upload file to S3
      this.http.put(uploadUrl, file).subscribe({
        next: () => console.log('Upload successful!'),
        error: (err) => console.error('Upload failed:', err)
      });
    }
  });
}
```

## 🔒 Security Best Practices

### ✅ DO

- Keep API Keys in `environment.local.ts` (git-ignored)
- Use environment variables in CI/CD for production
- Implement proper authentication (Cognito) for production
- Enable HTTPS only in production
- Set appropriate CORS headers on backend

### ❌ DON'T

- Commit API Keys to git
- Use API Keys in production (use Cognito instead)
- Hard-code sensitive values
- Disable SSL certificate validation

## 🚧 Migration to Cognito (Future)

When implementing login UI:

1. Install AWS Amplify:
   ```bash
   npm install aws-amplify @aws-amplify/adapter-angular
   ```

2. Update `environment.ts`:
   ```typescript
   auth: {
     cognito: {
       userPoolId: 'eu-south-1_XXX',
       userPoolClientId: 'XXX',
       region: 'eu-south-1',
     },
   }
   ```

3. Create `auth.interceptor.ts` for JWT tokens

4. Remove `apiKeyInterceptor` and `auth.apiKey`

## 📚 Resources

- [Angular Documentation](https://angular.dev/)
- [Angular HTTP Client](https://angular.dev/guide/http)
- [RxJS Operators](https://rxjs.dev/guide/operators)
- [AWS Amplify Angular](https://docs.amplify.aws/angular/)

## 🐛 Troubleshooting

### Issue: 401 Unauthorized

**Solution**: Check that:
1. API Key is correctly set in `environment.ts`
2. Backend is deployed and accessible
3. API Key hasn't expired

### Issue: CORS Errors

**Solution**: Ensure backend API Gateway has CORS enabled for your domain.

### Issue: Timeout Errors

**Solution**: Increase timeout in `environment.ts`:
```typescript
api: {
  timeout: 60000, // 60 seconds
}
```

## 📝 License

Private - Mariano Scada

## 👥 Contributors

- Mariano Scada
- Claude (AI Assistant)

---

**Last Updated**: December 2024
**Angular Version**: 17+
**Backend**: AWS CDK + API Gateway + Lambda
