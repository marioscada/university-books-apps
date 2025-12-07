# Responsive Strategy - University Books Mobile App

**Data:** 2025-12-07
**Versione:** 1.0
**Stack:** Ionic 8 + Angular 19 + Tailwind CSS + SCSS

---

## 🎯 Strategia Finale: Hybrid Approach

Questa strategia combina il meglio di tre mondi:
1. **Ionic** - Componenti UI nativi e cross-platform
2. **SCSS Globale** - Design system tokens e componenti invarianti
3. **Tailwind CSS** - Layout responsive e utility classes

---

## 📐 Breakpoints Standard (Allineati a Ionic)

### Breakpoints Ufficiali

Useremo i breakpoints **Ionic** come standard unico per tutto il progetto:

| Breakpoint | Min Width | Max Width | Device Type | Ionic Grid | Tailwind |
|------------|-----------|-----------|-------------|------------|----------|
| **xs** | 0px | 575px | Phone (portrait) | `size="12"` | `default` |
| **sm** | 576px | 767px | Phone (landscape) | `size-sm="6"` | `sm:` |
| **md** | 768px | 991px | Tablet | `size-md="4"` | `md:` |
| **lg** | 992px | 1199px | Desktop | `size-lg="3"` | `lg:` |
| **xl** | 1200px+ | ∞ | Large Desktop | `size-xl="2"` | `xl:` |

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './projects/university-books-mobile/src/**/*.{html,ts,scss}',
  ],
  darkMode: 'class',
  theme: {
    // ⚠️ IMPORTANTE: Sovrascrivere breakpoints Tailwind per matchare Ionic
    screens: {
      'sm': '576px',  // Ionic sm
      'md': '768px',  // Ionic md
      'lg': '992px',  // Ionic lg
      'xl': '1200px', // Ionic xl
      // '2xl': '1536px' ← Rimuovere, non serve
    },
    extend: {
      colors: {
        // Estendere con colori custom (sincronizzati con SCSS variables)
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        primary: 'var(--primary-color)',
        accent: 'var(--accent-color)',
      },
      spacing: {
        // Tailwind usa già 8pt grid system di default
        // 1 = 4px, 2 = 8px, 3 = 12px, 4 = 16px, 6 = 24px, 8 = 32px...
      },
    },
  },
  plugins: [],
}
```

---

## 🎨 Division of Responsibilities

### ✅ SCSS Globale - Component Styles (Invarianti)

**Uso:** Stili che sono **identici in tutta l'app**, indipendentemente dal layout.

**File:** `/src/styles/_components.scss`

```scss
// ===================================
// BUTTONS - Stili globali bottoni
// ===================================

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: var(--surface-3);
  color: var(--text-color);
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: var(--surface-highlighted);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(58, 74, 90, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.loading {
    position: relative;
    color: transparent;

    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: var(--text-color);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
  }
}

.btn-secondary {
  @extend .btn-primary;
  background: transparent;
  border: 2px solid var(--border-color);

  &:hover:not(:disabled) {
    background: var(--surface-2);
  }
}

.btn-danger {
  @extend .btn-primary;
  background: var(--error);

  &:hover:not(:disabled) {
    background: var(--error-dark);
  }
}

// ===================================
// TYPOGRAPHY - Titoli e testi
// ===================================

h1, .h1 {
  font-size: clamp(1.75rem, 4vw, 3rem); // 28px → 48px responsive
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  margin: 0 0 1.5rem 0;
}

h2, .h2 {
  font-size: clamp(1.5rem, 3vw, 2.25rem); // 24px → 36px
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  margin: 0 0 1rem 0;
}

h3, .h3 {
  font-size: clamp(1.25rem, 2.5vw, 1.875rem); // 20px → 30px
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0 0 0.75rem 0;
}

p, .body-text {
  font-size: clamp(0.875rem, 1.5vw, 1rem); // 14px → 16px
  line-height: 1.6;
  color: var(--text-color);
  margin: 0 0 1rem 0;
}

