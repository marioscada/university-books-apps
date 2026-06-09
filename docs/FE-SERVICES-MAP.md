# FE Services Map — ai-book-generator

> Mappa dei **servizi ufficiali** del frontend, uno per uno: responsabilità, cosa
> contiene (stato/signals), cosa fa (metodi), quali endpoint backend consuma e
> stato (reale vs mock). Architettura signals-first (Angular 19 + @ngrx/signals).
>
> **Flusso dati:** `Component (dumb)` → `Store (signals, smart)` → `API_PORT` →
> `AwsApiService (HTTP reale)` → backend. L'auth viaggia via Amplify/Cognito;
> l'`authInterceptor` aggiunge il Bearer. Le label 🌐 (chiavi/enum) le traduce
> l'i18n (`TranslateService`), il contenuto 📦 arriva dal server.
> Data: 2026-06-08.

---

## A. Data layer

### 1. `ApiPort` (interface) — `core/data/api-port.ts`
- **Cos'è:** il contratto unico verso il backend (29 metodi Promise-based). Gli store dipendono da QUESTO, non dall'implementazione.
- **Token DI:** `API_PORT`. Switch dell'implementazione in `app.config.ts` senza toccare store/UI.
- **Gruppi di metodi:** Templates (list/get) · Projects (list/get/create/patch/generate/cancel/publish/archive/reopen/duplicate/delete/derive) · Versions (getCurrentVersion/generateChapters) · Jobs (getJob) · Sources (list/get/createNote/createUpload/patch/delete/getIngestJob) · Chat (list/send) · Derived (generate/regenerate) · Plan (getPlan).

### 2. `AwsApiService implements ApiPort` — `core/data/aws-api.service.ts` ⭐ (reale)
- **Cosa fa:** chiama il backend reale via `HttpClient` su `environment.api.baseUrl`. Adapter ibrido: reale dove il backend è pronto, delega a `MockApiService` il resto.
- **Reali (HTTP):** `listProjects/getProject/createProject/patchProject/generate/cancel/deleteProject/getJob/getCurrentVersion/generateChapters` → `/v1/projects/*`; `listSources/createNote/patchSource/deleteSource` → `/v1/documents/*`.
- **Mapping:** `Project` 1:1 (pass-through); `Job`/`Version` normalizzati (campi assenti → default).
- **Delegati a mock (per ora):** templates, `getSource`, `createUpload` (presigned), `getIngestJob`, chat, derivati AI, `getPlan`, publish/archive/reopen/duplicate/derive.
- **Stato:** creato, **da collegare** al provider `API_PORT` (oggi ancora mock).

### 3. `MockApiService implements ApiPort` — `core/data/mock-api.service.ts` (legacy)
- **Cosa fa:** implementazione mock completa su dati `*-seed.ts`. Resta come **fallback** dei metodi non ancora reali; va **dismessa** man mano. I seed (`mock-seed/templates-seed/workspace-seed/derived-seed`) sono dati finti da abolire.

---

## B. Stores (smart, @ngrx/signals — stato dell'app)

### 4. `ProjectsStore` — `core/state/projects.store.ts`
- **Contiene:** entità `Project[]` (withEntities) + flag loading.
- **Computed:** `activeProjects`, `needsAttention` (status=review), `publishedProjects`.
- **Fa:** carica la lista/dettaglio, crea/patcha, avvia `generate` con **polling reattivo del Job** (`rxMethod` + `takeWhile` finché running), cancel/publish/archive/reopen/duplicate/delete/derive.
- **Consuma:** `listProjects/getProject/createProject/patchProject/generate/cancel/getJob/…` → `/v1/projects/*`.

### 5. `WorkspaceStore` — `core/state/workspace.store.ts`
- **Cos'è:** sessione di editing dello **Studio** del progetto attivo.
- **Contiene:** `version` corrente, `messages` (chat), `derived`, flag (`generating/genProgress/publishing/…`), `approvedChapterIds`.
- **Computed:** `chapters`, `approvedCount`, `chaptersReady`.
- **Fa:** `load(projectId)` (version + chat), `sendChat`, `generateChapters`, `toggleApproved/approveAll` (→ persistere via `approvals`), `publish`, `generateDerived/regenerate`.
- **Consuma:** `getCurrentVersion/generateChapters/listChatMessages/sendChatMessage/publish/generateDerived` (+ futuro `approvals`).

### 6. `SourcesStore` — `core/state/sources.store.ts`
- **Contiene:** entità `Source[]` (Library).
- **Fa:** lista con filtri (folder/tag/q), `createNote`, `createUpload`, `patchSource`, `deleteSource`, stato ingest.
- **Consuma:** `listSources/getSource/createNote/createUpload/patchSource/deleteSource/getIngestJob` → `/v1/documents/*`.

### 7. `TemplatesStore` — `core/state/templates.store.ts`
- **Contiene:** `templates` (ProjectTemplate[]).
- **Computed:** `templateById`.
- **Fa:** carica i modelli per la galleria Create / personalizzazione.
- **Consuma:** `listTemplates/getTemplate` → `/v1/templates` (🟡 mapping i18n da allineare).

---

## C. Auth & config

### 8. `AuthService` — `auth/services/auth.service.ts`
- **Cosa fa:** autenticazione via **AWS Amplify/Cognito** (non REST): `signIn$/signOut$/signUp/confirmSignUp/resetPassword/confirmResetPassword`, `getAccessToken`, `initializeAuth` (APP_INITIALIZER).
- **Contiene:** signal `state` `{ isAuthenticated, user: AuthUser, loading, error }`.
- **Consuma:** Cognito (token) + `GET /v1/auth/me` (profilo). Il token alimenta l'`authInterceptor`.
- **Stato:** ✅ reale.

### 9. `BillingService` — `core/services/billing.service.ts`
- **Contiene:** signal `status` (`active|past_due|none`), `chancesLeft`; computed `canReuse`.
- **Fa:** governa il **gating** (rielabora/deriva): se non `active` → upsell.
- **Consuma:** futuro `GET /v1/subscription` + checkout. **Stato:** ❌ mock.

### 10. Config — `core/config/*`
- `amplify.config.ts`: configura Cognito (userPoolId/clientId dal `environment`). ✅
- `api-client.config.ts`: `OpenAPI.BASE`/`TOKEN` per il client generato (token = accessToken Cognito). Ponte verso il client tipizzato.
- `runtime.config.ts`: config a runtime.

---

## D. UI / cross-cutting (NON dati)

### 11. `LocaleService` + i18n (`TranslateService`) — `shared/services/locale.service.ts`
- **Cosa fa:** lingua corrente + **traduzione delle chiavi/enum 🌐** (template `nameKey/descKey`, `labelKey`, valori enum → label). Il backend manda codici, QUI diventano testo. File `it/en/de`.

### 12. `BreakpointHelperService` — `shared/services/breakpoint-helper.service.ts`
- **Cosa fa:** stato responsive (breakpoint globali) per l'auto-adattamento dei componenti. Nessun dato di dominio.

---

## E. Piano di switch mock → reale (de-mock)
1. Collegare il provider: `{ provide: API_PORT, useExisting: AwsApiService }` in `app.config.ts`.
2. Verificare end-to-end i flussi reali (Projects CRUD, generate→job→version→chapters, Library).
3. Allineare Templates (i18n) e finalizzazione upload lato backend, poi spostarli da mock a reale.
4. Tenere su mock SOLO chat + derivati AI (concordato) finché la pipeline AI non è cablata; Billing finché non c'è il provider.
5. Abolire progressivamente i `*-seed.ts` e `MockApiService` quando ogni metodo è reale.
