# Migrazione: da app mobile Ionic → sito web responsive stile *mariosite*

> Guida operativa passo-passo per trasformare **ai-book-generator** (Angular 19 + Ionic 8)
> in un **sito web responsive** che replica struttura, layout, colori e stili di
> **mariosite** (`~/marianoscada-site/projects/site-web`).
>
> Principio guida: **non distruggere nulla**. Si costruisce la nuova struttura *in parallelo*
> a quella esistente e si migra un pezzo per volta; i componenti vecchi restano finché i nuovi
> non sono cablati e verificati. Ogni fase lascia `npm start` **funzionante**.

---

## 0. Contesto e obiettivo

| | Stato attuale | Stato target |
|---|---|---|
| Stack UI | Angular 19 + **Ionic 8** + Tailwind | Angular 19 + **Angular Material 3** + Tailwind |
| Tema | Dark "black gradient" (`#0A0A0A`) | Light mariosite (azure M3, sezioni bianco/`#f1f5f9`, footer `#1A1D21`) |
| Layout | `app-shell` (top-app-bar + navigation-drawer + footer) | `site-shell` (header sticky + `mat-sidenav` mobile + footer) |
| Sezioni | landing a viewport pieno | `hero-section` + `content-section` con **sfondi alternati** |
| Business logic | Cognito/Amplify, books, home, activity | **invariata** (si tiene tutto) |

**Sorgente di verità da copiare/adattare:** `~/marianoscada-site/projects/site-web/src`.

### Decisioni prese
- **Colori + stili = mariosite** (Material 3 azure, accent blu `#7aa7ff`, sezioni `white`/`#f1f5f9`, footer scuro `#1A1D21`).
- **Rimuovere Ionic** → Angular Material + Tailwind.
- **Struttura nuova in parallelo** (niente distruzione).
- **Tema dentro l'app** in `src/theme/` (no libreria `generic-styles` separata).
- **SSR**: fuori scope (fase finale opzionale).

---

## Convenzioni i18n (file di traduzione)

I file di traduzione vivono in `projects/ai-book-generator/public/i18n/` — un JSON per
lingua: **`en.json`, `it.json`, `de.json`** (stile mariosite). Regole obbligatorie:

1. **Struttura PIATTA, niente accorpamenti.** Le chiavi sono stringhe dot-path
   (`"i18n.Sezione.Sottosezione.chiave": "valore"`), **mai** oggetti JSON annidati.
   ✅ `"i18n.Header.Nav.home": "Home"`  ·  ❌ `"i18n": { "Header": { ... } }`
2. **Ordine alfabetico** delle chiavi in **ogni** file. Riordino:
   `python3 -c "import json,io; [io.open(f+'.json','w',encoding='utf-8').write(json.dumps({k:json.load(open(f+'.json'))[k] for k in sorted(json.load(open(f+'.json')))}, ensure_ascii=False, indent=2)+chr(10)) for f in ['en','it','de']]"`
3. **Ogni lingua il proprio termine.** Tradurre davvero ogni valore (`Create`→`Crea`→`Erstellen`).
   Eccezioni che restano invariate: il **brand** (`AI Book Generator`) e i **nomi piano**
   commerciali (`Free`/`Pro`/`Team`).
4. **Parità di chiavi**: en/it/de devono avere **le stesse identiche chiavi** (nessuna
   mancante/extra). Verifica: vedi script in fondo a questa sezione.
5. **Placeholder** con sintassi `{name}`, `{year}` — uguali in tutte le lingue.

Verifica rapida (piatto + allineato + ordinato):
```bash
python3 -c "
import json
d={f:json.load(open(f'public/i18n/{f}.json')) for f in ['en','it','de']}
for f,o in d.items():
    nest=[k for k,v in o.items() if isinstance(v,(dict,list))]
    ks=list(o); print(f'{f}: {len(o)} chiavi · annidamenti={len(nest)} · ordinato={ks==sorted(ks)}')
print('chiavi identiche:', set(d['en'])==set(d['it'])==set(d['de']))
"
```

> NB: l'i18n al momento NON è cablato (ngx-translate non installato). I file sono
> pronti; il wiring si farà quando deciso.

---

## 1. Struttura folder target (mirror di mariosite)

Si crea dentro `projects/ai-book-generator/src`, **accanto** alle cartelle esistenti:

