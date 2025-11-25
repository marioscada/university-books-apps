# 🚀 Future Integrations Guide

Questa guida contiene le librerie e feature comunemente utilizzate nei progetti Angular che possono essere aggiunte al template secondo le necessità.

## 📋 Indice

- [UI Component Libraries](#ui-component-libraries)
- [State Management](#state-management)
- [Authentication & Security](#authentication--security)
- [HTTP & API](#http--api)
- [Forms Enhancement](#forms-enhancement)
- [Utility Libraries](#utility-libraries)
- [Mobile Development](#mobile-development)
- [Testing](#testing)
- [Production Tools](#production-tools)
- [Internationalization](#internationalization)

---

## 🎨 UI Component Libraries

### Angular Material (Consigliato per Web)
```bash
ng add @angular/material
```

**Features:**
- Design Material UI
- Accessibilità built-in
- Theming avanzato
- Ottima documentazione

**Uso:**
```typescript
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  imports: [MatButtonModule, MatCardModule]
})
```

### PrimeNG (Alternativa ricca di componenti)
```bash
npm install primeng primeicons
```

**Features:**
- 90+ componenti
- Temi pre-built
- DataTable avanzato
- Grafici inclusi

### Ng-Bootstrap
```bash
npm install @ng-bootstrap/ng-bootstrap bootstrap
```

**Features:**
- Bootstrap 5
- Nessuna dipendenza jQuery
- Ottimo per progetti Bootstrap esistenti

---

## 🔄 State Management

### NgRx (Per applicazioni complesse)
```bash
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools
```

**Quando usarlo:**
- App enterprise complesse
- Molte interazioni tra componenti
- Necessità di time-travel debugging

**Setup base:**
```typescript
// app.config.ts
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(),
    provideEffects(),
    provideStoreDevtools({ maxAge: 25 })
  ]
};
```

### NgRx Signals (Più semplice - Angular 17+)
```bash
npm install @ngrx/signals
```

**Quando usarlo:**
- Alternativa più semplice a NgRx Store
- Progetti medio-piccoli
- Team che inizia con state management

---

## 🔐 Authentication & Security

### Auth0 (SaaS Authentication)
```bash
npm install @auth0/auth0-angular
```

**Setup:**
```typescript
import { provideAuth0 } from '@auth0/auth0-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAuth0({
      domain: 'YOUR_DOMAIN',
      clientId: 'YOUR_CLIENT_ID',
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    })
  ]
};
```

### JWT Manual Implementation
```bash
npm install @auth0/angular-jwt
```

**Guard Example:**
```typescript
// shared/guards/auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    inject(Router).navigate(['/login']);
    return false;
  }
  return true;
};
```

**Interceptor Example:**
```typescript
// shared/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
```

---

## 🌐 HTTP & API

### HTTP Interceptors Setup

**Loading Interceptor:**
```typescript
// shared/interceptors/loading.interceptor.ts
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  loadingService.show();

  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};
```

**Error Handling Interceptor:**
```typescript
// shared/interceptors/error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Client Error: ${error.error.message}`;
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }

      notificationService.showError(errorMessage);
      return throwError(() => error);
    })
  );
};
```

**Register Interceptors:**
```typescript
// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])
    )
  ]
};
```

---

## 📝 Forms Enhancement

### Angular Reactive Forms (già incluso)

**Custom Validators:**
```typescript
// shared/utils/validators.ts
export class CustomValidators {
  static email(control: AbstractControl): ValidationErrors | null {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(control.value) ? null : { invalidEmail: true };
  }

  static strongPassword(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;
    return valid ? null : { weakPassword: true };
  }
}
```

---

## 🛠️ Utility Libraries

### Date Manipulation - date-fns (Consigliato)
```bash
npm install date-fns
```

**Uso:**
```typescript
import { format, addDays, isAfter } from 'date-fns';
import { it } from 'date-fns/locale';

const formatted = format(new Date(), 'dd/MM/yyyy', { locale: it });
const tomorrow = addDays(new Date(), 1);
```

### Lodash (Tree-shakeable)
```bash
npm install lodash-es
npm install -D @types/lodash-es
```

**Uso:**
```typescript
import { debounce, chunk, uniq } from 'lodash-es';

const debouncedSearch = debounce((query: string) => {
  // search logic
}, 300);
```

### UUID Generation
```bash
npm install uuid
npm install -D @types/uuid
```

**Uso:**
```typescript
import { v4 as uuidv4 } from 'uuid';
const id = uuidv4();
```

---

## 📱 Mobile Development

### Ionic Framework (Per App Mobile)

**Quando usare Ionic:**
- App mobile cross-platform (iOS + Android)
- Necessità di accesso a funzionalità native
- UI/UX mobile-first
- Vuoi riutilizzare codice Angular esistente

**Setup:**
```bash
# Installare Ionic CLI globalmente
npm install -g @ionic/cli

# Aggiungere Ionic al progetto
ionic init
npm install @ionic/angular

# Aggiungere Capacitor per funzionalità native
npm install @capacitor/core @capacitor/cli
npx cap init
```

**Struttura progetto con Ionic:**
```
projects/
├── mobile-app/              # App Ionic/Capacitor
│   ├── src/
│   │   ├── app/
│   │   ├── shared/          # Codice condiviso
│   │   ├── environments/
│   │   └── theme/           # Ionic themes
│   ├── capacitor.config.ts
│   └── ionic.config.json
└── web-app/                 # App web standard
```

**Componenti Ionic Example:**
```typescript
import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>My App</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-button>Click Me</ion-button>
    </ion-content>
  `,
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton]
})
export class HomePage {}
```

### Capacitor (Accesso Funzionalità Native)

**Plugin Essenziali:**
```bash
# Core plugins
npm install @capacitor/app @capacitor/haptics @capacitor/keyboard
npm install @capacitor/status-bar @capacitor/splash-screen

# Storage
npm install @capacitor/preferences

# Camera
npm install @capacitor/camera

# Geolocation
npm install @capacitor/geolocation

# Push Notifications
npm install @capacitor/push-notifications

# Filesystem
npm install @capacitor/filesystem

# Network
npm install @capacitor/network
```

**Uso Capacitor Plugins:**
```typescript
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';

// Camera
const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });
  return image.webPath;
};

// Geolocation
const getCurrentPosition = async () => {
  const coordinates = await Geolocation.getCurrentPosition();
  return {
    lat: coordinates.coords.latitude,
    lng: coordinates.coords.longitude
  };
};

// Storage
await Preferences.set({ key: 'user', value: JSON.stringify(user) });
const { value } = await Preferences.get({ key: 'user' });
```

**Platform Detection:**
```typescript
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform(); // 'ios', 'android', 'web'

if (Capacitor.isPluginAvailable('Camera')) {
  // Use camera
}
```

**Build per Mobile:**
```bash
# Build Angular app
npm run build:mobile-app

# Sync con Capacitor
npx cap sync

# Open in IDE
npx cap open ios
npx cap open android

# Run on device
npx cap run ios
npx cap run android
```

**Configurazione Capacitor:**
```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'My App',
  webDir: 'dist/mobile-app/browser',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3f51b5'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
```

**Progressive Web App (PWA) Alternative:**
```bash
# Se non serve app nativa, usa PWA
ng add @angular/pwa

# Questo aggiunge:
# - Service Worker
# - Manifest.json
# - Icons per diverse dimensioni
# - Supporto offline
```

---

## 🧪 Testing

### Cypress (E2E Testing)
```bash
npm install -D cypress
npx cypress open
```

**Esempio test:**
```typescript
describe('Login Flow', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    cy.get('[data-cy=email]').type('user@example.com');
    cy.get('[data-cy=password]').type('password');
    cy.get('[data-cy=submit]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

### Testing Library
```bash
npm install -D @testing-library/angular
```

---

## 🚀 Production Tools

### Sentry (Error Tracking)
```bash
npm install @sentry/angular
```

**Setup:**
```typescript
import * as Sentry from '@sentry/angular';

Sentry.init({
  dsn: 'YOUR_DSN',
  environment: environment.production ? 'production' : 'development',
  tracesSampleRate: 1.0
});
```

### Google Analytics 4
```bash
npm install @angular/fire
```

**Setup:**
```typescript
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAnalytics, getAnalytics } from '@angular/fire/analytics';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics())
  ]
};
```

### Bundle Analyzer
```bash
npm install -D webpack-bundle-analyzer
```

**Uso:**
```bash
ng build --stats-json
npx webpack-bundle-analyzer dist/cicd-test/browser/stats.json
```

---

## 🌍 Internationalization

### NGX-Translate
```bash
npm install @ngx-translate/core @ngx-translate/http-loader
```

**Setup:**
```typescript
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
};
```

**Uso:**
```typescript
constructor(private translate: TranslateService) {
  this.translate.setDefaultLang('it');
  this.translate.use('it');
}

