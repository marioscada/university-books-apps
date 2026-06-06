# Refactoring → 100% (smart/dumb · riusabile · Material-first · seniority)

Audit statico di **39 componenti** (3 agenti paralleli: `components-v2`, `ui/layout/widgets/sections`, `pages/auth`). Nessun file modificato durante l'audit. Questo documento è il piano operativo per portare il progetto a uno standard "design-system + smart/dumb impeccabile + Material-first".

**Data:** 2026-06-06 · **Branch:** `feat/ai-book-generator/pages`

---

## 0. Verdetto sintetico

La base è **buona** (tutto OnPush + signals, molti dumb esemplari, theming a token), ma **non è ancora 100%**. I problemi reali si concentrano su 3 fronti:

1. **Confini violati** — 5 componenti "shared/dumb" sono in realtà *app-aware* (iniettano servizi/Router/mock) o importano dominio.
2. **Material-first non applicato** — diverse primitive (dialog/backdrop/focus-trap, drawer, progress, stepper, form-field, chips) sono **reimplementate a mano** invece di usare Material/CDK.
3. **Container troppo grandi** — `project-workspace` (637) e `model-setup` (616) accentrano logica che va estratta in facade/presenter/mapper.

Più una coda di pulizie (hex hardcoded, label a11y/i18n cablate, API legacy `@Input/@Output`).

**Modelli di riferimento (già a norma):** `choice-card`, `review-shell`, `plan-card`, `stat-card`, `step-indicator`, `create`, `landing`, `pricing` (container sottili).

---

## 1. Policy: Material-first (DECISIONE)

> **Regola.** Prima i componenti **Angular Material / CDK**; il custom è ammesso **solo come wrapper design-system sopra** Material/CDK, **mai** come reimplementazione di una primitiva che Material già offre.

Ordine di preferenza pratico:
`MatDialog`/`CDK Overlay` · `MatFormField`+`MatInput`+`MatError` · `MatButton`/`MatIconButton` · `MatMenu` · `MatChips` (`mat-chip-row`/`matChipRemove`) · `MatProgressBar`/`MatProgressSpinner` · `MatStepper`/`CDK Stepper` · `MatSidenav`/`CDK Overlay` · `A11yModule` (`cdkTrapFocus`, `FocusKeyManager`) · `cdkTextareaAutosize` · `cdkScrollBlock`.

**Eccezioni consentite** (puro layout/markup non coperto da Material, restano custom): `action-bar`, `review-shell`, `page-header`, `content-section`, `hero-section`, `chapter-index`, `chapter-reader`, `step-indicator` (indicatore puro; `mat-stepper` è content-driven), `counter-field` (è il "simple input" del DS — **da documentare come deviazione** o migrare a `mat-form-field`).

Questa policy **non** contraddice "no componenti ridondanti": `modal-shell` resta UN solo dialog del DS, ma **internamente** deve poggiare su CDK Overlay invece di rifare backdrop/focus a mano.

---

## 2. P0 — Confini & correttezza (bloccanti)

