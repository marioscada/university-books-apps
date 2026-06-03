# UI Spec — Creazione progetto & Generazione

### SCADÁ AI Books Generator · Angular + Angular Material (M3)

> Spec di dettaglio delle interfacce fornite dai mockup. Copre il **wizard "Nuovo
> progetto"** (4 step) e l'intero **flusso di generazione** con tutte le azioni
> disponibili. Riferimento visivo: pattern Vercel/Linear/Stripe/Notion.
>
> **Stato implementazione** (giugno 2026):
> - ✅ Wizard "Nuovo progetto" (4 step) — implementato (`pages/project-new`).
> - ⏳ Schermata "Generazione in corso" + 7 azioni — da implementare (fase F5/F6,
>   sul `Project Workspace` stato `processing`).

---

## 0. Design system & principi (validi per tutte le schermate)

- **Material M3** (`mat.theme()` globale) come base; componenti Material ovunque,
  stile dal tema globale (i `*.component.scss` contengono solo layout-glue).
- **Accento**: l'app usa `--accent-500 = #039FCE` (coerenza con tutto il prodotto).
  *Nota: i mockup mostrano un blu `#2f6df6`; la decisione presa è mantenere #039FCE
  globale — a un token di distanza se si volesse adottare il blu.*
- **Layout 2 colonne**: colonna configurazione (~62%) + **Live Preview** sticky
  (~35%) che si aggiorna in tempo reale. Su mobile la preview collassa in alto.
- **Header pagina compatto** (~80–96px): H1 forte + sottotitolo su una riga.
- **Footer sticky** sempre visibile: Indietro · Salva bozza · Avanti/Genera.
- Pochissimi bordi, molto whitespace, elevazione leggera; l'accento guida solo CTA
  e stato selezionato.
- **a11y**: `radiogroup`/`radio` sulle selection card, `aria-current` sullo step,
  focus visibile, navigazione da tastiera, contrasto AA.
- **i18n**: ogni testo è chiave flat dot-path in `public/i18n/{en,it,de}.json`.
- **Dominio**: ogni schermata riflette `Project.status` + `Job` (vedi
  `PRODUCT-ARCHITECTURE.md §1.2/§1.4/§2`). Nessuno stato inventato fuori dalla
  state machine.

---

## A0. Pagina «Crea» — entry/launcher di creazione (`/create`)

> ✅ **Decisione**: `/create` = **launcher in alto** (questa UI) **+ sezione
> "Continua a creare"** (i progetti vivi della dashboard attuale) **sotto**, nella
> stessa pagina. I **modelli** sono resi con **dati mock** (cover + meta) che
> precompilano il wizard; il tipo dominio `ProjectTemplate` si formalizza dopo.

- Header: **"Crea"** + *"Trasforma le tue idee e le tue fonti in libri completi con
  l'aiuto dell'intelligenza artificiale."*
- **Inizia da zero**: card larga **"Nuovo progetto da zero"** + *"Crea un progetto
  partendo da una pagina vuota."* (icona + chevron) → apre il wizard (`/create/new`).
- **Scegli un tipo di progetto**: riga orizzontale di card-tipo (Libro · Manuale ·
  Guida · Report · Tesi/Accademico), ognuna: **icona + titolo + descrizione + hint**
  (es. "6–12 capitoli", "5–10 sezioni", "Struttura accademica") + freccia → wizard
  con `kind` **preselezionato** (+ smart defaults).
