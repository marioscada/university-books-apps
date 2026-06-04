# UX/UI Flow — da "Nuovo progetto" a "Pubblicato"
### SCADÁ AI Books Generator · Alternative C (Setup → Studio), brief-first

> Studio di flusso approvato: **Setup compatto** (brief → modello → fonti) →
> **Studio/Workspace** guidato dallo stato (indice → generazione → manufatto →
> pubblicato), con **2 porte di conferma** 🔒 prima delle generazioni AI.
> Pattern trasversale: ogni output AI ha **Accetta · Modifica a mano · Rigenera
> con istruzioni**. Nessun codice finché le schermate non sono approvate.

## Mappa pagine
```
/create            Launcher: Riprendi + "Nuovo progetto" + (modelli come scorciatoia)
/create/new        SETUP compatto: ① Brief  ② Modello  ③ Fonti  (+ Personalizza facolt.)
                   └─[Genera indice]→ crea Project draft, lancia job outline
/project/:id       STUDIO (state machine): outline → processing → review → published
```

## Indicatore di percorso (sempre visibile nello Studio)
`StepIndicator` in cima allo Studio, così sai dove sei nel viaggio:
`Setup ✓ — Indice — Generazione — Revisione — Pubblicato`

---

## SCHERMATA 0 — /create (Launcher)
**Scopo**: riprendere una bozza o iniziarne una nuova.
```
┌ Riprendi da dove hai interrotto ────────────────────────────┐
│ [entity-card] [entity-card] [entity-card]                   │
├ Crea un nuovo progetto ─────────────────────────────────────┤
│  ╔══════════════════════════════════╗                       │
│  ║ ✦ Inizia un nuovo progetto       ║  [Inizia →]            │
│  ╚══════════════════════════════════╝                       │
├ Oppure parti da un modello ─────────────────────────────────┤
│ [model-card][model-card][model-card][model-card] …          │
└─────────────────────────────────────────────────────────────┘
```
- "Inizia" → Setup, sezione Brief (nessun modello: brief-first).
- I model-card sono **scorciatoie**: cliccandone uno → Setup con quel modello già scelto.
- **Componenti**: `entity-card`, `model-card`, hero CTA, `mat-flat-button`.

---

## SCHERMATA 1 — /create/new (SETUP compatto, brief-first)
Una pagina a sezioni (bande alternate), **footer sticky** con le azioni.

**① Brief** (banda bianca) — *già costruita*
- `CounterField` "Titolo" (obbligatorio, /80) + `CounterField` "Di cosa tratta"
  (multiline, /500) + **libro live** che riflette il titolo.

**② Modello** (banda slate)
- Riga selezionabile di `model-card` (selezione singola). Scelto un modello:
  - il libro live cambia tema, sotto compare "Cosa include" (chip dalle parti).
- **Componenti**: `model-card` (stato selected), `mat-icon`.

**③ Fonti** (banda bianca)
- `FileDropzone` (drag&drop PDF/DOCX/…) + elenco caricati con stato ingest +
  "Aggiungi una nota" (testo). Facoltativa ma consigliata.
- **Componenti**: `file-dropzone`/`source-upload`, `mat-chip`.

**④ Personalizza i default — facoltativo** (banda slate, collassata)
- `mat-expansion-panel` chiuso di default; chi vuole lo apre:
  `DocStructureList` (includi/escludi, conteggio), preset "Lunghezza",
  `mat-button-toggle` formato output, tipografia.
- Per il 90% si salta: la struttura vera si rifinisce sull'**indice** generato.

**Footer sticky**
`[Salva bozza]` (stroked) · `[Genera indice →]` (flat primary, attivo con
titolo + modello). → crea il `Project` draft, lancia il **job outline**, va a `/project/:id`.
- **Componenti**: `CounterField`, `model-card`, `file-dropzone`,
  `MatExpansionPanel`, `MatButtonToggle`, `MatSlideToggle`, `mat-flat/stroked-button`,
  `MatSnackBar` (conferme), barra sticky custom.

---

## SCHERMATA 2 — /project/:id · stato **outline** (PORTA 🔒 #1)
L'AI propone l'indice; tu lo correggi o lo rigeneri, **prima** di generare il testo.
```
┌ Titolo progetto · [in bozza]        [↻ Rigenera indice con istruzioni ▾] ┐
├───────────────────────────────┬─────────────────────────────────────────┤
│ INDICE (editabile)            │ ANTEPRIMA                                │
│ ⠿ 1. Introduzione   ✎ ↻ ⋮     │   ┌────────┐  Indice                     │
│ ⠿ 2. Metodologia    ✎ ↻ ⋮     │   │ cover  │  1. Introduzione ……… 1      │
│ ⠿ 3. Risultati      ✎ ↻ ⋮     │   └────────┘  2. Metodologia ……… 5      │
│ + Aggiungi sezione            │   [miniature pagine]                     │
├───────────────────────────────┴─────────────────────────────────────────┤
│ [Salva bozza]                              [Conferma indice e genera 🔒] │
└──────────────────────────────────────────────────────────────────────────┘
```
- **Sinistra**: `DocStructureList` (drag riordina, toggle, ✎ rinomina); menu per
  riga `MatMenu` → [✎ Modifica, ↻ Rigenera questa parte, 🗑 Rimuovi].
