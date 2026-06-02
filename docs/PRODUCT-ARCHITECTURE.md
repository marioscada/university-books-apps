# AI Book Generator — Product & Domain Architecture

> Documento **autoritativo** che fissa l'architettura del prodotto PRIMA della UI.
> Regola d'oro: **nessuna UI scollegata dal dominio**. Le pagine si implementano
> dopo che dominio, stati, job, versioning, relazioni, chat e contratto API sono
> definiti qui.
>
> Decisioni di base (concordate):
> - **Backend**: definiamo NOI il dominio/API e **mockiamo il frontend**. Quando il
>   backend sarà pronto, aderirà a questo contratto.
> - **v1 single-user**, ma il **modello dati è già predisposto** per
>   `Workspace` / `Member` / ruoli / permessi (non implementati in v1, ma le entità
>   non sono "impossibili da estendere").
> - **i18n**: ogni testo nuovo → chiave i18n (ngx-translate già cablato, default EN).
> - **Reattività signals-first**, OnPush, `inject()`, API non deprecate (Angular 19).

---

## 0. Filosofia

Il prodotto è un **sistema di progetti vivi**, non un generatore di file. Un
**Project** è un container che attraversa stati, conserva **versioni immutabili**,
è **rigenerabile a granularità di capitolo**, ha una **chat AI contestuale** e può
**derivare** altri progetti (summary, slides, quiz…). Le fonti (**Source**) vivono
nella **Library** con metadati e relazione **many-to-many** con i progetti.

Tre aree (menu): **Create** (vivo) · **Collection** (completato) · **Library** (fonti).
Più due superfici interne: **Project Workspace** (pagina dinamica del singolo
progetto) e **New Project Wizard** (flusso guidato).

---

## 1. Domain model (TypeScript — contratto frontend, mock-ready)

> Tutte le entità portano `workspaceId` + `ownerId` (predisposizione team). In v1
> esiste **un solo workspace personale implicito** per utente; ruoli/permessi non
> sono applicati ma le entità li prevedono.

### 1.1 Tenancy (predisposto, non attivo in v1)

```ts
type Plan = 'free' | 'pro' | 'team';
type Role = 'owner' | 'admin' | 'editor' | 'viewer';

interface Workspace {
  id: string;
  name: string;
  ownerId: string;          // userId
  plan: Plan;
  createdAt: string;        // ISO
}

interface Member {
  id: string;
  workspaceId: string;
  userId: string;
  role: Role;               // v1: sempre 'owner'
  createdAt: string;
}
```

### 1.2 Project (il container vivo)

```ts
type ProjectKind =
  | 'book' | 'summary' | 'manual' | 'study_guide'
  | 'research_report' | 'training_course' | 'documentation' | 'custom';

type ProjectStatus =
  | 'draft'        // creato, non ancora lanciato
  | 'queued'       // in coda di elaborazione
  | 'processing'   // l'AI sta lavorando (job attivo)
  | 'review'       // versione pronta, l'utente deve controllare → "needs attention"
  | 'published'    // risultato approvato/esportato (aggiornabile con nuove versioni)
  | 'archived'     // non attivo, consultabile/riapribile
  | 'failed';      // generazione fallita → retry

interface Project {
  id: string;
  workspaceId: string;
  ownerId: string;

  title: string;
  kind: ProjectKind;
  status: ProjectStatus;
  coverTheme: CoverTheme;          // riusa i temi cover-art (aurora|ocean|…)

  settings: ProjectSettings;       // config di generazione (dal wizard)

  currentJobId?: string;           // job attivo se status=processing/queued
  currentVersionId?: string;       // versione "attiva" mostrata di default
  versionIds: string[];            // ordinate per number crescente

  // Lineage progetti derivati (summary/slides/quiz da un libro, ecc.)
  parentProjectId?: string;
  derivedKind?: DerivedKind;       // valorizzato se è un derivato
  derivedProjectIds: string[];     // figli derivati da questo

  sourceIds: string[];             // many-to-many (vedi ProjectSource)

  createdAt: string;
  updatedAt: string;
  lastActivityLabel?: string;      // derivato lato UI (es. "2 ore fa")
}

type DerivedKind = 'summary' | 'slides' | 'quiz' | 'manual' | 'study_guide' | 'translation';

type ProcessingMode =
  | 'fast_draft' | 'balanced' | 'deep_research'
  | 'academic' | 'business' | 'educational' | 'technical';

interface ProjectSettings {
  instructions: string;            // prompt libero (Step 3 wizard)
  processingMode: ProcessingMode;  // Step 4 — incide su costo/tempo/qualità
  structure: StructureConfig;      // Step 5
  outputFormats: OutputFormat[];   // Step 6
  language: string;                // ISO (es. 'en')
}

interface StructureConfig {
  chapters?: number;               // n° capitoli (o 'auto')
  length?: 'short' | 'medium' | 'long';
  tone?: 'neutral' | 'formal' | 'friendly' | 'technical' | 'academic';
  depth?: 'overview' | 'standard' | 'deep';
  bibliography: boolean;
  glossary: boolean;
  quiz: boolean;
  exercises: boolean;
  tables: boolean;
  images: boolean;
}

type OutputFormat = 'pdf' | 'docx' | 'epub' | 'markdown' | 'html'; // slides: fase futura
```