- **Ispirati a un modello**: riga di card-modello con **cover immagine** (es. "Guida
  introduttiva all'Intelligenza Artificiale — Libro · 12 capitoli"; "Manuale di
  Fotografia Digitale — Manuale · 7 sezioni"; "Marketing Digitale — Guida · 12
  sezioni"; "Analisi di Mercato 2024 — Report · 14 sezioni"; "Tesi: IA e
  Apprendimento Automatico — Accademico") + bottone **"Usa modello"** → wizard
  precompilato dal template.
- **Banner "Non sai da dove iniziare?"**: *"Raccontaci la tua idea in poche parole e
  ti suggeriremo il tipo di progetto più adatto."* + **"Ottieni suggerimenti"**
  (flusso AI di suggerimento tipo).

Mapping dominio: "tipo" e "modello" **preselezionano** `ProjectKind` + `ProjectSettings`
nel wizard. I **modelli/template** sono un concetto **nuovo** (non ancora nel dominio):
da modellare (`ProjectTemplate`) in fase dedicata. La AI-suggestion è un'operazione
tipizzata futura.

---

## A. Wizard "Nuovo progetto" — 4 step + Opzioni avanzate

Header: **"Nuovo progetto"** + sottotitolo *"Configura cosa vuoi generare, le fonti
da utilizzare e come dovrà essere prodotto il risultato finale."*
Progress custom a 4 segmenti (Obiettivo · Fonti · Istruzioni · Genera): step
completati cliccabili, attivo evidenziato in accento.

### Live Preview panel (colonna destra, tutte le step)
Badge **"In tempo reale"**. Mostra e aggiorna live: Tipo di progetto · Titolo
(o "Non impostato") · Fonti (n° file + dimensione totale) · Capitoli stimati ·
Modalità AI · Output (formati) · Lingua · **cover del libro** generata col titolo
+ testo "Copertina generata automaticamente / L'anteprima si aggiorna mentre
configuri il progetto". In fondo nota: *"I suggerimenti e i valori stimati si basano
sulle tue scelte e potranno variare."*

### Step 1 — Obiettivo
- Titolo card: **"Che cosa vuoi creare?"** + *"Scegli il tipo di pubblicazione che
  l'AI dovrà generare."* (icona `track_changes`).
- **Selection Cards** in griglia (4 col desktop / 2 mobile), una per `ProjectKind`:
  Libro · Riassunto · Manuale · Guida allo studio · Relazione di ricerca · Corso di
  formazione · Documentazione · Personalizzato. Ogni card: **icona + titolo +
  descrizione breve**; stato selezionato = ring accento + check.
- Campo **"Titolo del progetto *"** (`mat-form-field` outline) + hint *"Potrai
  modificarlo successivamente."*
- Alla scelta del tipo → **smart defaults** (modalità, capitoli, bibliografia,
  formati) precompilati, finché l'utente non tocca "Opzioni avanzate".

### Step 2 — Fonti
- Titolo: **"Da quali materiali vuoi partire?"** + *"Carica nuovi contenuti oppure
  seleziona materiali già presenti nella tua libreria."* (icona `folder_open`).
- **Tab**: `Carica nuovi file` | `Libreria`.
  - **Carica nuovi file**: dropzone drag&drop *"Trascina i file qui oppure clicca
    per sfogliare"* + hint *"PDF, DOCX, PPTX, immagini, audio, CSV — max 200MB per
    file"* + bottone **"Seleziona file"**. Sotto, **"File caricati (n)"**: lista con
    icona-tipo, nome, `tipo · dimensione`, **chip stato "Pronto"** (verde), azioni
    anteprima (occhio) e elimina. Bottone **"+ Aggiungi URL"**.
  - **Libreria**: ricerca + materiali esistenti come **card con selezione multipla**
    (checkbox visivo sulla card).
- Empty state curato quando non c'è nulla.
- Il contatore fonti alimenta il Live Preview (es. *"3 file caricati · 36,3 MB"*).

### Step 3 — Istruzioni
- Titolo: **"Cosa deve fare l'AI?"** + *"Scrivi le istruzioni e il contesto che
  guideranno la generazione dei contenuti."* (icona `edit_note`).
- **Textarea** estesa (auto-resize), placeholder *"Descrivi cosa deve generare l'AI,
  il tono, il pubblico di riferimento, gli obiettivi e gli aspetti che ritieni più
  importanti."* + contatore **"n / 4000 caratteri"** + bottone **"Suggerimenti AI"**
  (split-button).
- **"Prompt suggeriti"** (*"Seleziona un prompt per iniziare più velocemente."*):
  riga scrollabile di card con testo + bottone **"+ Usa"** (riempie/appende la
  textarea). Suggerimenti contestuali al tipo scelto.
- **"Opzioni avanzate"** (`mat-expansion-panel`, collassato): contiene
  **Modalità AI** (selection cards), **Struttura** (capitoli, lunghezza, profondità
  + toggle Bibliografia/Glossario/Quiz/Esercizi/Appendici/Tabelle/Immagini) e
  **Output** (formati come selection cards multi + lingua). Default professionali
  per tipo; modalità `Deep Research`/`Academic` con badge **"Pro"** e disabilitate
  in piano `free`.

### Step 4 — Genera (Riepilogo)
- Titolo: **"Riepilogo del progetto"** + *"Tutto è pronto! Controlla i dettagli qui
  sotto. Puoi modificare qualsiasi sezione prima di generare."* (icona
  `rocket_launch`) + bottone **"Modifica"** globale.
