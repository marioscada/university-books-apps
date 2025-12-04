# Auth Library - Reusable Angular Authentication with AWS Cognito

Libreria Angular riutilizzabile per autenticazione con AWS Cognito, token management e UI customizzabile.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Library Structure](#library-structure)
4. [Core Features](#core-features)
5. [Implementation Guide](#implementation-guide)
6. [Usage in Projects](#usage-in-projects)
7. [Customization](#customization)

---

## 🎯 Overview

### Obiettivo

Creare una **libreria auth riutilizzabile** che:
- ✅ Gestisce autenticazione AWS Cognito (email/password)
- ✅ Token management automatico (access, ID, refresh)
- ✅ Token refresh automatico per sessioni persistenti (giorni/settimane)
- ✅ UI customizzabile tramite projection/templates
- ✅ Esportabile per uso in altri progetti Angular

### Scope Iniziale (v1.0)

**Incluso**:
- Login email/password con AWS Cognito
- Token JWT storage sicuro (Ionic Storage)
- Auto-refresh token prima della scadenza
- Logout con invalidazione token
- Auth guards per protezione route
- Auth interceptor per JWT headers
- State management con RxJS

**Non incluso (future)**:
- Social login (Google, Apple, Facebook)
- Multi-factor authentication (MFA)
- Password reset flow
- Email verification

---

## 🏗️ Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│         APPLICATION (Consumer Project)              │
│  ┌────────────────────────────────────────────┐    │
│  │  Custom Login UI                           │    │
│  │  - Uses library services                   │    │
│  │  - Custom styling                          │    │
│  │  - Project-specific logic                  │    │
│  └─────────────────┬──────────────────────────┘    │
└────────────────────┼────────────────────────────────┘
                     │
                     │ Uses
                     ▼
┌─────────────────────────────────────────────────────┐
│         AUTH LIBRARY (@libs/auth)                   │
│  ┌────────────────────────────────────────────┐    │
│  │  PUBLIC API                                │    │
│  │  - Services (AuthService, TokenService)   │    │
│  │  - Guards (AuthGuard)                     │    │
│  │  - Interceptors (AuthInterceptor)         │    │
│  │  - Models (interfaces, types)             │    │
│  └─────────────────┬──────────────────────────┘    │
│                    │                                │
│  ┌─────────────────┴──────────────────────────┐    │
│  │  CORE LOGIC                                │    │
│  │  - AuthService (Cognito integration)      │    │
│  │  - TokenService (JWT management)          │    │
│  │  - AuthStateService (RxJS state)          │    │
│  │  - StorageService (secure persistence)    │    │
│  └─────────────────┬──────────────────────────┘    │
│                    │                                │
│  ┌─────────────────┴──────────────────────────┐    │
│  │  INFRASTRUCTURE                            │    │
│  │  - Ionic Storage implementation            │    │
│  │  - HTTP client                             │    │
│  │  - AWS Cognito SDK                         │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Dependency Flow

```
Consumer App
     │
     ▼
@libs/auth (Public API)
     │
     ▼
Core Services (Business Logic)
     │
     ▼
Infrastructure (AWS Cognito, Storage)
```

**Key Principle**: L'app consumer dipende solo dalla public API della libreria. Nessuna dipendenza diretta su AWS Cognito o Ionic Storage.

---

## 📁 Library Structure

```
libs/auth/
├── src/
│   ├── lib/
│   │   ├── models/                    # Public interfaces
│   │   │   ├── auth.models.ts         # User, Tokens, Credentials
│   │   │   ├── auth-config.models.ts  # Library configuration
│   │   │   ├── auth-errors.models.ts  # Custom errors
│   │   │   └── index.ts
│   │   │
│   │   ├── services/                  # Core business logic
│   │   │   ├── auth.service.ts        # Main auth orchestrator
│   │   │   ├── token.service.ts       # Token management
│   │   │   ├── auth-state.service.ts  # RxJS state management
│   │   │   ├── storage.service.ts     # Secure storage abstraction
│   │   │   └── index.ts
│   │   │
│   │   ├── guards/                    # Route protection
│   │   │   ├── auth.guard.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── interceptors/              # HTTP middleware
│   │   │   ├── auth.interceptor.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── providers/                 # DI configuration
│   │   │   ├── auth-providers.ts      # provideAuth()
│   │   │   └── index.ts
│   │   │
│   │   └── utils/                     # Utilities
│   │       ├── token-decoder.ts
│   │       └── validators.ts
│   │
│   └── public-api.ts                  # Library entry point
│
├── ng-package.json                    # Build configuration
├── package.json
├── tsconfig.lib.json
└── README.md
```

---

## ⚙️ Core Features

### 1. Token Management con Auto-Refresh

**Problema**: I token JWT scadono (es. 1 ora). Come mantenere l'utente loggato per giorni/settimane?

**Soluzione**: Token refresh automatico

```typescript
// TokenService - Auto refresh logic
export class TokenService {
  private readonly REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minuti prima

  async getAccessToken(): Promise<string | null> {
    const token = await this.storage.get<string>('access_token');
    const expiresAt = await this.storage.get<number>('token_expiry');

    // Se token scade tra meno di 5 minuti, refresha
    if (Date.now() >= expiresAt - this.REFRESH_BUFFER_MS) {
      return await this.refreshToken();
    }

    return token;
  }

  private async refreshToken(): Promise<string | null> {
    const refreshToken = await this.storage.get<string>('refresh_token');

    // Call Cognito refresh endpoint
    const newTokens = await this.authService.refresh(refreshToken);
    await this.saveTokens(newTokens);

    return newTokens.accessToken;
  }
}
```

**Risultato**: L'utente resta loggato finché il refresh token è valido (configurabile in Cognito: 30 giorni default).

### 2. Secure Storage con Ionic Storage

**iOS**: Keychain (hardware encryption)
**Android**: Keystore (hardware-backed)
**Web**: IndexedDB (encrypted in browser)

```typescript
// StorageService - Abstraction layer
export interface IStorage {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class StorageService implements IStorage {
  constructor(private ionicStorage: Storage) {}

  async get<T>(key: string): Promise<T | null> {
    return await this.ionicStorage.get(key);
  }

  // ... altri metodi
}
```

### 3. RxJS State Management

```typescript
export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private stateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  });

  public state$ = this.stateSubject.asObservable();
  public isAuthenticated$ = this.state$.pipe(map(s => s.isAuthenticated));
  public user$ = this.state$.pipe(map(s => s.user));

  setAuthenticated(value: boolean): void {
    this.updateState({ isAuthenticated: value });
  }

  // ... altri metodi
}
```

### 4. Auth Interceptor per JWT Headers

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  return from(tokenService.getAccessToken()).pipe(
    switchMap(token => {
      if (token && !isAuthEndpoint(req.url)) {
        const cloned = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next(cloned);
      }
      return next(req);
    }),
    catchError(error => {
      if (error.status === 401) {
        // Token expired, try refresh
        return handleTokenRefresh(req, next);
      }
      return throwError(() => error);
    })
  );
};
```

---

## 🔧 Implementation Guide

### Phase 1: Models & Interfaces

**File**: `libs/auth/src/lib/models/auth.models.ts`

```typescript
/**
 * User information from Cognito ID token
 */
export interface UserInfo {
  sub: string;              // Cognito User UUID
  email: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
}

/**
 * JWT tokens from Cognito
 */
export interface AuthTokens {
  accessToken: string;      // Short-lived (1 hour)
  idToken: string;          // User info
  refreshToken: string;     // Long-lived (30 days)
  expiresIn: number;        // Seconds until expiration
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Auth library configuration
 */
export interface AuthConfig {
  cognito: {
    region: string;
    userPoolId: string;
    userPoolClientId: string;
  };
  storage: {
    prefix?: string;        // Storage key prefix
  };
  tokenRefresh: {
    bufferMinutes?: number; // Refresh before expiry (default: 5)
  };
}
```

### Phase 2: Storage Service

**File**: `libs/auth/src/lib/services/storage.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private _storage: Storage | null = null;
  private readonly PREFIX = 'auth_';

  constructor(private storage: Storage) {}

  async init(): Promise<void> {
    if (!this._storage) {
      this._storage = await this.storage.create();
    }
  }

  async set(key: string, value: any): Promise<void> {
    await this.ensureInit();
    await this._storage!.set(`${this.PREFIX}${key}`, value);
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureInit();
    return await this._storage!.get(`${this.PREFIX}${key}`);
  }

  async remove(key: string): Promise<void> {
    await this.ensureInit();
    await this._storage!.remove(`${this.PREFIX}${key}`);
  }

  async clear(): Promise<void> {
    await this.ensureInit();
    await this._storage!.clear();
  }

  private async ensureInit(): Promise<void> {
    if (!this._storage) {
      await this.init();
    }
  }
}
```

### Phase 3: Token Service

**File**: `libs/auth/src/lib/services/token.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { AuthTokens, UserInfo } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minuti

  constructor(private storage: StorageService) {}

  /**
   * Save tokens to secure storage
   */
  async saveTokens(tokens: AuthTokens): Promise<void> {
    const expiresAt = Date.now() + tokens.expiresIn * 1000;

    await Promise.all([
      this.storage.set('access_token', tokens.accessToken),
      this.storage.set('id_token', tokens.idToken),
      this.storage.set('refresh_token', tokens.refreshToken),
      this.storage.set('token_expiry', expiresAt),
    ]);

    // Decode and save user info
    const userInfo = this.decodeIdToken(tokens.idToken);
    await this.storage.set('user_info', userInfo);
  }

  /**
   * Get access token (refreshes if needed)
   */
  async getAccessToken(): Promise<string | null> {
    const token = await this.storage.get<string>('access_token');
    if (!token) return null;

    if (await this.isTokenExpired()) {
      console.log('Token expiring soon, needs refresh');
      return null; // AuthService will handle refresh
    }

    return token;
  }

  /**
   * Check if token is expired or expiring soon
   */
  async isTokenExpired(): Promise<boolean> {
    const expiresAt = await this.storage.get<number>('token_expiry');
    if (!expiresAt) return true;

    return Date.now() >= expiresAt - this.REFRESH_BUFFER_MS;
  }

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return await this.storage.get<string>('refresh_token');
  }

  /**
   * Get user info
   */
  async getUserInfo(): Promise<UserInfo | null> {
    return await this.storage.get<UserInfo>('user_info');
  }

  /**
   * Clear all tokens
   */
  async clearTokens(): Promise<void> {
    await Promise.all([
      this.storage.remove('access_token'),
      this.storage.remove('id_token'),
      this.storage.remove('refresh_token'),
      this.storage.remove('token_expiry'),
      this.storage.remove('user_info'),
    ]);
  }

  /**
   * Decode JWT ID token to extract user info
   */
  private decodeIdToken(idToken: string): UserInfo {
    try {
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode ID token:', error);
      return { sub: '', email: '' };
    }
  }
}
```

### Phase 4: Auth State Service

**File**: `libs/auth/src/lib/services/auth-state.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserInfo } from '../models/auth.models';

export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private stateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  });

  public readonly state$: Observable<AuthState> = this.stateSubject.asObservable();
  public readonly isAuthenticated$: Observable<boolean> = this.state$.pipe(
    map(state => state.isAuthenticated)
  );
  public readonly user$: Observable<UserInfo | null> = this.state$.pipe(
    map(state => state.user)
  );
  public readonly loading$: Observable<boolean> = this.state$.pipe(
    map(state => state.loading)
  );
  public readonly error$: Observable<string | null> = this.state$.pipe(
    map(state => state.error)
  );

  getCurrentState(): AuthState {
    return this.stateSubject.value;
  }

  setAuthenticated(value: boolean): void {
    this.updateState({ isAuthenticated: value });
  }

  setUser(user: UserInfo | null): void {
    this.updateState({ user });
  }

  setLoading(value: boolean): void {
    this.updateState({ loading: value });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  reset(): void {
    this.stateSubject.next({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  }

  private updateState(partial: Partial<AuthState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...partial,
    });
  }
}
```

### Phase 5: Auth Service (Cognito Integration)

**File**: `libs/auth/src/lib/services/auth.service.ts`

```typescript
import { Injectable, Inject } from '@angular/core';
import { CognitoIdentityProviderClient, InitiateAuthCommand, AuthFlowType } from '@aws-sdk/client-cognito-identity-provider';
import { Observable, from, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { AuthStateService } from './auth-state.service';
import { LoginCredentials, AuthTokens, UserInfo } from '../models/auth.models';
import { AUTH_CONFIG } from '../tokens/auth-config.token';
import { AuthConfig } from '../models/auth-config.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private cognitoClient: CognitoIdentityProviderClient;

  constructor(
    @Inject(AUTH_CONFIG) private config: AuthConfig,
    private tokenService: TokenService,
    private authState: AuthStateService
  ) {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.config.cognito.region,
    });
  }

  /**
   * Initialize auth on app start
   */
  async initialize(): Promise<void> {
    console.log('🔄 Initializing auth...');

    try {
      const userInfo = await this.tokenService.getUserInfo();
      const hasValidToken = !(await this.tokenService.isTokenExpired());

      if (userInfo && hasValidToken) {
        this.authState.setUser(userInfo);
        this.authState.setAuthenticated(true);
        console.log('✅ Session restored');
      } else {
        console.log('⏰ Token expired, attempting refresh...');
        await this.refreshToken();
      }
    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
      await this.logout();
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<UserInfo> {
    this.authState.setLoading(true);
    this.authState.setError(null);

    const command = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: this.config.cognito.userPoolClientId,
      AuthParameters: {
        USERNAME: credentials.email,
        PASSWORD: credentials.password,
      },
    });

    return from(this.cognitoClient.send(command)).pipe(
      switchMap(async (response) => {
        if (!response.AuthenticationResult) {
          throw new Error('No authentication result');
        }

        const tokens: AuthTokens = {
          accessToken: response.AuthenticationResult.AccessToken!,
          idToken: response.AuthenticationResult.IdToken!,
          refreshToken: response.AuthenticationResult.RefreshToken!,
          expiresIn: response.AuthenticationResult.ExpiresIn!,
        };

        await this.tokenService.saveTokens(tokens);
        const userInfo = await this.tokenService.getUserInfo();

        if (userInfo) {
          this.authState.setUser(userInfo);
          this.authState.setAuthenticated(true);
        }

        return userInfo!;
      }),
      tap(() => this.authState.setLoading(false)),
      catchError((error) => {
        this.authState.setLoading(false);
        this.authState.setError(error.message);
        return throwError(() => error);
      })
    );
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await this.tokenService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
        ClientId: this.config.cognito.userPoolClientId,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      });

      const response = await this.cognitoClient.send(command);

      if (response.AuthenticationResult) {
        const tokens: AuthTokens = {
          accessToken: response.AuthenticationResult.AccessToken!,
          idToken: response.AuthenticationResult.IdToken!,
          refreshToken: refreshToken, // Refresh token doesn't change
          expiresIn: response.AuthenticationResult.ExpiresIn!,
        };

        await this.tokenService.saveTokens(tokens);
        console.log('✅ Token refreshed');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      await this.logout();
      return false;
    }
  }

  /**
   * Logout and clear all data
   */
  async logout(): Promise<void> {
    await this.tokenService.clearTokens();
    this.authState.reset();
    console.log('✅ Logged out');
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.tokenService.getAccessToken();
    return token !== null;
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserInfo | null> {
    return await this.tokenService.getUserInfo();
  }
}
```

---

## 📦 Usage in Projects

### Step 1: Install Library

```bash
# In consumer project
npm install @libs/auth
npm install @ionic/storage-angular
npm install @aws-sdk/client-cognito-identity-provider
```

### Step 2: Configure in app.config.ts

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideAuth } from '@libs/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAuth({
      cognito: {
        region: 'eu-south-1',
        userPoolId: 'eu-south-1_XXXXXXXXX',
        userPoolClientId: 'xxxxxxxxxxxxxxxxxxxx',
      },
      storage: {
        prefix: 'myapp_', // Optional
      },
      tokenRefresh: {
        bufferMinutes: 5, // Optional
      },
    }),
  ],
};
```