### 1.3 Version (snapshot immutabile dell'output)

> Mai sovrascrivere: ogni generazione/rigenerazione "pubblicata" produce una
> **Version** con `number` crescente. Gli edit minori (chat) lavorano su una
> **draft della versione** finché non si pubblica.

```ts
interface Version {
  id: string;
  projectId: string;
  number: number;                  // 1, 2, 3…
  label?: string;                  // es. "Versione studenti"
  status: 'draft' | 'published';   // draft = in lavorazione; published = congelata
  createdAt: string;
  createdBy: string;

  settingsSnapshot: ProjectSettings; // settings con cui è stata generata
  sourcesUsedIds: string[];          // snapshot delle fonti usate
  outline: OutlineNode[];            // struttura capitoli
  chapters: Chapter[];               // contenuto
  outputs: RenderedOutput[];         // export materializzati
  changeSummary?: string;            // cosa è cambiato vs versione precedente (per compare)
}

interface OutlineNode {
  id: string;
  title: string;
  level: number;                   // 1 = capitolo, 2 = sezione…
  childrenIds: string[];
}

interface Chapter {
  id: string;
  versionId: string;
  index: number;
  title: string;
  body: string;                    // markdown/HTML
  status: 'pending' | 'generating' | 'ready' | 'failed';
  wordCount: number;
}

interface RenderedOutput {
  format: OutputFormat;
  url: string;                     // mock: blob/data url
  generatedAt: string;
  sizeBytes?: number;
}
```

### 1.4 Job (unità di elaborazione asincrona)

> Il job è SEPARATO dal Project: il Project ha al più un `currentJobId`. Il job
> espone progress/step/log/ETA e gestisce la **coda** delle fonti aggiunte durante
> l'elaborazione.

```ts
type JobType = 'generate' | 'regenerate_partial' | 'derive' | 'ingest';
type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

interface Job {
  id: string;
  projectId?: string;              // assente per ingest di Source
  sourceId?: string;               // valorizzato per ingest
  versionId?: string;              // la versione che il job sta costruendo
  type: JobType;
  status: JobStatus;

  steps: JobStep[];                // pipeline (es. analyze → outline → chapters → render)
  currentStepKey?: string;
  progress: number;                // 0..100
  etaSeconds?: number;

  targetChapterIds?: string[];     // per regenerate_partial ("aggiorna cap. 2 e 5")
  queuedSourceIds: string[];       // fonti aggiunte durante il job → prossima revisione

  log: JobLogEntry[];
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  error?: { code: string; message: string };
}

interface JobStep {
  key: string;                     // 'analyze' | 'outline' | 'chapters' | 'render' …
  labelKey: string;                // chiave i18n
  status: 'pending' | 'running' | 'done' | 'failed';
  detail?: string;                 // es. "12 fonti analizzate"
  startedAt?: string;
  finishedAt?: string;
}

interface JobLogEntry { at: string; level: 'info' | 'warn' | 'error'; message: string; }
```

### 1.5 Source (Library) + relazione con i progetti