.text-small {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

// ===================================
// CARDS - Stili globali card
// ===================================

.card {
  background: var(--surface-2);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

// ===================================
// ICONS - Dimensioni e colori standard
// ===================================

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &.icon-sm {
    width: 1rem;
    height: 1rem;
    font-size: 1rem;
  }

  &.icon-md {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 1.5rem;
  }

  &.icon-lg {
    width: 2rem;
    height: 2rem;
    font-size: 2rem;
  }

  &.icon-xl {
    width: 3rem;
    height: 3rem;
    font-size: 3rem;
  }

  &.icon-primary {
    color: var(--primary-color);
  }

  &.icon-success {
    color: var(--success);
  }

  &.icon-warning {
    color: var(--warning);
  }

  &.icon-error {
    color: var(--error);
  }
}

// ===================================
// FORM INPUTS - Stili globali
// ===================================

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--surface-3);
  color: var(--text-color);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
    background: var(--surface-variant);
  }

  &.error {
    border-color: var(--error);
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
  }

  &::placeholder {
    color: var(--text-disabled);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.form-label {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.form-error {
  color: var(--error);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

// ===================================
// ALERTS - Messaggi di stato
// ===================================

.alert {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &.alert-error {
    background-color: rgba(252, 165, 165, 0.1);
    color: var(--error);
    border: 1px solid var(--error);
  }

  &.alert-success {
    background-color: rgba(134, 239, 172, 0.1);
    color: var(--success);
    border: 1px solid var(--success);
  }

  &.alert-warning {
    background-color: rgba(251, 191, 36, 0.1);
    color: var(--warning);
    border: 1px solid var(--warning);
  }

  &.alert-info {
    background-color: rgba(59, 130, 246, 0.1);
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
  }
}

// ===================================
// ANIMATIONS - Animazioni globali
// ===================================

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

// ===================================
// UTILITIES - Helper classes
// ===================================

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.truncate-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### ✅ Tailwind CSS - Layout Responsive (Variabile)

**Uso:** Layout che **cambia in base al breakpoint**.

**Esempio:** Dashboard con lista mobile, grid desktop

```html
<!-- dashboard.component.html -->
<ion-content>
  <!-- Container con max-width responsive -->
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">

    <!-- Stats Grid - Adattivo -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="card" *ngFor="let stat of stats">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-small">{{ stat.label }}</p>
            <h2>{{ stat.value }}</h2>
          </div>
          <ion-icon [name]="stat.icon" class="icon icon-xl icon-primary"></ion-icon>
        </div>
      </div>
    </div>

    <!-- Books List/Grid - Adattivo -->
    <!-- Mobile: Lista verticale -->
    <ion-list class="md:hidden">
      <ion-item *ngFor="let book of books">
        <ion-thumbnail slot="start">
          <img [src]="book.cover" alt="{{ book.title }}">
        </ion-thumbnail>
        <ion-label>
          <h3 class="truncate-text">{{ book.title }}</h3>
          <p class="text-small">{{ book.author }}</p>
        </ion-label>
      </ion-item>
    </ion-list>

    <!-- Desktop: Grid -->
    <div class="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div class="card cursor-pointer" *ngFor="let book of books">
        <img [src]="book.cover" class="w-full h-64 object-cover rounded-lg mb-4" alt="{{ book.title }}">
        <h3 class="truncate-text">{{ book.title }}</h3>
        <p class="text-small line-clamp-2">{{ book.description }}</p>
        <div class="flex justify-between items-center mt-4">
          <span class="text-small">{{ book.year }}</span>
          <button class="btn-primary">View</button>
        </div>
      </div>
    </div>
  </div>
</ion-content>
```

**Tailwind classes usate:**
- `container mx-auto` - Container centrato
- `px-4 sm:px-6 lg:px-8` - Padding responsive
- `grid grid-cols-1 md:grid-cols-3` - Grid adattivo
- `md:hidden` / `hidden md:grid` - Show/hide per breakpoint
- `gap-4`, `mb-6`, `mt-4` - Spacing

**SCSS classes usate:**
- `.card` - Stile card globale
- `.btn-primary` - Bottone globale
- `.text-small` - Tipografia globale
- `.truncate-text` - Utility globale
- `.icon icon-xl icon-primary` - Icona globale

---

## 🗂️ File Structure

```
projects/university-books-mobile/src/
├── styles/
│   ├── _variables.scss           # CSS custom properties (colori, spacing)
│   ├── _components.scss           # ✅ Componenti globali (btn, card, icons)
│   ├── _typography.scss           # ✅ Titoli, paragrafi (con clamp)
│   ├── _utilities.scss            # ✅ Helper classes (loading, truncate)
│   ├── _responsive.scss           # Media queries custom (se servono)
│   └── global.scss                # Import principale
│
├── app/
│   ├── core/
│   │   └── services/
│   │       └── responsive.service.ts  # ✅ Servizio centralizzato breakpoint
│   │
│   ├── shared/
│   │   └── directives/
│   │       ├── responsive-class.directive.ts  # Classi CSS dinamiche
│   │       └── hide-on.directive.ts           # Show/hide custom
│   │
│   └── pages/
│       └── (componenti che usano Tailwind per layout)
│
└── tailwind.config.js              # ✅ Configurazione custom breakpoints
```

### Import Order (`global.scss`)

```scss
// 1. Tailwind base (reset, normalize)
@tailwind base;
@tailwind components;
@tailwind utilities;

// 2. Ionic core
@import '@ionic/angular/css/core.css';
@import '@ionic/angular/css/normalize.css';
@import '@ionic/angular/css/structure.css';
@import '@ionic/angular/css/typography.css';
@import '@ionic/angular/css/display.css';
@import '@ionic/angular/css/padding.css';
@import '@ionic/angular/css/float-elements.css';
@import '@ionic/angular/css/text-alignment.css';
@import '@ionic/angular/css/text-transformation.css';
@import '@ionic/angular/css/flex-utils.css';

// 3. Custom variables (colori dark theme)
@import './variables';

// 4. Custom components (btn, card, icons)
@import './components';

// 5. Typography (titoli con clamp)
@import './typography';

// 6. Utilities (loading, truncate)
@import './utilities';

// 7. Responsive overrides (se necessari)
@import './responsive';
```

---

## 🎛️ Responsive Service (Centralizzato)

### Implementation

**File:** `/src/app/core/services/responsive.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Capacitor } from '@capacitor/core';

export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop'
}

export enum BreakpointSize {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl'
}

export interface ResponsiveState {
  deviceType: DeviceType;
  breakpoint: BreakpointSize;
  isHandset: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isNative: boolean;
  platform: string; // 'ios' | 'android' | 'web'
  width: number;
  height: number;
  isPortrait: boolean;
  isLandscape: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  private responsiveState$ = new BehaviorSubject<ResponsiveState>(this.getInitialState());

  // Public observables
  public readonly state$: Observable<ResponsiveState> = this.responsiveState$.asObservable();

  public readonly deviceType$: Observable<DeviceType> = this.state$.pipe(
    map(state => state.deviceType),
    distinctUntilChanged()
  );

  public readonly breakpoint$: Observable<BreakpointSize> = this.state$.pipe(
    map(state => state.breakpoint),
    distinctUntilChanged()
  );

  public readonly isHandset$: Observable<boolean> = this.state$.pipe(
    map(state => state.isHandset),
    distinctUntilChanged()
  );

  public readonly isTablet$: Observable<boolean> = this.state$.pipe(
    map(state => state.isTablet),
    distinctUntilChanged()
  );

  public readonly isDesktop$: Observable<boolean> = this.state$.pipe(
    map(state => state.isDesktop),
    distinctUntilChanged()
  );

  constructor(
    private platform: Platform,
    private breakpointObserver: BreakpointObserver
  ) {
    this.initializeBreakpointObserver();
    this.initializePlatformListeners();
  }

  private getInitialState(): ResponsiveState {
    return {
      deviceType: this.getCurrentDeviceType(),
      breakpoint: this.getCurrentBreakpoint(),
      isHandset: this.breakpointObserver.isMatched('(max-width: 767px)'),
      isTablet: this.breakpointObserver.isMatched('(min-width: 768px) and (max-width: 991px)'),
      isDesktop: this.breakpointObserver.isMatched('(min-width: 992px)'),
      isNative: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform(),
      width: this.platform.width(),
      height: this.platform.height(),
      isPortrait: this.platform.isPortrait(),
      isLandscape: this.platform.isLandscape()
    };
  }

  private initializeBreakpointObserver(): void {
    this.breakpointObserver
      .observe([
        '(max-width: 575px)',   // xs
        '(min-width: 576px)',   // sm
        '(min-width: 768px)',   // md
        '(min-width: 992px)',   // lg
        '(min-width: 1200px)',  // xl
      ])
      .subscribe(() => {
        this.updateState();
      });
  }

  private initializePlatformListeners(): void {
    this.platform.resize.subscribe(() => {
      this.updateState();
    });
  }

  private updateState(): void {
    this.responsiveState$.next({
      deviceType: this.getCurrentDeviceType(),
      breakpoint: this.getCurrentBreakpoint(),
      isHandset: this.breakpointObserver.isMatched('(max-width: 767px)'),
      isTablet: this.breakpointObserver.isMatched('(min-width: 768px) and (max-width: 991px)'),
      isDesktop: this.breakpointObserver.isMatched('(min-width: 992px)'),
      isNative: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform(),
      width: this.platform.width(),
      height: this.platform.height(),
      isPortrait: this.platform.isPortrait(),
      isLandscape: this.platform.isLandscape()
    });
  }

  private getCurrentDeviceType(): DeviceType {
    if (this.platform.is('tablet')) {
      return DeviceType.TABLET;
    } else if (this.platform.is('mobile')) {
      return DeviceType.MOBILE;
    }
    return DeviceType.DESKTOP;
  }

  private getCurrentBreakpoint(): BreakpointSize {
    const width = this.platform.width();

    if (width < 576) return BreakpointSize.XS;
    if (width < 768) return BreakpointSize.SM;
    if (width < 992) return BreakpointSize.MD;
    if (width < 1200) return BreakpointSize.LG;
    return BreakpointSize.XL;
  }

  // Convenience methods
  public isBreakpoint(size: BreakpointSize): boolean {
    return this.responsiveState$.value.breakpoint === size;
  }

  public isDeviceType(type: DeviceType): boolean {
    return this.responsiveState$.value.deviceType === type;
  }

  public getCurrentState(): ResponsiveState {
    return this.responsiveState$.value;
  }

  public isMobileOrTablet(): boolean {
    const state = this.responsiveState$.value;
    return state.deviceType === DeviceType.MOBILE || state.deviceType === DeviceType.TABLET;
  }

  public isSmallScreen(): boolean {
    const state = this.responsiveState$.value;
    return state.breakpoint === BreakpointSize.XS || state.breakpoint === BreakpointSize.SM;
  }

  public isMediumOrLarger(): boolean {
    const state = this.responsiveState$.value;
    return [BreakpointSize.MD, BreakpointSize.LG, BreakpointSize.XL].includes(state.breakpoint);
  }
}
```

### Usage in Components

```typescript
import { Component } from '@angular/core';
import { ResponsiveService, DeviceType } from '@core/services/responsive.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  constructor(public responsive: ResponsiveService) {}

  // Accesso sincrono
  get isMobile(): boolean {
    return this.responsive.isDeviceType(DeviceType.MOBILE);
  }
}
```

```html
<!-- Template con async pipe -->
<div *ngIf="responsive.isHandset$ | async">
  Mobile layout
</div>

<div *ngIf="responsive.isDesktop$ | async">
  Desktop layout
</div>

<!-- Debug info -->
<div *ngIf="responsive.state$ | async as state">
  Device: {{ state.deviceType }} |
  Breakpoint: {{ state.breakpoint }} |
  Platform: {{ state.platform }}
</div>
```

---

## 📋 Decision Matrix: SCSS vs Tailwind

### Quando usare SCSS Globale?

| Scenario | SCSS | Motivo |
|----------|------|--------|
| Bottoni (primari, secondari, danger) | ✅ | Stile consistente, evita ripetizioni |
| Titoli (h1, h2, h3) | ✅ | Tipografia con clamp(), gerarchia chiara |
| Card styles (shadow, border) | ✅ | Look & feel uniforme |
| Form inputs (focus, error, disabled) | ✅ | Stati complessi, accessibilità |
| Icone (dimensioni, colori) | ✅ | Varianti predefinite (.icon-sm, .icon-lg) |
| Alert messages | ✅ | Varianti colore (.alert-error, .alert-success) |
| Animazioni (spin, fade) | ✅ | Keyframes riutilizzabili |
| Theme variables (dark mode) | ✅ | CSS custom properties centralizzate |

### Quando usare Tailwind?

| Scenario | Tailwind | Motivo |
|----------|----------|--------|
| Layout grid responsive | ✅ | `grid grid-cols-1 md:grid-cols-3` |
| Spacing variabile | ✅ | `gap-4`, `mb-6`, `px-4 sm:px-6` |
| Hide/show elementi | ✅ | `md:hidden`, `hidden lg:block` |
| Container con max-width | ✅ | `container mx-auto` |
| Flexbox layout | ✅ | `flex items-center justify-between` |
| Margin/padding custom | ✅ | `mt-4`, `pb-8`, `px-6` |
| Width/height specifici | ✅ | `w-full`, `h-64` |
| Hover/focus one-off | ✅ | `hover:shadow-lg` |

### Regola Pratica

**SCSS:**
> Se lo stile è **uguale in tutta l'app** → SCSS globale

**Tailwind:**
> Se lo stile **varia per pagina/breakpoint** → Tailwind utilities

---

## 🎯 Adaptive Layout Patterns

### Pattern 1: Lista Mobile, Grid Desktop

```html
<!-- Mobile: Lista verticale compatta -->
<ion-list class="md:hidden">
  <ion-item *ngFor="let item of items">
    <ion-thumbnail slot="start">
      <img [src]="item.image">
    </ion-thumbnail>
    <ion-label>
      <h3>{{ item.title }}</h3>
      <p class="text-small">{{ item.subtitle }}</p>
    </ion-label>
  </ion-item>
</ion-list>

<!-- Desktop: Grid espanso -->
<div class="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
  <div class="card" *ngFor="let item of items">
    <img [src]="item.image" class="w-full h-48 object-cover rounded-lg">
    <h3 class="mt-4">{{ item.title }}</h3>
    <p class="text-small">{{ item.subtitle }}</p>
  </div>
</div>
```

### Pattern 2: Bottom Tabs Mobile, Sidebar Desktop

```html
<!-- app.component.html -->
<ion-app>
  <!-- Mobile: Bottom tabs -->
  <ion-tabs class="md:hidden">
    <ion-tab-bar slot="bottom">
      <ion-tab-button tab="home">
        <ion-icon name="home" class="icon icon-md"></ion-icon>
        <ion-label>Home</ion-label>
      </ion-tab-button>
      <ion-tab-button tab="books">
        <ion-icon name="book" class="icon icon-md"></ion-icon>
        <ion-label>Books</ion-label>
      </ion-tab-button>
    </ion-tab-bar>
  </ion-tabs>

  <!-- Desktop: Sidebar + Content -->
  <div class="hidden md:flex h-screen">
    <!-- Sidebar -->
    <aside class="w-64 bg-surface-2 border-r border-gray-700">
      <div class="p-6">
        <h2>University Books</h2>
      </div>
      <nav>
        <a routerLink="/home" routerLinkActive="active"
           class="flex items-center gap-3 px-6 py-3 hover:bg-surface-3">
          <ion-icon name="home" class="icon icon-md"></ion-icon>
          <span>Dashboard</span>
        </a>
        <a routerLink="/books" routerLinkActive="active"
           class="flex items-center gap-3 px-6 py-3 hover:bg-surface-3">
          <ion-icon name="book" class="icon icon-md"></ion-icon>
          <span>My Books</span>
        </a>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-auto">
      <ion-router-outlet></ion-router-outlet>
    </main>
  </div>
</ion-app>
```

### Pattern 3: Stacked Mobile, Horizontal Desktop

```html
<div class="flex flex-col md:flex-row gap-4">
  <!-- Sidebar (full width mobile, 1/3 desktop) -->
  <aside class="w-full md:w-1/3">
    <div class="card">
      <h3>Filters</h3>
      <!-- Filtri -->
    </div>
  </aside>

  <!-- Content (full width mobile, 2/3 desktop) -->
  <main class="w-full md:w-2/3">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Contenuto -->
    </div>
  </main>
</div>
```

---

## 🧭 Adaptive Navigation Menu - Single Component Pattern

### 📐 Design Philosophy

Seguendo le best practices di **Google Material Design 3**, **Apple Human Interface Guidelines**, e **Ionic Navigation Patterns**, implementiamo un **unico componente menu intelligente** che si adatta automaticamente al breakpoint.

**Pattern utilizzati:**
- **Google Material 3**: [Navigation Drawer](https://m3.material.io/components/navigation-drawer/overview) per desktop, [Bottom Navigation](https://m3.material.io/components/navigation-bar/overview) per mobile
- **Apple HIG**: [Tab Bar](https://developer.apple.com/design/human-interface-guidelines/tab-bars) per mobile, [Sidebar](https://developer.apple.com/design/human-interface-guidelines/sidebars) per desktop
- **Ionic Split Pane**: [Adaptive Layout](https://ionicframework.com/docs/api/split-pane)

### 🎯 Breakpoint Behavior Specification

| Breakpoint | Device | Navigation Type | Menu State | Visual |
|------------|--------|-----------------|------------|--------|
| **xs** (< 576px) | Phone Portrait | Hamburger + Drawer | Hidden (overlay) | ☰ Top-left button |
| **sm** (576-767px) | Phone Landscape | Hamburger + Drawer | Hidden (overlay) | ☰ Top-left button |
| **md** (768-991px) | Tablet | Collapsible Sidebar | Visible (push content) | Icon + Label sidebar |
| **lg** (992-1199px) | Desktop | Expanded Sidebar | Always visible | Full sidebar |
| **xl** (≥ 1200px) | Large Desktop | Expanded Sidebar | Always visible | Full sidebar |

### 📂 Component Architecture

**File Structure:**
```
src/app/core/components/navigation/
├── navigation.component.ts         # Component logic
├── navigation.component.html       # Single template (adaptive)
├── navigation.component.scss       # Component styles
└── navigation.model.ts             # Navigation item interface
```

### 🎨 Step-by-Step Implementation

#### Step 1: Navigation Item Model

**File:** `src/app/core/components/navigation/navigation.model.ts`

```typescript
export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
  children?: NavigationItem[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'home',
    label: 'Dashboard',
    icon: 'home',
    route: '/home'
  },
  {
    id: 'books',
    label: 'My Books',
    icon: 'book',
    route: '/books',
    badge: 3
  },
  {
    id: 'search',
    label: 'Search',
    icon: 'search',
    route: '/search'
  },
  {
    id: 'favorites',
    label: 'Favorites',
    icon: 'heart',
    route: '/favorites'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'person',
    route: '/profile'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    route: '/settings'
  }
];
```

#### Step 2: Component TypeScript Logic

**File:** `src/app/core/components/navigation/navigation.component.ts`

```typescript
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';

import { ResponsiveService, BreakpointSize } from '@core/services/responsive.service';
import { NavigationItem, NAVIGATION_ITEMS } from './navigation.model';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IonicModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Navigation items
  public readonly menuItems = NAVIGATION_ITEMS;

  // Reactive state
  public readonly currentBreakpoint = signal<BreakpointSize>(BreakpointSize.MD);
  public readonly isMenuOpen = signal(false);
  public readonly isSidebarCollapsed = signal(false);

  // Computed properties
  get isHandset(): boolean {
    const bp = this.currentBreakpoint();
    return bp === BreakpointSize.XS || bp === BreakpointSize.SM;
  }

  get isTablet(): boolean {
    return this.currentBreakpoint() === BreakpointSize.MD;
  }

  get isDesktop(): boolean {
    const bp = this.currentBreakpoint();
    return bp === BreakpointSize.LG || bp === BreakpointSize.XL;
  }

  get showOverlayMenu(): boolean {
    // Mobile: hamburger menu overlay
    return this.isHandset;
  }

  get showSidebar(): boolean {
    // Tablet/Desktop: sempre visibile sidebar
    return !this.isHandset;
  }

  get sidebarMode(): 'expanded' | 'collapsed' {
    // Tablet: collapsible, Desktop: sempre expanded
    if (this.isTablet) {
      return this.isSidebarCollapsed() ? 'collapsed' : 'expanded';
    }
    return 'expanded';
  }

  constructor(
    private responsive: ResponsiveService,
    private menuCtrl: MenuController,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe a breakpoint changes
    this.responsive.breakpoint$
      .pipe(takeUntil(this.destroy$))
      .subscribe(breakpoint => {
        this.currentBreakpoint.set(breakpoint);
        this.handleBreakpointChange(breakpoint);
      });

    // Subscribe a route changes per chiudere menu mobile
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isHandset) {
          this.closeMenu();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleBreakpointChange(breakpoint: BreakpointSize): void {
    // Mobile (xs, sm): Abilita ion-menu
    if (breakpoint === BreakpointSize.XS || breakpoint === BreakpointSize.SM) {
      this.menuCtrl.enable(true, 'main-menu');
      this.isSidebarCollapsed.set(false); // Reset collapse state
    }
    // Tablet/Desktop (md, lg, xl): Disabilita ion-menu, usa sidebar
    else {
      this.menuCtrl.enable(false, 'main-menu');
      this.menuCtrl.close('main-menu'); // Chiudi se aperto
    }

    // Tablet (md): Inizia con sidebar collassata (opzionale)
    if (breakpoint === BreakpointSize.MD) {
      this.isSidebarCollapsed.set(true);
    }
    // Desktop (lg, xl): Sidebar sempre expanded
    else if (breakpoint === BreakpointSize.LG || breakpoint === BreakpointSize.XL) {
      this.isSidebarCollapsed.set(false);
    }
  }

  // Menu actions
  public toggleMenu(): void {
    if (this.isHandset) {
      this.menuCtrl.toggle('main-menu');
    } else if (this.isTablet) {
      this.isSidebarCollapsed.update(collapsed => !collapsed);
    }
  }

  public closeMenu(): void {
    if (this.isHandset) {
      this.menuCtrl.close('main-menu');
    }
  }

  public openMenu(): void {
    if (this.isHandset) {
      this.menuCtrl.open('main-menu');
    }
  }

  // Navigation
  public navigateTo(route: string): void {
    this.router.navigate([route]);
    // Menu si chiude automaticamente grazie a router.events subscription
  }

  public isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
}
```

#### Step 3: Component Template (Single Adaptive Template)

**File:** `src/app/core/components/navigation/navigation.component.html`

```html
<!-- ============================================
     MOBILE: Hamburger Button + Overlay Menu
     Breakpoints: xs, sm (< 768px)
     ============================================ -->

<!-- Hamburger Menu Button (Mobile only) -->
<ion-buttons *ngIf="showOverlayMenu" class="hamburger-button">
  <ion-button (click)="toggleMenu()" class="menu-toggle-btn">
    <ion-icon slot="icon-only" name="menu" class="icon icon-lg"></ion-icon>
  </ion-button>
</ion-buttons>

<!-- Overlay Menu (Mobile) -->
<ion-menu
  *ngIf="showOverlayMenu"
  side="start"
  menuId="main-menu"
  contentId="main-content"
  type="overlay"
  class="mobile-menu">

  <ion-header class="ion-no-border">
    <ion-toolbar class="menu-toolbar">
      <ion-title>Menu</ion-title>
      <ion-buttons slot="end">
        <ion-button (click)="closeMenu()">
          <ion-icon name="close" class="icon icon-md"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="menu-content">
    <ion-list class="menu-list">
      <ion-item
        *ngFor="let item of menuItems"
        button
        [routerLink]="item.route"
        routerLinkActive="active"
        [detail]="false"
        lines="none"
        class="menu-item">

        <ion-icon
          [name]="item.icon"
          slot="start"
          class="icon icon-md menu-icon">
        </ion-icon>

        <ion-label class="menu-label">
          {{ item.label }}
        </ion-label>

        <ion-badge
          *ngIf="item.badge"
          slot="end"
          class="menu-badge"
          color="primary">
          {{ item.badge }}
        </ion-badge>
      </ion-item>
    </ion-list>

    <!-- User profile section (mobile) -->
    <div class="menu-footer">
      <div class="user-profile">
        <ion-avatar class="user-avatar">
          <img src="assets/default-avatar.png" alt="User">
        </ion-avatar>
        <div class="user-info">
          <p class="user-name">John Doe</p>
          <p class="user-email text-small">john@example.com</p>
        </div>
      </div>
    </div>
  </ion-content>
</ion-menu>

<!-- ============================================
     TABLET/DESKTOP: Sidebar Navigation
     Breakpoints: md, lg, xl (≥ 768px)
     ============================================ -->

<aside
  *ngIf="showSidebar"
  class="sidebar-navigation"
  [class.collapsed]="sidebarMode === 'collapsed'"
  [class.expanded]="sidebarMode === 'expanded'">

  <!-- Sidebar Header -->
  <div class="sidebar-header">
    <!-- Logo + Title (hidden when collapsed) -->
    <div class="logo-container" *ngIf="sidebarMode === 'expanded'">
      <ion-icon name="book" class="icon icon-xl logo-icon"></ion-icon>
      <h2 class="app-title">University Books</h2>
    </div>

    <!-- Logo only (visible when collapsed) -->
    <div class="logo-container-collapsed" *ngIf="sidebarMode === 'collapsed'">
      <ion-icon name="book" class="icon icon-xl logo-icon"></ion-icon>
    </div>

    <!-- Toggle button (Tablet only) -->
    <ion-button
      *ngIf="isTablet"
      fill="clear"
      (click)="toggleMenu()"
      class="collapse-toggle">
      <ion-icon
        [name]="sidebarMode === 'expanded' ? 'chevron-back' : 'chevron-forward'"
        class="icon icon-md">
      </ion-icon>
    </ion-button>
  </div>

  <!-- Sidebar Navigation Items -->
  <nav class="sidebar-nav">
    <a
      *ngFor="let item of menuItems"
      [routerLink]="item.route"
      routerLinkActive="active"
      class="nav-item"
      [class.collapsed]="sidebarMode === 'collapsed'"
      [title]="sidebarMode === 'collapsed' ? item.label : ''">

      <ion-icon
        [name]="item.icon"
        class="icon icon-md nav-icon">
      </ion-icon>

      <span class="nav-label" *ngIf="sidebarMode === 'expanded'">
        {{ item.label }}
      </span>

      <ion-badge
        *ngIf="item.badge && sidebarMode === 'expanded'"
        class="nav-badge"
        color="primary">
        {{ item.badge }}
      </ion-badge>
    </a>
  </nav>

  <!-- Sidebar Footer (User Profile) -->
  <div class="sidebar-footer">
    <div
      class="user-profile-sidebar"
      [class.collapsed]="sidebarMode === 'collapsed'">

      <ion-avatar class="user-avatar-sidebar">
        <img src="assets/default-avatar.png" alt="User">
      </ion-avatar>

      <div class="user-info-sidebar" *ngIf="sidebarMode === 'expanded'">
        <p class="user-name-sidebar">John Doe</p>
        <p class="user-email-sidebar text-small">john@example.com</p>
      </div>

      <ion-button
        *ngIf="sidebarMode === 'expanded'"
        fill="clear"
        class="logout-btn">
        <ion-icon name="log-out" slot="icon-only" class="icon icon-sm"></ion-icon>
      </ion-button>
    </div>
  </div>
</aside>
```

#### Step 4: Component Styles (SCSS)

**File:** `src/app/core/components/navigation/navigation.component.scss`

```scss
@use '../../../../styles/variables' as vars;

// ===================================
// MOBILE: Hamburger + Overlay Menu
// ===================================

.hamburger-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
}

.menu-toggle-btn {
  --background: #{vars.$surface-3};
  --color: #{vars.$text-color};
  --border-radius: 12px;
  --padding-start: 12px;
  --padding-end: 12px;

  &:hover {
    --background: #{vars.$surface-highlighted};
  }
}

.mobile-menu {
  --width: 280px;
  --background: #{vars.$surface-2};
}

.menu-toolbar {
  --background: #{vars.$surface-3};
  --color: #{vars.$text-color};
  --border-width: 0;
  padding: 0.5rem 1rem;
}

.menu-content {
  --background: #{vars.$surface-2};
}

.menu-list {
  background: transparent;
  padding: 1rem 0;
}

.menu-item {
  --background: transparent;
  --background-hover: #{vars.$surface-3};
  --background-activated: #{vars.$surface-3};
  --color: #{vars.$text-color-secondary};
  --padding-start: 1.5rem;
  --padding-end: 1.5rem;
  margin: 0.25rem 0;
  border-radius: 0;
  transition: all 0.2s ease;

  &:hover {
    --background: #{vars.$surface-3};
  }

  &.active {
    --background: #{vars.$surface-3};
    --color: #{vars.$primary-color};
    border-left: 4px solid vars.$primary-color;

    .menu-icon {
      color: vars.$primary-color;
    }
  }
}

.menu-icon {
  color: vars.$text-color-secondary;
  margin-right: 1rem;
}

.menu-label {
  font-weight: 500;
  font-size: 1rem;
}

.menu-badge {
  --background: #{vars.$primary-color};
  --color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.menu-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  background: vars.$surface-3;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: vars.$text-color;
  margin: 0 0 0.25rem 0;
}

.user-email {
  color: vars.$text-color-secondary;
  margin: 0;
}

// ===================================
// TABLET/DESKTOP: Sidebar Navigation
// ===================================

.sidebar-navigation {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background: vars.$surface-2;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 999;

  // Expanded state (Desktop + Tablet expanded)
  &.expanded {
    width: 280px;
  }

  // Collapsed state (Tablet collapsed)
  &.collapsed {
    width: 80px;
  }
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-container-collapsed {
  display: flex;
  justify-content: center;
  width: 100%;
}

.logo-icon {
  color: vars.$primary-color;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: vars.$text-color;
  margin: 0;
}

.collapse-toggle {
  --padding-start: 8px;
  --padding-end: 8px;
  --background: transparent;

  &:hover {
    --background: #{vars.$surface-3};
  }
}

// Navigation Items
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.5rem;
  color: vars.$text-color-secondary;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  margin: 0.25rem 0;

  &:hover {
    background: vars.$surface-3;
    color: vars.$text-color;
  }

  &.active {
    background: vars.$surface-3;
    color: vars.$primary-color;
    border-left: 4px solid vars.$primary-color;

    .nav-icon {
      color: vars.$primary-color;
    }
  }

  // Collapsed state
  &.collapsed {
    justify-content: center;
    padding: 1rem;

    .nav-icon {
      margin: 0;
    }
  }
}

.nav-icon {
  color: vars.$text-color-secondary;
  flex-shrink: 0;
}

.nav-label {
  font-weight: 500;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  --background: #{vars.$primary-color};
  --color: white;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: auto;
}

// Sidebar Footer
.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: vars.$surface-3;
}

.user-profile-sidebar {
  display: flex;
  align-items: center;
  gap: 1rem;

  &.collapsed {
    justify-content: center;
  }
}

.user-avatar-sidebar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.user-info-sidebar {
  flex: 1;
  min-width: 0; // Per ellipsis
}

.user-name-sidebar {
  font-weight: 600;
  color: vars.$text-color;
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email-sidebar {
  color: vars.$text-color-secondary;
  margin: 0;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  --padding-start: 8px;
  --padding-end: 8px;
  --background: transparent;

  &:hover {
    --background: #{vars.$error};
  }
}

// ===================================
// RESPONSIVE UTILITIES
// ===================================

// Scrollbar styling (desktop sidebar)
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}
```

#### Step 5: Integration in App Component

**File:** `src/app/app.component.ts`

```typescript
import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NavigationComponent } from '@core/components/navigation/navigation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, NavigationComponent],
  template: `
    <ion-app>
      <!-- Navigation Component (self-adaptive) -->
      <app-navigation></app-navigation>

      <!-- Main Content -->
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-app>
  `
})
export class AppComponent {}
```

#### Step 6: Layout Adjustment for Sidebar

**File:** `src/styles/global.scss` (add at the end)

```scss
// ===================================
// LAYOUT: Adjust content for sidebar
// ===================================

#main-content {
  // Mobile: No offset (overlay menu)
  margin-left: 0;
  transition: margin-left 0.3s ease;
}

// Tablet/Desktop: Offset per sidebar
@media (min-width: 768px) {
  #main-content {
    margin-left: 280px; // Expanded sidebar width
  }
}

// Tablet collapsed: Smaller offset
@media (min-width: 768px) and (max-width: 991px) {
  #main-content.sidebar-collapsed {
    margin-left: 80px; // Collapsed sidebar width
  }
}
```

### 🎯 Component Behavior Summary

**Mobile (xs, sm < 768px):**
- ☰ Hamburger button (top-left, fixed)
- `<ion-menu>` overlay da sinistra
- Chiusura automatica dopo navigazione
- User profile in footer del menu

**Tablet (md 768-991px):**
- Sidebar laterale sempre visibile
- **Collapsible**: toggle tra expanded (280px) e collapsed (80px)
- Icone + label (expanded) o solo icone (collapsed)
- Chevron button per toggle

**Desktop (lg, xl ≥ 992px):**
- Sidebar laterale sempre expanded (280px)
- Non collapsible
- Icone + label sempre visibili
- User profile in footer sidebar

### ✅ Best Practices Applied

**1. Google Material Design 3:**
- Navigation Drawer pattern per mobile
- Persistent sidebar per desktop
- Proper touch targets (48px minimum)
- Clear visual hierarchy

**2. Apple HIG:**
- Tab bar concept per mobile navigation
- Sidebar concept per desktop
- Consistent iconography
- Clear active states

**3. Ionic Patterns:**
- `ion-menu` per mobile overlay
- Split-pane concept (sidebar + content)
- Proper routing integration
- Platform-aware components

**4. Single Responsibility:**
- Un componente, una responsabilità
- Self-aware del breakpoint
- Nessuna logica esterna richiesta
- Autonomo e riutilizzabile

**5. Performance:**
- Lazy rendering (`*ngIf` per mobile vs sidebar)
- Signal-based state (fine-grained reactivity)
- Proper cleanup con `takeUntil`
- Minimal re-renders

**6. Accessibility:**
- ARIA labels impliciti (Ionic components)
- Keyboard navigation support
- High contrast colors (dark theme)
- Clear focus states

### 📊 Testing Checklist

**Mobile (Chrome DevTools):**
- [ ] Hamburger button visibile top-left
- [ ] Menu si apre/chiude correttamente
- [ ] Route attiva evidenziata
- [ ] Menu si chiude dopo navigazione
- [ ] User profile visibile in footer

**Tablet (iPad):**
- [ ] Sidebar visibile lateralmente
- [ ] Toggle collapse/expand funziona
- [ ] Icone visibili quando collapsed
- [ ] Chevron button visibile
- [ ] Content offset corretto (280px/80px)

**Desktop (≥ 992px):**
- [ ] Sidebar sempre expanded
- [ ] Toggle button nascosto
- [ ] Tutte le label visibili
- [ ] Hover states corretti
- [ ] Scrollbar custom funziona

**Cross-breakpoint:**
- [ ] Transizione smooth tra breakpoints
- [ ] Nessun flash di contenuto
- [ ] State persistito durante resize
- [ ] Performance fluida

### 🔗 References

- [Material 3 Navigation Drawer](https://m3.material.io/components/navigation-drawer/overview)
- [Apple HIG Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars)
- [Ionic Split Pane](https://ionicframework.com/docs/api/split-pane)
- [Ionic Menu](https://ionicframework.com/docs/api/menu)
- [Angular Signals](https://angular.dev/guide/signals)

---

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
npm install @angular/cdk@19 --save
```

### 2. Update Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './projects/university-books-mobile/src/**/*.{html,ts,scss}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'sm': '576px',
      'md': '768px',
      'lg': '992px',
      'xl': '1200px',
    },
    extend: {
      colors: {
        surface: {
          1: '#0A0A0A',
          2: '#1E1E1E',
          3: '#282828',
        },
        primary: '#3B82F6',
      },
    },
  },
}
```

### 3. Create SCSS Files

```scss
// styles/_components.scss
// (contenuto sopra)

// styles/global.scss
@tailwind base;
@tailwind components;
@tailwind utilities;

@import '@ionic/angular/css/core.css';
// ... altri import Ionic

@import './variables';
@import './components';
@import './typography';
@import './utilities';
```

### 4. Import Global Styles

```typescript
// angular.json
{
  "projects": {
    "university-books-mobile": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "projects/university-books-mobile/src/styles/global.scss"
            ]
          }
        }
      }
    }
  }
}
```

### 5. Add Responsive Service to Core

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { LayoutModule } from '@angular/cdk/layout';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIonicAngular(),
    importProvidersFrom(LayoutModule), // ← Per BreakpointObserver
  ],
};
```

---

## ✅ Checklist Implementazione

**Setup Iniziale:**
- [ ] Installare @angular/cdk
- [ ] Configurare Tailwind con breakpoints Ionic
- [ ] Creare file SCSS (_components.scss, _typography.scss, _utilities.scss)
- [ ] Importare global.scss in angular.json
- [ ] Creare ResponsiveService

**Refactor Componenti:**
- [ ] Refactor login: usare classi globali (.btn-primary, .form-input)
- [ ] Refactor home: layout Tailwind responsive
- [ ] Testare adaptive pattern (lista mobile, grid desktop)

**Testing:**
- [ ] Testare su Chrome DevTools (mobile, tablet, desktop)
- [ ] Verificare breakpoints con ResponsiveService
- [ ] Verificare dark theme coerente
- [ ] Testare su device reale (iOS/Android)

---

## 📚 Resources

### Official Documentation
- [Ionic Breakpoints](https://ionicframework.com/docs/layout/css-utilities)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Angular CDK Layout](https://material.angular.io/cdk/layout/overview)
- [Material Design 3 Layout](https://m3.material.io/foundations/layout/overview)
- [Capacitor Platform Detection](https://capacitorjs.com/docs/core-apis/device)

### Best Practices
- [8pt Grid System](https://spec.fm/specifics/8-pt-grid)
- [Fluid Typography (clamp)](https://css-tricks.com/linearly-scale-font-size-with-css-clamp-based-on-the-viewport/)
- [Mobile First Design](https://www.uxpin.com/studio/blog/a-hands-on-guide-to-mobile-first-design/)

---

**Last Updated:** 2025-12-07
**Version:** 1.0
**Author:** University Books Team
