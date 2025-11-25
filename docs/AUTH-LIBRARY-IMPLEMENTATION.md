# 🔐 Auth Library - Complete Implementation Guide

Guida completa per implementare la libreria di autenticazione con Firebase, styling dinamico e supporto Ionic/Web.

## 📋 Indice

- [Overview](#overview)
- [Struttura Completata](#struttura-completata)
- [Services Implementation](#services-implementation)
- [Components Implementation](#components-implementation)
- [Guards & Interceptors](#guards--interceptors)
- [Public API Configuration](#public-api-configuration)
- [Usage in Projects](#usage-in-projects)
- [Styling Customization](#styling-customization)
- [Ionic Integration](#ionic-integration)
- [Testing](#testing)

---

## 🎯 Overview

La libreria `@lib/auth` fornisce:
- ✅ Login Email/Password
- ✅ Login Google (Web + iOS + Android)
- ✅ Login Apple (iOS + Web)
- ✅ Registrazione con email verification
- ✅ Password reset
- ✅ Remember me (LocalStorage)
- ✅ Auth Guard & Interceptor
- ✅ **Styling dinamico iniettabile**
- ✅ **Responsive design (Tailwind)**
- ✅ **Compatibilità Ionic**
- ✅ **Platform detection**

---

## ✅ Struttura Completata

```
libs/auth/
├── src/
│   ├── lib/
│   │   ├── models/                    ✅ FATTO
│   │   │   ├── user.model.ts
│   │   │   ├── auth-config.model.ts
│   │   │   ├── auth-response.model.ts
│   │   │   └── index.ts
│   │   ├── services/                  ⏳ DA FARE
│   │   │   ├── storage.service.ts
│   │   │   ├── firebase-auth.service.ts
│   │   │   ├── auth-state.service.ts
│   │   │   └── index.ts
│   │   ├── components/                ⏳ DA FARE
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── index.ts
│   │   ├── guards/                    ⏳ DA FARE
│   │   │   ├── auth.guard.ts
│   │   │   └── index.ts
│   │   ├── interceptors/              ⏳ DA FARE
│   │   │   ├── auth.interceptor.ts
│   │   │   └── index.ts
│   │   ├── directives/                ⏳ DA FARE
│   │   │   ├── has-role.directive.ts
│   │   │   └── index.ts
│   │   └── utils/                     ⏳ DA FARE
│   │       ├── validators.ts
│   │       └── platform.ts
│   └── public-api.ts
└── README.md
```

---

## 🔧 Services Implementation

### 1. Storage Service

**`libs/auth/src/lib/services/storage.service.ts`**

```typescript
import { Injectable, Inject } from '@angular/core';
import { AUTH_CONFIG } from '../tokens/auth-config.token';
import { AuthConfig } from '../models';

/**
 * Storage Service
 * Wrapper per LocalStorage/SessionStorage con type safety
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: Storage;

  constructor(@Inject(AUTH_CONFIG) private config: AuthConfig) {
    this.storage = config.storage.type === 'localStorage'
      ? window.localStorage
      : window.sessionStorage;
  }

  /**
   * Salva valore
   */
  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      this.storage.setItem(key, serialized);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  }

  /**
   * Leggi valore
   */
  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  /**
   * Rimuovi valore
   */
  remove(key: string): void {
    this.storage.removeItem(key);
  }

  /**
   * Pulisci tutto
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Check se key esiste
   */
  has(key: string): boolean {
    return this.storage.getItem(key) !== null;
  }

  /**
   * Salva token
   */
  setToken(token: string): void {
    this.set(this.config.storage.tokenKey, token);
  }

  /**
   * Leggi token
   */
  getToken(): string | null {
    return this.get<string>(this.config.storage.tokenKey);
  }

  /**
   * Rimuovi token
   */
  removeToken(): void {
    this.remove(this.config.storage.tokenKey);
  }

  /**
   * Salva user
   */
  setUser(user: any): void {
    this.set(this.config.storage.userKey, user);
  }

  /**
   * Leggi user
   */
  getUser<T>(): T | null {
    return this.get<T>(this.config.storage.userKey);
  }

  /**
   * Rimuovi user
   */
  removeUser(): void {
    this.remove(this.config.storage.userKey);
  }
}
```

### 2. Firebase Auth Service

**`libs/auth/src/lib/services/firebase-auth.service.ts`**

```typescript
import { Injectable, Inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
  UserCredential
} from '@angular/fire/auth';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import { AuthConfig, User, LoginCredentials, RegisterData, AuthResponse } from '../models';
import { StorageService } from './storage.service';
import { AUTH_CONFIG } from '../tokens/auth-config.token';

/**
 * Firebase Authentication Service
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private storageService: StorageService,
    @Inject(AUTH_CONFIG) private config: AuthConfig
  ) {
    this.initializeAuth();
  }

  /**
   * Inizializza auth da storage
   */
  private initializeAuth(): void {
    const storedUser = this.storageService.getUser<User>();
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }

    // Subscribe to Firebase auth state
    this.auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const user = this.mapFirebaseUser(firebaseUser);
        this.currentUserSubject.next(user);
        this.storageService.setUser(user);
      } else {
        this.currentUserSubject.next(null);
        this.storageService.removeUser();
      }
    });
  }

  /**
   * Login con email e password
   */
  loginWithEmail(credentials: LoginCredentials): Observable<AuthResponse> {
    return from(
      signInWithEmailAndPassword(this.auth, credentials.email, credentials.password)
    ).pipe(
      map(userCredential => this.createAuthResponse(userCredential)),
      tap(response => {
        if (credentials.rememberMe) {
          this.storageService.setUser(response.user);
        }
      }),
      catchError(error => {
        throw this.handleAuthError(error);
      })
    );
  }

  /**
   * Registrazione con email e password
   */
  register(data: RegisterData): Observable<AuthResponse> {
    return from(
      createUserWithEmailAndPassword(this.auth, data.email, data.password)
    ).pipe(
      tap(async (userCredential) => {
        // Update profile with display name
        if (data.displayName && userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: data.displayName
          });
        }

        // Send verification email se abilitato
        if (this.config.features.emailVerification && userCredential.user) {
          await sendEmailVerification(userCredential.user);
        }
      }),
      map(userCredential => this.createAuthResponse(userCredential)),
      catchError(error => {
        throw this.handleAuthError(error);
      })
    );
  }

  /**
   * Login con Google
   */
  loginWithGoogle(): Observable<AuthResponse> {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    return from(signInWithPopup(this.auth, provider)).pipe(
      map(userCredential => this.createAuthResponse(userCredential)),
      catchError(error => {
        throw this.handleAuthError(error);
      })
    );
  }

  /**
   * Login con Apple
   */
  loginWithApple(): Observable<AuthResponse> {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');

    return from(signInWithPopup(this.auth, provider)).pipe(
      map(userCredential => this.createAuthResponse(userCredential)),
      catchError(error => {
        throw this.handleAuthError(error);
      })
    );
  }

  /**
   * Logout
   */
  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.storageService.clear();
      })
    );
  }

  /**
   * Password reset
   */
  sendPasswordResetEmail(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  /**
   * Resend email verification
   */
  sendEmailVerification(): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    return from(sendEmailVerification(user));
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Get ID token
   */
  async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    return user ? await user.getIdToken() : null;
  }

  /**
   * Map Firebase User to our User model
   */
  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      phoneNumber: firebaseUser.phoneNumber,
      providerId: firebaseUser.providerData[0]?.providerId,
      lastLoginAt: new Date()
    };
  }

  /**
   * Create auth response
   */
  private async createAuthResponse(userCredential: UserCredential): Promise<AuthResponse> {
    const user = this.mapFirebaseUser(userCredential.user);
    const token = await userCredential.user.getIdToken();

    return {
      user,
      token,
      expiresIn: 3600 // 1 hour
    };
  }

  /**
   * Handle auth errors
   */
  private handleAuthError(error: any): Error {
    let message = 'An error occurred';

    switch (error.code) {
      case 'auth/user-not-found':
        message = 'Utente non trovato';
        break;
      case 'auth/wrong-password':
        message = 'Password errata';
        break;
      case 'auth/email-already-in-use':
        message = 'Email già registrata';
        break;
      case 'auth/weak-password':
        message = 'Password troppo debole (minimo 6 caratteri)';
        break;
      case 'auth/invalid-email':
        message = 'Email non valida';
        break;
      case 'auth/operation-not-allowed':
        message = 'Operazione non consentita';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Login annullato';
        break;
      case 'auth/cancelled-popup-request':
        message = 'Popup già aperto';
        break;
      case 'auth/network-request-failed':
        message = 'Errore di rete';
        break;
      default:
        message = error.message || 'Errore sconosciuto';
    }

    return new Error(message);
  }
}
```

### 3. Auth State Service

**`libs/auth/src/lib/services/auth-state.service.ts`**

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthState, User } from '../models';

/**
 * Auth State Management Service
 */
@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private stateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  public state$ = this.stateSubject.asObservable();

  get currentState(): AuthState {
    return this.stateSubject.value;
  }

  setUser(user: User | null): void {
    this.stateSubject.next({
      ...this.currentState,
      user,
      isAuthenticated: user !== null,
      error: null
    });
  }

  setLoading(isLoading: boolean): void {
    this.stateSubject.next({
      ...this.currentState,
      isLoading
    });
  }

  setError(error: string | null): void {
    this.stateSubject.next({
      ...this.currentState,
      error,
      isLoading: false
    });
  }

  clearError(): void {
    this.setError(null);
  }

  reset(): void {
    this.stateSubject.next({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }
}
```

### 4. Services Index

**`libs/auth/src/lib/services/index.ts`**

```typescript
export * from './storage.service';
export * from './firebase-auth.service';
export * from './auth-state.service';
```

---

## 🎨 Components Implementation

### 1. Login Component

**`libs/auth/src/lib/components/login/login.component.ts`**

```typescript
import { Component, OnInit, Inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { AuthStateService } from '../../services/auth-state.service';
import { AUTH_CONFIG } from '../../tokens/auth-config.token';
import { AuthConfig, LoginCredentials } from '../../models';
import { PlatformService } from '../../utils/platform.service';

@Component({
  selector: 'lib-auth-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @Input() redirectAfterLogin = true;

  loginForm!: FormGroup;
  showPassword = false;
  isIonic = false;

  // Styling dinamico
  get styling() {
    return this.config.styling;
  }

  get customClasses() {
    return this.styling?.customClasses || {};
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: FirebaseAuthService,
    private authState: AuthStateService,
    private platformService: PlatformService,
    @Inject(AUTH_CONFIG) public config: AuthConfig
  ) {
    this.isIonic = this.platformService.isIonic();
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [this.config.features.rememberMe]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authState.setLoading(true);
    this.authState.clearError();

    const credentials: LoginCredentials = this.loginForm.value;

    this.authService.loginWithEmail(credentials).subscribe({
      next: (response) => {
        this.authState.setUser(response.user);
        this.authState.setLoading(false);

        if (this.redirectAfterLogin) {
          this.router.navigate([this.config.routing.dashboardRoute]);
        }
      },
      error: (error) => {
        this.authState.setError(error.message);
        this.authState.setLoading(false);
      }
    });
  }

  loginWithGoogle(): void {
    if (!this.config.features.googleAuth) return;

    this.authState.setLoading(true);
    this.authState.clearError();

    this.authService.loginWithGoogle().subscribe({
      next: (response) => {
        this.authState.setUser(response.user);
        this.authState.setLoading(false);

        if (this.redirectAfterLogin) {
          this.router.navigate([this.config.routing.dashboardRoute]);
        }
      },
      error: (error) => {
        this.authState.setError(error.message);
        this.authState.setLoading(false);
      }
    });
  }

  loginWithApple(): void {
    if (!this.config.features.appleAuth) return;

    this.authState.setLoading(true);
    this.authState.clearError();

    this.authService.loginWithApple().subscribe({
      next: (response) => {
        this.authState.setUser(response.user);
        this.authState.setLoading(false);

        if (this.redirectAfterLogin) {
          this.router.navigate([this.config.routing.dashboardRoute]);
        }
      },
      error: (error) => {
        this.authState.setError(error.message);
        this.authState.setLoading(false);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  navigateToRegister(): void {
    this.router.navigate([this.config.routing.registerRoute]);
  }

  navigateToForgotPassword(): void {
    this.router.navigate([this.config.routing.forgotPasswordRoute]);
  }

  // Helpers for template
  hasError(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getError(field: string): string {
    const control = this.loginForm.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return `${field} è obbligatorio`;
    if (control.errors['email']) return 'Email non valida';
    if (control.errors['minlength']) return `Minimo ${control.errors['minlength'].requiredLength} caratteri`;

    return 'Campo non valido';
  }
}
```

**`libs/auth/src/lib/components/login/login.component.html`**

```html
<div class="auth-container" [ngClass]="customClasses.container"
     [ngStyle]="styling?.backgroundImage ? { 'background-image': styling.backgroundImage } : {}">

  <!-- Logo -->
  <div class="auth-logo" *ngIf="styling?.logoUrl">
    <img [src]="styling.logoUrl" alt="Logo" />
  </div>

  <!-- Form Card -->
  <div class="auth-card" [ngClass]="customClasses.form">
    <h2 class="auth-title">Accedi</h2>

    <!-- Error Message -->
    <div class="auth-error" *ngIf="(authState.state$ | async)?.error as error">
      {{ error }}
    </div>

    <!-- Login Form -->
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">

      <!-- Email Field -->
      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          formControlName="email"
          [ngClass]="[customClasses.input, hasError('email') ? 'input-error' : '']"
          placeholder="tuo@email.com"
          autocomplete="email"
        />
        <span class="error-message" *ngIf="hasError('email')">
          {{ getError('email') }}
        </span>
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <label for="password">Password</label>
        <div class="input-with-icon">
          <input
            [type]="showPassword ? 'text' : 'password'"
            id="password"
            formControlName="password"
            [ngClass]="[customClasses.input, hasError('password') ? 'input-error' : '']"
            placeholder="••••••••"
            autocomplete="current-password"
          />
          <button
            type="button"
            class="toggle-password"
            (click)="togglePasswordVisibility()"
            tabindex="-1"
          >
            <span *ngIf="!showPassword">👁️</span>
            <span *ngIf="showPassword">🙈</span>
          </button>
        </div>
        <span class="error-message" *ngIf="hasError('password')">
          {{ getError('password') }}
        </span>
      </div>

      <!-- Remember Me -->
      <div class="form-group-checkbox" *ngIf="config.features.rememberMe">
        <label class="checkbox-label">
          <input type="checkbox" formControlName="rememberMe" />
          <span>Ricordami</span>
        </label>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn btn-primary"
        [ngClass]="customClasses.buttonPrimary"
        [disabled]="(authState.state$ | async)?.isLoading"
      >
        <span *ngIf="!(authState.state$ | async)?.isLoading">Accedi</span>
        <span *ngIf="(authState.state$ | async)?.isLoading">Caricamento...</span>
      </button>

      <!-- Forgot Password Link -->
      <div class="form-footer" *ngIf="config.features.passwordReset">
        <a
          [ngClass]="customClasses.link"
          (click)="navigateToForgotPassword()"
          class="link"
        >
          Password dimenticata?
        </a>
      </div>
    </form>

    <!-- Social Login -->
    <div class="social-login" *ngIf="config.features.googleAuth || config.features.appleAuth">
      <div class="divider">
        <span>oppure</span>
      </div>

      <!-- Google Login -->
      <button
        type="button"
        class="btn btn-social btn-google"
        (click)="loginWithGoogle()"
        *ngIf="config.features.googleAuth"
        [disabled]="(authState.state$ | async)?.isLoading"
      >
        <img src="assets/icons/google.svg" alt="Google" />
        <span>Continua con Google</span>
      </button>

      <!-- Apple Login -->
      <button
        type="button"
        class="btn btn-social btn-apple"
        (click)="loginWithApple()"
        *ngIf="config.features.appleAuth && (config.platform === 'ios' || config.platform === 'web')"
        [disabled]="(authState.state$ | async)?.isLoading"
      >
        <img src="assets/icons/apple.svg" alt="Apple" />
        <span>Continua con Apple</span>
      </button>
    </div>

    <!-- Register Link -->
    <div class="auth-footer">
      <p>
        Non hai un account?
        <a
          [ngClass]="customClasses.link"
          (click)="navigateToRegister()"
          class="link link-primary"
        >
          Registrati
        </a>
      </p>
    </div>
  </div>
</div>
```

**`libs/auth/src/lib/components/login/login.component.scss`**

```scss
// Base styles usando Tailwind + variabili CSS per override dinamico
.auth-container {
  @apply min-h-screen flex items-center justify-center p-4;
  background-color: var(--auth-bg-color, theme('colors.gray.50'));
  background-size: cover;
  background-position: center;
}

.auth-logo {
  @apply text-center mb-8;

  img {
    @apply mx-auto h-16 w-auto;
  }
}

.auth-card {
  @apply w-full max-w-md bg-white rounded-lg shadow-lg p-8;
  border-radius: var(--auth-border-radius, theme('borderRadius.lg'));
}

.auth-title {
  @apply text-3xl font-bold text-center mb-6;
  color: var(--auth-text-color, theme('colors.gray.900'));
  font-family: var(--auth-font-family, inherit);
}

.auth-error {
  @apply bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4;
  font-size: var(--auth-font-size-base, theme('fontSize.sm'));
}

.auth-form {
  @apply space-y-4;
}

.form-group {
  @apply space-y-2;

  label {
    @apply block text-sm font-medium;
    color: var(--auth-text-color, theme('colors.gray.700'));
  }

  input {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
    border-radius: var(--auth-input-radius, theme('borderRadius.lg'));
    font-size: var(--auth-font-size-base, theme('fontSize.base'));

    &.input-error {
      @apply border-red-500 focus:ring-red-500;
    }
  }
}

.input-with-icon {
  @apply relative;

  input {
    @apply pr-12;
  }

  .toggle-password {
    @apply absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
  }
}

.error-message {
  @apply text-sm text-red-600;
}

.form-group-checkbox {
  @apply flex items-center;

  .checkbox-label {
    @apply flex items-center cursor-pointer;

    input[type="checkbox"] {
      @apply mr-2;
    }

    span {
      @apply text-sm;
      color: var(--auth-text-color, theme('colors.gray.700'));
    }
  }
}

.btn {
  @apply w-full px-4 py-3 rounded-lg font-medium transition-colors duration-200;
  border-radius: var(--auth-button-radius, theme('borderRadius.lg'));
  font-size: var(--auth-font-size-base, theme('fontSize.base'));

  &:disabled {
    @apply opacity-50 cursor-not-allowed;
  }
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
  background-color: var(--auth-primary-color, theme('colors.blue.600'));

  &:hover:not(:disabled) {
    background-color: var(--auth-primary-color-hover, theme('colors.blue.700'));
  }
}

.form-footer {
  @apply text-center mt-4;
}

.link {
  @apply text-sm cursor-pointer;
  color: var(--auth-secondary-color, theme('colors.blue.600'));

  &:hover {
    @apply underline;
  }
}

.social-login {
  @apply mt-6 space-y-3;
}

.divider {
  @apply relative text-center my-6;

  span {
    @apply bg-white px-4 text-sm text-gray-500;
  }

  &::before {
    content: '';
    @apply absolute left-0 top-1/2 w-full h-px bg-gray-300;
    z-index: -1;
  }
}

.btn-social {
  @apply flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50;

  img {
    @apply w-5 h-5;
  }
}

.btn-google {
  &:hover {
    @apply border-blue-500;
  }
}

.btn-apple {
  &:hover {
    @apply border-gray-900;
  }
}

.auth-footer {
  @apply text-center mt-6;

  p {
    @apply text-sm text-gray-600;
  }

  .link-primary {
    @apply font-medium;
    color: var(--auth-primary-color, theme('colors.blue.600'));
  }
}

// Responsive
@media (max-width: 640px) {
  .auth-card {
    @apply p-6;
  }

  .auth-title {
    @apply text-2xl;
  }
}

// Ionic specific styles
:host-context(.ion-page) {
  .auth-container {
    @apply min-h-full;
  }

  .btn {
    @apply text-base;
  }
}
```

---

## 🛡️ Guards & Interceptors

### Auth Guard

**`libs/auth/src/lib/guards/auth.guard.ts`**

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { FirebaseAuthService } from '../services/firebase-auth.service';
import { AUTH_CONFIG } from '../tokens/auth-config.token';

export const authGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);
  const config = inject(AUTH_CONFIG);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      }

      // Redirect to login with return URL
      return router.createUrlTree([config.routing.loginRoute], {
        queryParams: { returnUrl: state.url }
      });
    })
  );
};

/**
 * Role Guard (example)
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return (route, state): Observable<boolean | UrlTree> => {
    const authService = inject(FirebaseAuthService);
    const router = inject(Router);
    const config = inject(AUTH_CONFIG);

    return authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          return router.createUrlTree([config.routing.loginRoute]);
        }

        const hasRole = user.roles?.some(role => allowedRoles.includes(role));
        if (hasRole) {
          return true;
        }

        // No permission
        return router.createUrlTree(['/unauthorized']);
      })
    );
  };
}
```

### Auth Interceptor

**`libs/auth/src/lib/interceptors/auth.interceptor.ts`**

```typescript
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';

import { FirebaseAuthService } from '../services/firebase-auth.service';

/**
 * Auth Interceptor
 * Aggiunge token Firebase alle richieste HTTP
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(FirebaseAuthService);

  // Skip per richieste esterne o assets
  if (!req.url.includes('/api/') || req.url.includes('assets')) {
    return next(req);
  }

  // Aggiungi token
  return from(authService.getIdToken()).pipe(
    switchMap(token => {
      if (token) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      return next(req);
    })
  );
};
```

---

## 📦 Public API Configuration

### Injection Token

**`libs/auth/src/lib/tokens/auth-config.token.ts`**

```typescript
import { InjectionToken } from '@angular/core';
import { AuthConfig } from '../models';

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('auth.config');
```

### Public API

**`libs/auth/src/public-api.ts`**

```typescript
/*
 * Public API Surface of auth
 */

// Models
export * from './lib/models';

// Services
export * from './lib/services';

// Components
export * from './lib/components/login/login.component';
export * from './lib/components/register/register.component';
export * from './lib/components/forgot-password/forgot-password.component';

// Guards
export * from './lib/guards/auth.guard';

// Interceptors
export * from './lib/interceptors/auth.interceptor';

// Tokens
export * from './lib/tokens/auth-config.token';

// Utils
export * from './lib/utils/platform.service';
export * from './lib/utils/validators';
```

---

## 🚀 Usage in Projects

### 1. Install Dependencies

Nel progetto che usa la libreria:

```bash
npm install @angular/fire firebase
```

### 2. Configure in app.config.ts

**`projects/cicd-test/src/app/app.config.ts`**

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

// Auth Library
import { AUTH_CONFIG } from '@lib/auth';
import { authInterceptor } from '@lib/auth';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    // Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),

    // Auth Library Configuration
    {
      provide: AUTH_CONFIG,
      useValue: {
        firebase: environment.firebase,
        features: {
          emailPassword: true,
          googleAuth: true,
          appleAuth: true,
          emailVerification: true,
          passwordReset: true,
          twoFactor: false,
          rememberMe: true
        },
        routing: {
          loginRoute: '/auth/login',
          registerRoute: '/auth/register',
          dashboardRoute: '/dashboard',
          forgotPasswordRoute: '/auth/forgot-password'
        },
        storage: {
          type: 'localStorage',
          tokenKey: 'auth_token',
          userKey: 'auth_user'
        },
        // Styling dinamico
        styling: {
          colors: {
            primary: '#3f51b5',
            secondary: '#ff4081',
            error: '#f44336',
            success: '#4caf50'
          },
          logoUrl: '/icons/logo.svg',
          customClasses: {
            buttonPrimary: 'btn-custom-primary',
            input: 'input-custom'
          }
        },
        platform: 'web' // o 'ios', 'android'
      }
    }
  ]
};
```

### 3. Setup Routes

**`projects/cicd-test/src/app/app.routes.ts`**

```typescript
import { Routes } from '@angular/routes';
import { LoginComponent } from '@lib/auth';
import { authGuard } from '@lib/auth';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'register',
        loadComponent: () =>
          import('@lib/auth').then(m => m.RegisterComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('@lib/auth').then(m => m.ForgotPasswordComponent)
      }
    ]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component'),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  }
];
```

### 4. Use in Component

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseAuthService } from '@lib/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="authService.currentUser$ | async as user">
      <h1>Welcome {{ user.displayName || user.email }}!</h1>
      <button (click)="logout()">Logout</button>
    </div>
  `
})
export class DashboardComponent {
  constructor(public authService: FirebaseAuthService) {}

  logout(): void {
    this.authService.logout().subscribe(() => {
      // Redirect handled by guard
    });
  }
}
```

---

## 🎨 Styling Customization Examples

### Example 1: Custom Brand Colors

```typescript
styling: {
  colors: {
    primary: '#6366f1',      // Indigo
    secondary: '#ec4899',    // Pink
    error: '#ef4444',        // Red
    success: '#10b981'       // Green
  },
  logoUrl: '/assets/brand/logo.png',
  backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}
```

### Example 2: Dark Mode

```typescript
styling: {
  colors: {
    primary: '#60a5fa',
    text: '#f3f4f6',
    background: '#1f2937'
  },
  customClasses: {
    container: 'dark-mode-container',
    form: 'dark-mode-card'
  }
}
```

### Example 3: Ionic Styling

```typescript
styling: {
  customClasses: {
    input: 'ion-input',
    buttonPrimary: 'ion-button ion-button-solid',
    container: 'ion-page'
  }
}
```

---

## 📱 Ionic Integration

### Platform Service

**`libs/auth/src/lib/utils/platform.service.ts`**

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  isIonic(): boolean {
    return typeof document !== 'undefined' &&
           document.querySelector('ion-app') !== null;
  }

  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }

  isMobile(): boolean {
    return this.isIOS() || this.isAndroid();
  }

  getPlatform(): 'web' | 'ios' | 'android' {
    if (this.isIOS()) return 'ios';
    if (this.isAndroid()) return 'android';
    return 'web';
  }
}
```

### Ionic Usage Example

```typescript
// Ionic app
import { IonicModule } from '@ionic/angular';
import { LoginComponent } from '@lib/auth';

@Component({
  imports: [IonicModule, LoginComponent],
  template: `
    <ion-content>
      <lib-auth-login></lib-auth-login>
    </ion-content>
  `
})
export class LoginPage {}
```

---

## ✅ Implementation Checklist

### Phase 1: Complete Services ✅
- [x] StorageService
- [x] FirebaseAuthService
- [x] AuthStateService
- [x] PlatformService

### Phase 2: Build Components 🔄
- [ ] Complete RegisterComponent (similar to Login)
- [ ] Complete ForgotPasswordComponent
- [ ] Add EmailVerificationComponent
- [ ] Add TwoFactorComponent (optional)

### Phase 3: Testing 🔄
- [ ] Unit tests for services
- [ ] Component tests
- [ ] E2E tests
- [ ] Test con Ionic

### Phase 4: Documentation 🔄
- [ ] Update README.md
- [ ] Add Storybook examples
- [ ] Create demo project

---

## 📝 Next Steps

1. **Complete Register Component** (copy structure from Login)
2. **Complete Forgot Password Component**
3. **Build the library**: `ng build auth`
4. **Test in cicd-test project**
5. **Add custom styling examples**
6. **Test with Ionic**

---

## 🔗 References

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Angular Fire](https://github.com/angular/angularfire)
- [Ionic Framework](https://ionicframework.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Creato:** Novembre 2025
**Autore:** Mariano Scada
**Versione:** 1.0.0