| # | File | Problema | Azione | Done quando |
|---|---|---|---|---|
| P0.1 | `auth/components/register/register.component.ts` | Chiama `signUp`/`confirmSignUp` di `aws-amplify/auth` **dentro il componente**; `console.log` di debug | Spostare in `AuthService.signUp/confirmSignUp`; il componente chiama solo il service | Nessun import `aws-amplify` nei componenti; no console.log |
| P0.2 | `auth/components/forgot-password/forgot-password.component.ts` | `resetPassword`/`confirmResetPassword` Amplify diretti nel componente | Spostare in `AuthService.resetPassword/confirmResetPassword` | idem |
| P0.3 | `auth/services/auth.service.ts` (342) | Copre solo signIn/signOut (register/forgot lo bypassano); usa `fetch` grezzo con `HttpClient` iniettato ma **inutilizzato**; `console.log` sparsi | Aggiungere i metodi mancanti; usare `HttpClient`; rimuovere log | Confine Amplify completo e unico |
| P0.4 | `shared/widgets/user-profile-sidebar` | **App-aware**: inietta `AuthService`+`Router`, fa `signOut$` + `router.navigate` + `console.error` dentro un componente in `shared` | Renderlo dumb: `input` `user`, `output` `logout`/`navigate`; la logica torna al parent (auth-shell) | Zero DI di dominio nel widget |
| P0.5 | `shared/widgets/search-dropdown` | App-aware (inietta `SearchOverlayService` per `close()`); **4 `input({required})` morti** (`placeholder/emptyMessage/noResultsMessage/noResultsHint`) mai resi; **nessuna search-bar** renderizzata (`onSearchInput` mai invocato) | Emettere `close` via `output`; rendere la barra di ricerca + stati vuoto/no-results **oppure** rimuovere gli input morti | Nessun input required inutilizzato; UI coerente con l'API |
| P0.6 | `shared/components-v2/derived-result` | Importa `DerivedContent` da `core/domain` (dipendenza di dominio in un dumb) + stringa **"Sola lettura"** cablata | View-model locale (no `core/domain`); label via `input` | Dumb 100% i18n-agnostico |
| P0.7 | `shared/layout/auth-shell` | Importa `MOCK_SEARCH_ITEMS` (mock nel layer sbagliato) | Spostare i mock nel data-layer (store/ApiPort); passare `items` via input/store | Nessun mock importato dallo shell |

---

## 3. P1 — Material-first (adozione)

| # | File | Reimplementato a mano | → Sostituire con | Sev |
|---|---|---|---|---|
| P1.1 | `components-v2/modal-shell` | backdrop/scrim/ESC, **niente focus-trap/restore/scroll-lock** | `CDK Overlay` + `cdkTrapFocus` (A11yModule) + `cdkScrollBlock` (o `MatDialog`) | High |
| P1.2 | `layout/site-shell` | drawer mobile (signal+CSS+backdrop `<button>`) — già marcato *SCAFFOLD Fase 2* | `MatSidenavContainer` o `CDK Overlay` + focus-trap | High |
| P1.3 | `widgets/user-profile-sidebar` | drawer/backdrop/animazioni a mano (`@angular/animations`) | `CDK Overlay`/`MatSidenav` + `cdkTrapFocus` | High |
| P1.4 | `components-v2/generation-panel` | progress bar + stepper manuali | `mat-progress-bar` (+ valutare CDK Stepper) | Med |
| P1.5 | `components-v2/ai-chat-panel` | `textarea` + `button` custom | `mat-form-field`+`matInput`+`cdkTextareaAutosize` + `mat-icon-button` | Med |
| P1.6 | `components-v2/source-dropzone` | chip + spinner custom (drop nativo resta) | `mat-chip-row`+`matChipRemove` + `mat-progress-spinner` | Med |
| P1.7 | `auth/login` · `auth/register` · `auth/forgot-password` | `<input>`/`<button>` grezzi, niente `MatError` | `MatFormField`+`MatInput`+`MatError`+`MatButton` | Med |
| P1.8 | `ui/counter-field` | `<input>/<textarea>` invece di `MatInput` (scelta "simple input") | Decidere: migrare a `mat-form-field` **o** documentare la deviazione | Low |

---

## 4. P1 — Container troppo grandi (smart/dumb)

| # | File | Righe | Cosa accentra | Estrazione proposta |
|---|---|---|---|---|
| P1.9 | `pages/project/project-workspace.component.ts` | **637** | store + paging reader + derivati + stepper-mapping + chat ops + publish/derive/version dialog-state + formatter | `ReaderPaginationPresenter` · `ChatPresenter` · `PublishFlow`/`DeriveFlow` (dialog-state+formati) · `chapter-view.mapper.ts` · formatter (`statusLabel`/`pages`/`outcomeStats`) in util |
| P1.10 | `pages/model-setup/model-setup.component.ts` | **616** | form + mappe grammaticali IT + **upload simulato (`setInterval`)** + snackbar dedup + 3 editor (length/structure/style) + assemblaggio `ProjectSettings` + file kind/icon | `UploadSimulator`→poi `S3UploadService` · `settings.builder.ts` (mods→ProjectSettings) · 3 **dumb editor** presentational · grammatica IT in util i18n · file-helpers fuori dal container |
| P1.11 | `pages/collection/collection.component.ts` | **324** | 7 record di costanti + `build()` (filtra/sorta/raggruppa) + RowVM/sourceRow mapper + `relTime`/`humanSize` | `collection-row.mapper.ts` (RowVM + costanti) · `format.util.ts` (relTime/humanSize) · facade per il gating reuse |