```ts
type SourceType = 'pdf' | 'docx' | 'pptx' | 'image' | 'audio' | 'url' | 'note' | 'csv';
type IngestStatus = 'pending' | 'processing' | 'ready' | 'failed';

interface Source {
  id: string;
  workspaceId: string;
  ownerId: string;

  name: string;
  type: SourceType;
  mime?: string;
  sizeBytes: number;
  uploadedAt: string;

  ingestStatus: IngestStatus;      // job di estrazione all'upload
  lastAnalyzedAt?: string;
  extract?: string;                // estratto automatico (riassunto)
  conceptIndex?: string[];         // indice concetti / keyword
  language?: string;

  tags: string[];
  category?: string;
  folder?: string;

  usedInProjectIds: string[];      // many-to-many (denormalizzato)
  permission?: 'owner';            // predisposto (v1: sempre owner)
}

// Join esplicito (se serve lato API) — many-to-many Project↔Source
interface ProjectSource {
  projectId: string;
  sourceId: string;
  addedAt: string;
  queued?: boolean;                // aggiunta durante un job → prossima revisione
}
```

### 1.6 Project AI Chat + operazioni tipizzate

> La chat NON è testo libero: ogni messaggio utente può produrre una **Operation**
> tipizzata che agisce su outline/capitoli/versioni/derivati. La chat è
> **contestuale** al progetto (fonti, outline, versioni, output, istruzioni).

```ts
interface ChatThread { id: string; projectId: string; createdAt: string; }

interface ChatMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  operationId?: string;            // se il messaggio ha generato un'operazione
}

type OperationType =
  | 'refine_chapter' | 'reduce_length' | 'expand' | 'change_tone' | 'make_technical'
  | 'add_examples' | 'update_chapters' | 'add_sources' | 'change_format'
  | 'translate' | 'derive';

interface Operation {
  id: string;
  projectId: string;
  type: OperationType;
  params: Record<string, unknown>;   // es. { percent: 30 } | { tone: 'technical' }
  targetChapterIds?: string[];       // rigenerazione parziale
  derivedKind?: DerivedKind;         // per type='derive'
  status: 'pending' | 'running' | 'done' | 'failed';
  resultingJobId?: string;
  resultingVersionId?: string;
  resultingProjectId?: string;       // per derive → nuovo progetto figlio
  createdAt: string;
}
```

---

## 2. State machine del Project

```
            ┌───────── user: "Generate" ──────────┐
   draft ───┤                                      ▼
     ▲      └────────────────────────────────►  queued
     │  user: cancel (pre-run)                     │ system: worker picks up
     │                                             ▼
     │                                        processing ──── system: fail ──► failed
     │  user: cancel                               │                              │
     └─────────────────────────────────────       │ system: success              │ user: retry
                                            │       ▼                              ▼
                                            │    review ◄───────────────────── queued
                                            │       │ user: publish
                                            │       ▼
                                  user: new │   published ──── user: archive ──► archived
                                  version   │       │  ▲                            │
                                  (build vN)└───────┘  │ user: reopen               │ user: reopen
                                                       └────────────────────────────┘
```

Transizioni (trigger):

| Da | A | Trigger |
|---|---|---|
| draft | queued | utente: **Generate** |
| queued | processing | sistema: worker prende il job |
| processing | review | sistema: job `succeeded` |
| processing | failed | sistema: job `failed` |
| processing/queued | draft | utente: **Cancel** (annulla job) |
| failed | queued | utente: **Retry** |
| review | published | utente: **Publish** |
| review | processing | utente: **Regenerate** / operazione chat (nuova draft di versione) |
| published | processing | utente: **Create new version** (build vN+1) → review → published |
| published / archived | review/draft | utente: **Reopen** |
| review / published | archived | utente: **Archive** |

**"Needs attention"** NON è uno stato persistito: è un **flag derivato** =
`status ∈ {review, failed}` (più job bloccati). La Create hub lo usa per evidenziare.

---

## 3. Async job model & aggiornamenti live

