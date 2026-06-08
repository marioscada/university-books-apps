# Backend API Requirements — AI Book Generator (web app)

> Documento per il team backend. Elenca **tutto** ciò che la web app `ai-book-generator`
> richiede dal server per funzionare con dati reali, **cosa esiste già** e **cosa manca**.
> Eccezione esplicita: il **dialogo con l'AI** (chat + contenuti derivati) verrà
> **moccato lato frontend per ora** — è documentato qui solo per completezza futura.
>
> Data: 2026-06-08 · Branch FE: `feat/ai-book-generator/server-integration`

---

## 0. Come leggere questo documento

- Il frontend dipende da un'interfaccia unica `ApiPort` (29 metodi) **più** alcune esigenze
  fuori dall'`ApiPort` (billing/abbonamento, download/anteprima fonte). Ogni voce qui è mappata
  sull'endpoint REST che il backend deve esporre.
- **Legenda stato:**
  - ✅ **Esiste** — già nello schema OpenAPI / client generato, utilizzabile.
  - ⚠️ **Parziale / da allineare** — esiste qualcosa di vicino ma semantica o campi non combaciano.
  - ❌ **Manca** — nessun endpoint; va creato.
- **Naming**: il server parla di `Book`/`Document`, il frontend di `Project`/`Source`.
  Sono la **stessa entità**. In questo documento uso i path server (`/v1/books`, `/v1/documents`)
  e indico tra parentesi il concetto frontend.

---

## 1. Convenzioni trasversali (valgono per TUTTI gli endpoint)

1. **Base URL** (nuovo account AWS): `https://dj0gbp5q7e.execute-api.eu-south-1.amazonaws.com/dev`
2. **Auth**: ogni richiesta (tranne login/register/forgot/reset) richiede
   `Authorization: Bearer <Cognito accessToken>`. Authorizer Cognito verificato attivo
   (richiesta senza token → `401`). User Pool `eu-south-1_4KUM6HHzk`, App Client pubblico
   `64jv9gud9k3r0ea7uf88u9809k` (no secret, USER_SRP_AUTH).
3. **Tenancy**: l'accessToken porta `tenantId` e `role` (claim custom già presenti — verificato
   sul token reale: `tenantId: scado-ai`, `role: admin`). Il server deve **scopare ogni risorsa
   per tenant/owner** ricavandoli dal token, non da parametri client.
4. **Formato date**: ISO 8601 stringa (`2026-06-08T10:00:00Z`).
5. **Errori**: formato unico (già presente `ErrorResponse` nello schema). Atteso:
   ```json
   { "error": { "code": "string", "message": "string", "details"?: {} } }
   ```
   con HTTP status coerente (400/401/403/404/409/422/429/500).
6. **Paginazione/filtri/sort**: per le liste, query params `?limit=&cursor=&q=&sort=&order=`
   e risposta con `Pagination` (già modellato). Vedi singoli endpoint.
7. **ID**: stringhe opache.

---

## 2. AUTH — `/v1/auth/*`

L'app usa **AWS Amplify (Cognito) diretto** per login/registrazione/reset (non gli endpoint
REST auth). Quindi gli endpoint `/v1/auth/{login,register,...}` esistono nello schema **ma non
sono consumati dal client REST**. L'unico endpoint auth realmente chiamato via HTTP è:

| Metodo FE | Endpoint | Req | Res | Stato |
|---|---|---|---|---|
| `fetchUserFromBackend` (post-login) | `GET /v1/auth/me` | — (Bearer) | `{ sub, username, email, emailVerified, name, givenName, familyName, tenantId, role }` | ⚠️ **Funziona sul server reale (200) ma NON è nello schema OpenAPI** → va **aggiunto allo schema** |

**Richiesta al backend:**
- ✅ Mantieni `GET /v1/auth/me` così com'è (risponde correttamente).
- ⚠️ **Aggiungilo allo schema OpenAPI** così il client generato lo include (oggi è invisibile alla generazione).

Endpoint auth REST presenti ma non usati dal FE (Amplify li copre): `login, refresh, logout,
register, forgot-password, reset-password, change-password`. Nessuna azione richiesta.

