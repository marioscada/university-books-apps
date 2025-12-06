# Implementation Roadmap - University Books Apps

## 📋 Overview

Questo documento descrive **cosa abbiamo fatto** finora e **cosa dobbiamo ancora fare** per completare l'implementazione dell'app University Books Mobile con AWS Cognito authentication e backend integration.

---

## 🎯 Angular Best Practices & Coding Standards

Questo progetto segue le raccomandazioni ufficiali di Angular e le best practice moderne per garantire codice pulito, manutenibile e performante.

### 1. Naming Conventions

#### Git Branch Names (`feat/project-name/description`)

**OBBLIGATORIO:** Tutte le branch devono seguire il pattern `feat/nome-progetto/descrizione`

```bash
# ✅ CORRETTO - Branch naming con nome progetto
git checkout -b feat/university-books-mobile/auth-implementation
git checkout -b feat/university-books-mobile/api-integration
git checkout -b fix/university-books-mobile/login-validation
git checkout -b refactor/university-books-mobile/state-management

# ❌ SBAGLIATO - Branch senza nome progetto
git checkout -b feat/auth-implementation
git checkout -b feature/login
```

**Pattern completo:**
```
<type>/<project-name>/<short-description>

type:
  - feat:     Nuova funzionalità
  - fix:      Bug fix
  - refactor: Refactoring codice
  - docs:     Documentazione
  - test:     Test
  - chore:    Manutenzione

project-name:
  - university-books-mobile
  - backend-api-client
  - (altri progetti futuri)

short-description:
  - Breve descrizione kebab-case (2-4 parole)
```

**Esempi:**
```bash
feat/university-books-mobile/auth-implementation
feat/university-books-mobile/book-list-ui
fix/university-books-mobile/session-timeout
refactor/backend-api-client/error-handling
docs/university-books-mobile/setup-guide
```

**Motivo:**
- Organizzazione chiara per progetti in monorepo
- Facile identificare a quale progetto appartiene una branch
- Migliore gestione PR e code review
- Convenzione scalabile per progetti futuri

#### Observable Streams (`$` suffix)
```typescript
// ✅ CORRETTO - Observable con suffisso $
signIn$(email: string, password: string): Observable<SignInOutput>
signOut$(): Observable<void>
getCurrentUser$(): Observable<AuthUser | null>

// ❌ SBAGLIATO - Observable senza suffisso
signIn(email: string, password: string): Observable<SignInOutput>
```

**Motivo:** Il suffisso `$` rende immediatamente visibile che stai lavorando con uno stream Observable, migliorando la leggibilità del codice.

### 2. Access Modifiers & Immutability

#### `readonly` per campi immutabili
```typescript
// ✅ CORRETTO - Dipendenze e configurazioni sono readonly
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public readonly loginForm: FormGroup;
  public readonly loading = signal(false);
  public readonly errorMessage = signal<string | null>(null);
}

// ❌ SBAGLIATO - Campi mutabili senza motivo
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
}
```

#### `private`, `protected`, `public` appropriati
```typescript
// ✅ CORRETTO - Visibilità esplicita
export class AuthService {
  private readonly _state = signal<AuthState>(...);  // Privato, non serve fuori
  public readonly state = this._state.asReadonly();   // Pubblico, API esposta

  private setLoading(loading: boolean): void { }      // Metodo privato interno
  public signIn$(email, password): Observable { }     // Metodo pubblico API
}

// Template access rules:
private   → ❌ Non accessibile dal template
protected → ✅ Accessibile dal template
public    → ✅ Accessibile dal template e da altre classi
```

### 3. Memory Management - Automatic Unsubscribe

#### `takeUntilDestroyed()` (Angular 16+)
```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class LoginComponent {
  onSubmit(): void {
    // ✅ CORRETTO - Auto-cleanup quando il componente viene distrutto
    this.authService.signIn$(email, password)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (result) => { /* ... */ },
        error: (error) => { /* ... */ }
      });
  }
}

// ❌ SBAGLIATO - Memory leak se il componente viene distrutto prima del complete
export class LoginComponent {
  onSubmit(): void {
    this.authService.signIn$(email, password)
      .subscribe({
        next: (result) => { /* ... */ }
      });
    // ⚠️ La subscription non viene mai cancellata!
  }
}
```

**Motivo:** `takeUntilDestroyed()` rimuove automaticamente la subscription quando il componente viene distrutto, prevenendo memory leaks.

#### ⭐ PREFERENZA: `async` pipe nel template (quasi sempre)

**REGOLA GENERALE: Evitare `.subscribe()` nei componenti. Usare sempre `async` pipe quando possibile.**

```typescript
// ✅ BEST PRACTICE - async pipe (NO subscription nel .ts)
export class UserListComponent {
  public readonly users$ = this.userService.getUsers$();
  public readonly currentUser$ = this.authService.getCurrentUser$();
  public readonly isLoading$ = this.store.select(selectLoading);

  // Combinare multiple observable
  public readonly vm$ = combineLatest({
    users: this.users$,
    currentUser: this.currentUser$,
    isLoading: this.isLoading$
  });
}

<!-- Template -->
<!-- Singolo observable -->
@if (currentUser$ | async; as user) {
  <p>Welcome, {{ user.name }}!</p>
}

<!-- Lista -->
@for (user of users$ | async; track user.id) {
  <div>{{ user.name }}</div>
}

<!-- ViewModel pattern (migliore per multiple observable) -->
@if (vm$ | async; as vm) {
  @if (vm.isLoading) {
    <div>Loading...</div>
  } @else {
    <p>Current: {{ vm.currentUser.name }}</p>
    @for (user of vm.users; track user.id) {
      <div>{{ user.name }}</div>
    }
  }
}
```

