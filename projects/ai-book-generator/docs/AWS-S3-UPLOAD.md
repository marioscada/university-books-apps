# Upload fonti su AWS S3 (presigned PUT) — contratto FE ⇄ backend

Pipeline reale dei file utente (RAG): **caricati su S3 → ingest backend → `ready` →
disponibili all'AI** (generazione + chat). Documento di riferimento per il FE e i
**prerequisiti infrastrutturali** lato backend (CORS, firma), con citazioni dalla
doc ufficiale AWS.

## Flusso (FE)

1. `SourcesStore.createUpload(input, file, onProgress)` → `AwsApiService.createUpload`:
   1. `POST /v1/documents/presigned-url` `{ fileName, contentType, fileSize }`
      → `{ documentId, uploadUrl, expiresIn }`.
   2. **PUT dei byte su S3** verso `uploadUrl` via **XMLHttpRequest**
      (`core/data/s3-upload.ts`): solo `xhr.upload.onprogress` espone l'avanzamento
      reale dei byte (`fetch` no). Fuori da `HttpClient`/interceptor → **nessun
      Bearer Cognito** verso S3 (la URL è già autorizzata dalla firma).
   3. Ritorna `Source` in stato **`processing`** (ingest avviato).
2. `model-setup` fa **polling controllato** (`SourcesStore.ingestStatus`,
   `GET /v1/documents/{id}/ingest`): backoff esponenziale, timeout massimo (120s),
   nessun loop infinito → `ready` | `error`.
3. Stati UI fonte: `uploading` (% reale) → `processing` (ingest) → `ready` | `error`.
4. **Solo `ready` all'AI**: la generazione passa in `materialFileIds` /
   `instructionFileIds` **esclusivamente** gli id reali `ready`; se una fonte è
   ancora pending la generazione è **bloccata + avviso** (`sources.pendingWarn`).
   Le fonti sono linkate al **progetto**, quindi disponibili sia alla generazione
   sia alla chat.

## Vincolo Content-Type (causa #1 di 403)

Il **content-type della PUT deve coincidere ESATTAMENTE** con quello con cui il
backend firma la presigned URL. Il FE invia lo stesso valore alla richiesta
presigned e alla PUT (`resolveContentType` in `aws-api.service.ts`).

> "verify that all request parameters—including the HTTP method, headers, and query
> string—match exactly between URL generation and usage."
> — [AWS S3, presigned URL FAQ / SignatureDoesNotMatch](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)

**Prerequisito backend:** firmare la presigned URL con lo **stesso** `contentType`
ricevuto nel body (se incluso fra i `SignedHeaders`, il mismatch dà **403
SignatureDoesNotMatch**).

## Prerequisito CORS del bucket (PUT da browser)

La PUT con `Content-Type: application/pdf` **non è "simple"** → il browser invia un
**preflight OPTIONS**; senza CORS la PUT è bloccata (errore CORS opaco, status 0).
Configurazione minima del bucket (doc-backed):

```json
[
  {
    "AllowedOrigins": ["https://<origin-app>"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

> "The headers listed in the `Access-Control-Request-Headers` header in a pre-flight
> request must match the headers in the `AllowedHeaders` element."
> "Each `ExposeHeader` element identifies a header in the response that you want
> customers to be able to access … (for example, from a JavaScript `XMLHttpRequest`)."
> — [AWS S3, Elements of a CORS configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html)

`ExposeHeaders: ["ETag"]` serve a leggere l'ETag dalla risposta PUT (integrità /
multipart futuro).

## Matrice errori → UI

| Causa | Sintomo | Gestione FE |
|---|---|---|
| Content-type ≠ firmato | 403 SignatureDoesNotMatch | stato `error` + retry (prereq: firma backend) |
| URL scaduta | 403 | retry ri-richiede una presigned fresca |
| CORS bucket mancante | errore opaco, status 0 | stato `error`; **prereq infra**, non aggirabile dal FE |
| Rete | status 0 | stato `error` + retry |
| Ingest fallito / timeout | poll → `failed`/timeout | stato `error` |

## Limiti e prossimi passi

- **PUT singolo** regge fino a 5 GB → sufficiente per PDF/DOCX (max backend 100 MB).
- **Multipart** (`/v1/documents/multipart/*`, parti ≥ 5 MB) solo per file molto
  grandi / ripresa: step separato successivo, non blocca la fase 1.
- **Integrità** (opzionale, SigV4): checksum header (CRC32/SHA-256) se il backend
  firma la presigned URL con l'header di checksum.
- **Retry UI** sulle fonti in `error`: bottone di ritentativo sul chip.
