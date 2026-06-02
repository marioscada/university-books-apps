# Codex Implementation Guide — AI Book Generator

> **Ruolo.** Claude è **architetto e direttore (seniority mondiale)**. **Codex**
> esegue **alla lettera** i blocchi di istruzioni qui sotto, poi Claude fa il
> **check finale**. Questo file è il **contratto operativo**: regole, pattern e
> criteri di accettazione. **Niente lasciato al caso.**
>
> Architettura di prodotto: vedi `docs/PRODUCT-ARCHITECTURE.md` (dominio, stati,
> job, versioning, API mockata, routing, roadmap F0→F9). Convenzioni di codice:
> `docs/MIGRATION-TO-WEBSITE.md` §"Convenzioni di codice".
>
> **Regola zero.** Prima di qualunque scelta architetturale/pattern, **leggi i
> docs UFFICIALI** (angular.dev, material.angular.io, ngrx.io, libreria) e usa
> **API non deprecate** della **nostra versione (Angular 19)**. Niente "a memoria".

---

## 1. Regole tassative (DEVONO essere rispettate)

### 1.1 Angular 19 — reattività signals-first
- **Standalone** ovunque; **`ChangeDetectionStrategy.OnPush`** obbligatorio.
- Stato/derivati: **`signal` / `computed` / `effect`**. Input/Output: **`input()` / `output()`** (signal-based). Boolean bare attribute → `input(false, { transform: booleanAttribute })`.
- DI con **`inject()`** (no constructor DI verboso).
- Control flow nuovo: **`@if` / `@for` (con `track`) / `@switch`**. Niente `*ngIf`/`*ngFor`.
- **Niente API deprecate**: `provideAppInitializer` (NON `APP_INITIALIZER`), ecc.
- **Niente `.subscribe()` nei `.ts`** salvo casi concordati (preferire `toSignal`/`effect`/async pipe). Per attese una-tantum: `firstValueFrom`.

### 1.2 State management — NgRx **SignalStore** (riferimento mondiale)
- Usare **`@ngrx/signals`** (`signalStore`, `withState`, `withEntities`, `withComputed`, `withMethods`, `patchState`). Uno **store per feature** (no monolite).
- **Stato immutabile** (sempre `patchState`). **Business logic FUORI dalla UI**: i componenti leggono signals/computed e chiamano metodi dello store.
- I componenti **non** parlano direttamente col mock API: passano dallo store.
- Collezioni (Projects, Sources, Versions) → `withEntities`.