**Vantaggi async pipe:**
- ✅ Zero memory leaks (auto-unsubscribe)
- ✅ Meno codice boilerplate
- ✅ Change detection ottimizzata
- ✅ OnPush change detection friendly
- ✅ Template più dichiarativo

#### Quando è NECESSARIO usare `.subscribe()` nel .ts

⚠️ **IMPORTANTE: Ogni `.subscribe()` DEVE essere documentato con commento che spiega PERCHÉ async pipe non è applicabile.**

Usare subscription manuale SOLO in questi casi specifici:

**1. Side effects che non influenzano il template**
```typescript
// ✅ OK - Logging, analytics, chiamate API senza rendering
export class DashboardComponent {
  ngOnInit(): void {
    // ⚠️ Subscribe necessario (non async pipe) perché:
    // 1. Side effect puro (analytics tracking)
    // 2. Nessun output nel template
    this.analyticsService.trackPageView$()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => console.log('Page view tracked'),
        error: (err) => console.error('Analytics failed', err)
      });
  }
}
```

**2. Navigazione imperativa**
```typescript
// ✅ OK - Router navigation richiede subscribe
export class LoginComponent {
  onSubmit(): void {
    // ⚠️ Subscribe necessario (non async pipe) perché:
    // 1. Navigazione imperativa richiesta (router.navigate)
    // 2. Gestisce loading state (signals)
    this.authService.signIn$(email, password)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (result) => {
          if (result.isSignedIn) {
            this.router.navigate(['/home']);  // Imperativo
          }
        }
      });
  }
}
```

**3. Aggiornamento di signal o state management**
```typescript
// ✅ OK - Aggiornare signal basato su observable
export class NotificationComponent {
  private readonly count = signal(0);

  ngOnInit(): void {
    // ⚠️ Subscribe necessario (non async pipe) perché:
    // 1. Aggiorna signal basato su stream (state management)
    // 2. Nessun output visibile diretto nel template
    this.notificationService.getCount$()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (count) => this.count.set(count)
      });
  }
}
```

**4. Form submission con feedback**
```typescript
// ✅ OK - Gestire loading states durante submit
export class RegisterComponent {
  onSubmit(): void {
    this.loading.set(true);

    // ⚠️ Subscribe necessario (non async pipe) perché:
    // 1. Form submission con gestione loading state
    // 2. Aggiorna multiple signals (loading, successMessage, errorMessage)
    // 3. Logica condizionale basata su risposta
    this.authService.register$(data)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.successMessage.set('Registration successful!');
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.message);
        }
      });
  }
}
```

**5. Persistent Subscriptions (AWS Hub, Global Listeners)**

⚠️ **CASO SPECIALE**: Alcune sottoscrizioni devono rimanere aperte per tutta la durata dell'applicazione (es. AWS Hub listeners, auth state observers, WebSocket connections).

```typescript
// ✅ OK - Subscription persistente per auth state globale
export class AuthService {
  private authHubListener?: Subscription;

  constructor() {
    // ⚠️ Persistent subscription: AWS Amplify Hub listener per auth events
    // Rimane aperto per tutta la durata dell'app per tracciare sign in/out
    this.authHubListener = Hub.listen('auth', (data) => {
      if (data.payload.event === 'signIn') {
        this.handleSignIn();
      } else if (data.payload.event === 'signOut') {
        this.handleSignOut();
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup manuale quando il servizio viene distrutto
    this.authHubListener?.unsubscribe();
  }
}
```

**Regole per Persistent Subscriptions:**
- Usare SOLO per listener globali che devono durare quanto l'app
- Documentare con: `// ⚠️ Persistent subscription: <motivo>`
- NON usare `takeUntilDestroyed()` (la subscription è intenzionalmente persistente)
- Fare cleanup manuale in `ngOnDestroy()` se il servizio/componente può essere distrutto
- Tipici casi d'uso:
  - AWS Amplify Hub listeners
  - WebSocket connections globali
  - Real-time database subscriptions app-wide
  - Global state management streams

#### @Unsubscribe Decorator (Advanced)

Per casi complessi dove serve gestire multiple subscription manualmente, usa il decorator `@Unsubscribe`:

```typescript
// Component con multiple subscriptions complesse
import { Unsubscribe } from '@university-books/decorators';

export class ComplexComponent {
  @Unsubscribe()
  private subscription1!: Subscription;

  @Unsubscribe()
  private subscription2!: Subscription;

  ngOnInit(): void {
    // Il decorator si occupa automaticamente dell'unsubscribe
    this.subscription1 = this.service1.getData$().subscribe();
    this.subscription2 = this.service2.getData$().subscribe();
  }

  // ngOnDestroy viene gestito dal decorator automaticamente
}
```

**Implementazione decorator disponibile in:** `libs/decorators/`

**⚠️ ATTENZIONE:** Usare `@Unsubscribe` decorator SOLO quando:
- Hai 3+ subscriptions complesse da gestire
- Le subscription devono essere dinamiche (aggiunte/rimosse runtime)
- `takeUntilDestroyed()` non è applicabile per motivi architetturali

