# Backend Data Contract — Entità & Proprietà (FE ai-book-generator)

> Catalogo **dettagliato** di tutte le entità di dominio e delle loro proprietà che
> il frontend usa. Oggi sono tutte alimentate da **mock** (`MockApiService` + seed);
> questo documento è il contratto dati affinché il backend possa **fornire** (nelle
> risposte) e **ricevere** (nei body) gli stessi dati, così i componenti girano su
> dati reali.
>
> Complementare a `BACKEND-API-REQUIREMENTS.md` (che elenca gli endpoint). Qui il
> focus è **shape dei dati**. Fonte: `projects/ai-book-generator/src/app/core/domain/*`.
> Data: 2026-06-08.

## Legenda
- **Dir**: `→FE` = il backend lo **fornisce** in risposta · `FE→` = il backend lo **riceve** nel body · `↔` = entrambi.
- **Req**: ✓ obbligatorio · `?` opzionale.
- **Stato backend**: ✅ già esposto (endpoint implementato) · 🟡 parziale/da mappare · ❌ ancora mock.
- Tutti gli ID sono `string`. Tutte le date sono **ISO 8601** (`2026-06-08T10:00:00Z`).
- Le enum riportano i valori **esatti** attesi dal FE (lowercase): usarli identici evita mapping.
- **i18n**: campi marcati 🌐 sono **tradotti dal FE** → il backend invia chiavi/codici, non testo.

---

## 0. i18n vs dati dinamici — PRINCIPIO CHIAVE

Il backend **non invia mai testo già localizzato per la UI**. Due categorie nette:

### 🌐 A) Tradotto dal FE (i18n) — il backend manda CHIAVI/CODICI stabili, mai testo umano
- **Chiavi i18n esplicite**: `ProjectTemplate.nameKey / descKey / sourceKey`, `StructurePart.labelKey`, `JobStep.labelKey`. → il backend invia es. `template.book.name`, il FE lo traduce.
- **Valori enum** (tutti): `kind`, `status`, `reviewStage`, `processingMode`, `outputFormat`, `sourceType`, `ingestStatus`, `JobType`, `JobStatus`, `chapter.status`, `OperationType`, `plan`, `role`, `billing.status`, `coverTheme`, `length/tone/depth/group`. → il backend invia il **codice** (`book`, `processing`, `pdf`), **MAI** "Libro"/"In elaborazione"/"PDF". Il FE mappa codice → label localizzata.
- **Label statiche di UI** (bottoni, titoli sezione, hint, placeholder, messaggi di stato, nomi dei passi della pipeline): vivono **solo nel FE** (i18n). Il backend non le fornisce.

### 📦 B) Dato dinamico reale dal server — contenuto, NON tradotto
- **Contenuto utente/AI**: `Project.title`, `Source.name`, `ProjectSettings.instructions`, `Chapter.title` + `Chapter.body`, `OutlineNode.title`, `DerivedContent.title/paragraphs/slides/quiz/...`, `ChatMessage.content`, `Source.extract / conceptIndex`.
- **Identificatori, date (ISO), conteggi, flag, URL, hex colori, status-code**.
- ⚠️ Il **contenuto del libro** (capitoli, indice, derivati) è prodotto **nella `language` del progetto** scelta dall'utente: è *dato* generato in quella lingua, **non** i18n di interfaccia. L'i18n di UI riguarda solo le *etichette dell'applicazione*, non il manoscritto.

### Regola pratica
> È un'**etichetta di interfaccia**? → chiave/enum, tradotta dal FE (🌐).
> È **contenuto** che l'utente legge/scrive nel documento? → stringa dinamica dal server (📦).

**Conseguenza per il backend:** le tabelle che seguono marcano 🌐 i campi i18n. Per quei
campi il server deve restituire **chiavi/codici stabili e versionati** (non cambiarli a caso:
sono riferiti dai file di traduzione FE in `it/en/de`). Tutto il resto è contenuto dinamico.

---

## 1. Tenancy — `Workspace`, `Member`, `Plan`, `Role`

In v1 esiste un workspace personale implicito per utente; ruolo sempre `owner`.
Lo scoping per tenant è ricavato dal token (claim `tenantId`).

### `Plan` (enum) · Stato: ❌ (mock `free`)
`'free' | 'pro' | 'team'`

### `Role` (enum)
`'owner' | 'admin' | 'editor' | 'viewer'` (v1: sempre `owner`)

