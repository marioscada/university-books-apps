# UI Spec — Collezione · Libreria · Prezzi

### SCADÁ AI Books Generator · Angular + Angular Material (M3)

> Spec di dettaglio (mockup) delle tre superfici "browse / gestisci / monetizza".
> Companion di `UI-SPEC-CREATION-AND-GENERATION.md`. Design system, accento
> (#039FCE — i mock usano blu #2f6df6), token, a11y e i18n come nel doc companion §0.
>
> **Stato**: pagine **già esistenti in versione base** (`/collection`, `/library`,
> `/pricing`); qui la **UI/UX target** per il rebuild premium.

---

## F. Pagina «Collezione» (`/collection`)

> Dominio: progetti con almeno una Version `published` (+ `archived`/in corso a
> seconda dei filtri) — `PRODUCT-ARCHITECTURE §5`. Le **collezioni** (cartelle) sono
> un raggruppamento utente: concetto **nuovo** da modellare (`Collection`).

### F.1 Header
- **H1 "Collezioni"** + sottotitolo *"Organizza e scopri tutti i tuoi libri e
  progetti. Crea raccolte personalizzate e tieni tutto in ordine."*
- Azioni in alto a destra: **"+ Nuova collezione"** (outlined) · **"+ Nuovo
  progetto"** (accento, split-button con chevron).

### F.2 Stat cards (riga di 5 — fungono da filtro rapido per stato)
| Card | Valore | Icona | Stato |
|---|---|---|---|
| **Tutti i progetti** | 24 | libro | selezionata (accento) |
| **Bozze** | 7 | cerchio arancione | `draft` |
| **In corso** | 5 | spinner blu | `queued/processing` |
| **Completati** | 12 | check verde | `review/done` |
| **Pubblicati** | 4 | globo | `published` |

### F.3 Toolbar
- Search **"Cerca nelle collezioni…"**.
- Dropdown: **"Tutti gli stati"** · **"Tutti i tipi"** · **"Data modificata"** +
  bottone icona **filtri/ordina**.
- A destra: **toggle vista griglia / lista**.

### F.4 "Le mie collezioni"
Riga di **folder-card** colorate: icona cartella + nome + "N progetti" + "Aggiornata
X". Esempi: **Libri Pubblicati** (8 progetti, oggi, blu) · **Lavoro** (6, ieri,
verde) · **Formazione** (4, 3 giorni fa, viola) · **Marketing** (3, 1 settimana fa,
arancione) · card tratteggiata **"+ Crea nuova collezione"**.

### F.5 "Tutti i progetti" — griglia di project-card
Ogni card: **cover libro** (immagine/gradiente), menu **⋮** in alto a destra, e sotto:
- **chip stato** (Completato verde · In corso blu · Bozza arancione) + **tipo**
  (Manuale/Report/Libro…);
- **"Aggiornato X"**;
- footer: **"N capitoli / N sezioni"** a sinistra + a destra **"Pubblicato"** (globo)
  **oppure** mini **progress bar + %** (es. 65%, 45%) se in corso.
- Esempi: *L'Intelligenza Artificiale Spiegata Semplice* (Completato · 12 capitoli ·
  Pubblicato) · *Manuale di Machine Learning* (In corso · 8 sezioni · 65%) ·
  *Cybersecurity per aziende* (Bozza · 5 capitoli) · *Analisi di Mercato 2024*
  (Completato · Report · 15 sezioni · Pubblicato) · *Fotografia Digitale Avanzata*
  (In corso · 10 capitoli · 45%) · *Storia dell'Arte* (Bozza · Libro · 7 capitoli).
- In fondo: bottone **"Carica altri progetti"** (load-more).

### F.6 Mapping dominio
Riusa `project-card`/`cover-art`/`status--*` globali. Filtri = query su
`Project.status`/`kind`. `Collection` (cartelle) = nuovo aggregato utente
(id, nome, colore, projectIds, updatedAt) da aggiungere al dominio.

---

## G. Pagina «Libreria» (`/library`)

> Dominio: `Source` (`PRODUCT-ARCHITECTURE §1.5`), relazione many-to-many coi
> progetti. Vista a **tabella** (lista) oltre a griglia.

### G.1 Header
- **H1 "Libreria"** + sottotitolo *"Tutte le tue fonti e materiali in un unico posto.
  Carica, organizza e riutilizza le informazioni nei tuoi progetti."*
- Azioni: **"+ Nuova cartella"** (outlined) · **"Carica fonte"** (accento, chevron).

### G.2 Stat cards (riga di 6, per `SourceType`/categoria)
**Tutte le fonti** 128 · **Documenti** 78 · **Libri** 24 · **Articoli** 18 ·
**Siti web** 6 · **Audio / Video** 2 (icona + colore per tipo).

### G.3 Toolbar
- Search **"Cerca nelle fonti…"**.
- Dropdown: **"Tutti i tipi"** · **"Tutti i progetti"** · **"Tag"** · **"Data
  caricamento"** + bottone **"Filtri"**.
- A destra: **toggle griglia / lista** (in mock attivo = lista).

### G.4 Sidebar sinistra (navigazione/sfaccettature)
- **RACCOLTE**: Tutte le fonti 128 · Non assegnate 12 · Preferite 8 · Recenti 24 ·
  Cestino 3. (+ azione "+" per nuova raccolta.)