---

## 3. PROJECTS (server: **Books**) — `/v1/books/*`

Cuore dell'app. Il `Project` attraversa la state machine:
`draft → queued → processing → review → published` (+ `archived`, `failed`).
`reviewStage` distingue `index` (solo indice pronto) vs `chapters` (capitoli sviluppati).

| # | Metodo FE (`ApiPort`) | Endpoint richiesto | Stato | Note |
|---|---|---|---|---|
| 1 | `listProjects(filter)` | `GET /v1/books?status=&kind=&q=&limit=&cursor=&sort=&order=` | ⚠️ | Esiste `GET /v1/books` con `SortBy/SortOrder/AvailableFilters/Pagination`. **Confermare** che i filtri `status`/`kind` e la ricerca `q` siano supportati. |
| 2 | `getProject(id)` | `GET /v1/books/{bookId}` | ✅ | Confermare che il payload includa tutti i campi `Project` (vedi §10). |
| 3 | `createProject(input)` | `POST /v1/books` | ❌ **MANCA** | **Bloccante.** Crea un draft dal wizard. Req/Res sotto. |
| 4 | `patchProject(id, patch)` | `PATCH /v1/books/{bookId}` | ❌ **MANCA** | Aggiorna `title` / `settings` / `sourceIds`. (Esiste solo `PUT .../workspace`, semantica diversa.) |
| 5 | `generate(id)` | `POST /v1/books/{bookId}/generate` | ❌ **MANCA** | Avvia la generazione (`draft → queued`), crea un Job + una Version draft. Ritorna il `Job`. |
| 6 | `cancel(id)` | `POST /v1/books/{bookId}/cancel` | ❌ **MANCA** | Annulla il job attivo. Ritorna il `Project`. |
| 7 | `publish(id)` | `POST /v1/books/{bookId}/publish` | ✅ | Esiste. Confermare che faccia `review → published` e ritorni il Project aggiornato (lo schema ha `PublishBookRequest/Response`). |
| 8 | `archive(id)` | `POST /v1/books/{bookId}/archive` | ❌ **MANCA** | `* → archived`. |
| 9 | `reopen(id)` | `POST /v1/books/{bookId}/reopen` | ❌ **MANCA** | `archived → draft/review`. |
| 10 | `duplicate(id)` | `POST /v1/books/{bookId}/duplicate` | ❌ **MANCA** | Copia il progetto. Ritorna il nuovo Project. |
| 11 | `deleteProject(id)` | `DELETE /v1/books/{bookId}` | ❌ **MANCA** | Hard/soft delete. Ritorna `204`. |
| 12 | `derive(id, derivedKind, language?)` | `POST /v1/books/{bookId}/derive` | ❌ **MANCA** | Crea un progetto **figlio** derivato (summary/slides/quiz/…). Body `{ derivedKind, language? }`. Ritorna il nuovo Project figlio. *(Il contenuto del derivato è AI → vedi §8; questo endpoint crea solo l'entità.)* |
| — | export/download | `GET /v1/books/{bookId}/download` | ✅ | Esiste (`DownloadUrlResponse`). Non in `ApiPort` ma utile per l'export. |
| — | collaboratori | `GET/POST /v1/books/{bookId}/collaborators` | ✅ (non consumato) | Presente, **non ancora usato dal FE**. OK lasciarlo. |

### 3.1 `POST /v1/books` (createProject) — **dettaglio (bloccante)**

**Request body:**
```jsonc
{
  "title": "string",
  "kind": "book|summary|manual|study_guide|research_report|training_course|presentation|documentation|custom",
  "coverTheme": "aurora|ocean|ember|rose|mint|gold",   // opzionale, default "ocean"
  "settings": { /* ProjectSettings — vedi §10.2, opzionale: se assente usa default */ }
}
```
**Response:** `Project` completo (vedi §10.1) con `status: "draft"`, `id`, `createdAt`, `updatedAt`,
`workspaceId`, `ownerId` (ricavati dal token).

### 3.2 `PATCH /v1/books/{bookId}` (patchProject)
**Request body (tutti opzionali):** `{ "title"?, "settings"?: ProjectSettings, "sourceIds"?: string[] }`
**Response:** `Project` aggiornato.

### 3.3 `POST /v1/books/{bookId}/generate`
**Response:** `Job` (vedi §5) — il FE poi fa **polling** dello stato.

---

## 4. VERSIONI / INDICE / CAPITOLI

L'output vive in **Version** immutabili. Dopo la sola analisi → indice pronto, capitoli in
`pending`. Dopo lo sviluppo → capitoli `ready`.

| Metodo FE | Endpoint richiesto | Stato | Note |
|---|---|---|---|
| `getCurrentVersion(projectId)` | `GET /v1/books/{bookId}/workspace` **oppure** `GET /v1/books/{bookId}/version` | ⚠️ | Esiste `GET .../workspace` (`BookWorkspace`). **Confermare** che restituisca `outline` (nodi indice) + `chapters` (con `status`/`body`/`wordCount`) + lo stato della versione. Se `BookWorkspace` non porta indice+capitoli, serve un endpoint `version` dedicato che ritorni il tipo `Version` (§10.4). |
| `generateChapters(projectId)` | `POST /v1/books/{bookId}/chapters:generate` (o `POST .../generate-chapters`) | ⚠️ **da allineare** | Esiste `POST /v1/books/{bookId}/chapters` ma è **upsert di UN capitolo** (`UpsertChapterRequest`). Il FE ha bisogno di un trigger **"sviluppa TUTTI i capitoli dall'indice approvato"** → avvia un Job e ritorna la `Version`. Va aggiunto (o chiarita la semantica del POST esistente). |
| **approvazione indice/capitoli (revisione)** | persistere lo stato `approved` per capitolo | ❌ **MANCA** | Oggi `approvedChapterIds` è **stato locale FE** ("finché non c'è il backend"). In revisione l'utente approva i capitoli/l'indice: la decisione va persistita. **Due opzioni:** (A) `generateChapters` accetta nel body l'elenco dei capitoli approvati / l'outline (eventualmente modificato); **oppure** (B) `PATCH /v1/books/{bookId}/workspace` salva `approvedChapterIds` + outline, poi `generateChapters` lo legge. Da concordare. |

**Richiesta al backend:** chiarire il modello `BookWorkspace`:
- Contiene indice (`outline: OutlineNode[]`) e capitoli (`Chapter[]`)? 
- Oppure indice/capitoli stanno solo sotto `/chapters`? 

Il FE si aspetta di leggere indice **e** capitoli in un colpo da `getCurrentVersion`.

---

## 5. JOBS / AVANZAMENTO ASINCRONO — **manca del tutto**

Generazione indice e sviluppo capitoli sono **asincroni**. Il FE fa **polling ogni ~2s** dello
stato per mostrare progress bar/step.

| Metodo FE | Endpoint richiesto | Stato |
|---|---|---|
| `getJob(projectId)` | `GET /v1/books/{bookId}/job` (job attivo, o `null`) | ❌ **MANCA** |
| `getIngestJob(sourceId)` | `GET /v1/documents/{documentId}/ingest` (o stato dentro `GET /v1/documents/{id}`) | ❌/⚠️ |

**Due opzioni accettabili (decidere lato backend):**
- **A)** Endpoint Job dedicato che ritorna il tipo `Job` (§10.5) con `progress` 0–100, `steps[]`,
  `status`, `etaSeconds`.