```
src/
├── theme/                                   # NEW — partial SCSS del tema mariosite
│   ├── _tokens.scss                         # :root custom properties (colori/spazi/tipografia)
│   ├── _sections.scss                       # .site-section / .site-container
│   ├── _blocks.scss                         # .site-inner-block, .site-cta-pill
│   └── _mat-button.scss                     # override bottoni Material (opzionale)
└── app/
    └── shared/
        ├── components/
        │   ├── site-shell/                  # ← app-shell + page-layout
        │   ├── site-header-nav/             # ← top-app-bar + landing-header
        │   ├── site-mobile-menu/            # ← navigation-drawer (+ hamburger)
        │   ├── site-footer-block/           # ← footer + landing-footer
        │   ├── footer-link/                 # figlio dumb del footer
        │   ├── hero-section/                # ← landing/hero-section + home-hero
        │   └── content-section/             # ← features-showcase (zebra striping)
        ├── directives/
        │   └── screen-type.directive.ts     # NEW — classi responsive [appScreenType]
        └── services/
            └── breakpoint-helper.service.ts # NEW — ScreenType da CDK BreakpointObserver
```

> Le cartelle attuali `core/layout/*` e `pages/landing/components/*` **restano** fino alla Fase 7.

---

## 2. Mappatura mariosite → target

| mariosite (`site-web`) | nuovo path nel target | Sostituisce / assorbe |
|---|---|---|
| `shared/components/site-shell` | `shared/components/site-shell` | `core/layout/app-shell`, `core/layout/page-layout` |
| `shared/components/site-header-nav` | `shared/components/site-header-nav` | `core/layout/top-app-bar` **+** `pages/landing/.../landing-header` |
| `shared/components/site-mobile-menu` | `shared/components/site-mobile-menu` | `core/layout/navigation-drawer` (+ hamburger) |
| `shared/components/site-footer-block` (+`footer-link`) | idem | `core/layout/footer` **+** `pages/landing/.../landing-footer` |
| `shared/components/hero-section` | `shared/components/hero-section` | `pages/landing/.../hero-section` **+** `pages/home/.../home-hero` |
| `shared/components/content-section` | `shared/components/content-section` | `pages/landing/.../features-showcase` |
| `shared/services/breakpoint-helper.service.ts` | idem | affianca `core/services/responsive.service.ts` |
| `shared/directives/screen-type.directive.ts` | idem | nuovo |
| `src/styles.scss` + `src/theme/*` | `src/styles.scss` + `src/theme/*` | tema scuro `_variables.scss` |

**Da MANTENERE intatto** (business, framework-agnostic): `auth/services/auth.service.ts`,
`books/services/books.service.ts`, guards, `core/interceptors/auth.interceptor.ts`, models,
`core/config/*` (Amplify/api-client), provider in `app.config.ts`, i `*.component.ts` di
home/activity (solo i template vanno de-ionizzati).

---

## 3. Architettura della shell (da replicare 1:1)

`site-shell` usa `<mat-sidenav-container>` e proietta i template via `contentChild` + `ngTemplateOutlet`:

```
<app-site-shell>
  ├─ #header  → <app-site-header-nav>   (sticky; nav inline su desktop, hamburger su mobile)
  ├─ #sidebar → <app-site-mobile-menu>  (dentro <mat-sidenav mode="over" fixedInViewport>)
  ├─ #main    → <router-outlet>          (corpo centrale)
  └─ #footer  → <app-site-footer-block>  (dark surface, dentro l'area di scroll)
</app-site-shell>
```

La shell espone `toggleSidebar` (passato al context del template header → bottone hamburger).
`screenType$` (da `BreakpointHelperService`) determina desktop vs mobile.

### Shell condizionale (differenza chiave rispetto a mariosite)
mariosite mostra header+footer su **ogni** route. Qui invece va preservata la logica di
`AppShellComponent.showLayout()`:

```ts
// route pubbliche (landing, auth) → shell "pubblica" (no nav autenticata)
// route autenticate (home, activity, my-books) → shell completa
showLayout = !isPublicRoute && isAuthenticated();
```

Le route pubbliche usano un header con Login/Sign-Up; quelle autenticate il `site-header-nav`
con nav + search + profilo. Si passano `navItems`/azioni diversi per contesto.

---

## 4. Sezioni a sfondo alternato (il cuore della richiesta)

`content-section.component.scss` — zebra striping automatico:

```scss
:host {
  display: block;
  background: var(--mat-sys-surface-container-lowest);   /* bianco (sezioni dispari) */
}
:host(:nth-of-type(even)) {
  background: var(--section-band-alt);                    /* #f1f5f9 (sezioni pari) */
}
```

Le pagine compongono le sezioni e l'alternanza è automatica:

```html
<app-hero-section [data]="hero" />
@for (section of sections; track section.id) {
  <app-content-section [data]="section" />
}
```

---

## 5. Tema: `src/theme/` + Material 3 + Tailwind