- **I MIEI PROGETTI**: AI Handbook 24 · Marketing 2024 18 · Manuale Tecnico 15 ·
  Corso di Fisica 12 · Storia dell'Arte 9 · "Mostra altri".
- **TIPO DI FONTE**: PDF 72 · Documento 22 · Sito web 18 · Libro 24 · Audio/Video 2.

### G.5 Tabella fonti
Colonne: **☐** (select) · **Nome** (+ sottotitolo tipo) · **Tipo** (chip colorata) ·
**Progetto/i** (dot colorato + nome, può essere multiplo) · **Tag** (chip + "+n") ·
**Data caricamento** · **Dimensione** · **★** (preferito) · **⋯** (menu).
- Righe d'esempio: `Appunti_Intelligenza_Artificiale.pdf` (PDF · AI Handbook · AI,
  Machine Learning +2 · 12 mag 2025 · 12.4 MB) · `Marketing Strategy 2024.docx` ·
  `Deep Learning - Goodfellow (2016).pdf` (Libro · AI Handbook + Corso di Fisica ·
  ★) · `https://arxiv.org/abs/2301.07037` (Sito web · — dimensione) ·
  `Manuale_Operativo_V2.pdf` · `Analisi di Mercato 2024.pdf` ·
  `Storia dell'Arte Moderna.pdf` (★) · `Lezione 1 - Introduzione.mp4`
  (Audio/Video · 156.8 MB).
- **Paginazione**: *"1–8 di 128 fonti"* + numeri pagina `1 2 3 … 16`.

### G.6 Banner "Suggerimento AI"
Icona ✦ + **"Suggerimento AI"** + *"Collega più fonti allo stesso progetto per
ottenere contenuti più completi e accurati."* + link **"Scopri come funziona"**.

### G.7 Mapping dominio
Riusa `entity-card`/tabella globali. Le righe = `Source` (name, type, sizeBytes,
uploadedAt, tags, usedInProjectIds, ingestStatus, `permission`/preferito). Sidebar =
sfaccettature su tipo/progetto/raccolta. "Carica fonte" = upload (S3 con backend AWS).

---

## H. Pagina «Prezzi» (`/pricing`)

> Dominio: `Plan` (`PRODUCT-ARCHITECTURE §8`). ⚠️ **I numeri del mock (€39/€59/€49)
> differiscono dall'analisi costi fatta** (fascia studente €5–9): da riconciliare —
> i prezzi del mock sono placeholder premium.

### H.1 Header (centrato)
- **H1 "Prezzi"** + sottotitolo *"Scegli il piano più adatto al tuo modo di lavorare.
  Tutti i piani includono le funzionalità principali di SCADÁ."*
- **Toggle "Mensile / Annuale"** + badge **"Risparmia 20%"**.

### H.2 Tre plan-card
1. **Singolo Progetto** — *"Paga solo quando ti serve."* — **€39** *per progetto*.
   Feature (✓): 1 progetto · Tutte le funzionalità AI · Upload fonti illimitate ·
   PDF, DOCX, EPUB · Versioni e revisioni. CTA **"Genera Progetto"** (outlined).
2. **Monthly** *(evidenziata, badge **"PIÙ POPOLARE"**)* — *"Per chi lavora
   regolarmente."* — **€59** *al mese*. Feature: 4 progetti al mese · Tutte le
   funzionalità AI · Libreria completa · Revisioni illimitate · Export completo.
   CTA **"Inizia ora"** (accento).
3. **Annual** — *"Per professionisti e aziende."* — **€49** *al mese* ~~€59~~ ·
   *Fatturato annualmente €588* ~~€708~~. Feature: 48 progetti all'anno · … ·
   **Priorità di elaborazione**. CTA **"Scegli Annuale"** (verde) + **"Risparmi il
   20%"**.

### H.3 "Scegli come pagare il piano Annuale"
Due opzioni-card: **"Paga mensilmente"** (*Impegno annuale · €49 al mese per 12
mesi*) · **oppure** · **"Paga in un'unica soluzione"** (*Risparmi subito il 20% ·
€588 all'anno*).

### H.4 "Domande frequenti" (accordion)
- *"Posso cambiare piano in qualsiasi momento?"*
- *"Cosa succede se non uso tutti i progetti del mese?"*
- *"È inclusa l'assistenza clienti?"*

### H.5 Footer
🔒 *"Pagamento sicuro con carta di credito. Annulla quando vuoi."*

### H.6 Mapping dominio
`Plan` (`single | monthly | annual`), prezzi/feature da config; toggle billing
`monthly/annual`. Il gating (4 progetti/mese ecc.) usa i limiti del `Plan`. La CTA
"Singolo Progetto → Genera Progetto" rimanda al wizard.

---

## Note trasversali per il rebuild
- Riusare i **dumb component** globali: `project-card`/`cover-art`/`status--*`
  (Collezione), tabella/`entity-card` (Libreria), e nuovi presentational
  (`StatCard`, `PlanCard`, `FolderCard`, `SourceRow`) dove c'è riuso.
- **Concetti di dominio nuovi** introdotti dai mock: `Collection` (cartelle),
  `ProjectTemplate` (modelli, vedi doc companion §A0), tag/preferiti su `Source`.
- Numeri **Prezzi** da riconciliare col modello costi (vedi chat / futuro
  `PRICING-AND-COSTS.md`).