### 1.3 STILI — **globali, niente ad-hoc** (priorità massima)
- **Riusare SEMPRE** i pattern globali esistenti: `theme/_tokens.scss` (accent **#039FCE**, card tokens, spacing, bande), `theme/_sections.scss` (`.page`, `.band`/`.band--alt`, `.site-container`), `theme/_components.scss` (`cards-grid`, `app-card`, **`project-card` + `cover-art--*`**, `status--*`, `icon-tile` + tinte, `entity-card`, `scroll-area`, `accent-progress`, chip selezionata accent, `empty`, `is-danger`). Componenti condivisi: `page-header`, `icon-tile`.
- **Un nuovo pattern visivo riusabile → si aggiunge a `theme/_components.scss`** (UN UNICO PUNTO), **mai** duplicato in `*.component.scss`.
- `*.component.scss` SOLO per layout genuinamente specifico di quella pagina.
- **Componenti Material** (mat-card, mat-progress-bar, mat-list, mat-chip, mat-menu, mat-button) tematizzati coi token, senza `::ng-deep` quando lo stile può stare globale.
- **Token, non valori hardcoded**: colori/spazi/raggi/ombre dai token. Accent = `--accent-500`.
- Bande **bianco/slate** (`.band`/`.band--alt`) per il ritmo; canvas bianco puro.
- **Niente** scroll interni se non richiesti; **niente** colori "a caso": palette categoria = `icon-tile--*` / `cover-art--*` / `status--*` già definite.

### 1.4 i18n (default EN)
- **Ogni testo visibile → chiave i18n** flat dot-path (es. `i18n.Project.Status.processing`). Aggiungere la chiave in **tutti e tre** `public/i18n/{en,it,de}.json`, **ordine alfabetico**, **un termine per lingua** (no inglese nei file it/de).
- Nei template: `{{ 'i18n.X' | translate }}` / `| translate: { param }`. `TranslateModule` negli `imports` del componente.

### 1.5 Folder & naming
- **Mantenere le convenzioni ESISTENTI** del progetto (coerenza > ultimo trend): file con trattini, suffissi `*.component.ts` / `*.service.ts` / `*.store.ts` / `*.types.ts` come già in repo.
- Niente nomi generici (`utils.ts`, `helpers.ts`). Posizioni (questa repo):
  - **Dominio (tipi)** → `core/domain/*.ts`.
  - **Mock API** → `core/data/mock-api.service.ts` (+ seed in `core/data/mock-seed.ts`).
  - **Store (SignalStore)** → `core/state/<feature>.store.ts`.
  - **Pagine** → `app/pages/<page>/`. **Componenti condivisi** → `app/shared/...`.

### 1.6 Accessibilità & UX
- ARIA dove serve (`aria-label`, `role`, `aria-live` per progress/log), focus visibile, **mai colore da solo** (sempre icona+testo). `prefers-reduced-motion` rispettato.

### 1.7 Qualità / Definition of Done (ogni blocco)
- `npx tsc -p projects/ai-book-generator/tsconfig.app.json --noEmit` → **0 errori**.
- `npm run lint` → **pulito**. `npm run check:subscriptions` → **pulito**.
- `npx ng build ai-book-generator --configuration development` → **build OK** (solo per il check finale del blocco; durante lo sviluppo usare il dev server già attivo, NON ripetere `ng build`).
- Niente regressioni visibili; i18n completo (3 lingue); stili **solo** globali/token.
- Commit: branch `feat/ai-book-generator/<slug>`; messaggi `feat|fix|refactor(ai-book-generator): …` (subject minuscolo), chiudere con
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

### 1.8 Mock isolato (swap-to-backend indolore)
- Il `MockApiService` rispetta **le firme del contratto API** in `PRODUCT-ARCHITECTURE.md §7`. Gli store dipendono da un'**interfaccia** (`ApiPort`), non dall'implementazione mock → si sostituirà col backend senza toccare store/UI.
- Job/progress simulati con timer nel runtime app (ok usare `Date`/`setInterval` nel runtime; NON dentro Workflow scripts).

---

## 2. Formato di ogni blocco (come Codex deve lavorare)
Ogni blocco ha: **Obiettivo** · **File da creare/modificare** · **Contratto/figure** ·
**Passi** · **Criteri di accettazione** · **Comandi di verifica**. Codex implementa
**esattamente** quei file, poi Claude verifica i criteri.

---

## 3. BLOCCO CORRENTE — **F1: Domain model + Mock API + SignalStores**

> Obiettivo: fondazione **senza UI nuova**. Definire i tipi del dominio, il mock
> API conforme al contratto, e gli store SignalStore (Projects, Sources). Cablare
> la **Create hub esistente** allo store (sostituendo i dati mock inline attuali),
> verificando che la pagina renda identica ma ora **guidata dal dominio**.

### 3.1 Dipendenze
- `npm install @ngrx/signals` (signal-native, leggero). Nessun'altra dipendenza.

### 3.2 File da creare
```
core/domain/
  ids.ts                      // type-brand opzionale per gli id (string)
  project.ts                  // Project, ProjectKind, ProjectStatus, ProjectSettings, StructureConfig, ProcessingMode, OutputFormat, DerivedKind
  version.ts                  // Version, OutlineNode, Chapter, RenderedOutput
  job.ts                      // Job, JobType, JobStatus, JobStep, JobLogEntry
  source.ts                   // Source, SourceType, IngestStatus, ProjectSource
  chat.ts                     // ChatThread, ChatMessage, Operation, OperationType
  workspace.ts                // Workspace, Member, Plan, Role  (predisposti, non usati in v1)
  index.ts                    // barrel

core/data/
  api-port.ts                 // interfaccia ApiPort (firme dal contratto §7) — il "buco" per il backend
  mock-seed.ts                // seed realistico (3-5 projects in stati diversi, 4-6 sources)
  mock-api.service.ts         // implements ApiPort; simula job/progress con timer; providedIn root

core/state/
  projects.store.ts           // signalStore({providedIn:root}) withEntities<Project> + computed (byStatus, active, published…) + methods (load, create, generate, cancel, publish, archive, pollJob…)
  sources.store.ts            // signalStore withEntities<Source>
```

### 3.3 Contratto (rispettare ESATTAMENTE le interfacce di `PRODUCT-ARCHITECTURE.md §1`)
- Copiare le interfacce dal doc dominio (sezione 1) — stessi nomi/campi. NON inventarne altri.
- `ApiPort` espone i metodi che mappano gli endpoint §7 (es. `listProjects`, `getProject`, `createProject`, `generate`, `cancel`, `publish`, `archive`, `getJob`, `listSources`, …) tutti **`Promise`/`Observable`-based** e **tipizzati**.
- `MockApiService implements ApiPort`: dati da `mock-seed`, e per `generate` simula un `Job` che avanza step/progress/ETA con `setInterval` aggiornando lo store quando interrogato da `getJob` (polling).

### 3.4 SignalStore (pattern NgRx — ufficiale)
- `ProjectsStore`: `withEntities<Project>()`, `withComputed` (`activeProjects` = status vivo, `publishedProjects`, `needsAttention` = `review|failed`), `withMethods` (con `inject(ApiPort)` via token) per `loadAll`, `create`, `generate(id)`, `cancel(id)`, `publish(id)`, `archive(id)`, `pollJob(id)`. Stato **immutabile** via `patchState`/entity updaters.
- Fornire `ApiPort` con un **InjectionToken** che in v1 mappa a `MockApiService`.

### 3.5 Cablare la Create hub esistente
- `pages/create/create.component.ts`: rimuovere il signal `inProgress` inline; iniettare `ProjectsStore`, usare `store.activeProjects()` (o equivalente) per le card. Mappare `Project.status` → `status--*` + label i18n; `Project.coverTheme` → `cover-art--*`; progress dal job corrente (mock).
- **Stili**: NON cambiare nulla a livello visivo; riusare `project-card`/`cover-art`/`status--*` già globali. Le label di stato diventano **chiavi i18n** (`i18n.Project.Status.draft|queued|processing|review|published|failed`), da aggiungere ai 3 json.

### 3.6 Criteri di accettazione
- `/create` rende **identica** a prima (stesse card, cover, progress, add-card), ma i dati vengono dallo **store** (dominio).
- Gli stati mostrati derivano da `ProjectStatus` reali (almeno: 1 processing con progress che **avanza** via polling mock, 1 review/needs-attention, 1 draft).
- `tsc` 0 errori · `lint` pulito · `check:subscriptions` pulito · `ng build` OK.
- Nessuno stile in `create.component.scss` oltre a ciò che è già specifico (dash-hero, activity); tutto il resto globale.
- i18n stati presenti in **en/it/de** (alfabetico).

### 3.7 Comandi di verifica (Codex li esegue e riporta l'output)
```
npx tsc -p projects/ai-book-generator/tsconfig.app.json --noEmit
npm run check          # check:subscriptions + lint
npx ng build ai-book-generator --configuration development
```

### 3.8 Cosa NON fare in F1
- Niente nuove pagine/route (Workspace, Wizard) — sono F2+.
- Niente backend reale, niente chat, niente versioning UI.
- Niente stili nuovi nei componenti se esprimibili come globali/token.

---

## 4. Prossimi blocchi (anteprima — verranno dettagliati dopo il check di F1)
- **F2** Routing + `Project Workspace` shell dinamico per stato (mock).
- **F3** Create hub "live" completa (needs-attention, transizioni).
- **F4** New Project Wizard (7 step, resumable).
- **F5** Workspace per stato (live/review/published).
- **F6** Project AI Chat + operazioni tipizzate.
- **F7** Library (metadati, ingest, relazioni).
- **F8** Versioning (compare/restore/derive).
- **F9** Collection allineata + quote + notifiche.

---

## 5. Riferimenti ufficiali consultati
- Angular coding style guide — https://angular.dev/style-guide
- Angular signals (state) — https://angular.dev/guide/signals
- NgRx SignalStore — https://ngrx.io/guide/signals/signal-store
- Nx — Angular State Management 2025 — https://nx.dev/blog/angular-state-management-2025
- ngx-translate v17 — https://github.com/ngx-translate/core