**Nella maggior parte dei casi:**
1. 🥇 **PREFERIRE**: `async` pipe
2. 🥈 **ALTERNATIVA**: `takeUntilDestroyed()` per subscribe necessari
3. 🥉 **RARO**: `@Unsubscribe` decorator (solo casi complessi)

#### 📋 Checklist Code Review - Subscriptions

Prima di committare codice, verifica OGNI subscription:

**Per ogni `.subscribe()` trovato nel codice:**
- [ ] C'è un commento che spiega PERCHÉ async pipe non è applicabile?
  - Regular: `⚠️ Subscribe necessario (non async pipe) perché:`
  - Persistent: `⚠️ Persistent subscription: <motivo>`
- [ ] Usa `takeUntilDestroyed()` o `@Unsubscribe` decorator? (NON per persistent subscriptions)
- [ ] La subscription è veramente necessaria? (Non può usare async pipe?)
- [ ] Se è persistent subscription: è veramente necessaria app-wide?
- [ ] Se è per navigazione: è veramente imperativa o può usare declarative routing?
- [ ] Se è per aggiornare state: può usare toSignal() invece?

**Script automatico di verifica:**
```bash
# Verifica automatica completa di tutte le subscriptions in tutti i progetti
npm run check:subscriptions

# Verifica solo progetto specifico
npm run check:subscriptions:mobile
# oppure
bash scripts/check-subscriptions.sh university-books-mobile

# Verifica subscriptions + lint
npm run lint:all

# Verifica completa prima del build (subscriptions + lint + build)
npm run build:check

# Output di esempio:
# ✅ All checks passed! Total subscriptions: 2
# Best practices followed:
#   • All subscriptions have takeUntilDestroyed() or @Unsubscribe
#   • All subscriptions documented with explanation comments
#   • Preferring async pipe where applicable
#   ℹ️  Found 1 persistent subscription(s) (AWS/global listeners)
```

**Build Process Integration:**

Il controllo delle subscriptions è integrato nel processo di build:
- `npm run build` - esegue automaticamente `check:subscriptions` prima del build (tramite `prebuild` hook)
- `npm run check` - controlla subscriptions + lint (usato da CI/CD)
- `npm run lint:all` - controlla subscriptions + lint
- `npm run build:check` - full check (subscriptions + lint + build)

**CI/CD Integration (GitHub Actions):**

Il controllo è integrato in tutti i workflow GitHub Actions:

**1. Pull Request Checks (`.github/workflows/check-pr.yaml`)**
```yaml
- name: Check RxJS Subscriptions
  run: npm run check:subscriptions

- name: Run Lint
  run: npm run lint
```

**2. Build Workflows (`build-pr.yaml`, `build-master.yaml`)**
```yaml
- name: Check RxJS Subscriptions
  run: npm run check:subscriptions

- name: Run Lint
  run: npm run lint

- name: Build Production
  run: npm run build
```

**3. Test Workflow (`run-tests.yaml` - Lint job)**
```yaml
- name: Check RxJS Subscriptions
  run: npm run check:subscriptions

- name: Run ESLint
  run: npm run lint

- name: TypeScript Type Check
  run: npx tsc --noEmit
```

**Risultato:** Ogni PR viene automaticamente verificata e **bloccata** se contiene subscriptions non documentate o senza cleanup! ✅

**Comandi manuali per verificare:**
```bash
# Trova tutte le subscriptions nel progetto
grep -r "\.subscribe(" src/app --include="*.ts" | grep -v ".spec.ts"

# Verifica che abbiano takeUntilDestroyed
grep -r "\.subscribe(" src/app --include="*.ts" | grep -v "takeUntilDestroyed" | grep -v ".spec.ts"

# Trova Observable che potrebbero usare async pipe
grep -r ": Observable<" src/app --include="*.ts" | grep -v "service.ts" | grep -v ".spec.ts"
```

**Esempi di codice che NON PASSA la review:**
```typescript
// ❌ SBAGLIATO - Nessun commento, nessun takeUntilDestroyed
this.service.getData$().subscribe(data => {
  this.data = data;
});

// ❌ SBAGLIATO - Dovrebbe usare async pipe
public data: any;
ngOnInit() {
  this.service.getData$().subscribe(data => {
    this.data = data;  // Nel template: {{ data }}
  });
}

// ✅ CORRETTO - Usa async pipe invece
public readonly data$ = this.service.getData$();
// Template: {{ data$ | async }}
```

### 4. Validators come Arrow Functions

```typescript
// ✅ CORRETTO - Validator come readonly arrow function
export class RegisterComponent {
  private readonly passwordStrengthValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    // validation logic
    return isValid ? null : { passwordStrength: true };
  };

  private readonly passwordMatchValidator = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}

// ❌ SBAGLIATO - Metodo normale (può causare problemi con `this` context)
export class RegisterComponent {
  private passwordStrengthValidator(control: AbstractControl) {
    // ...
  }
}
```

**Motivo:** Arrow functions mantengono automaticamente il binding di `this` e sono più sicure da passare come callback.

### 5. Dependency Injection moderna (Angular 14+)

```typescript
// ✅ CORRETTO - inject() function (modern)
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  constructor() {
    // Logic qui se necessario
  }
}

// ✅ ACCETTABILE - Constructor injection (classico)
export class LoginComponent {
  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) { }
}

// ⚠️ EVITA - Mix di entrambi gli approcci
```

**Preferenza:** Usare `inject()` quando possibile - è più flessibile e consente dependency injection fuori dal constructor.

### 6. Signals (Angular 16+) per State Management

