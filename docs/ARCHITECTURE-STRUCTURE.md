# Project Architecture & Folder Structure

**Data:** 2025-12-07
**Versione:** 1.0
**Stack:** Angular 19 + Ionic 8 (Standalone Components)

---

## 🎯 Architettura: Feature-Based + Smart/Presentational Pattern

Seguiamo le **Angular Style Guide** ufficiali e i pattern raccomandati da:
- [Angular Official Docs](https://angular.dev/style-guide)
- [Angular Architecture Best Practices](https://angular.dev/best-practices)
- [Ionic Framework Patterns](https://ionicframework.com/docs/angular/your-first-app)

---

## 📐 Principi Architetturali

### 1. **Core/Shared/Features Separation**

| Folder | Scopo | Esempi | Singleton? |
|--------|-------|--------|------------|
| **core/** | Servizi app-wide, singleton | AuthService, ResponsiveService, Guards | ✅ Yes |
| **shared/** | Componenti riutilizzabili tra features | Button, Card, Pipes, Directives | ❌ No |
| **features/** | Moduli feature auto-contenuti | Auth, Books, Profile | ❌ No |

### 2. **Smart vs Presentational Components**

#### 🧠 Smart Components (Container/Pages)
- **Responsabilità:** Logica, state management, chiamate API
- **Location:** `features/{feature}/pages/`
- **Naming:** `*.page.ts` (Ionic convention)
- **Caratteristiche:**
  - Iniettano services
  - Gestiscono state (signals, observables)
  - Fanno chiamate HTTP
  - Orchestrano presentational components
  - **NO styling complesso** (solo layout)

#### 🎨 Presentational Components (Dumb)
- **Responsabilità:** UI rendering, eventi
- **Location:** `features/{feature}/components/` o `shared/components/`
- **Naming:** `*.component.ts`
- **Caratteristiche:**
  - Solo `@Input()` e `@Output()`
  - **NO services injection** (tranne CD, Renderer)
  - **NO business logic**
  - Riutilizzabili
  - Testabili facilmente

### 3. **Colocation Principle**

> "Things that change together should live together"

```
✅ CORRETTO - Model/Utils vicini al componente
features/auth/pages/login/
├── login.page.ts
├── login.page.html
├── login.page.scss
├── login.model.ts          # Solo se usato SOLO da login
└── login.utils.ts          # Solo se usato SOLO da login

❌ SBAGLIATO - Separazione inutile
features/auth/
├── pages/login/login.page.ts
├── models/login.model.ts   # Lontano, difficile da trovare
└── utils/login.utils.ts
```

**Regola:**
- Se model/utils è usato **SOLO** da un componente → mettilo nella stessa cartella
- Se model/utils è usato da **PIÙ componenti** della feature → `features/{feature}/models/` o `utils/`
- Se model/utils è usato da **PIÙ features** → `shared/models/` o `shared/utils/`

---

## 📂 Struttura Completa

```
projects/university-books-mobile/src/app/
│
├── core/                           # App-wide singleton services
│   ├── services/
│   │   ├── responsive.service.ts  # Breakpoint detection
│   │   └── index.ts               # Barrel export
│   │
│   ├── guards/
│   │   ├── auth.guard.ts          # Route protection
│   │   ├── guest.guard.ts
│   │   └── index.ts
│   │
│   ├── interceptors/
│   │   ├── auth.interceptor.ts    # JWT injection
│   │   ├── error.interceptor.ts
│   │   └── index.ts
│   │
│   ├── models/
│   │   ├── user.model.ts          # Domain models app-wide
│   │   └── index.ts
│   │
│   └── components/                 # Layout components
│       └── navigation/             # App-wide navigation
│           ├── navigation.component.ts
│           ├── navigation.component.html
│           ├── navigation.component.scss
│           └── navigation.model.ts
│
├── shared/                         # Reusable across features
│   ├── components/                # Presentational components
│   │   ├── button/
│   │   │   ├── button.component.ts
│   │   │   ├── button.component.html
│   │   │   ├── button.component.scss
│   │   │   └── button.component.spec.ts
│   │   ├── card/
│   │   ├── modal/
│   │   ├── loading-spinner/
│   │   └── index.ts
│   │
│   ├── directives/
│   │   ├── responsive-class.directive.ts
│   │   ├── hide-on.directive.ts
│   │   └── index.ts
│   │
│   ├── pipes/
│   │   ├── format-date.pipe.ts
│   │   ├── truncate.pipe.ts
│   │   └── index.ts
│   │
│   ├── models/
│   │   ├── api-response.model.ts  # Shared interfaces
│   │   └── index.ts
│   │
│   └── utils/
│       ├── format.utils.ts
│       └── index.ts
│
└── features/                       # Feature modules
    │
    ├── auth/                       # Authentication feature
    │   ├── pages/                 # Smart components (container)
    │   │   ├── login/
    │   │   │   ├── login.page.ts
    │   │   │   ├── login.page.html
    │   │   │   ├── login.page.scss
    │   │   │   ├── login.model.ts      # Login-specific types
    │   │   │   └── login.utils.ts      # Login-specific helpers
    │   │   │
    │   │   ├── register/
    │   │   │   ├── register.page.ts
    │   │   │   ├── register.page.html
    │   │   │   ├── register.page.scss
    │   │   │   └── register.utils.ts
    │   │   │
    │   │   └── forgot-password/
    │   │       ├── forgot-password.page.ts
    │   │       ├── forgot-password.page.html
    │   │       └── forgot-password.page.scss
    │   │
    │   ├── components/            # Presentational components
    │   │   ├── login-form/
    │   │   │   ├── login-form.component.ts
    │   │   │   ├── login-form.component.html
    │   │   │   └── login-form.component.scss
    │   │   │
    │   │   ├── social-login-buttons/
    │   │   │   ├── social-login-buttons.component.ts
    │   │   │   ├── social-login-buttons.component.html
    │   │   │   └── social-login-buttons.component.scss
    │   │   │
    │   │   └── password-strength-indicator/
    │   │       ├── password-strength-indicator.component.ts
    │   │       ├── password-strength-indicator.component.html
    │   │       └── password-strength-indicator.component.scss
    │   │
    │   ├── services/
    │   │   ├── auth.service.ts    # Feature-specific service
    │   │   └── index.ts
    │   │
    │   ├── models/                # Feature-wide models
    │   │   ├── auth-user.model.ts
    │   │   ├── auth-state.model.ts
    │   │   └── index.ts
    │   │
    │   ├── utils/                 # Feature-wide utils
    │   │   ├── auth-error-parser.utils.ts
    │   │   └── index.ts
    │   │
    │   └── auth.routes.ts         # Feature routing
    │
    ├── books/                      # Books feature
    │   ├── pages/
    │   │   ├── book-list/         # Smart component
    │   │   │   ├── book-list.page.ts
    │   │   │   ├── book-list.page.html
    │   │   │   └── book-list.page.scss
    │   │   │
    │   │   ├── book-detail/       # Smart component
    │   │   │   ├── book-detail.page.ts
    │   │   │   ├── book-detail.page.html
    │   │   │   └── book-detail.page.scss
    │   │   │
    │   │   └── book-upload/
    │   │       ├── book-upload.page.ts
    │   │       ├── book-upload.page.html
    │   │       └── book-upload.page.scss
    │   │
    │   ├── components/            # Presentational components
    │   │   ├── book-card/
    │   │   │   ├── book-card.component.ts
    │   │   │   ├── book-card.component.html
    │   │   │   └── book-card.component.scss
    │   │   │
    │   │   ├── book-filters/
    │   │   │   ├── book-filters.component.ts
    │   │   │   ├── book-filters.component.html
    │   │   │   └── book-filters.component.scss
    │   │   │
    │   │   └── book-search-bar/
    │   │       ├── book-search-bar.component.ts
    │   │       ├── book-search-bar.component.html
    │   │       └── book-search-bar.component.scss
    │   │
    │   ├── services/
    │   │   ├── book.service.ts
    │   │   └── index.ts
    │   │
    │   ├── models/
    │   │   ├── book.model.ts
    │   │   ├── book-filter.model.ts
    │   │   └── index.ts
    │   │
    │   └── books.routes.ts
    │
    ├── profile/                    # Profile feature
    │   ├── pages/
    │   │   ├── profile-view/
    │   │   └── profile-edit/
    │   ├── components/
    │   │   ├── avatar-uploader/
    │   │   └── profile-form/
    │   ├── services/
    │   │   └── profile.service.ts
    │   └── profile.routes.ts
    │
    └── home/                       # Home/Dashboard feature
        ├── pages/
        │   └── dashboard/
        │       ├── dashboard.page.ts
        │       ├── dashboard.page.html
        │       └── dashboard.page.scss
        ├── components/
        │   ├── stats-card/
        │   └── recent-activity/
        └── home.routes.ts
```

---

## 🎨 Smart vs Presentational - Esempi Pratici

### Example 1: Book List Feature

#### 🧠 Smart Component (Page)

**File:** `features/books/pages/book-list/book-list.page.ts`

```typescript
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';

import { BookService } from '../../services/book.service';
import { BookCardComponent } from '../../components/book-card/book-card.component';
import { BookFiltersComponent } from '../../components/book-filters/book-filters.component';
import { Book, BookFilter } from '../../models';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    BookCardComponent,      // Presentational
    BookFiltersComponent    // Presentational
  ],
  templateUrl: './book-list.page.html',
  styleUrls: ['./book-list.page.scss']
})
export class BookListPage {
  // ✅ SMART: Inietta services
  private readonly bookService = inject(BookService);

  // ✅ SMART: Gestisce state
  public readonly books = signal<Book[]>([]);
  public readonly loading = signal(false);
  public readonly filters = signal<BookFilter>({ category: 'all' });

  constructor() {
    this.loadBooks();
  }

  // ✅ SMART: Business logic
  private loadBooks(): void {
    this.loading.set(true);
    this.bookService.getBooks$(this.filters())
      .subscribe({
        next: (books) => {
          this.books.set(books);
          this.loading.set(false);
        }
      });
  }

  // ✅ SMART: Gestisce eventi da presentational components
  public onFilterChange(filters: BookFilter): void {
    this.filters.set(filters);
    this.loadBooks();
  }

  public onBookClick(book: Book): void {
    // Navigate to detail...
  }
}
```

**Template:** `book-list.page.html`

```html
<ion-header>
  <ion-toolbar>
    <ion-title>My Books</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <!-- Presentational component per filtri -->
  <app-book-filters
    [filters]="filters()"
    (filterChange)="onFilterChange($event)">
  </app-book-filters>

  <!-- Grid responsive con Tailwind -->
  <div class="container mx-auto px-4 py-6">
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      @for (book of books(); track book.id) {
        <!-- Presentational component per book card -->
        <app-book-card
          [book]="book"
          (bookClick)="onBookClick($event)">
        </app-book-card>
      }
    </div>
  </div>
</ion-content>
```

#### 🎨 Presentational Component

**File:** `features/books/components/book-card/book-card.component.ts`

```typescript
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular/standalone';

import { Book } from '../../models';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton],
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush  // ✅ OnPush per performance
})
export class BookCardComponent {
  // ✅ PRESENTATIONAL: Solo Input
  @Input({ required: true }) book!: Book;

  // ✅ PRESENTATIONAL: Solo Output
  @Output() bookClick = new EventEmitter<Book>();

  // ✅ PRESENTATIONAL: NO services (tranne CD, Renderer se necessario)
  // ✅ PRESENTATIONAL: NO business logic
  // ✅ PRESENTATIONAL: Pura UI rendering

  public onCardClick(): void {
    this.bookClick.emit(this.book);
  }
}
```

**Template:** `book-card.component.html`

```html
<ion-card class="card cursor-pointer" (click)="onCardClick()">
  <img [src]="book.coverUrl" [alt]="book.title" class="w-full h-64 object-cover">

  <ion-card-header>
    <ion-card-title class="h3 truncate-text">{{ book.title }}</ion-card-title>
  </ion-card-header>

  <ion-card-content>
    <p class="text-small line-clamp-2">{{ book.description }}</p>
    <div class="flex justify-between items-center mt-4">
      <span class="text-small">{{ book.year }}</span>
      <ion-button size="small">View Details</ion-button>
    </div>
  </ion-card-content>
</ion-card>
```

---

## 🔧 File Naming Conventions

### Pages (Smart Components)
```
✅ CORRETTO:
- book-list.page.ts
- book-list.page.html
- book-list.page.scss
- book-list.page.spec.ts

❌ SBAGLIATO:
- book-list.component.ts   (usa .page.ts per smart components)
- BookList.page.ts         (usa kebab-case, non PascalCase)
```

### Components (Presentational)
```
✅ CORRETTO:
- book-card.component.ts
- book-card.component.html
- book-card.component.scss
- book-card.component.spec.ts

❌ SBAGLIATO:
- book-card.ts             (manca .component)
- bookCard.component.ts    (usa kebab-case, non camelCase)
```

### Services
```
✅ CORRETTO:
- book.service.ts
- auth.service.ts

❌ SBAGLIATO:
- bookService.ts           (manca .service)
- book-service.ts          (no kebab-case per service)
```

### Models
```
✅ CORRETTO:
- book.model.ts
- user.model.ts
- auth-state.model.ts

❌ SBAGLIATO:
- book.ts                  (manca .model)
- book.interface.ts        (usa .model, non .interface)
```

---

## 📋 Checklist: Dove Mettere un File?

### Nuovo Componente

**È usato da una sola feature?**
- ✅ Si → `features/{feature}/components/`
- ❌ No → `shared/components/`

**Ha logica/services/state?**
- ✅ Si → È una **page** → `features/{feature}/pages/`
- ❌ No → È **presentational** → `features/{feature}/components/`

### Nuovo Service

**È usato app-wide?**
- ✅ Si → `core/services/`
- ❌ No → `features/{feature}/services/`

**È singleton?**
- ✅ Si → `core/services/` + `providedIn: 'root'`
- ❌ No → `features/{feature}/services/` + provide in feature

### Nuovo Model

**È usato da un solo componente?**
- ✅ Si → Stessa cartella del componente

**È usato da più componenti della feature?**
- ✅ Si → `features/{feature}/models/`

**È usato da più features?**
- ✅ Si → `shared/models/`

**È un domain model app-wide?**
- ✅ Si → `core/models/`

### Nuovo Util

Stessa logica dei models:
- Un solo componente → stessa cartella
- Feature-wide → `features/{feature}/utils/`
- App-wide → `shared/utils/`

---

## 🎯 Migration Plan: Struttura Attuale → Nuova Struttura

### Stato Attuale

```
src/app/
├── auth/
│   ├── components/
│   │   ├── login/              # ❌ È una PAGE, non component
│   │   ├── register/           # ❌ È una PAGE, non component
│   │   └── forgot-password/    # ❌ È una PAGE, non component
│   └── auth.routes.ts
│
└── pages/
    └── home/                    # ❌ Dovrebbe essere in features/
```

### Nuovo Target

```
src/app/
├── core/
│   ├── services/
│   │   └── responsive.service.ts  # ← Nuovo
│   ├── guards/
│   │   ├── auth.guard.ts          # ← Già esiste
│   │   └── guest.guard.ts         # ← Già esiste
│   └── components/
│       └── navigation/            # ← Nuovo
│
├── shared/
│   ├── components/                # ← Da creare quando serve
│   ├── directives/                # ← Da creare quando serve
│   └── pipes/                     # ← Da creare quando serve
│
└── features/
    ├── auth/
    │   ├── pages/                 # ← SPOSTARE auth/components → qui
    │   │   ├── login/
    │   │   ├── register/
    │   │   └── forgot-password/
    │   ├── components/            # ← Presentational (da creare se serve)
    │   ├── services/
    │   │   └── auth.service.ts    # ← Già esiste (core → qui)
    │   └── auth.routes.ts
    │
    └── home/
        ├── pages/                 # ← SPOSTARE pages/home → qui
        │   └── dashboard/
        └── home.routes.ts
```

---

## ✅ Best Practices Summary

### DO ✅

1. **Separare Smart (pages) e Presentational (components)**
2. **Colocation**: model/utils vicini al componente se usati solo lì
3. **Feature-based**: ogni feature è auto-contenuta
4. **Naming conventions**: `.page.ts`, `.component.ts`, `.service.ts`, `.model.ts`
5. **Barrel exports**: `index.ts` in ogni cartella
6. **OnPush**: ChangeDetectionStrategy.OnPush per presentational components
7. **Readonly**: Inputs readonly, services readonly

### DON'T ❌

1. **NO services in presentational components** (tranne CD, Renderer)
2. **NO business logic in presentational components**
3. **NO mixing pages e components** nella stessa cartella
4. **NO hardcoded paths**: usare barrel exports
5. **NO file giganti**: max 400 righe per file
6. **NO duplicazione**: usare shared per codice riutilizzabile

---

## 📚 References

- [Angular Style Guide](https://angular.dev/style-guide)
- [Angular Architecture](https://angular.dev/best-practices/architecture-overview)
- [Smart vs Presentational Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
- [Ionic Angular Best Practices](https://ionicframework.com/docs/angular/your-first-app)
- [Feature-Sliced Design](https://feature-sliced.design/)

---

**Last Updated:** 2025-12-07
**Version:** 1.0
**Author:** University Books Team