### 5a. `src/theme/_tokens.scss` — custom properties (valori reali da mariosite)
Vedi il file creato in questo repo: contiene `--header-height: 88px`, `--section-band-alt: #f1f5f9`,
`--site-accent-blue: #7aa7ff`, `--site-dark-surface: #1A1D21`, le scale tipografiche `--site-*`,
e i `--page-padding-inline` responsive (20 → 24 → 32px).

### 5b. Nuovo `src/styles.scss` (entry — punta a Material 3)
Ordine di emissione (importante, come in mariosite):

```scss
@use '@angular/material' as mat;
@use 'theme/tokens';
@use 'theme/blocks';
@use 'theme/sections';
@use 'theme/mat-button';

@tailwind base;
@tailwind components;

html {
  @include mat.theme((
    color: (theme-type: light, primary: mat.$azure-palette, tertiary: mat.$blue-palette),
    typography: Inter,
    density: 0,
  ));
}
body { font-family: Inter, 'Helvetica Neue', sans-serif; }
html { scroll-behavior: smooth; }
section[id] { scroll-margin-top: var(--header-height); }

/* Drawer mobile che copre l'header sticky (da mariosite styles.scss) */
.mat-sidenav-container.mat-drawer-container { z-index: auto; }
.mat-drawer.mat-sidenav-fixed { z-index: 20; }
.mat-drawer-container .mat-drawer-backdrop { z-index: 19; }

@tailwind utilities;   /* SEMPRE per ultimo: vince la cascade */
```

> Il `stylePreprocessorOptions.includePaths` in `angular.json` oggi punta a
> `projects/ai-book-generator/src/styles`. Per far risolvere `@use 'theme/...'`
> aggiungere anche `"projects/ai-book-generator/src"`.

### 5c. Tailwind (`tailwind.config.js`)
- Aggiungere `prefix: 'tw-'` (come mariosite) per evitare collisioni con Material.
  ⚠️ Tutte le classi Tailwind senza prefisso nei template esistenti diventano `tw-*`.
- Portare la palette mariosite (`primary` near-black, `grey`, `success`, `warning`, `danger`).