- **B)** Niente Job separato: `GET .../workspace` espone già `status` + `progress` + step correnti.
  In tal caso il FE polla il workspace. **Va esplicitato quali campi di progress contiene.**

Senza uno dei due, le schermate "Sto generando l'indice / i capitoli" non hanno avanzamento reale.

---

## 6. SOURCES / LIBRARY (server: **Documents**) — `/v1/documents/*`

Le fonti (PDF/DOCX/PPTX/immagini/URL/note/CSV) con ingest (estrazione testo).

| # | Metodo FE | Endpoint richiesto | Stato | Note |
|---|---|---|---|---|
| 1 | `listSources(filter)` | `GET /v1/documents?folder=&tag=&q=&limit=&cursor=` | ❌ **MANCA** | Non esiste LIST documenti. Necessario per la Library. |
| 2 | `getSource(id)` | `GET /v1/documents/{documentId}` | ✅ | Esiste (`DocumentMetadata`). Confermare campi `Source` (§10.3): `ingestStatus`, `extract`, `conceptIndex`, `tags`, `folder`, `category`. |
| 3 | `createUpload(input)` | `POST /v1/documents/presigned-url` (+ multipart per file grandi) | ✅/⚠️ | Esiste presigned-url e l'intero flusso multipart. **Confermare il flusso completo**: presign → `PUT` su S3 → **come si finalizza/registra il Document?** Per il multipart c'è `complete`; per l'upload singolo presigned c'è un endpoint di **conferma/registrazione** del record dopo il PUT? Se no, va aggiunto. |
| 4 | `createNote(name)` | `POST /v1/documents` (type `note`, testo inline) | ❌ **MANCA** | Crea una fonte testuale inline (no file), ingest immediato `ready`. |
| 5 | `patchSource(id, patch)` | `PATCH /v1/documents/{documentId}` | ❌ **MANCA** | Aggiorna `tags` / `folder` / `category`. |
| 6 | `deleteSource(id)` | `DELETE /v1/documents/{documentId}` | ❌ **MANCA** | Ritorna `204`. |
| 7 | `getIngestJob(sourceId)` | `GET /v1/documents/{documentId}/ingest` o stato in `GET /v1/documents/{id}` | ❌/⚠️ | Stato estrazione (`pending/processing/ready/failed`). |
| 8 | download fonte (UI Collection) | `GET /v1/documents/{documentId}/download` → presigned URL | ❌ **MANCA** | Azione "download" sulla fonte nella Library. |
| 9 | anteprima fonte (UI Collection) | `GET /v1/documents/{documentId}/preview` (o presigned GET inline) | ❌ **MANCA** | `openSource()` apre l'anteprima del file. |

