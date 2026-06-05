# Regole dei componenti — “regola santa” 🔒

> Vale per **tutti** i componenti del progetto `ai-book-generator`. Nessuna eccezione.

## 1. Un solo componente per concetto — niente ridondanza
Dove un elemento ricompare — in **qualunque** contesto: pagina, sezione, **dialog**, mobile — deve essere **sempre lo stesso componente**. Mai duplicare.

- Prima di crearne uno nuovo: cerca se esiste già un componente per quel concetto. Se sì, **estendilo** (input/varianti). Se trovi un doppione, **consolida ed elimina**.
- Esempio: `generation-panel` è l’**unico** pannello di elaborazione/attesa — usato per generazione indice, generazione capitoli e attesa pubblicazione/render. Non esistono varianti parallele.

## 2. 100% data-driven — tutto iniettato dal padre
Qualunque cosa il componente mostra — testo, **icone**, stati, conteggi, label, varianti — arriva via `input()` / `output()` / `model()`. Il componente:

- è **dumb/presentational**: nessuna business logic, nessun accesso a store/servizi/`ApiPort`;
- è **i18n-agnostico**: riceve stringhe già tradotte;
- non assume il **dominio** né il **contesto** di pagina.

## 3. Riusabile ovunque, anche dentro un dialog
Nessuna assunzione di layout di pagina:

- niente posizionamento fisso, niente larghezze rigide; **self-responsive**;
- prevedi una variante **`flat`/bare** per togliere la chrome di card quando il componente vive **dentro un dialog** o un altro contenitore;
- altezza/larghezza guidate dal contenitore (flex/`stretch`), non hardcoded.

## 4. Standard tecnici
- `standalone`, `ChangeDetectionStrategy.OnPush`, **signals** (`input/output/model`, `computed`).
- **Solo token globali** per lo stile (niente colori hardcoded) → ritematizzabile.
- **a11y**: ruoli/aria corretti, focus, `prefers-reduced-motion`.
- Pronto per **produzione** da subito.

## 5. Architettura dati (contorno)
Smart page → **store** (signals + rxMethod) → **`ApiPort`** (Promise, async, AWS-ready). I **dati mock** vivono in file `*-seed.ts` da abolire col backend. I componenti dumb **non** toccano dati.

---
_Sintesi: un componente, riusato ovunque, tutto dal padre, dialog-safe. Se stai per duplicare, fermati e consolida._