> Obiettivo: i container restano "sottili" (orchestrano store + delegano a dumb), come `create`/`landing`/`pricing`.

---

## 5. P2 — Pulizia trasversale

- **Hex hardcoded → token** (rompono la ritematizzazione): `generation-panel`, `derived-result`, `chapter-reader`, `site-header-nav` (~16), `site-mobile-menu`/`site-footer-block` (~8), `content-section` (6), `output-showcase` (5), `output-types` (9), `site-shell` sections, `step-indicator`/`counter-field` (1-2 residui). Riferimento corretto: `choice-card`/`review-shell` (token-only).
- **Label a11y/i18n cablate → input**: `list-row` "Altre azioni"; `ai-chat-panel` close usa `sendLabel` (aggiungere `closeLabel`); `source-dropzone`/`list-row` remove → "Rimuovi {name}" (verbo + nome).
- **Convenzione responsive**: `list-row` usa `@media 768px` hardcoded → usare `ScreenTypeDirective` (come `choice-card`).
- **API legacy → signals**: `widgets/search-item` e `widgets/search-dropdown` usano `@Input/@Output/EventEmitter`+`CommonModule` → `input()/output()`.
- **Accoppiamento layout**: `action-bar` assume `--page-max-width`/`--page-padding-inline` → documentare la dipendenza o renderla configurabile.
- **Dati mock inline**: `pricing`/`landing`/`create` hanno dati statici nel container → spostare in seed/config quando arriva il backend (fuori scope immediato).

---

## 6. Matrice componenti (sintesi)

**A norma (modelli):** choice-card · review-shell · plan-card · stat-card · step-indicator · page-header · footer-link · language-switcher · content-section · hero-section · output-types · output-showcase · site-mobile-menu · action-bar (con nota) · chapter-index · chapter-reader · tone.ts · create · landing · pricing.

**Da rifattorizzare:** modal-shell (P1.1) · site-shell (P1.2) · user-profile-sidebar (P0.4+P1.3) · search-dropdown (P0.5) · search-item (P2) · derived-result (P0.6) · auth-shell (P0.7) · generation-panel (P1.4) · ai-chat-panel (P1.5) · source-dropzone (P1.6) · list-row (P2) · counter-field (P1.8) · site-header-nav (P2 hex) · project-workspace (P1.9) · model-setup (P1.10) · collection (P1.11) · login/register/forgot (P0.1-3, P1.7) · auth.service (P0.3).

---

## 6-bis. Consolidamenti — primitive del design-system (accorpare)

Meno componenti "quasi uguali", più primitive riusabili Material-first. Regola: generalizzare solo con **≥2 consumer reali** e preferire **directive/classe globale** a wrapper-component dove basta.

| Nuovo | Fonde / serve | Forma | Note |
|---|---|---|---|
| **`AppListItem`** | `list-row` + `widgets/search-item` | props opzionali: `variant`, `badge`+tono, `actions`, `selectable`, `compact`, `focusable` | DEVE implementare opzionale `FocusableOption` (CDK) per la nav a tastiera ereditata da search-item (liste statiche **e** risultati overlay) |
| **`AppTextField`** | `counter-field` + composer di `ai-chat-panel` | wrapper su `mat-form-field` | input + textarea `cdkTextareaAutosize` + counter + `mat-error`. = P1.5 + P1.8 |
| **`AttachmentList`** | `source-dropzone` + file-list duplicata in `model-setup.html` | `mat-chip-set`/`mat-chip-row` + `matChipRemove` (+ stato ingest/spinner) | = P1.6; condiviso da dialog upload e setup |
| **`appSelectableCard` (directive)** | base per `stat-card`/`choice-card`/`plan-card`/output-types | directive: ring + `role=button` + tastiera + `aria-pressed` | **NON** un wrapper component e **NON** fondere le 4 card (concetti diversi). Riusa la classe globale `.surface-card` già esistente |
| **`nav-item` / `action-item`** | `site-header-nav` + `site-mobile-menu` | renderer dumb + **un solo modello nav** | Tenere due shell (barra vs drawer); condividere solo i renderer degli item |