- **Griglia di 6 card riepilogo**, ognuna con icona + campi e link "Modifica" →
  step relativo:
  1. **Obiettivo**: Tipo di progetto · Titolo.
  2. **Fonti**: Totale file (n + dimensione) · Tipologia (chip PDF/DOCX/PPTX + URL).
  3. **Istruzioni**: Lunghezza istruzioni (caratteri) · Prompt suggeriti (n) ·
     "Visualizza istruzioni".
  4. **Modalità AI**: Modalità selezionata (chip "Balanced") + descrizione.
  5. **Struttura**: Capitoli stimati (es. "8–12") · Include (icone dei contenuti
     attivi + "+n").
  6. **Output**: Formato (PDF) · Lingua (Italiano).
- **Barra "Stima generazione"**: *"In base alla modalità selezionata e alla quantità
  di fonti."* + **Tempo stimato** (~6–8 min) + **Costo stimato** (es. 12 crediti).
- **"Opzioni avanzate"** (collassabile) — impostazioni aggiuntive di generazione.
- Live Preview: badge **"Pronto per la generazione"** + cover + riepilogo + box
  verde **"Qualità garantita"** (*"I contenuti saranno generati con la massima
  qualità possibile in base alle tue fonti."*).
- Footer: Indietro · Salva bozza · **"Genera progetto"** (CTA grande, sottotitolo
  *"Inizia la generazione con l'AI"*).
- Nota di sicurezza a piè pagina: *"I tuoi dati sono al sicuro. Nessun contenuto
  verrà condiviso con terze parti."*

### Footer wizard (sticky, tutte le step)
`[ ← Indietro ]   [ Salva bozza ]   [ Avanti → ] / [ ✦ Genera progetto ]`
- "Avanti" → "Genera progetto" nell'ultimo step.
- "Avanti" disabilitato se lo step non è valido, con `mat-tooltip` esplicativo.
- **Autosave bozza** in background (debounce) oltre al bottone esplicito.

---

## B. Schermata "Generazione in corso" (Workspace · stato `processing`)

Accessibile dopo "Genera progetto" → `/project/:id` con `status = processing`.
Layout 2 colonne: **colonna sinistra** (stato + azioni, ~65%) + **Anteprima
progetto** sticky a destra (~35%). Bande: header su bianco, corpo su slate.

### B.1 Header pagina (compatto)
- Icona **✦** (sparkle, accento) a sinistra del titolo.
- **H1: "Generazione in corso"** (peso forte, ~2rem).
- Sottotitolo (1 riga, grigio): *"L'AI sta generando i tuoi contenuti. Puoi
  lasciare questa pagina: ti avviseremo al termine."*
- Due **chip pill outlined** con icona (sotto il sottotitolo):
  - 🕐 *"Tempo stimato: 6–8 min"* (da `Job.etaSeconds`)
  - 🕐 *"Iniziato: oggi, 10:42"* (da `Job.startedAt`)

### B.2 Card "Stato generazione"
Card bianca, bordo sottile, padding generoso.
- Titolo sezione **"Stato generazione"** (bold).
- **Stepper orizzontale a 5 segmenti** con linee di connessione:
  | # | Step (label) | Pallino | Stato sotto-label | Colore |
  |---|---|---|---|---|
  | 1 | Analisi delle fonti | cerchio pieno accento + ✓ bianco | **Completato** | verde `--site-success` |
  | 2 | Pianificazione struttura | cerchio pieno accento + ✓ | **Completato** | verde |
  | 3 | Generazione contenuti | cerchio accento + **spinner** | **In corso…** | accento |
  | 4 | Revisione e coerenza | cerchio grigio + **＋** | **In attesa** | grigio |
  | 5 | Impaginazione e output | cerchio grigio + ＋ | **In attesa** | grigio |
  - **Connettori**: segmenti completati = accento pieno; da fare = grigio
    (`--card-border-color`). La linea cresce col progresso.
- **Progress bar** (sotto lo stepper): riempita ~accento fino alla %; a destra
  testo **"58% completato"** (da `Job.progress`).
- **Box "Operazione in corso"** (sfondo azzurro tenue `--accent-100` al ~40%,
  angoli arrotondati):
  - Riga label: ✦ **"Operazione in corso"** (accento).
  - Titolo (bold): *"Stiamo scrivendo il Capitolo 4: Algoritmi di apprendimento"*.
  - Sottotesto (grigio): *"Analisi, sintesi e generazione contenuti in corso…"*.
  - A destra: bottone **"Visualizza log"** (`mat-stroked-button`, icona lista) →
    apre il modal log (vedi §C.1).

### B.3 Card "Azioni disponibili"
Card bianca separata. Titolo **"Azioni disponibili"** + **3 azioni-card** in riga
(ognuna: pastiglia-icona circolare + titolo bold + descrizione + chevron `›`,
cliccabile su tutta la card):
1. ⏸️ (icona pausa, bg azzurro) **"Metti in pausa"** — *"Pausa temporaneamente la
   generazione."* → §C.2
2. ✏️ (icona edit, bg azzurro) **"Modifica progetto"** — *"Torna indietro e modifica
   le istruzioni o le fonti."* → §C.3
3. ⏹️ (icona stop, **bg rosso** `--mat-sys-error` tenue) **"Annulla generazione"** —
   *"Interrompi e rimuovi il progetto."* → §C.4 (dialog di conferma)

### B.4 Nota privacy (piè della colonna sinistra)
Icona scudo + **"I tuoi dati sono al sicuro"** (bold) + *"Le tue fonti e i contenuti
generati sono privati e crittografati. Nessun contenuto verrà condiviso con terze
parti."*

### B.5 Pannello "Anteprima progetto" (colonna destra, sticky)
- Titolo **"Anteprima progetto"** + **badge "In generazione"** (pill verde tenue).
- **Cover del libro** (3D, blu scuro con onda): titolo del progetto in maiuscolo
  (es. "L'INTELLIGENZA ARTIFICIALE SPIEGATA SEMPLICE") + sottotitolo
  ("Comprendere l'AI nel mondo reale"); a destra della cover un breve testo
  descrittivo (*"Guida completa per comprendere l'intelligenza artificiale con
  esempi pratici e linguaggio chiaro."*).
- **Lista riepilogo** (icona + label + valore): Tipo di progetto = **Libro** ·
  Capitoli stimati = **8–12** · Fonti = **3 file (36.3 MB)** · Modalità AI =
  **Balanced** · Formato = **PDF** · Lingua = **Italiano**.
- **Box notifica** (azzurro tenue): 🔔 *"Ti avviseremo non appena la generazione
  sarà completata."* + *"Puoi chiudere questa pagina."*

### B.6 Mapping dominio
- Step stepper = `Job.steps[].labelKey` + `status` (`done`/`running`/`pending`).
- Progress = `Job.progress`; ETA = `Job.etaSeconds`; inizio = `Job.startedAt`.
- "Operazione in corso" = step `running` (`currentStepKey`) + dettaglio capitolo.
- Lo stepper a **5 step** richiede di estendere il mock `GENERATE_STEPS` (oggi 4:
  analyze/outline/chapters/render) a 5: **analyze · outline · chapters · review ·
  render** con label i18n `i18n.Job.Step.{analyze,outline,chapters,review,render}`.

---

## C. Le 7 azioni della schermata di generazione

> Regola trasversale: **in tutti i casi tranne "Annulla generazione", la
> generazione continua in background**; l'utente riceve una notifica al termine e
> ritrova il progetto in "I miei progetti".

### 1. Visualizza log
*"Mostra il log dettagliato di tutte le operazioni in corso."*
- **Modal "Log di generazione"** (overlay) con righe timestamp + messaggio, la riga
  corrente evidenziata in accento, esempio:
  - `10:42:15` Iniziata analisi delle fonti (3 file)
  - `10:42:18` Estrazione testo e metadati completata
  - `10:42:33` Pianificazione struttura: 10 capitoli stimati
  - `10:42:47` Generazione Capitolo 1: Introduzione… completata
  - `10:43:12` Generazione Capitolo 2: Fondamenti… completata
  - `10:43:48` Generazione Capitolo 3: Algoritmi di base… completata
  - `10:44:21` **Generazione Capitolo 4: Algoritmi di apprendimento… in corso** ✦
  - `10:44:22` Ottimizzazione contenuti e coerenza — in attesa
  - `10:44:22` Impaginazione e output — in attesa
- Bottone **"Chiudi"**. Mapping: `Job.log[]` (`at`, `level`, `message`).

### 2. Metti in pausa
*"La generazione viene messa in pausa e potrai riprenderla quando vuoi."*
- Header diventa **"Generazione in pausa"** + *"La generazione è in pausa. Puoi
  riprenderla quando vuoi."*
- Chips: **"Tempo rimanente: ~3–4 min"** · **"Messo in pausa: oggi, 10:46"**.
- "Stato generazione": lo step corrente passa a **"In pausa"** (anziché In corso);
  progress invariato (58%). Box **"Ultima attività completata"**.
- Bottoni: **"Elimina progetto"** (rosso, a sinistra) · **"Riprendi generazione"**
  (accento, a destra).
- Mapping: introduce `JobStatus = 'paused'` (estensione) o si modella come `Job`
  fermo con flag; "Riprendi" → ripresa job; "Elimina" → cancel + delete progetto.

### 3. Modifica progetto
*"Torna alla configurazione per modificare istruzioni, fonti o impostazioni."*
- Header **"Modifica progetto"** + *"Puoi modificare le impostazioni del progetto.
  La generazione riprenderà da capo."*
- Riapre il **wizard in modalità modifica** (progress Obiettivo/Fonti/Istruzioni/
  Genera, di solito su Istruzioni) con i campi **precompilati** (es. textarea piena
  + contatore "217 / 4000 caratteri").
- Footer: **"Annulla e torna indietro"** · **"Salva modifiche"** (accento).
- Live Preview: badge **"In modifica"**.
- Mapping: `processing → review/draft` per editing, nuova generazione = nuovo `Job`
  (la versione riparte). Riusa il wizard esistente con `?draft=:id` in edit-mode.

### 4. Annulla generazione
*"La generazione viene interrotta e il progetto viene annullato."*
- **Dialog di conferma "Annulla generazione?"** + *"Sei sicuro di voler annullare la
  generazione? Il lavoro svolto andrà perso."*
- Bottoni: **"No, continua"** · **"Sì, annulla"** (rosso).
- È **l'unico caso** che NON continua in background. Mapping: `cancel(id)` →
  `processing → draft` o eliminazione, stop `Job`.

### 5. Torna alla dashboard
*"Torna alla dashboard progetti lasciando la generazione in background."*
- Sulla schermata di generazione compare un **avviso verde**: *"La generazione
  continuerà in background — Riceverai una notifica quando sarà completata."*
- Bottoni: **"Rimani qui"** · **"Vai alla dashboard"** (accento → `/create`).

### 6. Visualizza anteprima
*"Apre l'anteprima dinamica che si aggiorna con i contenuti generati."*
- Header **"Anteprima in tempo reale"** + *"L'anteprima si aggiorna man mano che
  l'AI genera i contenuti."*
- **Tab**: `Anteprima libro` | `Indice` | `Statistiche`.
  - **Anteprima libro**: pagina del libro renderizzata (es. *"CAPITOLO 4 — Algoritmi
    di apprendimento"* con testo + diagramma) + navigazione **"Capitolo precedente |
    4 / 10 | Capitolo successivo"**.
  - **Indice**: struttura/outline dei capitoli.
  - **Statistiche**: metriche del contenuto generato.
- Pannello destro **"Progresso generazione — 58% completato"** con la lista dei 5
  step e relativo stato (Completato/In corso/In attesa).
- Mapping: `Version.chapters[]` (anche in stato `generating`), `Version.outline`.

### 7. Chiudi pagina
*"Se chiudi la pagina, la generazione continua in background."*
- **Card/modal** con icona cloud: **"Puoi chiudere questa pagina"** + *"La
  generazione continuerà in background e ti avviseremo non appena sarà completata."*
- Riga **"Notifiche attive: email e notifiche push"**.
- Bottone **"Chiudi pagina"** (accento).

---

## D. Background generation & notifiche

> *In tutti i casi (tranne Annulla generazione), la generazione continua in
> background. Riceverai una notifica quando sarà completata e troverai il progetto
> nella sezione "I miei progetti".*

Tre canali:
- **Email** — *"Ti invieremo un'email quando il progetto sarà pronto."*
- **Notifiche push** — *"Riceverai una notifica sul tuo dispositivo."*
- **I miei progetti** — *"Troverai il progetto completato nella tua dashboard."*

Mapping dominio: alla transizione `processing → review|failed` parte la notifica
(in-app: badge/centro notifiche; futuro: email/push via backend AWS — SES/SNS).
Il progetto compare in Create hub come **needs-attention** (`review`).

---

## E. Note di implementazione (per le fasi successive)

- La schermata di generazione e le 7 azioni vivono sul **Project Workspace**
  (`/project/:id`, stato `processing`) → fase **F5** (più F6 per anteprima/chat).
- Riusare i **dumb component** esistenti dove possibile: `WizardProgress` (stato
  generazione), `LivePreviewPanel` (preview), `SelectionCard` (azioni-card).
- "Metti in pausa" richiede un'estensione del modello `Job` (stato `paused` /
  `pausedAt`) da riflettere in `PRODUCT-ARCHITECTURE.md §1.4` e nella state machine.
- "Visualizza anteprima" richiede `Version.chapters` popolati progressivamente
  (mock: il job engine scrive capitoli mentre avanza).
- Tutte le azioni passano dai metodi dello `ProjectsStore` (mai dal mock diretto);
  polling reattivo già gestito via `rxMethod`.