### Flusso upload atteso dal FE (`createUpload`)
1. `POST /v1/documents/presigned-url` → `{ uploadUrl, documentId, fields? }`
2. FE fa `PUT`/`POST` del file su S3 (presigned)
3. **Finalizzazione**: serve un endpoint che marchi il Document come caricato e **avvii l'ingest**
   (Textract/OCR/parsing). **Confermare quale endpoint chiude il cerchio** (per multipart è
   `/complete`; per single presigned, oggi, sembra mancare).

---

## 7. TEMPLATES (modelli di pubblicazione) — `/v1/templates/*`

| Metodo FE | Endpoint | Stato | Note |
|---|---|---|---|
| `listTemplates()` | `GET /v1/templates` | ✅ | Confermare che `Template` server mappi su `ProjectTemplate` (§10.6): `parts[]`, `defaults`, `typography`, `estimatedPages`. |
| `getTemplate(id)` | `GET /v1/templates/{templateId}` | ✅ | idem |

Endpoint admin presenti ma **non consumati dal FE** (gestione modelli): `POST /v1/templates`,
`PUT/DELETE /v1/templates/{id}`, `POST .../{activate,deactivate,clone,retire}`. OK lasciarli.

⚠️ **Punto da chiarire**: il FE usa **chiavi i18n** per nome/descrizione del template
(`nameKey`, `descKey`, `sourceKey`, `labelKey` delle parti). Il server espone chiavi i18n o
stringhe già localizzate? Va concordato (preferenza FE: o chiavi i18n stabili, o testo +
locale esplicito).

---

## 8. CHAT AI + DERIVATI (contenuto AI) — **MOCK lato FE per ora**

> Questi endpoint **NON sono richiesti adesso**: il dialogo AI e i contenuti derivati restano
> moccati nel frontend. Documentati qui per il futuro, così il contratto è già chiaro.