- **Decisione v1 (mock): polling.** Mentre `status ∈ {queued, processing}`, il
  frontend fa **polling** di `GET /projects/:id/job` ogni ~2s. L'accesso è dietro
  un `ProjectProgressService` (signals) **astratto**: in futuro si sostituisce
  l'implementazione con **SSE/WebSocket** senza toccare la UI.
- **Mock engine**: un servizio simula il job avanzando step/progress/ETA con timer,
  scrivendo nel `log`. (Niente `Date.now`/`Math.random` dentro Workflow scripts; nel
  runtime app sono ok.)
- **Coda fonti durante il job**: aggiungere una Source mentre `processing` la mette
  in `job.queuedSourceIds`.
  - **Default**: *Add to next revision* (sicuro) → confluisce nella prossima Version.
  - **Avanzato (conferma richiesta)**: *Cancel current job and regenerate with new
    sources* → `cancel` + nuovo job che include le fonti.
- **Rigenerazione parziale**: `regenerate_partial` con `targetChapterIds`
  ("aggiorna solo capitoli 2 e 5") → rigenera solo quei `Chapter`, crea nuova Version.
- **Notifiche**: alla transizione `processing → review|failed` → notifica in-app
  (centro notifiche) + (futuro) email. v1: badge/toast in-app.

---

## 4. Versioning, derivazioni, azioni sui progetti storici

- **Version** immutabile per ogni risultato pubblicato; `number` crescente.
- **Compare**: diff outline/capitoli tra due Version (`changeSummary` + diff testuale).
- **Restore**: ripristina una Version precedente creando una nuova Version (mai sovrascrive).
- **Derive** (`type='derive'`): crea un **progetto figlio collegato** (`parentProjectId`,
  `derivedKind`) — es. *Create slides/quiz/summary from this book*. Il derivato ha
  propria vita/versioni.
- **Azioni progetto storico (Collection)**: `Refine` · `Add sources` ·
  `Create new version` · `Derive (summary/manual/slides/quiz)` · `Change output format` ·
  `Duplicate` · `Export again` · `Compare versions` · `Restore previous version`.

---

## 5. Confine Create / Collection / Library

| Area | Contenuto | Regola |
|---|---|---|
| **Create** | progetti **vivi**: `draft, queued, processing, failed, review` | "lavoro in corso + needs attention" |
| **Collection** | progetti **con almeno una Version `published`** (+ `archived`) | archivio completo, filtrabile per stato/categoria |
| **Library** | **Source** (fonti) con metadati, stato ingest | many-to-many con i progetti |

- Un **published** che avvia una nuova versione **rivive**: appare in Create
  (`processing` su vN+1) **e** resta in Collection (ha v1 published). È voluto.
- Da Collection si **riapre** un progetto → crea nuova Version o progetto derivato.

---

## 6. Routing

```
/landing                      pubblica (vetrina)
/auth/*                       login/register
/create                      Create hub — progetti vivi (default post-login)
/create/new                  New Project Wizard (7 step, resumable)
/project/:id                 Project Workspace (dinamico per stato)
/project/:id/version/:vid    (opz.) vista versione specifica / compare
/collection                  archivio completato/pubblicato
/library                     fonti
/pricing                     piani
```

- **Project Workspace** `/project/:id` cambia layout in base a `status`:
  - `processing/queued` → **pannello live** (step, progress, ETA, log, fonti in coda).
  - `review` → outline, capitoli, fonti usate, anteprima, export, **Project AI Chat**.
  - `published` → versione pubblicata, formato, data, **Create new version** + derivati.
  - `failed` → errore + **Retry** + log.
  - `draft` → riprendi il wizard / lancia Generate.

---

## 7. API contract (mockato in v1)

> REST-ish. In v1 implementato da un **mock data layer** (servizi con signals +
> simulazione job). Le firme restano stabili quando subentra il backend reale.