```typescript
// ✅ CORRETTO - Signals per state locale
export class LoginComponent {
  public readonly loading = signal(false);
  public readonly errorMessage = signal<string | null>(null);

  onSubmit(): void {
    this.loading.set(true);  // Aggiornamento
    this.errorMessage.set(null);
  }
}

// ✅ CORRETTO - Computed signals
export class HomeComponent {
  public readonly authState = this.authService.state;

  public readonly userName = computed(() => {
    const user = this.authState().user;
    return user?.username || 'User';
  });
}

// Template access
<p>{{ loading() }}</p>           <!-- Signal -->
<p>{{ userName() }}</p>          <!-- Computed signal -->
```

**Motivo:** Signals offrono reattività granulare e performance migliori rispetto a RxJS per state management locale.

### 7. Typed Forms

```typescript
// ✅ CORRETTO - FormGroup tipizzato
export class LoginComponent {
  public readonly loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  // Getters tipizzati
  get email() {
    return this.loginForm.get('email');
  }
}
```

### 8. Project Structure

```
projects/university-books-mobile/src/app/
├── auth/                        Feature module (auto-contenuto)
│   ├── components/              UI components
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── guards/                  Auth guards
│   ├── models/                  Auth-specific models
│   ├── services/                Auth service
│   └── index.ts                 Barrel export
├── pages/                       Routable pages
│   └── home/
├── core/                        Singleton services & config
│   ├── config/
│   └── models/
└── app.routes.ts

libs/backend-api-client/         Shared library
├── src/
│   ├── generated/               Auto-generated code
│   └── index.ts
```

**Principi:**
- Feature modules sono **auto-contenuti**: models, services, guards vanno insieme
- `core/` contiene solo servizi singleton e configurazioni globali
- `libs/` per codice condiviso tra progetti futuri (web, admin, etc.)

### 9. Error Handling

```typescript
// ✅ CORRETTO - Error handling robusto
signIn$(email: string, password: string): Observable<SignInOutput> {
  return from(signIn(signInInput)).pipe(
    switchMap(async (result) => {
      // Handle success
      return result;
    }),
    catchError((error) => {
      const errorMessage = this.parseAuthError(error);
      this.setError(errorMessage);
      throw error;  // Re-throw per permettere handling upstream
    })
  );
}

private parseAuthError(error: any): string {
  switch (error?.name) {
    case 'UserNotFoundException':
      return 'User not found. Please check your email.';
    case 'NotAuthorizedException':
      return 'Incorrect email or password.';
    default:
      console.error('Auth error:', error);
      return error.message || 'An unknown error occurred';
  }
}
```

### 10. Librerie Condivise

```typescript
// libs/backend-api-client/package.json
{
  "name": "@university-books/backend-api-client",
  "version": "0.0.1"
}

// tsconfig.json
{
  "paths": {
    "@university-books/backend-api-client": ["./libs/backend-api-client/src/index.ts"]
  }
}

// Usage
import { LoginRequest, AuthenticationService } from '@university-books/backend-api-client';
```

**Convenzione naming:** `@organization/descriptive-name` (scoped packages)

**Librerie disponibili:**
- `@university-books/backend-api-client` - Client TypeScript auto-generato per API backend
- `@university-books/decorators` - Decoratori TypeScript riutilizzabili (es: `@Unsubscribe`)

### 11. Import Organization

#### Separare import esterni da import locali
```typescript
// ✅ CORRETTO - Librerie esterne prima, poi spazio, poi import locali
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../models/auth.model';

// ❌ SBAGLIATO - Tutto mischiato
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { AuthUser } from '../../models/auth.model';
```

**Ordine consigliato:**
1. Import Angular (`@angular/*`)
2. Import librerie terze (`aws-amplify`, `rxjs`, etc.)
3. **[SPAZIO VUOTO]**
4. Import locali relativi (`./`, `../`)

### 12. Class Member Order

Mantenere un ordine consistente dei membri della classe per migliorare la leggibilità.

```typescript
export class LoginComponent {
  // 1. DICHIARAZIONI (inject, properties)
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public readonly loginForm: FormGroup;
  public readonly loading = signal(false);
  public readonly errorMessage = signal<string | null>(null);

  // 2. OBSERVABLE STREAMS (se presenti)
  public readonly users$ = this.userService.getUsers$();
  private readonly destroy$ = new Subject<void>();

  // 3. COSTRUTTORE
  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  // 4. LIFECYCLE HOOKS (ngOnInit, ngOnDestroy, etc.)
  ngOnInit(): void {
    // Initialization logic
  }

  // 5. PUBLIC METHODS (API del componente)
  onSubmit(): void {
    // ...
  }

  onCancel(): void {
    // ...
  }

  // 6. GETTERS (per template access)
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  // 7. PRIVATE/PROTECTED METHODS (helper methods)
  private setLoading(loading: boolean): void {
    this.loading.set(loading);
  }

  private handleError(error: any): void {
    console.error('Error:', error);
  }
}
```

**Ordine riassunto:**
1. Dichiarazioni (dependencies, properties)
2. Observable streams (`$`)
3. Constructor
4. Lifecycle hooks
5. Public methods
6. Getters
7. Private/Protected methods

### 13. Utility Functions - Separation of Concerns

Quando un componente ha funzioni utility complesse o riutilizzabili, separarle in file dedicati.