| Metodo FE | Endpoint (futuro) | Stato |
|---|---|---|
| `listChatMessages(projectId)` | `GET /v1/books/{bookId}/chat` | ❌ (mock FE) |
| `sendChatMessage(projectId, text)` | `POST /v1/books/{bookId}/chat` → ritorna `[userMsg, assistantMsg]` | ❌ (mock FE) |
| `generateDerived(projectId)` | `POST /v1/books/{bookId}/derived` → `DerivedContent` (§10.7) | ❌ (mock FE) |
| `regenerateDerived(projectId, feedback)` | `POST /v1/books/{bookId}/derived/regenerate` → `DerivedContent` | ❌ (mock FE) |

**Nota**: l'entità "progetto derivato" (§3, `derive`) è separata dal **contenuto** derivato
(AI). La creazione dell'entità figlio può essere reale; il contenuto AI è mock.

---

## 9. BILLING / ABBONAMENTO / CHECKOUT — **manca del tutto**

Due concetti distinti già presenti nel FE (oggi entrambi mock):

1. **Piano del workspace** (`ApiPort.getPlan`) → `'free' | 'pro' | 'team'` — usato per il
   **gating soft** delle funzioni.
2. **Stato abbonamento + chance** (`BillingService`, fuori da `ApiPort`) → governa il modello
   d'accesso: rielaborare un progetto / creare derivati è gated dall'abbonamento.
   - `status: 'active' | 'past_due' | 'none'`
   - `chancesLeft: number` (rielaborazioni residue nel mese; valorizzato solo se `active`)
   - regola FE: `canReuse = status === 'active' && chancesLeft > 0`

### Endpoint richiesti

| Esigenza FE | Endpoint richiesto | Stato | Note |
|---|---|---|---|
| `getPlan()` | `GET /v1/subscription` (o `/v1/workspace`) → include `plan` | ❌ **MANCA** | `'free'\|'pro'\|'team'`. In assenza il FE assume `free`. |
| stato abbonamento + chance | `GET /v1/subscription` → `{ status, chancesLeft, plan, currentPeriodEnd? }` | ❌ **MANCA** | Alimenta il `BillingService`. Stessa risorsa di sopra: **un solo endpoint** può coprire piano + stato + chance. |
| checkout abbonamento (pagina Prezzi) | `POST /v1/billing/checkout` → `{ url }` (Stripe/checkout session) | ❌ **MANCA** | Body `{ planId: 'monthly'\|'annual'\|... }`. Il FE redirige a `url`. (Oggi `pricing.choose()` è mock → manda al login.) |
| paga singolo progetto | `POST /v1/billing/checkout` con `{ kind: 'single_project', projectId }` → `{ url }` | ❌ **MANCA** | Caso `status === 'none'`: "paga il singolo progetto" dal dialog di rielaborazione (`collection.paySingle()`). |
| regolarizza pagamento (`past_due`) | `GET /v1/billing/portal` → `{ url }` (customer portal) | ❌ **MANCA** | Caso `status === 'past_due'`: gestione metodo di pagamento. |

**Decisione di prodotto richiesta:** quanto di billing va attivato per il primo rilascio reale?
Minimo per sbloccare il flusso: `GET /v1/subscription` (anche solo che ritorni `none`/`free`),
così il gating funziona; il checkout vero può seguire. Senza `GET /v1/subscription` il FE resta
sul mock `BillingService`.

> Nota repo: esiste lo script `check-subscriptions.sh` ma **nessuna API** dietro.

---

## 10. APPENDICE — Shape dei tipi (contratto di risposta atteso dal FE)

