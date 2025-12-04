# SCSS Architecture Guide

Documentazione completa per la gestione degli stili globali nel progetto.

## 📁 Struttura

```
src/styles/
├── styles.scss          # Entry point principale
├── _variables.scss      # Variabili globali (colori, spacing, breakpoints)
├── _mixins.scss         # Mixin riutilizzabili
├── _functions.scss      # Funzioni SCSS
├── _base.scss           # CSS Reset e stili base HTML
└── _utilities.scss      # Classi utility
```

## 🎯 Best Practices 2025

### 1. **Usa `@use` invece di `@import`**

❌ **Vecchio modo (deprecato):**
```scss
@import 'variables';
@import 'mixins';

.component {
  color: $primary-color;
}
```

✅ **Nuovo modo (Angular 19 / SCSS moderno):**
```scss
@use '../styles/variables' as vars;
@use '../styles/mixins' as mix;

.component {
  color: vars.$primary-color;
  @include mix.flex-center;
}
```

### 2. **Component-Scoped Styles First**

✅ **Preferisci:**
```scss
// component.scss
@use '../styles/variables' as vars;

.my-component {
  color: vars.$primary-color;
  padding: vars.$spacing-4;
}
```

❌ **Evita stili globali quando possibile**

### 3. **Mantieni gli stili globali minimi**

Solo per:
- Reset CSS (`_base.scss`)
- Typography globale
- Utility classes (`.d-flex`, `.text-center`)

## 📘 Uso delle Variabili

### Importa con namespace

```scss
@use '../styles/variables' as vars;

.card {
  background: vars.$white;
  border: vars.$border-width solid vars.$border-color;
  border-radius: vars.$border-radius;
  padding: vars.$spacing-4;
  box-shadow: vars.$shadow;
}
```

### Variabili disponibili

#### Colori
```scss
vars.$primary-color      // #3f51b5
vars.$primary-light      // #757de8
vars.$primary-dark       // #002984
vars.$accent-color       // #ff4081
vars.$success            // #4caf50
vars.$warning            // #ff9800
vars.$error              // #f44336
vars.$gray-500           // #9e9e9e
```

#### Spacing
```scss
vars.$spacing-1  // 4px
vars.$spacing-2  // 8px
vars.$spacing-3  // 12px
vars.$spacing-4  // 16px
vars.$spacing-6  // 24px
vars.$spacing-8  // 32px
```

#### Typography
```scss
vars.$font-size-sm     // 0.875rem (14px)
vars.$font-size-base   // 1rem (16px)
vars.$font-size-lg     // 1.125rem (18px)
vars.$font-weight-bold // 700
```

#### Breakpoints
```scss
vars.$breakpoint-sm   // 576px
vars.$breakpoint-md   // 768px
vars.$breakpoint-lg   // 992px
vars.$breakpoint-xl   // 1200px
```

## 🔧 Uso dei Mixin

### Importa con namespace

```scss
@use '../styles/mixins' as mix;

.component {
  @include mix.flex-center;
}
```

### Mixin disponibili

#### Responsive Design
```scss
@use '../styles/mixins' as mix;

.component {
  padding: 1rem;

  @include mix.respond-to('md') {
    padding: 2rem;
  }

  @include mix.respond-to('lg') {
    padding: 3rem;
  }
}
```

#### Flexbox
```scss
.header {
  @include mix.flex-between; // flex + space-between + align-center
}

.modal {
  @include mix.flex-center; // flex + center + center
}

.sidebar {
  @include mix.flex-column; // flex-direction: column
}
```

#### Typography
```scss
h1 {
  @include mix.heading('h1'); // Heading style
}

.description {
  @include mix.text-truncate; // Ellipsis overflow
}

.excerpt {
  @include mix.line-clamp(3); // Limita a 3 righe
}
```

#### Visual Effects
```scss
.card {
  @include mix.box-shadow(vars.$shadow-md);
  @include mix.transition(transform, 300ms);

  &:hover {
    @include mix.hover-lift; // Sollevamento al hover
  }
}

button {
  @include mix.focus-visible; // Focus ring accessibile
}
```

#### Layout
```scss
.container {
  @include mix.container(1200px); // Max-width container
}

.grid {
  @include mix.grid(12, 1rem); // 12 colonne con gap
}
```