## 6-ter. Split granulare dei container (dividere)

- **`project-workspace`** → `WorkspaceRouteContainer` (smart: sceglie per `status`+`reviewStage` = savepoint) + screen dumb `GenerationScreen` · `ReviewIndexScreen` · `ReviewChaptersScreen` · `PublishedScreen` · `DerivedWorkspaceScreen` + `PublishDialog` · `DeriveDialog` · `ReaderDialog` + **`WorkspaceFacade`** (orchestrazione store) → gli screen restano quasi-dumb.
- **`model-setup`** → `SetupRouteContainer` + `SetupTitleSection` · `InstructionsPanel` · `SourcesPanel` + `UploadDialog` · `TextSourceDialog` + **facade** upload/settings (vedi P1.10).
- **`auth-shell`** → `AppShellContainer` (app-aware: header/search/profile/nav) **separato** da `SiteShell` puro (vedi P0.7).
- **`user-profile-sidebar`** → container auth/logout + **drawer dumb** (vedi P0.4 + P1.3).
- **`search-dropdown`** → overlay container + **risultati dumb** (= `AppListItem` focusable) (vedi P0.5).

> Ordine consigliato: prima i 3 merge che sono *anche* vittorie Material-first (**AppTextField, AttachmentList, AppListItem**), poi gli split.

## 7. Roadmap d'esecuzione

**Fase A — Confini (P0)**: auth domain-logic → AuthService (P0.1-3); rendere dumb user-profile-sidebar + search-dropdown (P0.4-5); derived-result view-model locale (P0.6); mock fuori da auth-shell (P0.7). *Correttezza prima di tutto.*

**Fase B — Material-first core (P1.1-1.3)**: modal-shell su CDK Overlay+focus-trap; site-shell + user-profile-sidebar su MatSidenav/CDK. *Sblocca a11y (focus-trap/scroll-lock).*

**Fase C — Material-first + consolidamenti primitive (P1.4-1.8 + §6-bis)**: prima i merge che sono anche vittorie Material — **`AppTextField`** (counter-field + composer chat), **`AttachmentList`** (dropzone + file-list setup), **`AppListItem`** (list-row + search-item) — poi `generation-panel` (progress), `appSelectableCard` directive, renderer `nav-item`/`action-item`.

**Fase D — Split container (P1.9-1.11 + §6-ter)**: `project-workspace` → screen-per-stato + `WorkspaceFacade`; `model-setup` → sezioni + facade; `collection` → mapper/util; `auth-shell` → `AppShell`+`SiteShell`; `user-profile-sidebar` e `search-dropdown` → container + dumb.

**Fase E — Pulizia (P2)**: hex→token, label i18n/a11y, ScreenTypeDirective, signals su widgets legacy.

Ogni fase: **build verde + lint pulito** prima di committare; un commit per item/gruppo coerente.

---

## 8. Definition of Done (100%)

- [ ] Nessun componente in `shared/` inietta servizi di dominio/Router/store (eccetto shell documentati) né importa `core/domain` se dumb.
- [ ] Nessuna primitiva Material reimplementata a mano (dialog/drawer/focus-trap/progress/chips/form-field): tutto su Material/CDK o wrapper esplicito.
- [ ] Tutte le label utente passano via `input` (i18n-agnostico); nessuna stringa cablata nei dumb.
- [ ] Zero colori esadecimali nei componenti: solo token globali.
- [ ] Nessun `input({required})` inutilizzato; nessuna logica Amplify/API nei componenti.
- [ ] Container `> ~300` righe spezzati in facade/presenter/mapper; i container restano orchestratori sottili.
- [ ] Tutti i componenti: OnPush + signals (`input()/output()/model()`); niente `@Input/@Output/EventEmitter`.
- [ ] `build` + `lint` verdi; a11y: focus-trap/scroll-lock sui dialog/drawer, label dei controlli.