> Sono i tipi di dominio del frontend. Le risposte server devono essere mappabili su questi
> (i nomi campo possono differire se concordiamo l'adapter, ma **il set di informazioni deve esserci**).

### 10.1 `Project` (server `Book`)
```ts
{
  id: string; workspaceId: string; ownerId: string;
  title: string;
  kind: ProjectKind;            // book|summary|manual|study_guide|research_report|training_course|presentation|documentation|custom
  status: ProjectStatus;        // draft|queued|processing|review|published|archived|failed
  reviewStage?: 'index'|'chapters';
  coverTheme: 'aurora'|'ocean'|'ember'|'rose'|'mint'|'gold';
  settings: ProjectSettings;    // §10.2
  currentJobId?: string;
  currentVersionId?: string;
  versionIds: string[];
  parentProjectId?: string;     // se è un derivato
  derivedKind?: DerivedKind;    // summary|slides|quiz|manual|study_guide|translation
  derivedProjectIds: string[];
  sourceIds: string[];
  createdAt: string; updatedAt: string;
}
```

### 10.2 `ProjectSettings`
```ts
{
  instructions: string;
  processingMode: 'fast_draft'|'balanced'|'deep_research'|'academic'|'business'|'educational'|'technical';
  structure: {
    chapters?: number; length?: 'short'|'medium'|'long';
    tone?: 'neutral'|'formal'|'friendly'|'technical'|'academic';
    depth?: 'overview'|'standard'|'deep';
    bibliography: boolean; glossary: boolean; quiz: boolean; exercises: boolean;
    appendices: boolean; tables: boolean; images: boolean;
  };
  outputFormats: ('pdf'|'docx'|'epub'|'markdown'|'html')[];
  language: string;             // ISO
  templateId?: string;
  parts?: { key: string; included: boolean; count?: number; wordCount?: number }[];
  typography?: { fontFamily: string; fontSizePt: number; textColor: string; lineHeight: number; marginMm: number; alignment?: 'left'|'justify' };
  totalWords?: number;
}
```

### 10.3 `Source` (server `Document`)
```ts
{
  id: string; workspaceId: string; ownerId: string;
  name: string;
  type: 'pdf'|'docx'|'pptx'|'image'|'url'|'note'|'csv';
  mime?: string; sizeBytes: number; uploadedAt: string;
  ingestStatus: 'pending'|'processing'|'ready'|'failed';
  lastAnalyzedAt?: string; extract?: string; conceptIndex?: string[]; language?: string;
  tags: string[]; category?: string; folder?: string;
  usedInProjectIds: string[];
}
```

### 10.4 `Version` + `Chapter` + `OutlineNode`
```ts
Version {
  id: string; projectId: string; number: number; label?: string;
  status: 'draft'|'published'; createdAt: string; createdBy: string;
  settingsSnapshot: ProjectSettings; sourcesUsedIds: string[];
  outline: OutlineNode[]; chapters: Chapter[]; outputs: RenderedOutput[];
  changeSummary?: string;
}
OutlineNode { id: string; title: string; level: number; childrenIds: string[] }
Chapter { id: string; versionId: string; index: number; title: string; body: string;
          status: 'pending'|'generating'|'ready'|'failed'; wordCount: number }
RenderedOutput { format: OutputFormat; url: string; generatedAt: string; sizeBytes?: number }
```

### 10.5 `Job`
```ts
{
  id: string; projectId?: string; sourceId?: string; versionId?: string;
  type: 'generate'|'regenerate_partial'|'derive'|'ingest';
  status: 'queued'|'running'|'succeeded'|'failed'|'cancelled';
  steps: { key: string; labelKey: string; status: 'pending'|'running'|'done'|'failed'; detail?: string; startedAt?: string; finishedAt?: string }[];
  currentStepKey?: string; progress: number /*0..100*/; etaSeconds?: number;
  targetChapterIds?: string[]; queuedSourceIds: string[];
  log: { at: string; level: 'info'|'warn'|'error'; message: string }[];
  createdAt: string; startedAt?: string; finishedAt?: string;
  error?: { code: string; message: string };
}
```

### 10.6 `ProjectTemplate` (server `Template`)
```ts
{
  id: string; kind: ProjectKind;
  nameKey: string; descKey: string; sourceKey: string;   // i18n keys (da concordare §7)
  parts: { key: string; labelKey: string; group: 'front'|'body'|'back'|'section';
           optional: boolean; includedByDefault: boolean; repeatable?: boolean;
           countRange?: [number, number]; defaultCount?: number; defaultWordCount?: number }[];
  defaults: { processingMode; outputFormats; language; structure };  // vedi ProjectSettings
  typography: TypographySettings;
  coverTheme?: CoverTheme; estimatedPages?: number;
}
```

### 10.7 `DerivedContent` (AI — mock per ora)
```ts
{
  kind: DerivedKind; title: string; language?: string;
  paragraphs?: string[];                       // summary, translation
  slides?: { title: string; bullets: string[] }[];          // slides
  quiz?: { question: string; options: string[]; answerIndex: number; explanation?: string }[]; // quiz
  steps?: { title: string; body: string }[];   // manual
  cards?: { front: string; back: string }[];   // study_guide
}
```

---

## 11. RIEPILOGO — cosa abbiamo vs cosa manca

### ✅ Già disponibile (utilizzabile)
- Auth Cognito completo (login/register/reset via Amplify) + `GET /v1/auth/me` (⚠️ da mettere a schema)
- `GET /v1/books`, `GET /v1/books/{id}`, `GET /v1/books/{id}/download`
- `POST /v1/books/{id}/publish`
- `GET /v1/books/{id}/workspace`, `GET/POST /v1/books/{id}/chapters` (⚠️ semantica da allineare)
- `GET/POST /v1/books/{id}/collaborators` (non ancora consumato)
- `GET /v1/documents/{id}`, presigned-url + multipart (upload)
- `GET /v1/templates`, `GET /v1/templates/{id}` (+ admin CRUD non usato)

### ❌ Mancante / da creare (necessario per il funzionamento reale, **escluso AI**)
**Bloccanti (flusso base):**
1. `POST /v1/books` — creare un progetto
2. `PATCH /v1/books/{id}` — salvare titolo/settings
3. `POST /v1/books/{id}/generate` + `POST /v1/books/{id}/cancel` — avvio/annullo generazione
4. **Avanzamento async**: `GET /v1/books/{id}/job` *oppure* campi progress in `GET .../workspace`
5. "Genera tutti i capitoli dall'indice" — trigger dedicato (oggi POST chapters è single-upsert)
6. Persistenza dell'**approvazione indice/capitoli** in revisione (oggi è stato locale FE)

**Library:**
7. `GET /v1/documents` (LIST) · `POST /v1/documents` (nota inline) · `PATCH /v1/documents/{id}` · `DELETE /v1/documents/{id}`
8. Finalizzazione upload singolo (registra Document + avvia ingest) · `GET .../ingest` (stato)
9. `GET /v1/documents/{id}/download` (download fonte) · `GET /v1/documents/{id}/preview` (anteprima)

**Lifecycle progetto (se richiesto in v1):**
10. `POST /v1/books/{id}/{archive,reopen,duplicate,derive}` · `DELETE /v1/books/{id}`

**Billing / abbonamento:**
11. `GET /v1/subscription` (piano + status + chance) — minimo per il gating
12. `POST /v1/billing/checkout` (abbonamento e singolo progetto) · `GET /v1/billing/portal` (regolarizza)

### 🟡 Mock lato frontend (nessuna API richiesta ora)
- Chat AI: `GET/POST /v1/books/{id}/chat`
- Contenuti derivati AI: `POST /v1/books/{id}/derived[/regenerate]`

### ⚠️ Da chiarire/decidere con il backend
- `BookWorkspace`: contiene indice + capitoli + progress? (→ §4, §5)
- Flusso di finalizzazione dell'upload singolo presigned (→ §6)
- Template: chiavi i18n o testo localizzato? (→ §7)
- Filtri supportati su `GET /v1/books` (`status`/`kind`/`q`) (→ §3)
- `GET /v1/auth/me` da aggiungere allo schema OpenAPI (→ §2)

---

## 12. Note tooling (per il FE, non per il backend)
- Lo schema in repo (`schemas/current.json`) è del **vecchio account** (scaricato 2025-12-12 da
  `omrsvjwsfh…`). Va rigenerato dal nuovo: `npm run schema:fetch && npm run schema:generate`.
- `GET /v1/openapi.json` sul nuovo account risponde **403** col solo Bearer Cognito → lo schema
  è protetto da **API key di usage-plan**. Serve la **dev API key dello schema** del nuovo account
  per rigenerare il client (questo è l'unico uso legittimo residuo di una API key; il runtime usa
  solo Cognito).