```
# Projects
GET    /projects?status=&kind=&q=            → Project[]
POST   /projects                              → Project            (crea draft dal wizard)
GET    /projects/:id                          → Project
PATCH  /projects/:id                          → Project            (title/settings)
POST   /projects/:id/generate                 → Job                (draft→queued, crea Version draft)
POST   /projects/:id/cancel                   → Project
POST   /projects/:id/publish                  → Project            (review→published, congela Version)
POST   /projects/:id/archive                  → Project
POST   /projects/:id/reopen                   → Project
POST   /projects/:id/duplicate                → Project
POST   /projects/:id/derive                   → Project            ({ derivedKind }) figlio collegato

# Versions
GET    /projects/:id/versions                 → Version[]
GET    /projects/:id/versions/:vid            → Version
POST   /projects/:id/versions                 → Version            (build vN+1)
POST   /projects/:id/versions/:vid/restore    → Version
GET    /projects/:id/versions/compare?a=&b=   → VersionDiff

# Jobs (polling live)
GET    /projects/:id/job                       → Job | null         (polled ~2s)

# Operations (chat / azioni tipizzate)
GET    /projects/:id/chat                      → ChatMessage[]
POST   /projects/:id/chat                      → { message, operation? }
POST   /projects/:id/operations                → Operation          (typed op → job/version)

# Library (Sources)
GET    /sources?folder=&tag=&q=                → Source[]
POST   /sources                                → Source             (upload → ingest job)
GET    /sources/:id                            → Source
PATCH  /sources/:id                            → Source             (tags/folder/category)
DELETE /sources/:id                            → void
GET    /sources/:id/ingest                     → Job                (stato estrazione)
```

---

## 8. Quote / piani (gating)

- Plan: `free` (1 progetto, 20MB) · `pro` (illimitato, export, advanced AI) · `team`.
- I `ProcessingMode` hanno costo/tempo diversi → il wizard mostra stima e **gate**
  (mode "deep/academic" disabilitati in free). Tracciamento uso lato workspace.
- v1: gating **soft** lato UI su dati mock; enforcement reale col backend.

---

## 9. i18n

Ogni testo nuovo → **chiave i18n** (es. `i18n.Project.Status.processing`,
`i18n.Wizard.Step.goal.title`). File flat dot-path in `public/i18n`. Header/footer
già tradotti; le nuove superfici aggiungono le proprie chiavi (en/it/de).

---

## 10. Roadmap a fasi (ognuna = blocco Codex supervisionato)

> Ogni fase: contratto → mock → UI → criteri di accettazione. Codex esegue su
> istruzioni dettagliate; supervisione finale di Claude.

- **F0 — Questo documento** (dominio, stati, job, versioning, API, routing). ← *qui*
- **F1 — Domain + mock data layer**: interfacce TS (`core/domain/*`), `ProjectStore`
  (signals) + `MockApi` che simula job/progress/versioni. Seed mock realistico.
- **F2 — Routing + Project Workspace shell**: `/project/:id` dinamico per stato (con mock).
- **F3 — Create hub "live"**: card progetti legate allo store (stati reali, progress
  che avanza, needs-attention), add-card → `/create/new`.
- **F4 — New Project Wizard** (7 step, resumable come Draft, gating piani) → `generate`.
- **F5 — Workspace dettagli stato**: live panel (step/log/ETA), review (outline/capitoli/
  preview/export), published (versioni).
- **F6 — Project AI Chat + operazioni** (typed ops, rigenerazione parziale).
- **F7 — Library**: metadati, ingest, relazione many-to-many, stato uso.
- **F8 — Versioning UX**: compare, restore, derive (summary/slides/quiz).
- **F9 — Collection allineata** + quote/gating + notifiche.

---

## 11. Non-goals v1 (esplicito)

- Team reale / inviti / ruoli applicati (solo predisposizione dati).
- SSE/WebSocket (si usa polling dietro astrazione).
- Slides come output (dopo i formati testuali).
- Enforcement reale quote/billing (solo gate soft UI).
- Backend reale (tutto mockato; contratto stabile).

---

## 12. Principi trasversali (vincolanti)

- **Dominio prima della UI**; nessuna pagina inventa stati fuori da questa macchina.
- **signals-first**, OnPush, `inject()`, API non deprecate (vedi
  `MIGRATION-TO-WEBSITE.md` §Convenzioni di codice).
- **Stili globali** (`theme/`): le nuove card/stati riusano `project-card`,
  `cover-art`, `status--*`, `page-header`, bande — un unico punto.
- **i18n** per ogni testo. **Mock isolato** dietro interfacce = swap-to-backend indolore.