### 5d. Font Inter + Material Symbols
In `src/index.html` aggiungere (o self-host in `public/`):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
```
e **rimuovere** i due `<script>` CDN di ionicons.

---

## 6. Checklist rimozione Ionic

Pacchetti da togliere da `package.json` (root) **solo a fine migrazione**: `@ionic/angular`,
`@ionic/storage-angular`. Aggiungere `@angular/material` (allineato a `@angular/cdk` 19.2.x).

| File | Uso Ionic | Sostituto |
|---|---|---|
| `core/layout/top-app-bar/*` | `IonIcon`, `<ion-icon>` | superato da `site-header-nav` (`<mat-icon>`) |
| `core/layout/navigation-drawer/*` | `IonicModule`, `<ion-icon>` | superato da `site-mobile-menu` (`MatSidenav`+`MatIcon`) |
| `core/layout/page-layout/*` | `IonicModule`, `<ion-content>` | `<div>` con `overflow:auto` |
| `core/shared/components/search/*` | `IonIcon`, `<ion-icon>` | `<mat-icon>` + `<input>`; logica `SearchOverlayService` invariata |
| `core/shared/components/user-profile-sidebar/*` | `IonicModule`, `ion-*` | `<mat-icon>` + elementi nativi |
| `pages/home/home.component.ts` | `IonInput` | `<input matInput>` / nativo; rimuovere hack `ion-input.test-input` |
| `pages/home/components/{recommendations,stats-widget,recent-activity,quick-actions}/*` | `<ion-icon>` | `<mat-icon>` |
| `pages/my-books/*` | `IonContent/IonHeader/IonTitle/IonToolbar/IonSpinner` | HTML + `<mat-progress-spinner>` |
| `pages/activity/*` + sections | `<ion-icon>` | `<mat-icon>` |
| `core/models/navigation.model.ts`, `search-item.model.ts` | nomi ionicon (`home-outline`) | nomi Material Symbols (`home`, `book`, `lightbulb`, `description`, `local_library`) |
| `src/styles/styles.scss` | hack `ion-input.test-input *` | rimuovere |

> `core/services/responsive.service.ts` nomina "Ionic" nei commenti ma **non importa** Ionic →
> si può tenere durante la migrazione, ritirandolo quando `breakpoint-helper.service.ts` copre tutti i chiamanti.

---

## 7. Fasi di migrazione (ognuna buildabile e verificabile)

### Fase 0 — Setup (nessun cambiamento visibile)
- Branch dedicato. `npm i @angular/material@^19.2.19`. Caricare Inter + Material Symbols in `index.html`.
- **Verifica:** `npm start` serve ancora l'app Ionic invariata.

### Fase 1 — Scaffold tema + componenti (non distruttivo) ✅ *fatto in questo commit*
- Creare `src/theme/*` e i 7 componenti `site-*`/`hero-section`/`content-section` + direttiva + service.
  In questa fase sono **scaffold** (plain Angular, nessun import Material) → compilano, non referenziati.
- Aggiungere `src` agli `includePaths` in `angular.json`.
- **Verifica:** `npm start` compila; app invariata; `tsc --noEmit` verde.

### Fase 2 — Riempire i componenti con Material (da mariosite)
- Portare i template/SCSS reali di `site-shell`, `site-header-nav`, `site-mobile-menu`,
  `site-footer-block`, `hero-section`, `content-section` da mariosite, **togliendo**
  `ngx-components`, `ngx-translate` (`| translate`) e il language-switcher; sostituire
  `<app-site-nav-item>` con `<a routerLink routerLinkActive="is-active">`.
- Sostituire le immagini logo mariosite con il wordmark "University Books".
- **Verifica:** route `/preview` temporanea che renderizza header+sezioni+footer; hamburger apre il drawer.

### Fase 3 — Landing pubblica adotta la nuova shell
- Riscrivere `pages/landing/landing.component.html` con `site-header-nav` + `hero-section` +
  `content-section`×N + `site-footer-block` (dati hard-coded). Route `/landing` invariata.
- È lo swap più sicuro (pubblico, niente Amplify/guard).
- **Verifica:** `/landing` ha look mariosite, sezioni alternate bianco/`#f1f5f9`, footer scuro,
  hamburger su <960px. Le pagine autenticate restano vecchio stile.

### Fase 4 — Shell autenticata
- Far renderizzare `<app-site-shell>` ad `AppShellComponent` quando `showLayout()` è true,
  outlet nudo altrimenti. Cablare hamburger→`toggleSidebar`, search/profile agli handler esistenti
  (`SearchOverlayService`, `UserProfileSidebar`).
- **Verifica:** login Cognito → header+footer nuovi; nav, search, profilo funzionano; logout → shell pubblica.

### Fase 5 — De-ionizzare i widget (una pagina per volta)
- Sostituire `ion-*`/`IonInput` per la tabella §6; rinominare le icone in `navigation.model.ts`/`search-item.model.ts`.
- **Verifica:** per ogni route, DOM senza `ion-*`, icone Material, form funzionanti.

### Fase 6 — Tailwind prefix + ritiro tema scuro
- `prefix: 'tw-'` + palette in `tailwind.config.js`; sweep dei template (`flex`→`tw-flex`, ...).
- Rimuovere i valori dark da `src/styles/_variables.scss`; togliere l'hack `ion-input`.
- **Verifica:** nessuna classe Tailwind senza prefisso "morta"; pass visivo a 360/768/1280px.

### Fase 7 — Cleanup finale
- Eliminare `core/layout/{app-shell,top-app-bar,navigation-drawer,page-layout,footer}` e i vecchi
  `pages/landing/components/*` + `pages/home/components/home-hero`.
- Rimuovere `@ionic/*` da `package.json`; `npm install`. Togliere gli script ionicons da `index.html`.
- **Verifica:** `grep -rn "@ionic\|ion-" projects/ai-book-generator/src` → vuoto;
  `npm run build --configuration=production` passa i budget.

### Fase 8 (opzionale) — SSR
- `@angular/ssr` + `outputMode: static` come mariosite (`app.config.server.ts`, `app.routes.server.ts`, `main.server.ts`).

---

## 8. Rischi & accortezze
- **Amplify/Cognito**: NON toccare `Amplify.configure(...)` né gli `APP_INITIALIZER` in `app.config.ts`.
- **Shell condizionale**: senza `showLayout()` l'header autenticato comparirebbe su landing/auth.
- **Tailwind prefix**: introdurre `tw-` rende inattive le classi non prefissate → fare lo sweep nella stessa fase.
- **Material**: serve `provideAnimations()` (già presente) perché sidenav/icone animino. Non duplicarlo.
- **Font Inter**: caricarlo o `mat.theme(typography: Inter)` fa fallback.
- **Build verde**: ogni fase deve lasciare `npm start` funzionante.

---

## 9. Verifica end-to-end
```bash
npm start          # http://localhost:4200  — compila senza errori
npm run build      # build di produzione entro i budget
grep -rn "@ionic\|ion-" projects/ai-book-generator/src   # atteso: vuoto (dopo Fase 7)
```
Test responsive manuale: **360px / 768px / 1280px** — header sticky, hamburger+drawer da mobile,
footer scuro, sezioni a sfondo alternato, login/logout Cognito.