### `Workspace` · Dir `→FE` · Stato: ❌
| prop | tipo | req | note |
|---|---|---|---|
| id | string | ✓ | |
| name | string | ✓ | |
| ownerId | string (userId) | ✓ | |
| plan | Plan | ✓ | gating soft |
| createdAt | string ISO | ✓ | |

### `Member` · Dir `→FE` · Stato: ❌ (predisposto, non usato in v1)
`{ id, workspaceId, userId, role: Role, createdAt }`

---

## 2. Identità utente — `AuthUser` / `/v1/auth/me`

Dir `→FE` · Stato: ✅ (endpoint esiste; aggiungere a schema OpenAPI)
| prop | tipo | req | note |
|---|---|---|---|
| userId (`sub`) | string | ✓ | |
| username | string | ✓ | |
| email | string | ✓ | |
| emailVerified | boolean | ✓ | |
| name | string | ? | |
| givenName | string | ? | |
| familyName | string | ? | |
| tenantId | string | ✓ | dal token |
| role | string | ? | dal token (`admin`…) |

---

## 3. Modello di pubblicazione — `ProjectTemplate` (il "model")

Modello **immutabile** (galleria nella pagina Create). Dir `→FE` · Stato: 🟡
(esiste `GET /v1/templates` ma shape backend ≠ questa — **da allineare**, in
particolare le chiavi i18n).

### `ProjectTemplate`
| prop | tipo | req | note |
|---|---|---|---|
| id | string | ✓ | |
| kind | ProjectKind | ✓ | vedi §4 |
| nameKey | string | ✓ | 🌐 **chiave i18n** del nome (es. `template.book.name`) — non testo |
| descKey | string | ✓ | 🌐 chiave i18n descrizione |
| sourceKey | string | ✓ | 🌐 chiave i18n ("fonte standard") |
| parts | StructurePart[] | ✓ | struttura standard ordinata |
| defaults | TemplateDefaults | ✓ | smart defaults wizard |
| typography | TypographySettings | ✓ | vedi §5.3 |
| coverTheme | CoverTheme | ? | tema anteprima |
| estimatedPages | number | ? | stima per la card |

### `StructurePart` (parte della struttura del modello)
| prop | tipo | req | note |
|---|---|---|---|
| key | string | ✓ | identificatore stabile parte (es. `introduction`, `chapter`, `glossary`) |
| labelKey | string | ✓ | 🌐 chiave i18n della label (il FE la traduce) |
| group | `'front'\|'body'\|'back'\|'section'` | ✓ | 🌐 enum (label tradotta dal FE) |
| optional | boolean | ✓ | escludibile dall'utente |
| includedByDefault | boolean | ✓ | inclusa di default |
| repeatable | boolean | ? | parte ripetibile (capitoli/moduli) |
| countRange | [number, number] | ? | range [min,max] se ripetibile |
| defaultCount | number | ? | conteggio default se ripetibile |
| defaultWordCount | number | ? | parole target (per parte o per unità) |

### `TemplateDefaults`
`{ processingMode: ProcessingMode, outputFormats: OutputFormat[], language: string, structure: StructureConfig }` (vedi §5).

---

## 4. Progetto — `Project` (authoring) + enum

Entità viva dell'authoring. Dir `↔` · Stato: ✅ CRUD reale su `/v1/projects`
(il backend `Project` è 1:1 con questo).

### Enum (valori esatti)
- **ProjectKind**: `book | summary | manual | study_guide | research_report | training_course | presentation | documentation | custom`
- **ProjectStatus**: `draft | queued | processing | review | published | archived | failed`
- **reviewStage**: `index | chapters`
- **CoverTheme**: `aurora | ocean | ember | rose | mint | gold`
- **DerivedKind**: `summary | slides | quiz | manual | study_guide | translation`

### `Project`
| prop | tipo | req | dir | note |
|---|---|---|---|---|
| id | string | ✓ | →FE | |
| workspaceId | string | ✓ | →FE | = tenantId in v1 |
| ownerId | string | ✓ | →FE | dal token |
| title | string | ✓ | ↔ | create/patch |
| kind | ProjectKind | ✓ | ↔ | create |
| status | ProjectStatus | ✓ | →FE | gestito dal server |
| reviewStage | `index\|chapters` | ? | →FE | sotto-stadio revisione |
| coverTheme | CoverTheme | ✓ | ↔ | default `ocean` |
| settings | ProjectSettings | ✓ | ↔ | §5 |
| currentJobId | string | ? | →FE | se processing/queued |
| currentVersionId | string | ? | →FE | versione attiva |
| versionIds | string[] | ✓ | →FE | ordinate per number |
| parentProjectId | string | ? | →FE | se è un derivato |
| derivedKind | DerivedKind | ? | →FE | se è un derivato |
| derivedProjectIds | string[] | ✓ | →FE | figli derivati |
| sourceIds | string[] | ✓ | ↔ | fonti associate |
| createdAt | string ISO | ✓ | →FE | |
| updatedAt | string ISO | ✓ | →FE | |