### Step 3: Use in Components

```typescript
import { Component, inject } from '@angular/core';
import { AuthService, AuthStateService } from '@libs/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <form (ngSubmit)="onLogin()">
      <input [(ngModel)]="email" type="email" placeholder="Email">
      <input [(ngModel)]="password" type="password" placeholder="Password">

      @if (authState.loading$ | async) {
        <p>Loading...</p>
      }

      @if (authState.error$ | async; as error) {
        <p class="error">{{ error }}</p>
      }

      <button type="submit">Login</button>
    </form>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  public authState = inject(AuthStateService);

  email = '';
  password = '';

  onLogin() {
    this.authService.login({
      email: this.email,
      password: this.password,
    }).subscribe({
      next: (user) => {
        console.log('Logged in:', user);
        // Navigate to home
      },
      error: (err) => {
        console.error('Login failed:', err);
      },
    });
  }
}
```

---

## 🎨 Customization

### Custom Login UI

Ogni progetto può creare la propria UI di login, usando i servizi della libreria:

```typescript
// Project A - Simple login
@Component({
  template: `<ion-card>...</ion-card>`
})
export class SimpleLoginComponent {
  // Uses AuthService from library
}

// Project B - Fancy login with animations
@Component({
  template: `<div class="fancy-login">...</div>`
})
export class FancyLoginComponent {
  // Uses same AuthService, different UI
}
```

### Custom Styling

```scss
// Projects can override library styles
.auth-error {
  color: var(--ion-color-danger);
  font-size: 0.875rem;
}
```

---

## 📚 Best Practices

1. **Always use library services** - Non accedere direttamente a Cognito
2. **Subscribe to state$** - Usa RxJS observables per reattività
3. **Handle errors gracefully** - Mostra errori user-friendly
4. **Test token refresh** - Simula token scaduti per testare auto-refresh
5. **Secure storage only** - Mai salvare token in localStorage o cookies

---

## 🚀 Next Steps

1. Implementare models e interfaces
2. Creare StorageService con Ionic Storage
3. Implementare TokenService con auto-refresh
4. Creare AuthStateService per state management
5. Integrare AWS Cognito SDK in AuthService
6. Aggiungere Auth Guard e Interceptor
7. Creare provideAuth() per easy setup
8. Testare in progetto consumer

---

**Version**: 2.0.0 (Reusable Library)
**Author**: Mariano Scada
**Date**: December 2025