- **Rigenera con istruzioni**: `CounterField`/textarea + `[Rigenera]` → l'AI ripropone
  l'indice tenendo conto delle tue indicazioni (`MatProgressBar` durante).
- **Destra**: `ResultPreview` (anteprima dell'indice, live).
- **Porta 🔒**: `[Conferma indice e genera]` → `MatDialog` di conferma → stato `processing`.
- **Componenti**: `DocStructureList`, `ResultPreview`, `CounterField`, `MatMenu`,
  `MatProgressBar`, `MatDialog`, barra sticky.

---

## SCHERMATA 3 — /project/:id · stato **processing**
```
            Analisi ●──── Outline ●──── Capitoli ◐──── Render ○
            ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░  64%   ~1 min rimanente
            (anteprima cover a lato)              [Annulla]
```
- **Componenti**: `StepIndicator`/`wizard-progress`, `MatProgressBar`, log opzionale,
  `Job` dominio (polling già esistente). Al 100% → stato `review`.

---

## SCHERMATA 4 — /project/:id · stato **review** (PORTA 🔒 #2)
Il manufatto reale: leggi, chiedi modifiche per-sezione o rigenera, poi pubblichi.
```
┌ Titolo · [da revisionare] · v1 ▾                       [Pubblica 🔒]      ┐
├──────────────┬──────────────────────────────────┬────────────────────────┤
│ INDICE (nav) │ DOCUMENTO (lettura)              │ ASSISTENTE (collassab.)│
│ 1 Introduz.  │ ## 1. Introduzione               │ "Chiedi una modifica…" │
│ 2 Metodolog. │ Lorem ipsum…       [✎ ↻ 💬]       │ [textarea] [Invia]     │
│ 3 Risultati  │ ## 2. Metodologia                │ — proposta AI —        │
│ …            │ …                  [✎ ↻ 💬]       │ [Accetta][Scarta]      │
├──────────────┴──────────────────────────────────┴────────────────────────┤
│ [Salva]                                            [Pubblica 🔒]          │
└───────────────────────────────────────────────────────────────────────────┘
```
- **Sinistra**: `DocStructureList` come **navigazione** (click → scroll alla sezione).
- **Centro**: documento renderizzato; ogni sezione ha azioni hover
  [✎ modifica testo · ↻ rigenera con istruzioni · 💬 commenta].
- **Destra**: pannello **Assistente** (chat dominio) per chiedere modifiche; le
  proposte AI si **Accettano/Scartano** (diff). Rigenerazione per-sezione mirata.
- **Porta 🔒**: `[Pubblica]` → `MatDialog` conferma → stato `published`.
- **Componenti**: `DocStructureList`, superficie lettura, chat (`MatInput`+lista),
  `CounterField`, `MatMenu`, `MatProgressBar`, `MatDialog`, `MatSnackBar`.

---

## SCHERMATA 5 — /project/:id · stato **published**
- Documento finale (sola lettura) + **Esporta** (`MatMenu`: PDF/DOCX/EPUB) +
  **Crea derivato** (riassunto/slide/quiz) + cronologia versioni.
- **Componenti**: `MatMenu`, card, `MatDialog`.

---

## Pattern riusabile: "AI block actions"
Ogni blocco generato (indice intero, singola parte, singola sezione) espone la
stessa terna: **[Accetta] · [Modifica a mano] · [Rigenera con istruzioni]**.
Da estrarre in un piccolo componente dumb riusabile (`ai-block-actions`).

## Riuso di ciò che abbiamo già
- `model-card`, `CounterField`, `file-dropzone`, `DocStructureList`,
  `ResultPreview`, `page-thumbnail`, `project-summary`, `StepIndicator`,
  `entity-card`, `select-field` → coprono ~80% del flusso.
- Da aggiungere: superficie di lettura del documento, pannello assistente (chat),
  `ai-block-actions`, dialog di conferma porte.

## Ordine di costruzione consigliato
1. **Setup** (Schermata 1) — il Brief esiste già; aggiungere Modello + Fonti + footer.
2. **Outline** (Schermata 2) — riusa DocStructureList + ResultPreview (quasi pronti).
3. **Processing** (Schermata 3) — riusa StepIndicator + Job.
4. **Review** (Schermata 4) — la più nuova (lettura + assistente).
5. **Published** (Schermata 5).