### Body **ricevuti** dal backend
- **createProject** (`POST /v1/projects`): `{ title✓, kind✓, coverTheme?, settings?, sourceIds? }`
- **patchProject** (`PATCH /v1/projects/{id}`): `{ title?, settings?, sourceIds?, coverTheme? }`

---

## 5. Impostazioni di generazione — `ProjectSettings` + sotto-tipi

Dir `↔` (dentro create/patch project) · Stato: ✅

### Enum
- **ProcessingMode**: `fast_draft | balanced | deep_research | academic | business | educational | technical`
- **OutputFormat**: `pdf | docx | epub | markdown | html`

### 5.1 `ProjectSettings`
| prop | tipo | req | note |
|---|---|---|---|
| instructions | string | ✓ | prompt libero |
| processingMode | ProcessingMode | ✓ | costo/tempo/qualità |
| structure | StructureConfig | ✓ | §5.2 |
| outputFormats | OutputFormat[] | ✓ | |
| language | string (ISO) | ✓ | es. `it`, `en` |
| templateId | string | ? | modello di partenza |
| parts | PartOverride[] | ? | scostamenti per-parte |
| typography | TypographySettings | ? | §5.3 |
| totalWords | number | ? | parole totali manoscritto |

### 5.2 `StructureConfig`
| prop | tipo | req | note |
|---|---|---|---|
| chapters | number | ? | n° capitoli (assente = auto) |
| length | `short\|medium\|long` | ? | |
| tone | `neutral\|formal\|friendly\|technical\|academic` | ? | |
| depth | `overview\|standard\|deep` | ? | |
| bibliography | boolean | ✓ | |
| glossary | boolean | ✓ | |
| quiz | boolean | ✓ | |
| exercises | boolean | ✓ | |
| appendices | boolean | ✓ | |
| tables | boolean | ✓ | |
| images | boolean | ✓ | |

### 5.3 `TypographySettings`
`{ fontFamily✓, fontSizePt✓, textColor✓ (hex), lineHeight✓, marginMm✓, alignment? ('left'|'justify') }`

### 5.4 `PartOverride`
`{ key✓, included✓ (bool), count? (number), wordCount? (number) }`

---

## 6. Output — `Version`, `Chapter`, `OutlineNode`, `RenderedOutput`

Snapshot immutabile dell'output. Dir `→FE` · Stato: ✅ (stub) su
`GET /v1/projects/{id}/version` (campi `settingsSnapshot`/`outputs` oggi vuoti).

### `Version`
| prop | tipo | req | note |
|---|---|---|---|
| id | string | ✓ | |
| projectId | string | ✓ | |
| number | number | ✓ | 1,2,3… |
| label | string | ? | es. "Versione studenti" |
| status | `draft\|published` | ✓ | draft=in lavorazione |
| createdAt | string ISO | ✓ | |
| createdBy | string (userId) | ✓ | |
| settingsSnapshot | ProjectSettings | ✓ | settings usati |
| sourcesUsedIds | string[] | ✓ | snapshot fonti |
| outline | OutlineNode[] | ✓ | indice |
| chapters | Chapter[] | ✓ | contenuto |
| outputs | RenderedOutput[] | ✓ | export materializzati |
| changeSummary | string | ? | diff vs versione precedente |
| approvedChapterIds | string[] | ✓ | **persistenza approvazione revisione** |

### `OutlineNode`
`{ id✓, title✓, level✓ (1=capitolo,2=sezione…), childrenIds✓: string[] }`

### `Chapter`
| prop | tipo | req | note |
|---|---|---|---|
| id | string | ✓ | |
| versionId | string | ✓ | |
| index | number | ✓ | |
| title | string | ✓ | |
| body | string | ✓ | markdown/HTML |
| status | `pending\|generating\|ready\|failed` | ✓ | |
| wordCount | number | ✓ | |

### `RenderedOutput`
`{ format: OutputFormat✓, url✓, generatedAt✓ (ISO), sizeBytes? }`

---

## 7. Elaborazione async — `Job`, `JobStep`, `JobLogEntry`