#### Accessibility
```scss
.visually-hidden-label {
  @include mix.visually-hidden; // Screen reader only
}
```

## ⚙️ Uso delle Funzioni

### Importa con namespace

```scss
@use '../styles/functions' as fn;

.component {
  width: fn.rem(320); // 320px -> 20rem
}
```

### Funzioni disponibili

#### Conversione unità
```scss
@use '../styles/functions' as fn;

.box {
  width: fn.rem(320);      // 320px -> 20rem
  height: fn.em(48);       // 48px -> 3em
  margin: fn.spacing(4);   // 4 * 4px = 16px
}
```

#### Manipolazione colori
```scss
@use '../styles/functions' as fn;
@use '../styles/variables' as vars;

.button {
  background: vars.$primary-color;

  &:hover {
    background: fn.shade(vars.$primary-color, 10%); // 10% più scuro
  }

  &:active {
    background: fn.tint(vars.$primary-color, 20%); // 20% più chiaro
  }
}
```

#### Z-index management
```scss
@use '../styles/functions' as fn;

.modal-backdrop {
  z-index: fn.z('modal-backdrop'); // 1040
}

.modal {
  z-index: fn.z('modal'); // 1050
}
```

## 🎨 Utility Classes

### Display
```html
<div class="d-flex justify-between align-center">
  <span>Left</span>
  <span>Right</span>
</div>
```

### Spacing
```html
<div class="mt-4 mb-6 p-4">
  Margin-top: 16px
  Margin-bottom: 24px
  Padding: 16px
</div>
```

### Text
```html
<h1 class="text-center text-2xl font-bold">Title</h1>
<p class="text-muted text-sm">Subtitle</p>
```

### Colors
```html
<div class="bg-primary text-white p-4 rounded">
  Primary card
</div>
```

### Flexbox
```html
<div class="d-flex flex-column align-center gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## 📦 Esempio Component

```scss
// my-component.component.scss
@use '../styles/variables' as vars;
@use '../styles/mixins' as mix;
@use '../styles/functions' as fn;

.my-component {
  background: vars.$white;
  border-radius: vars.$border-radius;
  padding: vars.$spacing-4;
  @include mix.box-shadow(vars.$shadow);

  &__header {
    @include mix.flex-between;
    margin-bottom: vars.$spacing-4;
  }

  &__title {
    @include mix.heading('h3');
    color: vars.$primary-color;
  }

  &__content {
    font-size: vars.$font-size-base;
    line-height: vars.$line-height-normal;

    @include mix.respond-to('md') {
      font-size: vars.$font-size-lg;
    }
  }

  &__button {
    @include mix.button-base;
    background: vars.$primary-color;
    color: vars.$white;
    @include mix.transition;

    &:hover {
      background: vars.$primary-dark;
      @include mix.hover-lift;
    }

    &:focus-visible {
      @include mix.focus-ring(vars.$primary-color);
    }
  }
}
```

## 🔄 Aggiornare le Variabili

Per personalizzare i colori, spacing, o altri valori:

1. Apri `_variables.scss`
2. Modifica i valori:
```scss
// Cambia colore primario
$primary-color: #1976d2; // Invece di #3f51b5
```
3. Le modifiche si applicano automaticamente a tutto il progetto

## 🚀 Configurazione angular.json

```json
{
  "stylePreprocessorOptions": {
    "includePaths": ["projects/cicd-test/src/styles"]
  }
}
```

Questo permette di usare:
```scss
@use 'variables' as vars;  // Invece di '../styles/variables'
```

## 📚 Risorse

- [Sass @use Documentation](https://sass-lang.com/documentation/at-rules/use)
- [Angular Styles Guide](https://angular.dev/guide/styles)
- [SCSS Best Practices](https://sass-lang.com/guide)

## ⚠️ Errori Comuni

### ❌ Non funziona
```scss
@import 'variables';  // Deprecato!

.component {
  color: $primary-color;  // Variabile globale (cattiva pratica)
}
```

### ✅ Funziona
```scss
@use '../styles/variables' as vars;

.component {
  color: vars.$primary-color;  // Namespaced (best practice)
}
```

### ❌ Circular dependency
```scss
// _variables.scss
@use 'mixins';  // NON importare mixin nelle variabili!
```

### ✅ Corretto
```scss
// _mixins.scss
@use 'variables' as vars;  // OK: mixins possono usare variables
```
