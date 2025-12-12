# Piano di Sviluppo: Landing Page Pubblica + Refactoring Home

**Data**: 2025-12-13
**Branch**: `feat/university-books-mobile/home-page-refactoring`
**Ispirazione Design**: [Proof.io](https://proof.io/)

---

## 📋 Indice

1. [Obiettivi](#obiettivi)
2. [Architettura](#architettura)
3. [Stato Attuale](#stato-attuale)
4. [Componenti da Implementare](#componenti-da-implementare)
5. [Modifiche ai File Esistenti](#modifiche-ai-file-esistenti)
6. [Best Practices & Design Patterns](#best-practices--design-patterns)
7. [Checklist Implementazione](#checklist-implementazione)
8. [Testing & Quality](#testing--quality)

---

## 🎯 Obiettivi

### Obiettivo Principale
Creare una **landing page pubblica** (senza autenticazione) con sezioni full-viewport che mostrano le features dell'app, separando chiaramente il contenuto pubblico (marketing) da quello autenticato (applicazione).

### Obiettivi Specifici
1. ✅ **Full-viewport sections** - Ogni sezione occupa 100vh (desktop/tablet) o 50vh (mobile)
2. ✅ **Header trasparente → sticky** - Header trasparente su hero, diventa solido e sticky on scroll
3. ✅ **Smooth scroll** - Transizioni fluide tra sezioni
4. ✅ **Separazione pubblico/privato** - Landing page pubblica vs Home app autenticata
5. ✅ **UX/UI moderna** - Design ispirato a Proof.io con best practices

---

## 🏗️ Architettura

### Struttura Route

```typescript
routes = [
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    component: LandingComponent,
    title: 'University Books - Create & Share Academic Books'
    // NO auth guard - pubblica
  },
  {
    path: 'auth',
    loadChildren: () => authRoutes,
    canActivate: [guestGuard]
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
    title: 'Home - University Books'
    // Dashboard autenticata
  },
  // ... altre route autenticate
]
```

### Layout Strategy

#### Landing Page (Pubblico)
```
┌─────────────────────────────────────┐
│ Landing Header (transparent→sticky) │ ← Custom header
├─────────────────────────────────────┤
│                                     │
│         Hero Section (100vh)        │ ← Full viewport
│                                     │
├─────────────────────────────────────┤
│                                     │
│    Features Showcase (4x100vh)      │ ← 4 sezioni
│                                     │
├─────────────────────────────────────┤
│                                     │
│    Landing Footer (100vh)           │ ← CTA finale
│                                     │
└─────────────────────────────────────┘
```

#### App Pages (Autenticato)
```
┌─────────────────────────────────────┐
│   Top App Bar (fixed #252525)       │ ← App header
├──────┬──────────────────────────────┤
│ Nav  │                              │
│ Dra- │    Router Content            │ ← App content
│ wer  │    (home, my-books, etc.)    │
│      │                              │
├──────┴──────────────────────────────┤
│         App Footer                  │
└─────────────────────────────────────┘
```

### Conditional Layout Rendering

**App Shell Logic** (`app-shell.component.ts`):
```typescript
readonly showLayout = computed(() => {
  const url = this.router.url;
  // Hide app-shell for landing and auth pages
  return !url.startsWith('/landing') && !url.startsWith('/auth');
});
```

**Routing**:
- `/landing` → NO app-shell (custom layout)
- `/auth/*` → NO app-shell (già implementato)
- `/home`, `/my-books`, ecc. → SI app-shell

---

## ✅ Stato Attuale

### File Creati

#### 1. Landing Page Component
**Path**: `src/app/pages/landing/`

**File**:
- ✅ `landing.component.ts` - Container principale
- ✅ `landing.component.html` - Template
- ✅ `landing.component.scss` - Stili base

**Struttura**:
```typescript
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    LandingHeaderComponent,
    HeroSectionComponent,
    FeaturesShowcaseComponent,
    LandingFooterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {}
```

#### 2. Landing Header Component
**Path**: `src/app/pages/landing/components/landing-header/`

**File**:
- ✅ `landing-header.component.ts`
- ✅ `landing-header.component.html`
- ✅ `landing-header.component.scss`

**Features**:
- Trasparente inizialmente
- Scroll detection con `@HostListener`
- Signal-based state (`isScrolled`)
- Backdrop blur effect on scroll
- Navigation: Logo | Login | Sign Up

**Behavior**:
```scss
.landing-header {
  background: transparent; // Initial

  &.scrolled {
    background: rgba(37, 37, 37, 0.95);
    backdrop-filter: blur(10px);
  }
}
```

#### 3. Hero Section Component
**Path**: `src/app/pages/landing/components/hero-section/`

**File**:
- ✅ `hero-section.component.ts`
- ✅ `hero-section.component.html`
- ✅ `hero-section.component.scss`

**Features**:
- Full viewport (100vh)
- Gradient background: `linear-gradient(135deg, #1a1a1a, #2d2d2d)`
- Radial overlay per visual interest
- Typography responsive: 3.5rem → 2.5rem → 2rem
- CTA button con hover effects
- Accessibility: ARIA labels, focus states

**Content**:
```html
<h1>Create & Share University Books</h1>
<p>Transform your academic knowledge into professional books with AI-powered tools</p>
<a routerLink="/auth/register">Get Started Free</a>
<p>No credit card required</p>
```

### File Modificati

#### 4. Quick Actions (Home Page)
**Path**: `src/app/pages/home/components/quick-actions/`

**Modifiche** (`quick-actions.component.scss`):
```scss
// BEFORE
.actions-grid {
  gap: 1.5rem; // Spacing tra card
}
.action-card {
  min-height: 480px; // Fixed height
}

// AFTER
.actions-grid {
  gap: 0; // No spacing - full-viewport sections
}
.action-card {
  min-height: 100vh; // Desktop/tablet
  align-items: center; // Vertical centering

  @media (max-width: 767px) {
    min-height: 50vh; // Mobile: 2 sections visible
  }
}
```

#### 5. App Footer
**Path**: `src/app/core/layout/footer/`

**Modifiche** (`footer.component.scss`):
```scss
// BEFORE
.app-footer {
  min-height: 480px;
}

// AFTER
.app-footer {
  min-height: 100vh; // Desktop/tablet

  @media (max-width: 767px) {
    min-height: 50vh; // Mobile
  }
}
```

#### 6. Global Styles
**Path**: `src/styles/styles.scss`

**Aggiunto**:
```scss
html {
  scroll-behavior: smooth; // Smooth scroll tra sezioni
}
```

---

## 🚧 Componenti da Implementare

### 1. Features Showcase Component
**Path**: `src/app/pages/landing/components/features-showcase/`

**File da Creare**:
- `features-showcase.component.ts`
- `features-showcase.component.html`
- `features-showcase.component.scss`

**Design Pattern**: Presentational Component

**Structure**:
```typescript
interface Feature {
  id: string;
  title: string;
  description: string;
  image: string; // Unsplash URL
  route: string; // Link to feature (optional)
}

@Component({
  selector: 'app-features-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesShowcaseComponent {
  readonly features = signal<Feature[]>([
    {
      id: 'my-books',
      title: 'My Books',
      description: 'Create and manage your book projects with powerful editing tools',
      image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000',
      route: '/my-books'
    },
    {
      id: 'ai-studio',
      title: 'AI Studio',
      description: 'Generate content with AI assistance. Write faster, smarter.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2000',
      route: '/ai-studio'
    },
    {
      id: 'templates',
      title: 'Templates',
      description: 'Start from pre-built book templates. Save time, maintain consistency.',
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2000',
      route: '/templates'
    },
    {
      id: 'study-materials',
      title: 'Study Materials',
      description: 'Access reference materials and research resources in one place.',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000',
      route: '/library'
    }
  ]);
}
```

**Template Pattern** (riutilizzare da quick-actions):
```html
<section class="features-showcase">
  @for (feature of features(); track feature.id) {
    <div class="feature-wrapper" [attr.data-feature]="feature.id">
      <div class="feature-section">
        <div class="feature-content">
          <h2 class="feature-title">{{ feature.title }}</h2>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  }
</section>
```

**SCSS Pattern** (same as quick-actions):
```scss
.feature-wrapper {
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  overflow: hidden;

  // Background image per ID
  &[data-feature="my-books"]::before {
    background-image: url('...');
    opacity: 0.4;
  }
}

.feature-section {
  min-height: 100vh;
  display: flex;
  align-items: center;

  @media (max-width: 767px) {
    min-height: 50vh;
  }
}

.feature-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 3rem;

  @media (max-width: 767px) {
    padding: 1.5rem 1.25rem;
  }
}
```

**Best Practices**:
- ✅ OnPush change detection
- ✅ Signals for reactive data
- ✅ Semantic HTML (`<section>`, `<h2>`)
- ✅ ARIA labels per accessibility
- ✅ Same visual pattern as quick-actions (consistency)

---

### 2. Landing Footer Component
**Path**: `src/app/pages/landing/components/landing-footer/`

**File da Creare**:
- `landing-footer.component.ts`
- `landing-footer.component.html`
- `landing-footer.component.scss`

**Design Pattern**: Presentational Component

**Structure**:
```typescript
@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFooterComponent {
  readonly currentYear = new Date().getFullYear();
}
```

**Template**:
```html
<footer class="landing-footer">
  <div class="footer-content">
    <!-- Primary CTA -->
    <h2 class="footer-title">Start Creating Today</h2>
    <p class="footer-subtitle">
      Join thousands of academics creating and sharing books
    </p>
    <a routerLink="/auth/register" class="footer-cta">
      Get Started Free
    </a>

    <!-- Secondary Navigation -->
    <nav class="footer-nav">
      <a routerLink="/about">About</a>
      <a routerLink="/contact">Contact</a>
      <a routerLink="/terms">Terms</a>
      <a routerLink="/privacy">Privacy</a>
    </nav>

    <!-- Copyright -->
    <p class="footer-copyright">
      © {{ currentYear }} University Books. All rights reserved.
    </p>
  </div>
</footer>
```

**SCSS**:
```scss
.landing-footer {
  min-height: 100vh; // Desktop/tablet
  background: #252525;
  display: flex;
  align-items: center;

  @media (max-width: 767px) {
    min-height: 50vh;
  }
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 3rem;
  text-align: center;

  @media (max-width: 767px) {
    padding: 1.5rem 1.25rem;
  }
}

.footer-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
}

.footer-cta {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: #2196f3;
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(33, 150, 243, 0.4);
  }
}

.footer-nav {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;

  a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;

    &:hover {
      color: #2196f3;
    }
  }
}
```

**Best Practices**:
- ✅ Semantic `<footer>` element
- ✅ Clear visual hierarchy
- ✅ Accessible navigation
- ✅ Responsive design

---

## 📝 Modifiche ai File Esistenti

### 3. App Routes
**File**: `src/app/app.routes.ts`

**Modifiche**:
```typescript
// BEFORE
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home', // ❌ Redirect to authenticated page
    pathMatch: 'full'
  },
  // ... rest
];

// AFTER
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/landing', // ✅ Redirect to public landing page
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadComponent: () =>
      import('./pages/landing/landing.component')
        .then(m => m.LandingComponent),
    title: 'University Books - Create & Share Academic Books'
    // NO auth guard - public page
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes),
    canActivate: [guestGuard]
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component')
        .then(m => m.HomeComponent),
    canActivate: [authGuard],
    title: 'Home - University Books'
  },
  // ... rest of authenticated routes
];
```

**Best Practices**:
- ✅ Lazy loading con dynamic imports
- ✅ SEO-friendly titles
- ✅ Public route senza auth guard
- ✅ Separation of concerns (public vs authenticated)

---

### 4. App Shell Component
**File**: `src/app/core/layout/app-shell/app-shell.component.ts`

**Modifiche**:
```typescript
// BEFORE
export class AppShellComponent {
  readonly showLayout = computed(() => this.isAuthenticated());
  // ❌ Shows layout based only on auth state
}

// AFTER
export class AppShellComponent {
  private readonly router = inject(Router);

  readonly showLayout = computed(() => {
    const url = this.router.url;
    const isPublicRoute = url.startsWith('/landing') || url.startsWith('/auth');
    return !isPublicRoute && this.isAuthenticated();
  });
  // ✅ Hides layout for landing and auth pages
}
```

**Imports da Aggiungere**:
```typescript
import { Router } from '@angular/router';
```

**Best Practices**:
- ✅ Computed signal for reactive updates
- ✅ URL-based conditional logic
- ✅ Mantiene existing auth check
- ✅ Single source of truth

**Impact**:
- Landing page: NO TopAppBar, NO NavigationDrawer, NO Footer
- Auth pages: NO layout (già implementato)
- App pages: SI layout completo

---

## 🎨 Best Practices & Design Patterns

### Design Patterns Applicati

#### 1. **Container/Presentational Pattern**
```
Landing (Container)
├── LandingHeader (Presentational)
├── HeroSection (Presentational)
├── FeaturesShowcase (Presentational)
└── LandingFooter (Presentational)
```

**Vantaggi**:
- Separation of concerns
- Reusability
- Testability
- Maintainability

#### 2. **Single Responsibility Principle**
- `LandingHeaderComponent`: Solo navigation
- `HeroSectionComponent`: Solo value proposition
- `FeaturesShowcaseComponent`: Solo features showcase
- `LandingFooterComponent`: Solo footer con CTA

#### 3. **DRY (Don't Repeat Yourself)**
- Shared SCSS variables (`@use 'variables'`)
- Reusable patterns (100vh/50vh viewport)
- Common transition timings
- Consistent spacing system

#### 4. **OnPush Change Detection**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```
**Benefici**:
- Performance optimization
- Predictable updates
- Reduced change detection cycles

#### 5. **Signals API**
```typescript
readonly isScrolled = signal(false);
readonly features = signal<Feature[]>([...]);
```
**Benefici**:
- Reactive state management
- Type-safe
- Performance optimized
- Angular-native

### UI/UX Best Practices

#### 1. **Visual Hierarchy**
```scss
// Heading sizes (responsive)
h1 { font-size: 3.5rem → 2.5rem → 2rem }
h2 { font-size: 2.5rem → 2rem → 1.75rem }
h3 { font-size: 2rem → 1.5rem → 1.25rem }
```

#### 2. **Color Contrast (WCAG AA)**
```scss
// Minimum contrast ratio: 4.5:1 for normal text
.hero-title { color: #FFFFFF } // on #1a1a1a → 15.7:1 ✅
.hero-subtitle { color: rgba(255,255,255,0.85) } // on #1a1a1a → 13.3:1 ✅
```

#### 3. **Micro-interactions**
```scss
// Button hover effect
.cta-button {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(33, 150, 243, 0.4);
  }
}
```

#### 4. **Accessibility**
```html
<!-- ARIA labels -->
<a routerLink="/auth/register" aria-label="Get started with University Books">
  Get Started Free
</a>

<!-- Focus states -->
<style>
.cta-button:focus-visible {
  outline: 3px solid rgba(33, 150, 243, 0.5);
  outline-offset: 4px;
}
</style>
```

#### 5. **Responsive Design**
```scss
// Mobile-first approach
.feature-section {
  padding: 1.5rem 1.25rem; // Mobile (20px)

  @media (min-width: 768px) {
    padding: 2rem 1.5rem; // Tablet
  }

  @media (min-width: 1024px) {
    padding: 2.5rem 3rem; // Desktop
  }
}
```

#### 6. **Touch-friendly Targets**
```scss
// Minimum 44x44px for touch targets (Apple HIG)
.nav-button {
  min-height: 44px;
  padding: 0.625rem 1.25rem;
}
```

### Performance Optimizations

#### 1. **Lazy Loading**
```typescript
// Route-based code splitting
{
  path: 'landing',
  loadComponent: () => import('./pages/landing/landing.component')
}
```

#### 2. **CSS Transforms (GPU-accelerated)**
```scss
// Use transform instead of top/left
.header:hover {
  transform: translateY(-4px); // ✅ GPU
  // top: -4px; // ❌ CPU layout recalc
}
```

#### 3. **Will-change Optimization**
```scss
.scrolling-element {
  will-change: transform; // Hint to browser for optimization
}
```

#### 4. **Debounced Scroll Events**
```typescript
// TODO: Consider debouncing scroll for better performance
@HostListener('window:scroll')
onWindowScroll(): void {
  // Current: Direct signal update (fine for simple case)
  this.isScrolled.set(window.scrollY > 50);

  // Alternative: Debounce for complex calculations
  // this.scrollSubject.next(window.scrollY);
}
```

---

## ✅ Checklist Implementazione

### Fase 1: Components ✅
- [x] Landing page component structure
- [x] Landing header (transparent→sticky)
- [x] Hero section (100vh)
- [ ] Features showcase (4x100vh)
- [ ] Landing footer (CTA)

### Fase 2: Routing & Integration
- [ ] Update `app.routes.ts` (redirect to /landing)
- [ ] Update `app-shell.component.ts` (conditional layout)
- [ ] Import Router in app-shell
- [ ] Test route guards (public vs authenticated)

### Fase 3: Styling & Polish
- [ ] Verify responsive breakpoints
- [ ] Test smooth scroll behavior
- [ ] Check color contrast (WCAG AA)
- [ ] Verify focus states (keyboard navigation)
- [ ] Test on mobile devices

### Fase 4: Testing
- [ ] Manual testing: Landing → Login → Home flow
- [ ] Test header sticky behavior on scroll
- [ ] Verify full-viewport sections (100vh/50vh)
- [ ] Test CTA buttons navigation
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

### Fase 5: Quality Checks
- [ ] Run `npm run lint`
- [ ] Check bundle size impact
- [ ] Review with `/rw-ng`, `/rw-ionic`, `/rw-a11y`
- [ ] Generate final review report

---

## 🧪 Testing & Quality

### Manual Testing Checklist

#### Landing Page Flow
1. [ ] Navigate to `/` → should redirect to `/landing`
2. [ ] Landing page loads without app-shell (no nav drawer, no app header)
3. [ ] Header is transparent on load
4. [ ] Scroll down → header becomes solid with backdrop blur
5. [ ] Click "Sign Up" → navigates to `/auth/register`
6. [ ] Click "Login" → navigates to `/auth/login`

#### Authentication Flow
1. [ ] After login → redirects to `/home`
2. [ ] Home page shows app-shell (header, nav drawer, footer)
3. [ ] Quick actions sections are 100vh (desktop) or 50vh (mobile)
4. [ ] Smooth scroll between sections

#### Responsive Behavior
1. [ ] Desktop (≥1024px): All sections 100vh
2. [ ] Tablet (768-1023px): All sections 100vh
3. [ ] Mobile (<768px): All sections 50vh (2 visible at once)
4. [ ] Text sizes responsive
5. [ ] Touch targets ≥44px

### Lint & Build
```bash
# Lint check
npm run lint

# Build check
npm run build

# Size analysis
npm run build -- --stats-json
```

### Review Commands
```bash
# Angular review
/rw-ng

# Ionic review
/rw-ionic

# Accessibility review
/rw-a11y

# Complete review
/rw-all
```

---

## 📊 Success Criteria

### Functional Requirements
- ✅ Landing page accessible without login
- ✅ Full-viewport sections (100vh desktop, 50vh mobile)
- ✅ Header transparent→sticky on scroll
- ✅ Smooth scroll behavior
- ✅ CTA buttons navigate correctly
- ✅ App-shell hidden on landing/auth pages
- ✅ App-shell shown on authenticated pages

### Non-Functional Requirements
- ✅ WCAG AA contrast compliance
- ✅ Touch-friendly targets (≥44px)
- ✅ Keyboard navigation support
- ✅ OnPush change detection
- ✅ Lazy loading routes
- ✅ 0 lint errors
- ✅ Build succeeds

### UX Requirements
- ✅ Clear value proposition above fold
- ✅ Single prominent CTA per section
- ✅ Visual hierarchy with typography
- ✅ Smooth micro-interactions
- ✅ Responsive on all devices

---

## 🚀 Next Steps

1. **Implementare Features Showcase Component**
   - Create component files
   - Reuse quick-actions pattern
   - Add 4 feature sections with images

2. **Implementare Landing Footer Component**
   - Create component files
   - Add CTA + navigation + copyright
   - Full viewport height

3. **Update Routing**
   - Modify `app.routes.ts`
   - Test redirect behavior

4. **Update App Shell**
   - Inject Router
   - Add URL-based conditional logic
   - Test layout visibility

5. **Testing & Polish**
   - Manual testing flow
   - Responsive testing
   - Accessibility testing
   - Lint & build checks

6. **Review & Commit**
   - Run review commands
   - Fix any issues
   - Create comprehensive commit
   - Update documentation

---

## 📚 References

- [Proof.io](https://proof.io/) - Design inspiration
- [Angular Signals](https://angular.dev/guide/signals) - Reactive state management
- [WCAG AA](https://www.w3.org/WAI/WCAG2AA-Conformance) - Accessibility standards
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/) - Touch targets
- [Material Design](https://m3.material.io/) - Design system principles

---

**Fine Piano di Sviluppo**