Polling ~2s. Dir `→FE` · Stato: ✅ (stub) su `GET /v1/projects/{id}/job`.

### Enum
- **JobType**: `generate | regenerate_partial | derive | ingest`
- **JobStatus**: `queued | running | succeeded | failed | cancelled`

### `Job`
| prop | tipo | req | note |
|---|---|---|---|
| id | string | ✓ | |
| projectId | string | ? | assente per ingest di Source |
| sourceId | string | ? | valorizzato per ingest |
| versionId | string | ? | la versione che costruisce |
| type | JobType | ✓ | |
| status | JobStatus | ✓ | |
| steps | JobStep[] | ✓ | pipeline |
| currentStepKey | string | ? | |
| progress | number (0–100) | ✓ | |
| etaSeconds | number | ? | |
| targetChapterIds | string[] | ? | per regenerate_partial |
| queuedSourceIds | string[] | ✓ | fonti aggiunte durante il job |
| log | JobLogEntry[] | ✓ | |
| createdAt | string ISO | ✓ | |
| startedAt | string ISO | ? | |
| finishedAt | string ISO | ? | |
| error | `{ code, message }` | ? | |

### `JobStep`
`{ key✓ (analyze\|outline\|chapters\|render…), labelKey✓ 🌐 (chiave i18n), status✓ (pending\|running\|done\|failed), detail? (📦 testo dinamico es. "12 fonti analizzate"), startedAt?, finishedAt? }`

### `JobLogEntry`
`{ at✓ (ISO), level✓ (info\|warn\|error), message✓ }`

---

## 8. Fonti / Library — `Source`, `ProjectSource`

Dir `↔` · Stato: ✅ (list/note/patch/delete/download/preview/ingest su `/v1/documents`).

### Enum
- **SourceType**: `pdf | docx | pptx | image | url | note | csv`
- **IngestStatus**: `pending | processing | ready | failed`

### `Source`
| prop | tipo | req | dir | note |
|---|---|---|---|---|
| id | string | ✓ | →FE | |
| workspaceId | string | ✓ | →FE | |
| ownerId | string | ✓ | →FE | |
| name | string | ✓ | ↔ | |
| type | SourceType | ✓ | →FE | dedotto da mime/estensione |
| mime | string | ? | →FE | |
| sizeBytes | number | ✓ | →FE | |
| uploadedAt | string ISO | ✓ | →FE | |
| ingestStatus | IngestStatus | ✓ | →FE | stato estrazione |
| lastAnalyzedAt | string ISO | ? | →FE | |
| extract | string | ? | →FE | estratto automatico |
| conceptIndex | string[] | ? | →FE | keyword/concetti |
| language | string | ? | →FE | |
| tags | string[] | ✓ | ↔ | patch |
| category | string | ? | ↔ | patch |
| folder | string | ? | ↔ | patch |
| usedInProjectIds | string[] | ✓ | →FE | many-to-many |
| permission | `'owner'` | ? | →FE | v1 sempre owner |

### Body **ricevuti**
- **createNote** (`POST /v1/documents`): `{ name✓, content }`
- **createUpload** (presigned): `{ name✓, sizeBytes✓, mime? }` → flusso presigned-url + (finalizzazione)
- **patchSource** (`PATCH /v1/documents/{id}`): `{ tags?, folder?, category? }`

### `ProjectSource` (join many-to-many, se serve lato API)
`{ projectId✓, sourceId✓, addedAt✓ (ISO), queued? (bool — aggiunta durante un job) }`

---

## 9. Chat AI + Operazioni — `ChatThread`, `ChatMessage`, `Operation`

🟡 **Dialogo AI: MOCK lato FE per ora** (documentato per il futuro). La chat NON è
testo libero: un messaggio utente può produrre una `Operation` tipizzata.

### `ChatThread`
`{ id✓, projectId✓, createdAt✓ (ISO) }`

### `ChatMessage`
| prop | tipo | req | note |
|---|---|---|---|
| id | string | ✓ | |
| threadId | string | ✓ | |
| role | `user\|assistant\|system` | ✓ | |
| content | string | ✓ | |
| createdAt | string ISO | ✓ | |
| operationId | string | ? | se ha generato un'operazione |

- **sendChatMessage** (futuro `POST /v1/projects/{id}/chat`): riceve `{ text }`, ritorna i **nuovi** messaggi `[userMsg, assistantMsg]`.