#### Quando creare file `.utils.ts`
```typescript
// ✅ CORRETTO - Utility complesse in file separato

// login.utils.ts
export function parseAuthError(error: any): string {
  switch (error?.name) {
    case 'UserNotFoundException':
      return 'User not found. Please check your email.';
    case 'NotAuthorizedException':
      return 'Incorrect email or password.';
    case 'UserNotConfirmedException':
      return 'Please verify your email before signing in.';
    default:
      console.error('Auth error:', error);
      return error.message || 'An unknown error occurred';
  }
}

export function validatePasswordStrength(password: string): {
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isValid: boolean;
} {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
    isValid: hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
  };
}

// login.component.ts
import { parseAuthError, validatePasswordStrength } from './login.utils';

export class LoginComponent {
  onSubmit(): void {
    this.authService.signIn$(email, password)
      .pipe(takeUntilDestroyed())
      .subscribe({
        error: (error) => {
          const message = parseAuthError(error);  // ✅ Pulito e leggibile
          this.errorMessage.set(message);
        }
      });
  }
}
```

**Quando creare file `.utils.ts`:**
- ✅ Funzioni di parsing/formatting complesse (es: `parseAuthError`)
- ✅ Validazioni custom riutilizzabili (es: `validatePasswordStrength`)
- ✅ Trasformazioni dati (es: `formatUserData`, `normalizePhoneNumber`)
- ✅ Calcoli complessi (es: `calculateTotalPrice`, `computeStatistics`)

**Quando NON creare file `.utils.ts`:**
- ❌ Validators Angular (restano nel componente come arrow functions)
- ❌ Getters semplici per form controls
- ❌ Funzioni strettamente legate allo state del componente

#### Struttura per utility condivise vs specializzate
```
auth/
├── components/
│   ├── login/
│   │   ├── login.component.ts
│   │   ├── login.component.html
│   │   ├── login.component.scss
│   │   └── login.utils.ts           ← Utility SOLO per LoginComponent
│   └── register/
│       ├── register.component.ts
│       ├── register.component.html
│       ├── register.component.scss
│       └── register.utils.ts        ← Utility SOLO per RegisterComponent
└── utils/
    └── auth.utils.ts                ← Utility CONDIVISE tra tutti i componenti auth
```

**Esempio utility condivise:**
```typescript
// auth/utils/auth.utils.ts
// Utility usate da MULTIPLE componenti auth
export function parseAuthError(error: any): string { }
export function formatUserDisplayName(user: AuthUser): string { }
export function isPasswordValid(password: string): boolean { }

// auth/components/login/login.utils.ts
// Utility SPECIFICHE solo per login
export function shouldShowRememberMe(): boolean { }
export function getLastUsedEmail(): string | null { }

// auth/components/register/register.utils.ts
// Utility SPECIFICHE solo per register
export function generateUsername(email: string): string { }
export function validateBirthDate(date: Date): boolean { }
```

### 14. File Naming Conventions

```
✅ CORRETTO:
- login.component.ts
- login.component.html
- login.component.scss
- login.utils.ts
- auth.service.ts
- auth.guard.ts
- auth.model.ts

❌ SBAGLIATO:
- LoginComponent.ts       (PascalCase per file)
- login-utils.ts         (kebab-case per utils - usare dot notation)
- authService.ts         (camelCase per file)
- Auth.service.ts        (PascalCase per file)
```

**Pattern:** `name.type.ts` dove `type` può essere:
- `component`
- `service`
- `guard`
- `model`
- `utils`
- `config`
- `routes`

---

## ✅ COMPLETATO (Phase 1 & 2)

### Phase 1: Setup Iniziale & Refactoring ✅

#### 1.1 Environment & Dependencies ✅
- [x] Configurato `.env.local` con credenziali AWS (Cognito, API Key)
- [x] Creato `.env.example` come template
- [x] Installato dipendenze: `aws-amplify`, `openapi-typescript-codegen`, `dotenv`
- [x] Configurato gitignore per secrets e generated code

#### 1.2 Project Restructuring (AWS + Angular Best Practices) ✅
- [x] Analizzato documentazione ufficiale AWS Amplify Gen 2 e Angular 19 (2025)
- [x] Ristrutturato da layer-based a **feature-based** architecture
- [x] Implementato pattern **Core/Shared/Features**
- [x] Creato directory `amplify/` per backend config (TypeScript-first)
- [x] Spostato configurazioni in struttura standard

**Struttura Prima:**
```
src/lib/              ❌ Non standard
├── config/
├── core/
└── generated/
```

**Struttura Dopo:**
```
src/app/
├── core/             ✅ Singleton services
│   ├── models/       Domain models
│   ├── services/     Business services
│   └── config/       Configurations
├── shared/           ✅ Reusable components
└── features/         ✅ Feature modules
```

#### 1.3 Shared Library Creation ✅
- [x] Creato libreria `@university-books/backend-api-client` in `libs/`
- [x] Spostato codice auto-generato da progetto a libreria
- [x] Configurato path mappings in `tsconfig.json`
- [x] Aggiornato script `generate-api-client.ts` per generare in `libs/`

**Motivo:** Codice API condiviso tra tutti i futuri progetti (web, admin, ecc.)

#### 1.4 Domain Models ✅
- [x] Creato `User` domain model con business logic
- [x] Creato `Document` domain model con business logic
- [x] Separato API Types (generated) da Domain Models (business logic)
- [x] Documentato differenza tra i due concetti

### Phase 2: AWS Backend Integration ✅

