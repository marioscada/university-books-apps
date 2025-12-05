# AWS Backend Integration Guide
## Guida Completa per Sviluppatori Mobile App

**Data**: 5 Dicembre 2025
**Versione Backend**: 1.0.0
**API Gateway**: `https://omrsvjwsfh.execute-api.eu-south-1.amazonaws.com/dev/`
**Repository Backend**: `marioscada/ai-platform-university-books`

---

## 📋 Indice

1. [Panoramica Sistema](#panoramica-sistema)
2. [Setup Iniziale](#setup-iniziale)
3. [Autenticazione: Due Sistemi](#autenticazione-due-sistemi)
4. [Schema Management: Generazione Automatica Codice](#schema-management)
5. [Implementazione Step-by-Step](#implementazione-step-by-step)
6. [Struttura Directory Consigliata](#struttura-directory-consigliata)
7. [Script Automatici](#script-automatici)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Endpoints Disponibili](#endpoints-disponibili)

---

## 🎯 Panoramica Sistema

Il backend AWS fornisce un'infrastruttura completa per l'app mobile University Books con:

### Due Sistemi di Autenticazione Separati

1. **API Key** (Developer/Build-Time)
   - Per sviluppatori durante build/sviluppo
   - Accesso agli endpoint di sviluppo (schema, versioning)
   - Token permanente da configurare nell'environment
   - **NON usare in produzione lato client**

2. **Cognito JWT** (User/Runtime)
   - Per utenti finali dell'app
   - Login/Logout/Registrazione utenti
   - Token temporaneo (access token + refresh token)
   - Usare per tutte le chiamate API dell'app in produzione

### Sistema Schema Management

Il backend espone il suo OpenAPI 3.1.0 schema che permette di:
- ✅ Generare automaticamente TypeScript interfaces
- ✅ Generare automaticamente client HTTP (services)
- ✅ Generare automaticamente form validators
- ✅ Tracciare cambiamenti e breaking changes
- ✅ Mantenere versioni storiche degli schema

---

## 🚀 Setup Iniziale

### Step 1: Ottenere l'API Key

L'API Key è necessaria **SOLO** per gli script di build/sviluppo, **NON** per l'app in produzione.

```bash
# L'API Key è stata fornita dal team backend:
API_KEY=RErezCnnQ2a80EWrT7BXtPs1pcq708J1l66v0pY1
```

### Step 2: Configurare Environment Variables

Creare il file `.env.local` nella root del progetto:

```bash
# .env.local (NON committare questo file!)

# API Key per script di build/sviluppo (NON usare nell'app)
VITE_DEV_API_KEY=RErezCnnQ2a80EWrT7BXtPs1pcq708J1l66v0pY1

# URL Base API Gateway
VITE_API_BASE_URL=https://omrsvjwsfh.execute-api.eu-south-1.amazonaws.com/dev

# Cognito Configuration (per autenticazione utenti nell'app)
VITE_COGNITO_USER_POOL_ID=eu-south-1_jEu8Stbmc
VITE_COGNITO_CLIENT_ID=2k6isr2cfi30429noupl4bak0t
VITE_COGNITO_REGION=eu-south-1
```

### Step 3: Aggiungere al .gitignore

```bash
# .gitignore
.env.local
.env.*.local
generated/
schemas/
```

---

## 🔐 Autenticazione: Due Sistemi

### Sistema 1: API Key (Developer/Build-Time)

**Quando usare**: SOLO negli script di build per scaricare schema

```typescript
// scripts/fetch-schema.ts
const API_KEY = process.env.VITE_DEV_API_KEY; // Solo per script build

const response = await fetch(`${API_URL}/v1/openapi.json`, {
  headers: {
    'x-api-key': API_KEY, // ⚠️ Solo in script Node.js, NON nell'app!
  },
});
```

⚠️ **IMPORTANTE**: L'API Key **NON** deve essere usata nell'app Angular in produzione!

### Sistema 2: Cognito JWT (User/Runtime)

**Quando usare**: Per TUTTE le chiamate API dall'app mobile

```typescript
// src/services/auth.service.ts
import { Amplify, Auth } from 'aws-amplify';

// Configurazione Amplify
Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_COGNITO_REGION,
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  },
});

// Login utente
async function login(email: string, password: string) {
  try {
    const user = await Auth.signIn(email, password);
    const session = await Auth.currentSession();
    const accessToken = session.getAccessToken().getJwtToken();

    // Salvare il token per le chiamate API
    localStorage.setItem('accessToken', accessToken);

    return user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// Usare il token nelle chiamate API
async function callProtectedEndpoint() {
  const accessToken = localStorage.getItem('accessToken');

  const response = await fetch(`${API_URL}/v1/protected-endpoint`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`, // JWT Token per utenti
    },
  });

  return response.json();
}
```

---

## 📦 Schema Management

### Cosa Sono gli Schema OpenAPI?

Gli schema OpenAPI 3.1.0 descrivono **completamente** l'API del backend:
- Tutti gli endpoint disponibili
- Request body schemas (cosa inviare)
- Response schemas (cosa ricevere)
- Tipi di dato (string, number, object, array)
- Validazioni (required, minLength, pattern, etc.)
- Descrizioni ed esempi

### Perché Usare Schema Management?

**Senza Schema Management** (Manuale):
```typescript
// ❌ Scritto a mano, può diventare obsoleto
interface LoginRequest {
  email: string;
  password: string;
}

// ❌ Se il backend cambia, devi aggiornare manualmente
async function login(data: LoginRequest) {
  return fetch('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

**Con Schema Management** (Automatico):
```typescript
// ✅ Generato automaticamente dallo schema OpenAPI
import { LoginRequestDto, LoginResponseDto } from '@generated/types';
import { AuthService } from '@generated/services';

// ✅ TypeScript types sempre sincronizzati con il backend
const authService = new AuthService();
const response: LoginResponseDto = await authService.login({
  email: 'user@example.com',
  password: 'password123',
});
```

### Vantaggi della Generazione Automatica

1. ✅ **Zero Errori di Tipo**: TypeScript garantisce compatibilità
2. ✅ **Sempre Aggiornato**: Rigenera dopo ogni deploy backend
3. ✅ **Meno Codice**: Non scrivi HTTP calls manualmente
4. ✅ **Breaking Changes**: Rilevamento automatico incompatibilità
5. ✅ **Validazioni**: Form validators generati automaticamente
6. ✅ **Documentazione**: Inline comments dal backend

---

## 🛠 Implementazione Step-by-Step

### Step 1: Installare Dipendenze

```bash
# Installa i tool necessari
npm install --save-dev openapi-typescript-codegen
npm install --save-dev @openapitools/openapi-generator-cli

# Installa AWS Amplify per Cognito
npm install aws-amplify
```

### Step 2: Creare Script per Scaricare Schema

Creare il file `scripts/fetch-schema.ts`:

```typescript
import * as fs from 'fs';
import * as path from 'path';

const API_KEY = process.env.VITE_DEV_API_KEY;
const API_BASE_URL = process.env.VITE_API_BASE_URL;

if (!API_KEY || !API_BASE_URL) {
  throw new Error('Missing VITE_DEV_API_KEY or VITE_API_BASE_URL in .env.local');
}

async function fetchSchema() {
  console.log('🔍 Fetching OpenAPI schema from backend...');

  try {
    // 1. Check current version first (lightweight)
    const versionResponse = await fetch(`${API_BASE_URL}/v1/schema-version`, {
      headers: { 'x-api-key': API_KEY },
    });

    if (!versionResponse.ok) {
      throw new Error(`Failed to fetch version: ${versionResponse.statusText}`);
    }

    const versionInfo = await versionResponse.json();
    console.log(`📌 Current schema version: ${versionInfo.version}`);
    console.log(`📊 Endpoints: ${versionInfo.endpoints}, Schemas: ${versionInfo.schemas}`);
    console.log(`🔐 Hash: ${versionInfo.hash}`);

    // 2. Check if we need to update (compare hash)
    const schemasDir = path.join(process.cwd(), 'schemas');
    const currentSchemaPath = path.join(schemasDir, 'current.json');
    const hashFilePath = path.join(schemasDir, 'current.hash');

    let shouldUpdate = true;

    if (fs.existsSync(hashFilePath)) {
      const localHash = fs.readFileSync(hashFilePath, 'utf-8').trim();
      if (localHash === versionInfo.hash) {
        console.log('✅ Local schema is up to date!');
        shouldUpdate = false;
      } else {
        console.log('⚠️  Schema has changed, updating...');
      }
    } else {
      console.log('📥 No local schema found, downloading...');
    }

    if (!shouldUpdate) {
      return;
    }

    // 3. Download full schema
    const schemaResponse = await fetch(`${API_BASE_URL}/v1/openapi.json`, {
      headers: { 'x-api-key': API_KEY },
    });

    if (!schemaResponse.ok) {
      throw new Error(`Failed to fetch schema: ${schemaResponse.statusText}`);
    }

    const schema = await schemaResponse.json();

    // 4. Save schema to file
    if (!fs.existsSync(schemasDir)) {
      fs.mkdirSync(schemasDir, { recursive: true });
    }

    fs.writeFileSync(currentSchemaPath, JSON.stringify(schema, null, 2));
    fs.writeFileSync(hashFilePath, versionInfo.hash);

    console.log(`✅ Schema downloaded successfully!`);
    console.log(`   Version: ${versionInfo.version}`);
    console.log(`   Saved to: ${currentSchemaPath}`);

    // 5. Optional: Check for breaking changes if previous version exists
    const previousVersionPath = path.join(schemasDir, 'previous.json');
    if (fs.existsSync(previousVersionPath)) {
      console.log('🔍 Checking for breaking changes...');
      // TODO: Implement breaking changes detection
    }

    // 6. Backup previous schema
    if (fs.existsSync(currentSchemaPath)) {
      fs.copyFileSync(currentSchemaPath, previousVersionPath);
    }

  } catch (error) {
    console.error('❌ Failed to fetch schema:', error);
    process.exit(1);
  }
}

fetchSchema();
```

### Step 3: Creare Script per Generare Codice

Creare il file `scripts/generate-api-client.ts`:

```typescript
import { generate } from 'openapi-typescript-codegen';
import * as path from 'path';

async function generateClient() {
  console.log('🔨 Generating TypeScript client from OpenAPI schema...');

  try {
    await generate({
      input: path.join(process.cwd(), 'schemas', 'current.json'),
      output: path.join(process.cwd(), 'src', 'generated'),
      httpClient: 'fetch', // o 'axios' se preferite
      clientName: 'ApiClient',
      useOptions: true,
      useUnionTypes: true,
      exportCore: true,
      exportServices: true,
      exportModels: true,
      exportSchemas: true,
    });

    console.log('✅ TypeScript client generated successfully!');
    console.log('   Location: src/generated/');
    console.log('   Files:');
    console.log('     - models/     (TypeScript interfaces)');
    console.log('     - services/   (API client methods)');
    console.log('     - schemas/    (JSON schemas for validation)');

  } catch (error) {
    console.error('❌ Failed to generate client:', error);
    process.exit(1);
  }
}

generateClient();
```

### Step 4: Aggiungere Script a package.json

```json
{
  "scripts": {
    "schema:fetch": "tsx scripts/fetch-schema.ts",
    "schema:generate": "tsx scripts/generate-api-client.ts",
    "schema:update": "npm run schema:fetch && npm run schema:generate",
    "prebuild": "npm run schema:update"
  }
}
```

### Step 5: Configurare API Client con Autenticazione Cognito

Creare il file `src/services/api-client.config.ts`:

```typescript
import { OpenAPI } from '@generated/core/OpenAPI';
import { Auth } from 'aws-amplify';

/**
 * Configura l'API client generato per usare Cognito JWT tokens
 */
export async function configureApiClient() {
  // Base URL dell'API Gateway
  OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL;

  // Interceptor per aggiungere JWT token a tutte le richieste
  OpenAPI.TOKEN = async () => {
    try {
      const session = await Auth.currentSession();
      return session.getAccessToken().getJwtToken();
    } catch (error) {
      console.error('Failed to get access token:', error);
      return undefined;
    }
  };

  // Interceptor per gestire errori 401 (unauthorized)
  OpenAPI.interceptors = {
    response: async (response) => {
      if (response.status === 401) {
        // Token scaduto, prova a fare refresh
        try {
          const currentUser = await Auth.currentAuthenticatedUser();
          const session = await Auth.currentSession();

          if (session.isValid()) {
            // Riprova la richiesta con il nuovo token
            return fetch(response.url, {
              ...response,
              headers: {
                ...response.headers,
                'Authorization': `Bearer ${session.getAccessToken().getJwtToken()}`,
              },
            });
          }
        } catch (error) {
          // Refresh fallito, reindirizza al login
          console.error('Token refresh failed, redirecting to login');
          // TODO: Navigate to login page
        }
      }
      return response;
    },
  };
}
```

### Step 6: Inizializzare nel Main/Bootstrap

```typescript
// src/main.ts
import { Amplify } from 'aws-amplify';
import { configureApiClient } from './services/api-client.config';

// Configura Amplify (Cognito)
Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_COGNITO_REGION,
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  },
});

// Configura API Client generato
await configureApiClient();

// Avvia l'app Angular
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

### Step 7: Usare i Servizi Generati

```typescript
// src/components/login/login.component.ts
import { Component } from '@angular/core';
import { Auth } from 'aws-amplify';
import { AuthService } from '@generated/services';
import type { LoginRequestDto, LoginResponseDto } from '@generated/models';

@Component({
  selector: 'app-login',
  template: `
    <form (ngSubmit)="onLogin()">
      <input [(ngModel)]="email" type="email" placeholder="Email" />
      <input [(ngModel)]="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  `,
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService) {}

  async onLogin() {
    try {
      // 1. Login con Cognito (ottiene JWT token)
      const user = await Auth.signIn(this.email, this.password);
      console.log('Cognito user:', user);

      // 2. Ora tutte le chiamate API useranno automaticamente il JWT token
      // Il client generato include già l'header Authorization
      const userProfile = await this.authService.getUserProfile();
      console.log('User profile:', userProfile);

      // Naviga alla home
    } catch (error) {
      console.error('Login failed:', error);
    }
  }
}
```

---

## 📁 Struttura Directory Consigliata

```
university-books-apps/
├── .env.local                    # Environment variables (NON committare!)
├── .gitignore                    # Include .env.local, schemas/, generated/
├── package.json
├── scripts/
│   ├── fetch-schema.ts          # Scarica schema da AWS
│   ├── generate-api-client.ts   # Genera TypeScript client
│   └── check-breaking-changes.ts # Controlla breaking changes
├── schemas/
│   ├── current.json             # Schema OpenAPI corrente
│   ├── current.hash             # Hash SHA-256 dello schema
│   └── previous.json            # Backup schema precedente
├── src/
│   ├── generated/               # ⚠️ Auto-generato, NON modificare!
│   │   ├── models/              # TypeScript interfaces
│   │   │   ├── LoginRequestDto.ts
│   │   │   ├── LoginResponseDto.ts
│   │   │   └── ...
│   │   ├── services/            # API client services
│   │   │   ├── AuthService.ts
│   │   │   ├── TemplatesService.ts
│   │   │   └── ...
│   │   ├── schemas/             # JSON schemas per validazione
│   │   └── core/                # OpenAPI client core
│   ├── services/
│   │   ├── api-client.config.ts # Configurazione client (Cognito JWT)
│   │   └── auth.service.ts      # Wrapper per AWS Amplify Auth
│   └── main.ts
└── docs/
    └── AWS-BACKEND-INTEGRATION-GUIDE.md  # Questo documento
```

---

## 🤖 Script Automatici

### Script 1: Fetch Schema (Pre-Build)

**Quando eseguirlo**: Prima di ogni build, automaticamente

```bash
npm run schema:fetch
```

**Cosa fa**:
1. Controlla la versione corrente dello schema (`/v1/schema-version`)
2. Confronta l'hash con la versione locale
3. Se diverso, scarica il nuovo schema (`/v1/openapi.json`)
4. Salva in `schemas/current.json`
5. Backup vecchio schema in `schemas/previous.json`

### Script 2: Generate Client

**Quando eseguirlo**: Dopo ogni fetch dello schema

```bash
npm run schema:generate
```

**Cosa fa**:
1. Legge `schemas/current.json`
2. Genera TypeScript interfaces in `src/generated/models/`
3. Genera servizi API in `src/generated/services/`
4. Genera JSON schemas in `src/generated/schemas/`

### Script 3: Update (Fetch + Generate)

**Quando eseguirlo**: Durante sviluppo, o pre-build

```bash
npm run schema:update
```

**Cosa fa**:
1. Esegue `schema:fetch`
2. Esegue `schema:generate`
3. Pronto per il build!

### Script 4: Check Breaking Changes (Avanzato)

Creare `scripts/check-breaking-changes.ts`:

```typescript
import * as fs from 'fs';
import * as path from 'path';

const API_KEY = process.env.VITE_DEV_API_KEY;
const API_BASE_URL = process.env.VITE_API_BASE_URL;

async function checkBreakingChanges() {
  console.log('🔍 Checking for breaking changes...');

  // Leggi versione locale corrente
  const schemasDir = path.join(process.cwd(), 'schemas');
  const currentSchemaPath = path.join(schemasDir, 'current.json');

  if (!fs.existsSync(currentSchemaPath)) {
    console.log('⚠️  No local schema found. Run npm run schema:fetch first.');
    return;
  }

  const currentSchema = JSON.parse(fs.readFileSync(currentSchemaPath, 'utf-8'));
  const localVersion = currentSchema.info.version;

  // Controlla versione remota
  const versionResponse = await fetch(`${API_BASE_URL}/v1/schema-version`, {
    headers: { 'x-api-key': API_KEY },
  });

  const remoteInfo = await versionResponse.json();
  const remoteVersion = remoteInfo.version;

  console.log(`📌 Local version: ${localVersion}`);
  console.log(`📌 Remote version: ${remoteVersion}`);

  if (localVersion === remoteVersion) {
    console.log('✅ No changes detected.');
    return;
  }

  // Controlla breaking changes
  const breakingResponse = await fetch(
    `${API_BASE_URL}/v1/breaking-changes?from=${localVersion}&to=${remoteVersion}`,
    { headers: { 'x-api-key': API_KEY } }
  );

  const breakingChanges = await breakingResponse.json();

  if (!breakingChanges.hasBreakingChanges) {
    console.log('✅ No breaking changes detected!');
    console.log(`   You can safely update from ${localVersion} to ${remoteVersion}`);
    return;
  }

  // Breaking changes trovati!
  console.error('❌ BREAKING CHANGES DETECTED!');
  console.error(`\n🔴 Summary:`);
  console.error(`   Critical: ${breakingChanges.summary.critical}`);
  console.error(`   High:     ${breakingChanges.summary.high}`);
  console.error(`   Medium:   ${breakingChanges.summary.medium}`);
  console.error(`   Low:      ${breakingChanges.summary.low}`);

  console.error(`\n📋 Breaking changes:\n`);
  breakingChanges.breaking.forEach((change: any, index: number) => {
    console.error(`${index + 1}. [${change.severity.toUpperCase()}] ${change.type}`);
    console.error(`   Path: ${change.path}`);
    console.error(`   Description: ${change.description}`);
    console.error(`   Migration: ${change.migrationHint}`);
    console.error(``);
  });

  // Fail CI/CD se ci sono breaking changes critici
  if (breakingChanges.summary.critical > 0) {
    console.error('❌ CRITICAL breaking changes detected! Build failed.');
    process.exit(1);
  }

  console.warn('⚠️  Breaking changes detected but build continues.');
  console.warn('   Please review and update your code accordingly.');
}

checkBreakingChanges();
```

Aggiungere a `package.json`:

```json
{
  "scripts": {
    "schema:check": "tsx scripts/check-breaking-changes.ts",
    "prebuild": "npm run schema:check && npm run schema:update"
  }
}
```

---

## ✅ Best Practices

### 1. NON Modificare File Generati

```typescript
// ❌ NON fare questo!
// src/generated/models/LoginRequestDto.ts
export interface LoginRequestDto {
  email: string;
  password: string;
  rememberMe: boolean; // ❌ Campo aggiunto manualmente
}

// ✅ Crea wrapper invece
// src/models/login.model.ts
import { LoginRequestDto } from '@generated/models';

export interface LoginRequest extends LoginRequestDto {
  rememberMe: boolean; // ✅ Estensione custom
}
```

### 2. Usare Enum Generati

```typescript
// ✅ Gli enum vengono generati dallo schema
import { TemplateStatus } from '@generated/models';

function updateTemplate(status: TemplateStatus) {
  // TypeScript garantisce che il valore sia valido
  console.log(status); // 'draft' | 'active' | 'retired'
}
```

### 3. Gestire Errori Tipizzati

```typescript
import { ApiError } from '@generated/core/ApiError';

try {
  await authService.login({ email, password });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status}: ${error.message}`);
    console.error('Body:', error.body);
  }
}
```

### 4. Cache dello Schema

```typescript
// Non scaricare lo schema ogni volta!
// Usa l'hash per controllare se è cambiato

const localHash = localStorage.getItem('schemaHash');
const remoteInfo = await fetch('/v1/schema-version');

if (localHash === remoteInfo.hash) {
  console.log('Schema up to date, skip download');
}
```

### 5. Versioning dell'App

```typescript
// Traccia quale versione schema sta usando l'app
const APP_VERSION = '1.2.0';
const SCHEMA_VERSION = currentSchema.info.version;

console.log(`App v${APP_VERSION} using API Schema v${SCHEMA_VERSION}`);
```

---

## 🐛 Troubleshooting

### Problema 1: "Missing Authentication Token"

**Errore**:
```
{"message":"Missing Authentication Token"}
```

**Soluzione**:
- Verifica che l'URL sia corretto
- Controlla che l'endpoint esista
- Assicurati di includere l'header `x-api-key` (per endpoint developer)

```typescript
// ✅ Corretto
fetch(`${API_URL}/v1/openapi.json`, {
  headers: { 'x-api-key': API_KEY }
});

// ❌ Errato (manca header)
fetch(`${API_URL}/v1/openapi.json`);
```

### Problema 2: "403 Forbidden"

**Errore**:
```
{"message":"Forbidden"}
```

**Soluzione**:
- API Key errata o scaduta
- Richiedi una nuova API Key al team backend
- Verifica che l'API Key sia configurata in `.env.local`

### Problema 3: Schema Generation Failed

**Errore**:
```
Error: Invalid OpenAPI schema
```

**Soluzione**:
```bash
# Cancella cache e riprova
rm -rf schemas/ src/generated/
npm run schema:update
```

### Problema 4: Cognito JWT Expired

**Errore**:
```
401 Unauthorized
```

**Soluzione**:
```typescript
// Implementa auto-refresh del token
try {
  const currentUser = await Auth.currentAuthenticatedUser();
  const session = await Auth.currentSession();

  // Token viene refreshato automaticamente
  console.log('Token refreshed');
} catch {
  // Redirect to login
}
```

---

## 📡 Endpoints Disponibili

### Developer Endpoints (Richiedono API Key)

| Endpoint | Metodo | Scopo | Rate Limit |
|----------|--------|-------|------------|
| `/v1/schema-version` | GET | Verifica versione schema | 50 req/sec |
| `/v1/openapi.json` | GET | Scarica schema completo | 10 req/sec |
| `/v1/schema-history` | GET | Lista versioni storiche | 50 req/sec |
| `/v1/schema-diff` | GET | Confronta due versioni | 50 req/sec |
| `/v1/breaking-changes` | GET | Rileva breaking changes | 50 req/sec |
| `/v1/schema-storage` | POST | Salva versione (CI/CD) | 50 req/sec |

**Header richiesto**:
```
x-api-key: RErezCnnQ2a80EWrT7BXtPs1pcq708J1l66v0pY1
```

### User Endpoints (Richiedono Cognito JWT)

| Endpoint | Metodo | Scopo | Auth |
|----------|--------|-------|------|
| `/v1/auth/login` | POST | Login utente | Public |
| `/v1/auth/register` | POST | Registrazione | Public |
| `/v1/auth/refresh` | POST | Refresh token | Public |
| `/v1/auth/logout` | POST | Logout | JWT |
| `/v1/auth/forgot-password` | POST | Reset password | Public |
| `/v1/auth/reset-password` | POST | Conferma reset | Public |
| `/v1/auth/change-password` | POST | Cambia password | JWT |

**Header richiesto** (per endpoint protetti):
```
Authorization: Bearer <JWT_TOKEN>
```

### Esempio Completo: Login Flow

```typescript
import { Auth } from 'aws-amplify';
import { AuthService } from '@generated/services';

// 1. Login con Cognito
const user = await Auth.signIn('user@example.com', 'password123');

// 2. Ottieni JWT token (automatico con configureApiClient)
const session = await Auth.currentSession();
const token = session.getAccessToken().getJwtToken();

// 3. Usa servizi generati (token incluso automaticamente)
const authService = new AuthService();

// Tutte le chiamate successive includono automaticamente il JWT token
const profile = await authService.getUserProfile();
console.log('User profile:', profile);
```

---

## 🚀 Quick Start Checklist

- [ ] 1. Clonare repository mobile
- [ ] 2. Creare `.env.local` con API Key e configurazione Cognito
- [ ] 3. Aggiungere `.env.local` al `.gitignore`
- [ ] 4. Installare dipendenze (`npm install`)
- [ ] 5. Creare directory `scripts/` con i 3 script
- [ ] 6. Aggiornare `package.json` con npm scripts
- [ ] 7. Eseguire `npm run schema:update` per scaricare schema
- [ ] 8. Verificare che `src/generated/` sia stato creato
- [ ] 9. Configurare Amplify in `main.ts`
- [ ] 10. Configurare API Client con JWT interceptor
- [ ] 11. Implementare componente Login
- [ ] 12. Testare login e chiamate API
- [ ] 13. Aggiungere `npm run schema:check` al CI/CD

---

## 📚 Riferimenti

### Documentazione Backend
- Repository: `https://github.com/marioscada/ai-platform-university-books`
- API Key Guide: `docs/DEVELOPER-API-KEY-GUIDE.md`
- API Key Summary: `docs/API-KEY-SUMMARY.md`

### Tools
- OpenAPI TypeScript Codegen: https://github.com/ferdikoomen/openapi-typescript-codegen
- AWS Amplify: https://docs.amplify.aws/
- OpenAPI Specification: https://swagger.io/specification/

### AWS Resources
- API Gateway: `https://omrsvjwsfh.execute-api.eu-south-1.amazonaws.com/dev/`
- Cognito User Pool: `eu-south-1_jEu8Stbmc`
- S3 Schemas Bucket: `ai-platform-schemas-dev-540649423548`

---

## 📞 Supporto

Per domande o problemi:
1. Verificare questo documento
2. Consultare `DEVELOPER-API-KEY-GUIDE.md` nel repository backend
3. Controllare CloudWatch Logs per errori server-side
4. Contattare il team backend

---

**Data ultimo aggiornamento**: 5 Dicembre 2025
**Versione documento**: 1.0.0
**Prossimo schema review**: Ogni deploy backend

---

## 🎓 Tutorial Pratico

### Esempio Completo: Implementare Login + Protected API Call

```typescript
// 1. Configure Amplify (main.ts)
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'eu-south-1',
    userPoolId: 'eu-south-1_jEu8Stbmc',
    userPoolWebClientId: '2k6isr2cfi30429noupl4bak0t',
  },
});

// 2. Configure API Client (api-client.config.ts)
import { OpenAPI } from '@generated/core/OpenAPI';
import { Auth } from 'aws-amplify';

OpenAPI.BASE = 'https://omrsvjwsfh.execute-api.eu-south-1.amazonaws.com/dev';
OpenAPI.TOKEN = async () => {
  const session = await Auth.currentSession();
  return session.getAccessToken().getJwtToken();
};

// 3. Login Component (login.component.ts)
import { Component } from '@angular/core';
import { Auth } from 'aws-amplify';

@Component({
  selector: 'app-login',
  template: `
    <form (ngSubmit)="onLogin()">
      <input [(ngModel)]="email" type="email" />
      <input [(ngModel)]="password" type="password" />
      <button type="submit">Login</button>
    </form>
  `,
})
export class LoginComponent {
  email = '';
  password = '';

  async onLogin() {
    try {
      // Login con Cognito
      await Auth.signIn(this.email, this.password);

      // Naviga alla home page
      console.log('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
    }
  }
}

// 4. Use Generated Service (any-component.ts)
import { Component, OnInit } from '@angular/core';
import { TemplatesService } from '@generated/services';
import type { Template } from '@generated/models';

@Component({
  selector: 'app-templates',
  template: `
    <div *ngFor="let template of templates">
      {{ template.name }}
    </div>
  `,
})
export class TemplatesComponent implements OnInit {
  templates: Template[] = [];

  constructor(private templatesService: TemplatesService) {}

  async ngOnInit() {
    // JWT token incluso automaticamente!
    this.templates = await this.templatesService.listTemplates();
  }
}
```

---

**Fine Documento** ✅