### `Operation`
| prop | tipo | req | note |
|---|---|---|---|
| id | string | ✓ | |
| projectId | string | ✓ | |
| type | OperationType | ✓ | sotto |
| params | object | ✓ | es. `{ percent: 30 }`, `{ tone: 'technical' }` |
| targetChapterIds | string[] | ? | rigenerazione parziale |
| derivedKind | DerivedKind | ? | per type='derive' |
| status | `pending\|running\|done\|failed` | ✓ | |
| resultingJobId | string | ? | |
| resultingVersionId | string | ? | |
| resultingProjectId | string | ? | per derive → nuovo figlio |
| createdAt | string ISO | ✓ | |

**OperationType**: `refine_chapter | reduce_length | expand | change_tone | make_technical | add_examples | update_chapters | add_sources | change_format | translate | derive`

---

## 10. Contenuto derivato — `DerivedContent` + payload per tipo

🟡 **AI: MOCK lato FE per ora**. È ciò che il server restituisce dopo aver
elaborato un derivato; il FE lo mostra in sola lettura.

### `DerivedContent`
| prop | tipo | req | note |
|---|---|---|---|
| kind | DerivedKind | ✓ | discrimina il payload |
| title | string | ✓ | |
| language | string | ? | solo per `translation` |
| paragraphs | string[] | ? | `summary`, `translation` |
| slides | Slide[] | ? | `slides` |
| quiz | QuizItem[] | ? | `quiz` |
| steps | ManualStep[] | ? | `manual` |
| cards | StudyCard[] | ? | `study_guide` |

- **Slide**: `{ title✓, bullets✓: string[] }`
- **QuizItem**: `{ question✓, options✓: string[], answerIndex✓ (0-based), explanation? }`
- **ManualStep**: `{ title✓, body✓ }`
- **StudyCard**: `{ front✓, back✓ }`

- **generateDerived** (futuro): `POST /v1/projects/{id}/derived` → `DerivedContent`
- **regenerateDerived** (futuro): `POST /v1/projects/{id}/derived/regenerate` riceve `{ feedback }` → `DerivedContent`

---

## 11. Billing / Abbonamento — `Subscription`

❌ **Greenfield** (serve provider, es. Stripe). Alimenta il gating "rielabora/deriva".

### `Subscription` (Dir `→FE`)
| prop | tipo | req | note |
|---|---|---|---|
| plan | Plan | ✓ | `free\|pro\|team` |
| status | `active \| past_due \| none` | ✓ | governa l'accesso |
| chancesLeft | number | ✓ | rielaborazioni residue/mese (se `active`) |
| currentPeriodEnd | string ISO | ? | |

- **getPlan / subscription**: `GET /v1/subscription` → sopra.
- **checkout**: `POST /v1/billing/checkout` riceve `{ planId }` o `{ kind:'single_project', projectId }` → `{ url }`.
- **portal** (regolarizza `past_due`): `GET /v1/billing/portal` → `{ url }`.

---

## 12. Riepilogo direzione (provide vs receive)

**Il backend FORNISCE (`→FE`, nelle GET):** AuthUser/me · ProjectTemplate(+parts/defaults/typography) · Project · Version(+outline/chapters/outputs) · Job(+steps/log) · Source · Subscription · (futuro) ChatMessage/Operation/DerivedContent.

**Il backend RICEVE (`FE→`, nei body):**
- Project: create `{title,kind,coverTheme?,settings?,sourceIds?}` · patch `{title?,settings?,sourceIds?,coverTheme?}`
- Generazione: generate / cancel / generateChapters (no body) · approvals `{approvedChapterIds}`
- Source: createNote `{name,content}` · upload `{name,sizeBytes,mime?}` · patch `{tags?,folder?,category?}`
- (futuro) chat `{text}` · derived/regenerate `{feedback}` · billing checkout `{planId|kind,projectId}`

**Stato sintetico:** ✅ reali = Project CRUD+generazione(stub), Version/Job(stub), Source/Library, /auth/me · 🟡 da allineare = Template(i18n), settingsSnapshot/outputs nelle Version, finalizzazione upload · ❌ mock/greenfield = Chat+Derivati AI, Plan/Subscription/Billing, Workspace/Member.

**i18n (🌐) vs server (📦):** il backend manda **codici/chiavi** per enum e label
(`nameKey/descKey/sourceKey`, `labelKey`, tutti gli enum) → tradotti dal FE; manda
**testo dinamico** solo per il contenuto (title, body, name, instructions, extract,
chat content, derivati). Le label statiche di UI vivono solo nel FE. Vedi §0.