#### 2.1 Schema Management ✅
- [x] Script `fetch-schema.ts` per download schema OpenAPI da AWS
- [x] Script `generate-api-client.ts` per generare TypeScript client
- [x] Implementato caching con hash validation
- [x] Retry logic con exponential backoff
- [x] Error handling completo

**Script NPM:**
```bash
npm run schema:fetch       # Download schema
npm run schema:generate    # Generate client
npm run schema:update      # Both (used in prebuild)
```

#### 2.2 AWS Amplify Configuration ✅
- [x] Configurato `amplify.config.ts` per Cognito User Pool
- [x] Implementato validation delle environment variables
- [x] Setup debug logging per development

#### 2.3 Authentication Service ✅
- [x] Creato `AuthService` con AWS Amplify
- [x] Implementato Angular Signals per reactive state
- [x] Metodi: `signIn()`, `signOut()`, `getAccessToken()`
- [x] Auto token refresh gestito da Amplify
- [x] Error handling con messaggi user-friendly

#### 2.4 API Client Configuration ✅
- [x] Configurato OpenAPI client con JWT injection automatico
- [x] Setup `configureApiClient()` per bootstrap
- [x] Integrato con `AuthService` per token management

#### 2.5 Application Bootstrap ✅
- [x] Aggiornato `app.config.ts` per inizializzare Amplify
- [x] Configurato `APP_INITIALIZER` per API client setup
- [x] Integrato tutto nel bootstrap Angular

#### 2.6 Documentation ✅
- [x] Creato documentazione completa in `/docs/`
- [x] **WHERE-IS-WHAT.md** - Quick reference
- [x] **NAMING-CLARIFICATION.md** - API Types vs Domain Models
- [x] **ARCHITECTURE.md** - Decisioni architetturali
- [x] **PROJECT-STRUCTURE.md** - Struttura progetto
- [x] **REFACTORING-SUMMARY.md** - Storia refactoring
- [x] README libreria `backend-api-client`
- [x] README progetto mobile aggiornato

#### 2.7 Build & Testing ✅
- [x] Verificato build funzionante (397KB → 108KB compressed)
- [x] Testato generazione schema e client
- [x] Validato path mappings e imports

### Phase 3: UI Implementation - Authentication Feature ✅

#### 3.1 Login Feature Module ✅
- [x] Creato `features/auth/` directory structure
- [x] Implementato `LoginComponent`
  - [x] Form con email + password
  - [x] Validation (Angular Reactive Forms)
  - [x] Error handling UI
  - [x] Loading states con spinner
  - [x] Integrazione con `AuthService.signIn()`
- [ ] Implementare `RegisterComponent` 🟡 PROSSIMO
  - [ ] Form registrazione
  - [ ] Password strength indicator
  - [ ] Email verification flow
- [ ] Implementare `ForgotPasswordComponent` 🟡 PROSSIMO
  - [ ] Request reset
  - [ ] Verification code input
  - [ ] New password form

**File creati:**
```
src/app/features/auth/
├── login/
│   ├── login.component.ts     ✅
│   ├── login.component.html   ✅
│   └── login.component.scss   ✅
├── register/                  🟡 TODO
└── auth.routes.ts             ✅
```

#### 3.2 Auth Guards ✅
- [x] Implementato `AuthGuard` per proteggere route
- [x] Implementato `GuestGuard` per redirect se già loggato
- [x] Configurato routing con guards

**File creati:**
```
src/app/core/guards/
├── auth.guard.ts    ✅
└── guest.guard.ts   ✅
```

#### 3.3 Home Component (Placeholder) ✅
- [x] Creato `HomeComponent` con welcome message
- [x] Mostra username dall'AuthService
- [x] Button logout funzionante
- [x] Placeholder per future features (Documents, Profile, Settings)

**File creati:**
```
src/app/features/home/
├── home.component.ts      ✅
├── home.component.html    ✅
└── home.component.scss    ✅
```

#### 3.4 Routing ✅
- [x] Configurato `app.routes.ts` con auth routes
- [x] Implementato lazy loading per auth feature
- [x] Setup redirect dopo login/logout
- [x] Protezione route `/home` con `authGuard`
- [x] Protezione route `/auth` con `guestGuard`

**Routing implementato:**
```typescript
// app.routes.ts
{
  path: '',
  redirectTo: '/home',
  pathMatch: 'full'
},
{
  path: 'auth',
  loadChildren: () => import('./features/auth/auth.routes'),
  canActivate: [guestGuard]
},
{
  path: 'home',
  loadComponent: () => import('./features/home/home.component'),
  canActivate: [authGuard]
}
```

#### 3.5 Build & Testing ✅
- [x] Build production funzionante
- [x] Bundle size ottimale:
  - Initial: 414 KB (114 KB compressed)
  - Login lazy chunk: 39 KB (9 KB compressed)
  - Home lazy chunk: 3.5 KB (1.2 KB compressed)

---

## 🚧 DA FARE (Phase 3 Remaining, 4, 5)

### Phase 3: Authentication Feature - Completamento 🟡 TODO

---

### Phase 4: UI Implementation - Core App Features 🟡 TODO

#### 4.1 Dashboard/Home
- [ ] Creare `features/home/` module
- [ ] Dashboard component con overview
- [ ] Navigation menu
- [ ] User profile display

#### 4.2 Documents Feature
- [ ] Creare `features/documents/` module
- [ ] `DocumentListComponent`
  - [ ] Lista documenti con filtering/sorting
  - [ ] Paginazione
  - [ ] Search
