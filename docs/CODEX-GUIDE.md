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
- **MATERIAL-FIRST (vincolante).** TUTTA la UI dei componenti app usa **componenti Angular Material**, mai markup+CSS bespoke: wizard → **mat-stepper**; scelta singola → **mat-button-toggle-group**/mat-radio; multi-select → **mat-selection-list**/mat-chip-listbox; liste/recap → **mat-list**; pannelli → **mat-card**; bottoni → **mat-button/mat-flat-button/mat-stroked-button** (NIENTE pill custom dentro i componenti app — `site-cta-pill` è solo per la landing pubblica). I componenti Material **ereditano lo stile dal tema globale M3 (`mat.theme()` in `styles.scss`)** → il `*.component.scss` contiene SOLO layout-glue, zero look. Eventuali ritocchi globali Material vanno in un partial `theme/` dedicato (single source, come customer-portal: `_mat-button.scss`/`_stepper.scss`…), MAI per-componente. Riferimenti: customer-portal (`/Users/marianoscada/refactoring/azzurro/projects/customer-portal`), docs ufficiali https://material.angular.io.
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

## 3. BLOCCO **F1 — Domain model + Mock API + SignalStores** ✅ COMPLETATO

> Esito (commit `dff5c5f`): dominio, `ApiPort`+mock, `ProjectsStore`/`SourcesStore`,
> Create cablata. In sede di check sono stati applicati: **self-init** via
> `withHooks.onInit`; polling **reattivo `rxMethod`** (niente `setTimeout` nel codice
> di produzione); `RUNTIME_CONFIG` **InjectionToken** per `pollIntervalMs` (no magic
> number); cleanup mock via `DestroyRef`. Tutte le verifiche verdi. Vedi
> `ngrx-signalstore-references` (memoria) per le regole consolidate.

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

## 4. BLOCCO **F2 — Routing + Project Workspace shell** ✅ COMPLETATO

> Esito (commit `95e7417`): routing `withComponentInputBinding` + `project/:id`
> (Workspace `@switch` per stato, transizioni cablate, auto-switch `processing→review`)
> + `create/new` stub funzionale; `ProjectsStore.reopen` aggiunto; i18n
> `Workspace.*`/`Job.Step.*`/`Project.Kind.*`/`NewProject.*` (en/it/de, ETA con `{{ }}`).
> Tutte le verifiche verdi.

> Obiettivo: da `/create`, click su una card → `/project/:id`, pagina **Workspace**
> il cui layout cambia in base allo `status` live (dal `ProjectsStore`, mock). È la
> **shell per-stato** + il cablaggio della **state machine** (`PRODUCT-ARCHITECTURE.md §2`).
> I contenuti ricchi (outline/capitoli/preview/log/versioni) sono F5/F8.
> NB: il "Create hub live" (card dallo store, progress che avanza) — elencato come F3
> nel doc — è **già stato assorbito in F1**; F2 aggiunge navigazione + Workspace.

### 4.1 Routing
- `app.config.ts`: `provideRouter(routes, withComponentInputBinding())` — oggi è solo `provideRouter(routes)`; serve per bindare il param `:id` su `input()`.
- `app.routes.ts`: due route lazy (stesso pattern + commento authGuard TEMP delle altre):
  - `project/:id` → `ProjectWorkspaceComponent`
  - `create/new` → `NewProjectComponent`

### 4.2 File da creare
```
pages/project/
  project-workspace.component.ts|html|scss   // shell dinamica per stato
pages/project-new/
  new-project.component.ts|html|scss          // stub funzionale (vero wizard = F4)
```

### 4.3 `ProjectWorkspaceComponent`
- Standalone, OnPush, signals. `id = input.required<string>()` (route binding).
- Inietta `ProjectsStore` (si auto-inizializza via `withHooks` → deep-link ok):
  - `project = computed(() => store.entities().find(p => p.id === this.id()))`
  - `job = computed(() => store.jobsByProject()[this.id()])`
  - non trovato dopo il load → empty state globale (`.empty`, `i18n.Workspace.notFound`).
- `<app-page-header>` (titolo = `project().title`, eyebrow = label stato i18n).
- **Layout per stato** con `@switch (project().status)`, riusando bande/card/`status--*`/`accent-progress` globali:

| Stato | Shell | Azione → metodo store |
|---|---|---|
| `draft` | pannello bozza | **Generate** → `store.generate(id)` |
| `queued`/`processing` | **live**: `accent-progress` (`job.progress`), step corrente (i18n), ETA | **Cancel** → `store.cancel(id)` |
| `review` | sezioni placeholder (outline/capitoli/preview/export come card) | **Publish** → `store.publish(id)` |
| `failed` | errore + log placeholder | **Retry** → `store.generate(id)` |
| `published` | info versione placeholder | **Archive** → `store.archive(id)` |
| `archived` | pannello archiviato | **Reopen** → `store.reopen(id)` |

