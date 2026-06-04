# Strategia upload fonti (S3) — punto aperto da approfondire

## Problema
Se carichiamo i file **subito** su S3 (staging) appena l'utente li allega, ma poi
l'utente **chiude/abbandona** senza cliccare "Genera indice / Invia", quei file
restano su S3 **senza essere mai usati** → nel tempo S3 **satura** di file orfani
(costo + disordine).

## Opzioni (da valutare, robustezza + costo + UX)
1. **Upload immediato su staging + lifecycle TTL (consigliata da approfondire)**
   - File caricati subito in `s3://bucket/uploads/staging/<user>/<uuid>/…`.
   - **Lifecycle policy S3** sul prefisso `staging/`: auto-elimina dopo N ore/giorni
     (es. 24–48h) tutto ciò che non è stato "committato" → niente orfani permanenti.
   - Su "Invia": si **promuovono** i file (move/copy staging→permanente, o solo si
     marca `committed`) e si scrivono i `sourceIds` sul progetto.
   - ✕ (elimina prima dell'invio) → `DELETE` reale dell'oggetto staging.
   - Pro: UX migliore (upload in background, progress, validazione precoce, parallelo,
     resumable). Contro: serve la lifecycle + logica di "commit".

2. **Upload differito (solo alla submit)**
   - I `File` restano in **memoria browser**; si caricano **solo** al click "Invia".
   - Pro: zero orfani su S3 (niente caricato finché non confermi). Contro: UX peggiore
     (attesa lunga alla submit, niente progress prima, rischio perdita su refresh,
     limiti dimensione in memoria).

3. **Ibrido**: upload immediato ma con **conferma di sessione**
   - Tracciare le sessioni/draft: un job periodico (o lifecycle) pulisce gli staged
     non associati a una draft attiva.

## Domande aperte (da decidere insieme)
- TTL del prefisso staging? (24h? 7g?)
- "Commit" = move S3 staging→permanente, oppure stesso oggetto marcato `committed`?
- Dedup / antivirus-scan in fase di ingest?
- Limiti: dimensione max per file, n° max file, tipi ammessi (lato presigned policy).
- Resumable upload (multipart) per file grandi?

## Stato attuale nel codice (mock, già predisposto)
- `ApiPort.createUpload(input)` → oggi mock ritorna `Source { id, ingestStatus:'ready' }`;
  domani = presigned S3 PUT (staging) + record.
- `ApiPort.deleteSource(id)` → la ✕ (elimina staging).
- `Source.ingestStatus` (`uploading|ready|…`), `Project.sourceIds` (commit su invio).
- Componente dumb `SourceDropzone` emette `File[]` (binario), riceve `items{id,name,
  status}`; il padre (smart/`SourcesStore`) carica/cancella e tiene gli id.

> DA APPROFONDIRE: scegliere fra opzione 1/2/3, definire TTL e "commit", e cablare
> `SourcesStore` al presigned-upload reale quando il backend AWS è pronto.