- [ ] `DocumentUploadComponent`
  - [ ] File upload con drag & drop
  - [ ] Progress indicator
  - [ ] Upload to S3 presigned URL
- [ ] `DocumentDetailComponent`
  - [ ] View document metadata
  - [ ] Download/Delete actions

**File da creare:**
```
src/app/features/documents/
├── list/
│   └── document-list.component.ts
├── upload/
│   └── document-upload.component.ts
├── detail/
│   └── document-detail.component.ts
└── documents.routes.ts
```

#### 4.3 Business Services
- [ ] Creare `DocumentService` in `core/services/`
  - [ ] Metodi: `getAll()`, `upload()`, `delete()`
  - [ ] Trasformazione API Types → Domain Models
  - [ ] Error handling
  - [ ] Caching (optional)

**File da creare:**
```
src/app/core/services/
└── document.service.ts
```

---

### Phase 5: Shared Components & UX 🟡 TODO

#### 5.1 Shared UI Components
- [ ] Creare components in `shared/components/`
  - [ ] `LoadingSpinnerComponent`
  - [ ] `ErrorMessageComponent`
  - [ ] `ConfirmDialogComponent`
  - [ ] `FileUploadComponent` (reusable)
  - [ ] `EmptyStateComponent`

**File da creare:**
```
src/app/shared/components/
├── loading-spinner/
├── error-message/
├── confirm-dialog/
├── file-upload/
└── empty-state/
```

#### 5.2 Shared Pipes
- [ ] `FileSizePipe` (già implementato in Document model, estrarre)
- [ ] `RelativeTimePipe` (già implementato in Document model)
- [ ] `TruncatePipe` per testi lunghi

#### 5.3 Shared Directives
- [ ] `AutofocusDirective`
- [ ] `ClickOutsideDirective`
- [ ] `PermissionsDirective` (future: role-based)

---

### Phase 6: Testing 🟢 NICE TO HAVE

#### 6.1 Unit Tests
- [ ] Test per `AuthService`
- [ ] Test per `DocumentService`
- [ ] Test per Domain Models
- [ ] Test per components (Login, DocumentList, ecc.)

**Command:**
```bash
npm run test
```

#### 6.2 E2E Tests
- [ ] Setup Playwright/Cypress
- [ ] Test flow: Register → Login → Upload Document → Logout
- [ ] Test error scenarios

**Command:**
```bash
npm run e2e
```

---

### Phase 7: State Management (Optional) 🟢 NICE TO HAVE

**Se l'app diventa complessa:**

#### Option A: NgRx (Redux pattern)
- [ ] Setup NgRx store
- [ ] Auth state management
- [ ] Documents state management
- [ ] Effects per async operations

#### Option B: Angular Signals (Modern approach)
- [ ] Estendere uso di Signals già presente in `AuthService`
- [ ] Signal-based state per Documents
- [ ] Computed signals per derived state

**Raccomandazione:** Inizia con Signals (già usati), passa a NgRx solo se necessario

---

### Phase 8: Performance & Optimization 🟢 NICE TO HAVE

- [ ] Implementare lazy loading per tutte le features
- [ ] Image optimization (WebP, lazy loading)
- [ ] Virtual scrolling per liste lunghe
- [ ] Service Worker per offline support (PWA)
- [ ] Bundle size analysis e optimization

---

### Phase 9: Security Hardening 🟡 IMPORTANTE

- [ ] Implementare Content Security Policy (CSP)
- [ ] Setup HTTPS-only in production
- [ ] Validare input lato client E server
- [ ] Sanitize HTML content
- [ ] Rate limiting (gestito dal backend)
- [ ] Audit dependencies (`npm audit`)

---

### Phase 10: Deployment 🟡 IMPORTANTE

#### 10.1 CI/CD Pipeline
- [ ] Setup GitHub Actions workflow
  - [ ] Lint
  - [ ] Test
  - [ ] Build
  - [ ] Deploy

#### 10.2 AWS Amplify Hosting (Recommended)
- [ ] Configurare Amplify Hosting
- [ ] Setup dominio custom (optional)
- [ ] SSL certificate
- [ ] Preview environments per PR

#### Alternative Deployment Options:
- S3 + CloudFront
- Vercel
- Netlify

---

## 📊 Progress Overview

| Phase | Status | Priority | Completion |
|-------|--------|----------|------------|
| **1. Setup & Refactoring** | ✅ DONE | 🔴 HIGH | 100% |
| **2. Backend Integration** | ✅ DONE | 🔴 HIGH | 100% |
| **3. Auth UI** | 🟡 IN PROGRESS | 🔴 HIGH | 70% |
| **4. Core Features** | 🔴 TODO | 🔴 HIGH | 0% |
| **5. Shared Components** | 🟡 TODO | 🟡 MEDIUM | 0% |
| **6. Testing** | 🟢 TODO | 🟢 LOW | 0% |
| **7. State Management** | 🟢 TODO | 🟢 LOW | 0% |
| **8. Performance** | 🟢 TODO | 🟢 LOW | 0% |
| **9. Security** | 🟡 TODO | 🟡 MEDIUM | 0% |
| **10. Deployment** | 🟡 TODO | 🟡 MEDIUM | 0% |

**Overall Progress: 37% Complete**

**Phase 3 Details:**
- ✅ Login Component (100%)
- ✅ Auth Guards (100%)
- ✅ Home Component (100%)
- ✅ Routing Configuration (100%)
- 🟡 Register Component (0%)
- 🟡 Forgot Password Component (0%)

---