- **Nessun polling nel componente**: legge solo signal; lo store già polla via `rxMethod`. A 100% lo store passa `processing → review` e il layout cambia da solo.
- **Azioni avanzate** (Regenerate, New version, Derive, Compare): bottoni **presenti ma disabilitati** con tooltip i18n "in arrivo". Non inventano comportamenti.

### 4.4 `NewProjectComponent` (stub funzionale)
- Campo titolo + select `kind` + **Create** → `store.create(title, kind)` → `router.navigate(['/project', nuovoId])` (apre la draft). Niente 7 step (F4), ma il loop è camminabile end-to-end col mock.

### 4.5 Navigazione Create (`create.component.html`)
- Card progetto → `[routerLink]="['/project', work.id]"`.
- Add-card → `routerLink="/create/new"`.

### 4.6 i18n (en/it/de, alfabetico, una lingua per file)
- `i18n.Workspace.*`: titoli per stato + label azioni + `notFound` + label "in arrivo".
- `i18n.Job.Step.{analyze,outline,chapters,render,extract}` — ora visibili nel live panel (in F1 differite): aggiungerle.
- `i18n.NewProject.{title,titleField,kind,create}`.

### 4.7 Criteri di accettazione
1. Da `/create`, click su card → `/project/:id` con layout coerente allo stato.
2. Il seed `processing` mostra progress che **avanza** e a 100% il Workspace **auto-passa a `review`** senza reload.
3. Ciclo via store: draft→Generate→processing→review→Publish→published; Cancel→draft; failed→Retry.
4. Deep-link diretto `/project/:id` funziona (self-init store).
5. `/create/new` crea una draft e naviga al suo Workspace.
6. Stili **solo globali**; i18n per ogni testo; **tsc + check:subscriptions + lint + ng build verdi**.

### 4.8 Cosa NON fare in F2
- Niente wizard a step (F4), niente outline/capitoli/preview/export reali (F5), niente chat (F6), library (F7), versioning UI (F8).
- Non toccare `theme/`. Nessuna nuova dipendenza. authGuard resta staccato (TEMP dev) come il resto.

### 4.9 Comandi di verifica
```
npx tsc -p projects/ai-book-generator/tsconfig.app.json --noEmit
npm run check
npx ng build ai-book-generator --configuration development
```

---

## 5. BLOCCO CORRENTE — **F4: New Project Wizard**

> Obiettivo: sostituire lo **stub** `/create/new` con un **wizard a 7 step**,
> **resumable come Draft**, con **gating piani soft**, che compila `ProjectSettings`
> + `sourceIds` di un Project e termina con **Genera** (`draft→queued`) o **Salva
> come bozza**. Domini di riferimento: `PRODUCT-ARCHITECTURE.md §1.2` (ProjectSettings,
> StructureConfig, ProcessingMode, OutputFormat), `§1.5` (Source), `§8` (gating).

### 5.0 Decisioni architetturali (vincolanti)
- **Resumability = il draft È la persistenza.** Dopo lo **Step 1** (kind+title) si crea
  il draft con `store.create(title, kind)`; ogni step successivo fa **PATCH** dei settings
  via store (`updateSettings`). "Salva ed esci" lascia un draft nella Create hub; "Riprendi"
  da un Workspace `draft` riapre il wizard su quel progetto. → niente stato volatile perso.
- **Stepper custom signal-driven** (`currentStep = signal<number>()` + `@switch`), **non**
  `mat-stepper` (controllo totale del look globale + signals-first). I **controlli di input
  sono Material** (`mat-form-field`, `mat-select`, `mat-radio`, `mat-checkbox`,
  `mat-slide-toggle`, `mat-chip-listbox`).
- **Gating soft** su piano mock (`free`): modalità `deep_research`/`academic` **disabilitate**
  con hint upgrade; nessun blocco hard (enforcement reale = backend, fuori v1).
- **Niente upload reale**: le fonti si **selezionano dalla Library** (`SourcesStore`) + una
  "nota" mock creabile inline. L'ingest reale è F7.

### 5.1 Store / ApiPort (aggiunte minime, pattern F1)
- `ApiPort`: aggiungere `getPlan(): Promise<Plan>` (mock → piano `free`); confermare
  `patchProject(id, { settings, title })` già presente (contratto §7). 
- `ProjectsStore`: aggiungere metodo `updateSettings(id, settings: ProjectSettings)` (e/o
  `update(id, patch)`) che chiama `api.patchProject` e fa `patchState(updateEntity)`.
  Eventuale `WorkspaceStore`/computed `currentPlan` o semplice signal caricato da `getPlan`.
- Business logic NELLO store; il wizard legge signal e chiama metodi (mai il mock diretto).

### 5.2 Routing
- `create/new` resta → ora carica `NewProjectWizardComponent` (rinominare/rimpiazzare lo stub `NewProjectComponent`).
- Resume: la route accetta il draft via **query param** `?draft=:id` (es. `/create/new?draft=proj-…`). Il wizard, se presente, carica quel draft e riprende.
- Nel **Workspace `draft`** aggiungere azione **"Riprendi"** → `routerLink="/create/new"` con `[queryParams]="{ draft: project.id }"` (accanto o al posto di "Genera").

