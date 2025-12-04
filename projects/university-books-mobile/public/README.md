# Public Folder (Angular 18+)

Questa cartella contiene tutti gli asset statici del progetto secondo la convenzione **Angular 18+**.

## Struttura

```
public/
├── icons/              # Favicon, loghi, icone
│   └── favicon.ico
├── images/             # Immagini statiche (foto, banner, etc.)
│   └── .gitkeep
├── svg/                # Grafica vettoriale SVG
│   └── .gitkeep
├── i18n/               # File di traduzione (internazionalizzazione)
│   ├── en.json        # Inglese
│   └── it.json        # Italiano
├── fonts/              # Font personalizzati
│   └── .gitkeep
└── data/               # Dati statici, mock, configurazioni
    └── config.json    # Configurazione app
```

## Differenza tra `public/` e vecchio `src/assets/`

### Angular 18+ (public/)
- ✅ **Nuova convenzione ufficiale Angular 18+**
- ✅ File copiati alla **root** del build output
- ✅ Percorsi più semplici: `/icons/logo.svg` invece di `/assets/icons/logo.svg`
- ✅ Flat structure consigliata (LIFT principle)

### Vecchia convenzione (src/assets/)
- ❌ Deprecato in favore di `public/`
- ❌ File copiati in `/assets/` del build output
- ❌ Percorsi più lunghi

## Organizzazione Flat vs Nested

✅ **Flat (consigliata):**
```
public/
├── icons/       ← Separati
├── images/
├── svg/
```

❌ **Nested (sconsigliata):**
```
public/
└── images/
    ├── icons/   ← Nested
    └── svg/
```

## Convenzioni

### Icons (icons/)
- `favicon.ico` - Favicon del sito
- `logo.svg` - Logo principale
- `logo-white.svg` - Logo versione bianca
- `icon-*.svg` - Icone specifiche
- `apple-touch-icon.png` - iOS home screen icon

### SVG (svg/)
- Grafica vettoriale riutilizzabile
- Illustrazioni scalabili
- Diagrammi, grafici
- **Naming:** `illustration-name.svg`, `diagram-flow.svg`

### Images (images/)
- Foto e immagini raster
- Banner, hero images
- Organizzare per sezione: `images/home/`, `images/products/`
- **Formati:** `.jpg`, `.png`, `.webp`
- **Naming:** `hero-banner.jpg`, `product-main.png`

### i18n (Internazionalizzazione)
- Un file JSON per lingua: `en.json`, `it.json`, `es.json`, `de.json`
- Struttura gerarchica:
  ```json
  {
    "section": {
      "subsection": {
        "key": "value"
      }
    }
  }
  ```

### Fonts (fonts/)
- Font custom: `font-name.woff2`, `font-name.woff`
- Includere `license.txt` se necessario
- Preferire `.woff2` (migliore compressione)

### Data (data/)
- Configurazioni: `config.json`
- Mock data per sviluppo: `mock-users.json`
- Dati statici: `countries.json`, `categories.json`

## Utilizzo nel Codice

### Icone
```typescript
// In template (nota: NO /assets/ prefix!)
<img src="/icons/favicon.ico" alt="Icon">
<img src="/icons/logo.svg" alt="Logo">

// In CSS
background-image: url('/icons/logo.svg');

// In TypeScript
const iconPath = '/icons/logo.svg';
```

### SVG
```typescript
// In template
<img src="/svg/illustration.svg" alt="Illustration">

// Inline SVG (HttpClient)
this.http.get('/svg/icon.svg', { responseType: 'text' })
  .subscribe(svg => this.svgContent = svg);
```

### Immagini
```typescript
// In template
<img src="/images/hero-banner.jpg" alt="Banner">
<img src="/images/home/photo.webp" alt="Photo">

// In CSS
background-image: url('/images/banner.jpg');

// Lazy loading
<img loading="lazy" src="/images/large.jpg">

// Responsive WebP
<picture>
  <source srcset="/images/photo.webp" type="image/webp">
  <img src="/images/photo.jpg" alt="Photo">
</picture>
```

### i18n
```typescript
// HttpClient (runtime)
this.http.get<any>('/i18n/en.json').subscribe(translations => {
  this.translations = translations;
});

// Oppure con Angular i18n service
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/i18n/', '.json');
}
```

### Data/Config
```typescript
// Configurazione runtime
this.http.get('/data/config.json').subscribe(config => {
  this.appConfig = config;
});

// Mock data per sviluppo
this.http.get('/data/mock-users.json').subscribe(...);
```

### Fonts
```scss
// In styles.scss o component.scss
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom-font.woff2') format('woff2'),
       url('/fonts/custom-font.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap; // Performance optimization
}

body {
  font-family: 'CustomFont', sans-serif;
}
```

## Best Practices

### 1. Ottimizza le immagini
- Usa tools: **ImageOptim**, **TinyPNG**, **Squoosh**
- Target: < 100KB per immagine
- Usa WebP con fallback

### 2. Usa SVG quando possibile
- Scalabili senza perdita di qualità
- Dimensione ridotta
- Modificabili via CSS
- Inline per controllo completo

### 3. Lazy loading per immagini pesanti
```html
<img loading="lazy" src="/images/large.jpg">
```

### 4. WebP + fallback
```html
<picture>
  <source srcset="/images/photo.webp" type="image/webp">
  <img src="/images/photo.jpg" alt="Photo">
</picture>
```

### 5. Font preloading
```html
<!-- In index.html -->
<link rel="preload" href="/fonts/custom.woff2" as="font" type="font/woff2" crossorigin>
```

### 6. Non committare file temporanei
- `.DS_Store`, `Thumbs.db`
- File di backup: `*.bak`, `*~`
- Cache: `.cache/`

### 7. Naming conventions
- Lowercase con kebab-case: `hero-banner.jpg`
- Descrittivo: `product-main-photo.jpg` invece di `img1.jpg`
- Versioni: `logo-white.svg`, `logo-dark.svg`

## Output Build

Durante il build, tutti i file da `public/` vengono copiati alla **root** di `dist/{project}/browser/`:

```
dist/cicd-test/browser/
├── index.html
├── main-HASH.js
├── polyfills-HASH.js
├── icons/              ← Da public/icons/
│   └── favicon.ico
├── images/             ← Da public/images/
├── svg/                ← Da public/svg/
├── i18n/               ← Da public/i18n/
│   ├── en.json
│   └── it.json
├── fonts/              ← Da public/fonts/
└── data/               ← Da public/data/
    └── config.json
```

Accessibili via:
- Development: `http://localhost:4200/icons/logo.svg`
- Production: `https://example.com/icons/logo.svg`

## Migrazione da src/assets/

Se hai vecchi percorsi con `/assets/`:

**Prima (src/assets/):**
```html
<img src="assets/images/logo.svg">
```

**Dopo (public/):**
```html
<img src="/icons/logo.svg">
```

**Find & Replace:**
1. `assets/icons/` → `/icons/`
2. `assets/images/` → `/images/`
3. `assets/i18n/` → `/i18n/`
4. `assets/fonts/` → `/fonts/`
5. `assets/data/` → `/data/`

## Link Utili

- [Angular File Structure](https://angular.dev/reference/configs/file-structure)
- [Angular Assets Configuration](https://angular.dev/reference/configs/workspace-config#assets-configuration)
- [Optimizing Images for Web](https://web.dev/fast/#optimize-your-images)