## 🎯 Next Immediate Steps (in order)

### ✅ Step 1-4: Login UI, Guards, Home, Routing - COMPLETATI

**Cosa è stato implementato:**
1. ✅ `LoginComponent` con form (email + password)
2. ✅ `AuthGuard` e `GuestGuard`
3. ✅ `HomeComponent` con welcome message e logout
4. ✅ Routing configuration con lazy loading
5. ✅ Build production funzionante

### 🟡 Step 5: Test End-to-End Flow (PROSSIMO)

**Flusso da testare:**
1. Start app: `npm start`
2. Navigate to `http://localhost:4200`
3. Verifica redirect automatico a `/auth/login` (non autenticato)
4. Login con credenziali Cognito test
5. Verifica redirect a `/home` dopo login
6. Verifica username visualizzato correttamente
7. Logout
8. Verifica redirect a `/auth/login`

### 🟡 Step 6: Register Component (OPZIONALE - può essere fatto dopo)

**Cosa implementare:**
```bash
# Creare struttura
mkdir -p projects/university-books-mobile/src/app/features/auth/register
```

1. Form registrazione con:
   - Email
   - Password
   - Confirm Password
   - Password strength indicator
2. Chiamata a Amplify `signUp()`
3. Email verification flow
4. Error handling

### 🟡 Step 7: Forgot Password Component (OPZIONALE)

**Cosa implementare:**
1. Request reset flow
2. Verification code input
3. New password form
4. Chiamate a Amplify `resetPassword()`

---

## 🛠️ Commands Reference

### Development
```bash
# Start dev server
npm run start:university-books-mobile

# Build for production
npm run build

# Run tests
npm run test

# Lint
npm run lint
```

### Schema Management
```bash
# Update API client (fetch + generate)
npm run schema:update

# Fetch schema only
npm run schema:fetch

# Generate client only
npm run schema:generate
```

### Git Workflow

**IMPORTANTE:** Seguire sempre la convenzione di naming `<type>/<project-name>/<description>`

```bash
# Check status
git status

# Create feature branch (con nome progetto!)
git checkout -b feat/university-books-mobile/auth-ui

# Commit con conventional commits
git add .
git commit -m "feat(auth): implement login UI with form validation"

# Push (specificare nome progetto nella branch)
git push origin feat/university-books-mobile/auth-ui

# Creare Pull Request su GitHub
# Titolo: feat(auth): implement login UI with form validation
# Branch target: master o main
```

**Convenzioni branch naming:**
- ✅ `feat/university-books-mobile/auth-implementation`
- ✅ `fix/university-books-mobile/login-bug`
- ✅ `refactor/backend-api-client/error-handling`
- ❌ `feat/auth` (manca nome progetto)
- ❌ `feature/login-ui` (tipo sbagliato, manca progetto)

**Convenzioni commit message:**
```bash
<type>(<scope>): <description>

# Esempi:
feat(auth): implement AWS Cognito integration
fix(auth): resolve session timeout issue
refactor(api-client): improve error handling
docs(readme): update setup instructions
test(auth): add login component tests
```

**Scopes validi:** auth, api-client, ci, university-books-mobile

---

## 📚 Resources

### Documentation
- [Project Structure](mobile-app/PROJECT-STRUCTURE.md)
- [Where is What](mobile-app/WHERE-IS-WHAT.md)
- [Architecture Decisions](mobile-app/ARCHITECTURE.md)
- [AWS Integration Guide](AWS-BACKEND-INTEGRATION-GUIDE.md)
- [Angular Best Practices](ANGULAR-IMPLEMENTATION-GUIDE.md)

### Official Docs
- [Angular Documentation](https://angular.dev/)
- [AWS Amplify Angular](https://docs.amplify.aws/angular/)
- [AWS Cognito](https://docs.aws.amazon.com/cognito/)
- [OpenAPI TypeScript Codegen](https://github.com/ferdikoomen/openapi-typescript-codegen)

---

## 🚀 Quick Start for New Contributors

1. **Clone & Setup**
```bash
git clone <repo-url>
cd university-books-apps
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env.local
# Edit .env.local with your AWS credentials
```

3. **Fetch Schema & Build**
```bash
npm run schema:update
npm run build
```

4. **Start Development**
```bash
npm start
```

5. **Read Documentation**
- Start with [WHERE-IS-WHAT.md](mobile-app/WHERE-IS-WHAT.md)
- Then [ARCHITECTURE.md](mobile-app/ARCHITECTURE.md)

---

## ✅ Definition of Done

Per considerare il progetto "completato" (MVP):

- [x] ✅ Infrastructure setup (AWS, Amplify, API Client)
- [x] ✅ Architecture refactoring (Best practices)
- [x] ✅ Login/Logout UI funzionanti
- [x] ✅ Auth guards implementati
- [ ] 🟡 Register UI (opzionale per MVP)
- [ ] 🔴 Document list view
- [ ] 🔴 Document upload funzionante
- [x] ✅ Error handling UI friendly (login page)
- [x] ✅ Loading states (login page)
- [ ] 🟡 Basic tests (almeno auth flow)
- [ ] 🟡 Deployed to staging environment

**MVP Target:** Phases 1-4 completate

**Current Status:** Phase 3 al 70%, pronto per iniziare Phase 4 (Documents feature)

---

**Last Updated:** 2025-12-06
**Current Phase:** Phase 3 (70% complete) → Phase 4 Ready to Start
**Next Milestone:** Documents Feature Implementation
