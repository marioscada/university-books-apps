# Create Page — Design & Flow (AI Book Generator)

> Documento di lavoro per la pagina **Create** (il cuore del prodotto: trasforma
> materiale dell'utente in libro / riassunto / manuale / corso) e per la nuova
> pagina **Home**. Raccoglie la proposta iniziale (ChatGPT), la **valutazione**
> critica e le **alternative** consigliate. Riferimenti UX: Stripe, Linear,
> Vercel, Notion.

---

## 0. Navigazione (aggiornata)

Voci menu (header + footer), uguali in entrambi:

`Home · Create · Projects · Library · Pricing`

- **Home** → landing/marketing: spiega *cosa ottieni* con istruzioni a sezioni
  (testo + immagini/illustrazioni "che ti aspettano" per capire l'output).
- **Create** → il wizard guidato (questa pagina). È il vecchio "home" autenticato.
- **Projects** → i progetti generati/in corso dell'utente.
- **Library** → materiali/output salvati, template, fonti riutilizzabili.
- **Pricing** → piani.

---

## 1. Proposta iniziale (ChatGPT) — sintesi

Wizard lineare a **8 step**:

1. **Upload Sources** — PDF / Word / PowerPoint / Immagini / URL / Note (drag&drop grande)
2. **Define Goal** — Book / Summary / Study Notes / Training Course / Technical Manual / Research Report / Custom
3. **Describe the Output** — prompt libero ("Crea un libro universitario di 120 pagine…")
4. **Configure Structure** — n° capitoli, profondità, lingua, stile, lunghezza
5. **AI Analysis** — animazione (Analisi → Estrazione concetti → Organizzazione → Generazione)
6. **Review Outline** — l'AI propone i capitoli; l'utente modifica/elimina/aggiunge
7. **Generate** — CTA grande "🚀 Generate Content"
8. **Export** — PDF / DOCX / EPUB / Markdown

+ **Header durante il wizard**: `Logo | Create` con mini-stepper
`1 Upload · 2 Goal · 3 Instructions · 4 Structure · 5 Review · 6 Generate`.

---

## 2. Valutazione critica

### ✅ Cosa funziona
- **Flusso guidato** chiaro: ideale per utenti non tecnici.
- **Mini-stepper nell'header** (idea ottima): pattern Stripe/Linear/Notion, dà
  sempre il senso del "dove sono / quanto manca".
- **Separazione input → output** concettualmente giusta.

### ⚠️ Criticità
1. **8 step sono troppi.** Ogni step obbligatorio aumenta l'abbandono. I prodotti
   citati (Stripe Checkout, Linear, Notion AI) tengono l'input a **3–4 step max**.
2. **Mescola fasi diverse nello stesso contatore numerato.** Step 1–4 sono *input*
   dell'utente; step 5 è *processing* (automatico); 6 è *review*; 7 è *azione*;
   8 è *output*. Numerarli tutti uguali confonde: l'utente pensa di dover
   "compilare" anche l'animazione AI e l'export.
3. **Step 2 (Goal) e Step 3 (Instructions) si sovrappongono.** Il tipo di output
   e il prompt libero appartengono alla stessa decisione ("cosa genero e come").
4. **Step 7 "Generate" come step a sé** è ridondante: è il pulsante di fine
   wizard, non una schermata.
5. Lo **stepper nell'header della proposta** ha 6 voci ma il wizard ne ha 8 →
   incoerenza da risolvere.

### 🎯 Principio guida
> Separare nettamente **3 momenti**: **INPUT** (poche schermate) → **GENERAZIONE**
> (stato automatico, non uno "step" da compilare) → **WORKSPACE** (review +
> export, è un editor, non un wizard).

---

## 3. Alternativa consigliata (RACCOMANDATA)

### 3a. Wizard di INPUT a 4 step
Mini-stepper nell'header (stile Stripe/Linear), **solo questi 4 numerati**:

| # | Step | Contenuto | Note |
|---|------|-----------|------|
| 1 | **Sources** | Drag & drop grande: PDF, Word, PPT, immagini, URL, note. Lista file caricati con dimensione/anteprima. | Si può proseguire anche senza fonti (solo prompt). |
| 2 | **Goal** | Cosa generare: Book · Summary · Study Notes · Training Course · Technical Manual · Research Report · Custom. Card selezionabili (radio). | Fonde "tipo output". |
| 3 | **Instructions** | Prompt libero + esempi cliccabili ("Libro universitario 120 pagine", "Manuale professionale", "Riassunto per superiori"). | Fonde il "describe". |
| 4 | **Structure** | N° capitoli, profondità, lingua, stile di scrittura, lunghezza. Valori di default sensati per il Goal scelto. | Tutto opzionale: default pronti. |

→ CTA finale del wizard: **`Generate`** (grande, primario).

### 3b. Stato di GENERAZIONE (non è uno step)
Schermata di avanzamento con checklist animata (no input):
- ✅ Analisi documenti
- ✅ Estrazione concetti
- ✅ Organizzazione capitoli
- ✅ Generazione contenuto

(Progress reale o simulato; messaggi che cambiano. Possibilità di "Run in
background" → torna a Projects mentre genera.)

### 3c. WORKSPACE di risultato (editor, non wizard)
Dopo la generazione l'utente entra in un **workspace**:
- **Outline editabile** a sinistra (capitoli: modifica / elimina / aggiungi /
  riordina drag) — l'ex "Step 6 Review".
- **Anteprima contenuto** a destra.
- **Rigenera** (intero / per capitolo).
- **Export**: PDF · DOCX · EPUB · Markdown (l'ex "Step 8").

> Questo separa il "wizard di 4 step" (input) dall'"editor" (review+export),
> esattamente come Notion AI: genera → poi editi il documento.

### 3c-bis. Header durante il wizard (mini-stepper)
`Logo | Create` con stepper a **4 voci** coerenti col wizard:

`1 Sources · 2 Goal · 3 Instructions · 4 Structure`

Stato corrente evidenziato (accent blu `--site-accent-blue`); completati con
check. Stile Stripe/Linear/Vercel. Niente search/nav durante il wizard:
header minimale per ridurre distrazioni (pattern checkout).

---

## 4. Alternative al wizard (se si vuole osare di più)

- **B. Single smart page con progressive disclosure** — una sola pagina con le 4
  sezioni che si espandono man mano (no cambio schermata). Più veloce per utenti
  esperti, meno "guidato".
- **C. Prompt-first (stile ChatGPT/Notion AI)** — si parte da un grande campo
  prompt + bottone "Add sources"; le opzioni (Goal, Structure) sono pannelli
  avanzati opzionali. Massima rapidità, minor controllo iniziale.
- **D. Template-first** — si parte scegliendo un template (da Library); il
  template precompila Goal+Structure; resta solo Sources+Instructions.

> Raccomandazione: **partire con A (wizard 4 step)** perché è il più chiaro per
> il pubblico target (studenti/professionisti non tecnici), tenendo C come
> evoluzione "power-user" futura.

---

## 5. Pagina Home (nuova) — sezioni dettagliate

Landing a sezioni (riusa `hero-section` + `content-section` con sfondi alternati).
Ordine secondo il funnel: **aggancio → capisci → vedi il risultato → ti fidi →
converti**. Per ogni sezione: scopo, contenuto, visual.

| # | Sezione | Scopo | Contenuto | Visual / Componente |
|---|---------|-------|-----------|---------------------|
| 1 | **Hero** | Aggancio in 3 sec | Eyebrow `AI BOOK GENERATOR` · titolo forte ("Trasforma il tuo materiale in un libro professionale") · sottotitolo 1 riga · CTA **Generate** + link "Guarda come funziona" | `hero-section`, scuro full-bleed, mockup output a dx |
| 2 | **Trust bar** | Credibilità immediata | "Usato da studenti e professionisti" + loghi atenei/aziende o metrica ("10.000+ documenti generati") | banda bianca sottile, loghi grigi |
| 3 | **How it works** | Capire il processo | 4 blocchi alternati testo+immagine: *Carica materiale* · *Scegli cosa generare* · *L'AI struttura e scrive* · *Esporta dove vuoi* | 4× `content-section` (`text-left`/`text-right`), zebra bianco/slate, img per ognuno |
| 4 | **Output types** | Ampiezza prodotto | Griglia card: Book · Summary · Study Notes · Training Course · Technical Manual · Research Report · Custom (icona + 1 riga) | sezione `centered`, grid di card |
| 5 | **Output showcase** | Vedere il risultato (converte gli scettici) | 3–4 esempi reali di libri/manuali generati con anteprima | gallery immagini, "ecco cosa otterrai" |
| 6 | **Use cases** | Identificazione | Studenti · Docenti · Professionisti · Aziende, ciascuno col beneficio specifico | 4 colonne / card |
| 7 | **Features** | Perché noi | 3 colonne icona: Multi-formato input · Struttura intelligente · Export professionale (o velocità / controllo capitoli / multilingua) | `content-section centered` o grid 3 |
| 8 | **Pricing teaser** | Anticipare costo | 2–3 piani in sintesi + CTA "Vedi tutti i piani" → `/pricing` | grid piani |
| 9 | **FAQ** | Rimuovere obiezioni | Accordion: privacy file · formati input · lunghezza libro · modifica capitoli | accordion (mat-expansion) |
| 10 | **CTA finale** | Convertire | Claim + CTA **Generate** | banda scura come hero |
| 11 | **Footer** | Navigazione/legale | già implementato, centrato | `site-footer-block` |

### Note
- **Riuso massimo**: sezioni 1/3/4/5/7/10 si fanno con `hero-section` +
  `content-section` esistenti (supportano `media`, `text-left/right`, `centered`,
  `cta`). Solo 2 (trust), 6 (use cases grid), 8 (pricing), 9 (FAQ accordion)
  richiedono micro-componenti nuovi.
- **Immagini illustrative** ("che aspettano l'utente per capire cosa ottiene")
  in `public/images/`, referenziate via `media.src` di `ContentSectionData`.
- **MVP minimo**: 1 Hero, 3 How-it-works, 5 Showcase, 10 CTA finale, 11 Footer —
  già sufficiente a comunicare valore. Le altre si aggiungono progressivamente.
- **Sfondi alternati** automatici: l'ordine bianco/slate è gestito da
  `:nth-of-type(even)` su `content-section` — basta impilarle.

---

## 6. Mappatura proposta → componenti (riuso, niente nuovo se evitabile)

| Elemento | Componente | Stato |
|---|---|---|
| Hero Home | `shared/components/hero-section` | esiste |
| Sezioni Home (testo+img alternate) | `shared/components/content-section` | esiste (supporta `media` + `text-left/right`) |
| Header wizard con stepper | nuovo `create/components/wizard-header` (variante di `site-header-nav`) | da creare |
| Step Sources (drag&drop) | nuovo `create/steps/sources` | da creare |
| Step Goal (card radio) | nuovo `create/steps/goal` | da creare |
| Step Instructions (prompt) | nuovo `create/steps/instructions` | da creare |
| Step Structure (form) | nuovo `create/steps/structure` | da creare |
| Stato generazione | nuovo `create/components/generation-progress` | da creare |
| Workspace (outline+preview+export) | nuovo `create/workspace` | da creare |
| CTA pill `Generate` | `.site-cta-pill` (theme/_blocks) | centralizzato |

---

## 7. Decisioni aperte (da confermare con l'utente)
1. **Wizard 4-step (A)** confermato come approccio, o si preferisce prompt-first (C)?
2. Il wizard deve essere **dietro login** (authGuard) o provabile da ospite con
   export bloccato?
3. **Generazione**: sincrona (resta in pagina) o "run in background" → Projects?
4. Quanti **tipi di output** al lancio (tutti i 7 o un sottoinsieme MVP:
   Book / Summary / Study Notes)?
5. Lingue supportate per la generazione.

---

## 8. Prossimi passi
- [ ] Confermare approccio (§7).
- [ ] Disegnare in `/preview` la **Home** con le sezioni "how it works" (immagini placeholder).
- [ ] Prototipare l'**header wizard con stepper** (4 voci) in `/preview`.
- [ ] Scaffolding cartella `create/` (steps + workspace) seguendo i pattern shared.
