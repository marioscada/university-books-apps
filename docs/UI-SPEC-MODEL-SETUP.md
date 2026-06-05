# UI Spec — Pagina "Personalizza il modello" (`/create/new`)
### SCADÁ AI Books Generator · vista **Anteprima** (dinamica in funzione del modello)

> Destinazione dopo la scelta di un modello in Create. Riferimento visivo:
> screenshot 2026-06-03 19.07. Le altre tab (Impostazioni, Fonti, Verifica e crea)
> saranno dettagliate in seguito; qui si specifica la **toolbar + vista Anteprima**.

---

## 0. Layout generale
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← | PERSONALIZZA IL TUO PROGETTO            [Anteprima|Impostaz.|Fonti|Verif] │
│    | Report  ✎   · Business report                     [Salva bozza][Crea ▸] │
├───────────────┬───────────────────────────────────┬───────────────────────────┤
│ STRUTTURA DEL │        ANTEPRIMA DEL RISULTATO     │   RIEPILOGO DEL PROGETTO  │
│ DOCUMENTO     │                                   │                           │
│ (col 1)       │   (col 2)                         │   (col 3)                 │
└───────────────┴───────────────────────────────────┴───────────────────────────┘
```
- Container: `.site-container`. Grid 3 colonne: `minmax(0,1.1fr) minmax(0,1.6fr) minmax(300px,360px)`.
- Responsive: <1080px → col3 sotto full-width; <720px → 1 colonna.
- **Dinamica**: tutte le sezioni si popolano dal `ProjectTemplate` scelto (parti, default,
  tipografia, stima pagine). Stato editabile via `linkedSignal` (default dal modello →
  override utente); il modello resta immutabile.

## 1. Toolbar (sticky)
| Elemento | Material / impl. | Note |
|---|---|---|
| Back | `mat-icon-button` + `mat-icon` arrow_back | → `/create` |
| Eyebrow | testo `.setup-bar__eyebrow` | "PERSONALIZZA IL TUO PROGETTO" (i18n) |
| Titolo progetto | testo + `mat-icon-button` (edit) | default = nome modello; pencil → input inline (`app-text-field`) |
| Standard/fonte | `.setup-bar__source` + `mat-icon` verified | `template.sourceKey` |
| Tab switch | `mat-button-toggle-group` (single) a pillole, con icone | Anteprima·Impostazioni·Fonti·Verifica e crea → `activeTab` signal + `@switch` |
| Salva bozza | `mat-stroked-button` | crea draft, torna a /create |
| Crea progetto | `mat-flat-button color="primary"` | crea draft + va al workspace |

## 2. Colonna 1 — Struttura del documento  → `DocStructureListComponent`
Header: titolo "STRUTTURA DEL DOCUMENTO" + sub "Clicca su ogni sezione per modificarla"
+ link "＋ Aggiungi sezione".

Ogni **riga parte**:
- `cdkDrag` handle (`drag_indicator`) — reorder via `@angular/cdk/drag-drop` (`cdkDropList`).
- icona a tono (`mat-icon`, tono da token `--tone-*`).
- label + **sotto-label di lunghezza** (es. "Lungo (~3.000 parole)"; parti a 0 parole →
  "Generato automaticamente").
- `mat-slide-toggle` includi/escludi (parti obbligatorie: `lock` con `matTooltip`).
- chevron `expand_more` → espande editor inline (conteggio per ripetibili + parole).
- Editor inline: stepper conteggio (mat-icon-button ±) + `app-text-field` type=number parole.

Footer: legenda ("● Sezione attiva · ○ Disattivata · Trascina per riordinare").

**Lunghezza suggerita** (sotto la lista, parent-owned): `mat-button-toggle-group`
(Sintetico/Breve/Standard/Medio/Lungo) → preset che scala le parole di tutte le parti
rispetto ai default del modello.

### Contratto `DocStructureListComponent` (dumb, library-grade)
```ts
interface DocPartView {
  key: string; label: string; sublabel: string;
  icon: string; iconTone: ModelTone;        // riusa ModelTone
  included: boolean; optional: boolean;
  repeatable: boolean; count: number; countMin: number; countMax: number;
  wordCount: number;
}
// inputs (signal): parts: DocPartView[]; reorderable=true;
//   + label inputs i18n-agnostici: addSectionLabel, editLabel, countLabel,
//     wordsLabel, activeLabel, disabledLabel, reorderHint, requiredLabel
// outputs: toggle(key), countChange({key,count}), wordChange({key,words}),
//          reorder(orderedKeys: string[]), addSection()
// stato interno consentito: expandedKey (UI), nessuna logica di dominio.
```
Material: `MatSlideToggleModule`, `MatIconModule`, `MatTooltipModule`,
`DragDropModule` (CDK), `app-text-field`. Host: `ScreenTypeDirective`. Solo token.

## 3. Colonna 2 — Anteprima del risultato  → `ResultPreviewComponent` + `PageThumbnailComponent`
Header: "ANTEPRIMA DEL RISULTATO" + sub + link "Suggerisci anteprima".
Toolbar mini: `mat-button-toggle-group` view (pagina singola / griglia) + label "Sintesi dinamica".

- **Cover hero**: `.cover-art--<theme>` con titolo grande (titolo progetto) + tipo/anno;
  accanto un riquadro **INDICE** con le sezioni incluse (gruppo body/section) + una
  caption "Sintesi iniziale".
- **Griglia pagine**: una `app-page-thumbnail` per parte inclusa (label + numero).
- **Footer stats**: `≈ N parole · X–Y pagine · PDF, DOCX · 1–2 minuti` (icone `mat-icon`).

### Contratto `PageThumbnailComponent` (dumb)
```ts
// inputs: label: string; index: number;
//   variant: 'cover'|'toc'|'text'|'chart'|'empty'; tone: ModelTone;
// puramente presentazionale (CSS faux-page), nessun output.
```
### Contratto `ResultPreviewComponent` (dumb)
```ts
interface PagePreview { label: string; variant: 'cover'|'toc'|'text'|'chart'|'empty'; }
// inputs: coverTitle, coverKicker, coverTheme: CoverTheme,
//   tocEntries: string[], pages: PagePreview[],
//   statWords: string, statPages: string, statFormats: string, statTime: string,
//   viewMode: 'single'|'grid', + label inputs (title, subtitle, suggestLabel, tocLabel)
// outputs: viewModeChange('single'|'grid'), suggest()
```
Material: `MatButtonToggleModule`, `MatIconModule`. Usa `app-page-thumbnail`.

## 4. Colonna 3 — Riepilogo del progetto  → `ProjectSummaryComponent`
- **Statistiche** (`dl`): Tipo di documento, Lunghezza stimata, Sezioni attive,
  Formato di output, Lingua, Stile di contenuto.
- **Modifiche apportate**: lista diff vs default del modello (parole cambiate, conteggio,
  parti aggiunte) + "Vedi tutte le modifiche (N)".
- **Escluso**: `mat-chip-set` con le parti disattivate.
- **Conferma**: box "✓ Tutto è modificabile / Puoi sempre tornare e cambiare…".

### Contratto `ProjectSummaryComponent` (dumb)
```ts
interface SummaryRow { label: string; value: string; icon?: string; }
interface ChangeRow { label: string; detail: string; tone: ModelTone; }
// inputs: title, rows: SummaryRow[], changesTitle, changes: ChangeRow[],
//   changesMoreLabel, excludedTitle, excluded: string[],
//   confirmTitle, confirmText
// outputs: viewAllChanges()
```
Material: `MatIconModule`, `MatChipsModule`. Solo token.

## 5. Logica nel parent (`ModelSetupComponent`, orchestratore)
- Stato: `parts` (linkedSignal da template, con baseline per diff/preset), `typo`,
  `formats`, `title`, `activeTab`, `lengthPreset`, `viewMode`.
- Derivati: `includedParts`, `totalWords`, `pagesEstimate` (≈ parole/350), `timeEstimate`,
  `tocEntries`, `pagePreviews`, `summaryRows`, `changes` (diff), `excluded`.
- Mapping per riga: `partSublabel(part)` (bucket lunghezza → label+parole), `partIcon(key)`,
  `partTone(key)`.
- `applyPreset(p)`: scala `wordCount = round(baselineWord * factor[p])`.
- `createProject()/saveDraft()`: costruiscono `ProjectSettings` (default modello + override)
  e chiamano `createFromTemplate` (modello immutabile).
- **Impostazioni tab**: ospita tipografia/output già costruiti (rivisitabili dopo).

## 6. Regole non negoziabili (per tutti i componenti)
- Standalone, `ChangeDetectionStrategy.OnPush`, **signal** `input()/output()`,
  `booleanAttribute`/`numberAttribute` dove serve.
- **Dumb**: nessun DI/servizio/store, nessuna logica di dominio, label via input
  (i18n-agnostici), output con nomi funzionali (no `change`/`select` nativi).
- **Self-responsive** via `hostDirectives:[ScreenTypeDirective]`.
- **Stile solo da token globali** (`--card-*`, `--field-*`, `--accent-*`, `--tone-*`,
  `--space-*`): nessun literal di colore/spaziatura → ritematizzabile dal solo tema.
- A11y (role/aria/tabindex/tastiera), `prefers-reduced-motion`, JSDoc + `@example`.
- Riferimento di stile: `shared/ui/selection-card`, `entity-card`, `model-card`.