### 5.3 I 7 step (campi ↔ dominio)
1. **Goal** — `kind` (`ProjectKind`, griglia di scelte con icona) + `title` (input). *(crea il draft al "Avanti")*
2. **Sources** — multi-select dalle `SourcesStore.entities()` (chip/checkbox) → `sourceIds`; "+ nota" crea una Source `type:'note'` mock. Min 0 (consentito), con hint.
3. **Instructions** — `textarea` → `settings.instructions` (prompt libero).
4. **Mode** — `processingMode` via `mat-radio`/card-list (7 valori); `deep_research`/`academic` **disabilitati** se piano `free` (+ badge "Pro"). Mostra stima tempo/qualità statica per modalità.
5. **Structure** — `StructureConfig`: `chapters` (number/'auto'), `length`, `tone`, `depth` (select) + toggle `bibliography|glossary|quiz|exercises|tables|images` (`mat-slide-toggle`).
6. **Output & language** — `outputFormats` (`mat-chip-listbox` multi: pdf/docx/epub/markdown/html) + `language` (`mat-select` ISO).
7. **Review** — recap di tutti i settings + fonti; **gate piano**; bottoni **Genera ora** → `store.generate(id)` → naviga a `/project/:id` (processing) · **Salva come bozza** → naviga a `/project/:id` (draft) o `/create`.

- Navigazione: **Avanti/Indietro** + indicatore step (1..7). PATCH dei settings ad ogni "Avanti" (autosave). **"Salva ed esci"** sempre disponibile da step ≥1.

### 5.4 Stili
- **Globali**: riusa `band`, `site-container`, `project-card`/`app-card`, `status--*`, `accent-progress`, `site-cta-pill`, form Material globali. 
- L'**indicatore step** è un pattern riusabile nuovo → se serve, va SOLO in `theme/_components.scss` (es. `.wizard-steps`/`.wizard-step--active` con `--accent-500`), single source. Nessuno stile ad-hoc nel componente oltre layout-glue.

### 5.5 i18n (en/it/de, alfabetico, una lingua per file)
- `i18n.Wizard.Step.{goal|sources|instructions|mode|structure|output|review}.{title,subtitle}`
- `i18n.Wizard.Action.{next,back,saveExit,generate,saveDraft,addNote}`
- `i18n.Wizard.Mode.{fast_draft|balanced|deep_research|academic|business|educational|technical}.{label,desc}`
- `i18n.Wizard.Structure.{chapters,length,tone,depth,bibliography,glossary,quiz,exercises,tables,images}` (+ valori enum dove servono label)
- `i18n.Wizard.gating.proOnly`, `i18n.Wizard.review.title`, ecc. (riusa `i18n.Project.Kind.*` e `i18n.Project.Status.*` esistenti).

### 5.6 Criteri di accettazione
1. `/create/new` mostra il wizard a 7 step navigabile (Avanti/Indietro), controlli Material, stile globale.
2. Dopo lo Step 1 esiste un **draft** nello store; "Salva ed esci" → il draft compare nella Create hub; "Riprendi" dal Workspace draft riapre il wizard popolato (`?draft=:id`).
3. Step 4: con piano `free`, `deep_research`/`academic` sono **disabilitati** con hint upgrade.
4. Step 7 **Genera** → `store.generate` → `/project/:id` in processing (progress che avanza); **Salva bozza** → draft.
5. I settings scelti finiscono in `project.settings` (verificabile riaprendo il draft).
6. Stili **solo globali** (eventuale `.wizard-steps` in `theme/`); i18n per ogni testo (en/it/de); **tsc + check:subscriptions + lint + ng build verdi**.

### 5.7 Cosa NON fare in F4
- Niente upload/ingest reale (F7), niente generazione contenuti reali (F5), niente chat (F6), versioning (F8).
- Niente enforcement hard del piano (solo gate soft UI). Non toccare `theme/` se non per l'indicatore step. Nessuna nuova dipendenza. authGuard resta staccato (TEMP). Non committare/pushare.

### 5.8 Comandi di verifica
```
npx tsc -p projects/ai-book-generator/tsconfig.app.json --noEmit
npm run check
npx ng build ai-book-generator --configuration development
```

---

## 6. Prossimi blocchi (anteprima)
- **F5** Workspace dettagli per stato (live step/log/ETA, review outline/capitoli/preview/export, published versioni).
- **F6** Project AI Chat + operazioni tipizzate (rigenerazione parziale).
- **F7** Library (metadati, ingest, relazione many-to-many, stato uso).
- **F8** Versioning UX (compare/restore/derive summary/slides/quiz).
- **F9** Collection allineata + quote/gating + notifiche.

---

## 7. Riferimenti ufficiali consultati
- Angular coding style guide — https://angular.dev/style-guide
- Angular signals (state) — https://angular.dev/guide/signals
- NgRx SignalStore — https://ngrx.io/guide/signals/signal-store
- Nx — Angular State Management 2025 — https://nx.dev/blog/angular-state-management-2025
- ngx-translate v17 — https://github.com/ngx-translate/core
