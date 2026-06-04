# create/new — architettura del flusso dati (STRATEGIA APPROVATA)

> Stato: **approvata** (da implementare in seguito — *non ora*). Quando clicco
> **Genera indice**, il padre ha **già tutto** e fa **una sola** chiamata API col
> pacchetto di configurazione. Niente file binari in quella chiamata: i file sono
> già su storage e si passano per **riferimento**.
> Fonti/best practice: Angular (smart container / dumb components, signals,
> `output()`), AWS S3 (**presigned URL upload** + **S3 Lifecycle**).

## 1. Quando il padre riceve i dati (mirroring in tempo reale)
Pattern **smart container / dumb components**: i componenti **emettono**, il padre
(pagina = container intelligente) **tiene lo stato** (signals) e **decide**.

| Cosa | Quando arriva al padre |
|---|---|
| Titolo, descrizione, note, brief (select) | **in tempo reale**, ad ogni `valueChange`/selezione |
| Ritocchi al modello (documentLength / structure / typography) | **alla conferma** (Applica) dell'editor; il padre confronta col default e decide "modificato" |
| File (descrizione e fonti) | **appena caricati su staging**: il padre riceve i `Source { id, stato }` (vedi §2) |

→ Al click **Genera indice** il padre **non raccoglie nulla all'ultimo**: ha già lo
stato completo. Fa **1** chiamata: `POST /projects (config + sourceIds)`.

## 2. File — strategia APPROVATA: Opzione A (upload immediato su staging)
Pattern più solido: il browser carica **direttamente su S3** tramite **presigned
URL**, senza far passare il binario dal backend; accesso temporaneo e limitato.

### Flusso completo (approvato)
```
file selected (utente sceglie i file → il componente dumb emette: solo selezione locale)
  → 1. backend crea una PRESIGNED PUT URL
  → 2. browser carica su S3:  s3://bucket/staging/{userId}/{draftId}/{uuid}/<file>
  → 3. backend salva i METADATA del file (record Source { id, nome, tipo, size, stato })
  → 4. submit finale ("Genera indice") COLLEGA quei file al progetto (sourceIds)
  → 5. se l'utente ELIMINA prima dell'invio: DELETE reale dell'oggetto staging
  → 6. se ABBANDONA: una S3 Lifecycle rule pulisce dopo 24–48h (expiration)
```
- **Saturazione S3 risolta** dalla **S3 Lifecycle** (regole automatiche sugli oggetti,
  inclusa expiration/eliminazione) sul prefisso `staging/` → niente orfani permanenti.
- Pro: scalabile (server fuori dal binario), progress/validazione subito, parallelo,
  resumable (multipart).

### Stato lato componente vs lato padre (naming preciso)
- **Componente dumb** (`SourceDropzone`): conosce solo la **selezione locale** →
  emette **`filesSelected`** (i `File` grezzi). Non carica, non decide. Riceve indietro
  l'elenco da mostrare (con **stato** `in-caricamento → pronto`) ed emette la richiesta
  di rimozione `itemRemove(id)`.
- **Padre smart**: dopo l'upload li tiene come **`stagedSources`** (`Source { id, nome,
  stato }`) — **non più "selected"**, sono già **staged/disponibili**.

## 3. Cosa passiamo al backend su "Genera indice"
**JSON di configurazione + riferimenti**, mai binari:
```jsonc
POST /projects
{
  "title": "…",
  "brief": { "topic": "…", "goal": "...", "audience": "...", "tone": "...", "language": "it" },
  "outputFormats": ["pdf","docx"],
  "templateId": "book",
  "customizations": { /* solo gli scostamenti dal modello, §4 */ },
  "sourceIds": ["src-…","src-…"]   // file già su S3 staging → "commit"/collega al progetto
}
```

## 4. Naming — APPROVATO
Evitiamo `length` (confonde con `array.length`) e termini opachi.

| Prima | Approvato |
|---|---|
| `Modifications` | **`Customizations`** (gli scostamenti dell'utente dal modello) |
| `length` (area Lunghezza) | **`documentLength`** |
| `style` (area Font e stile) | **`typography`** |
| `structure.excluded` | **`structure.excludedParts`** |
| lunghezza: `value` / `unit` | **`amount`** / **`unit`** (`'pages' | 'words'`) |
| evento dropzone `filesAdded` | **`filesSelected`** (selezione locale) |
| stato padre delle fonti | **`stagedSources`** (dopo upload, non più "selected") |

> Regola: nomi che dicono **il significato di dominio**, comprensibili a un nuovo
> sviluppatore senza spiegazioni.

## 5. Tipi di file accettati — da decidere (2 livelli)
- **Client (`accept`)** = solo hint/filtro UX. Allow-list proposta:
  `PDF · DOCX · DOC · PPTX · TXT · MD · CSV · XLSX · PNG · JPG · WEBP`.
- **Backend (presigned policy)** = **autoritativo**: impone i content-type ammessi e
  la **dimensione massima** (es. ≤ 50 MB) nella firma S3, così il client non aggira i limiti.
- Aperto: lista definitiva dei tipi + dimensione max + (eventuale) scan antivirus in ingest.

## 6. Decisioni prese
1. **Upload = Opzione A** (staging immediato + presigned S3 + S3 Lifecycle TTL). ✓
2. **Naming** come §4. ✓
3. **NON** implementare ora l'interazione col server: questa è solo la **strategia**.
   Implementazione (presigned, `SourcesStore`, status, commit, lifecycle) in seguito.