// Nel template
<h1>{{ 'HELLO' | translate }}</h1>
```

---

## 📊 Grafici e Visualizzazioni

### Chart.js con ng2-charts
```bash
npm install chart.js ng2-charts
```

### Apache ECharts
```bash
npm install echarts ngx-echarts
```

---

## 🔍 Quick Reference

### Decisioni Comuni

| Necessità | Libreria Consigliata |
|-----------|---------------------|
| UI Components | Angular Material |
| State Management (semplice) | NgRx Signals |
| State Management (complesso) | NgRx Store |
| Date Utilities | date-fns |
| General Utilities | lodash-es |
| Authentication SaaS | Auth0 |
| Error Tracking | Sentry |
| Analytics | Google Analytics 4 |
| E2E Testing | Cypress |
| Mobile App | Ionic + Capacitor |
| i18n | NGX-Translate |
| Charts | Chart.js / ECharts |

---

## 📝 Notes

- Aggiungere librerie **solo quando necessario** (evitare over-engineering)
- Verificare sempre la compatibilità con Angular 19
- Preferire librerie con **tree-shaking** per ridurre bundle size
- Documentare ogni nuova integrazione nel progetto
- Aggiornare `package.json` e questa guida quando aggiungi nuove librerie

---

**Ultima modifica:** Novembre 2025
