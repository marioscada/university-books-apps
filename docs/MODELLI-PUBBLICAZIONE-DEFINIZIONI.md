# Modelli di pubblicazione — definizioni, struttura standard e default
### SCADÁ AI Books Generator · riferimento per wizard (smart defaults) e backend (generazione)

> Per ogni tipo: **definizione operativa** (cosa si aspetta l'utente), **struttura
> standard** (ancorata a fonti/standard riconosciuti), **lunghezza/capitoli tipici**,
> **default consigliati per il wizard**. Usare come base per gli smart defaults e per
> istruire il modello (Bedrock/Claude) su *come* strutturare l'output di ciascun tipo.

---

## 1. Libro
**Definizione** — Una pubblicazione completa e autoconsistente, organizzata in capitoli,
che sviluppa un argomento dall'inizio alla fine.

**Struttura standard** (editoria saggistica — Chicago Manual / prassi editoriale):
- *Front matter*: frontespizio, pagina copyright, indice; opzionali prefazione/foreword.
- *Body*: Introduzione → Capitoli (eventualmente raggruppati in Parti) → Conclusione.
  Ogni capitolo costruisce sul precedente, dal fondamento all'avanzato.
- *Back matter*: glossario, bibliografia, indice analitico, appendici (secondo necessità).

**Lunghezza tipica** — 8–15 capitoli per la saggistica.

**Default wizard** — Modalità Balanced · 8–12 capitoli · indice sì · bibliografia sì ·
conclusione sì · output PDF + EPUB.

**Fonte** — Standard editoriali saggistica (front/body/back matter, Chicago Manual).

---

## 2. Riassunto
**Definizione** — Versione breve e facile da consultare/studiare del materiale; cattura
l'essenziale senza sviluppo esteso.

**Struttura standard** (modello executive summary):
- Scopo/focus (1 frase)
- Punti chiave (findings principali)
- Conclusioni / takeaway / raccomandazioni
- (opzionale) Mappa concettuale dei collegamenti tra i punti

Documento stand-alone, NON diviso in capitoli. Sottoheading + elenchi per scansionabilità.

**Lunghezza tipica** — 1–3 sezioni; da un paragrafo a poche pagine.

**Default wizard** — Modalità Fast Draft · niente capitoli · bibliografia no ·
output PDF · punti chiave sì.

**Fonte** — Standard executive summary / sintesi professionale.

---

## 3. Guida allo studio
**Definizione** — Materiale organizzato per imparare e ripassare velocemente, orientato
alla preparazione di esami/verifiche.

**Struttura standard** (ricerca educativa) — per ogni argomento:
- Obiettivi di apprendimento (cosa saprai fare)
- Concetti chiave (riformulati in modo conciso, NON copia del testo)
- Definizioni / glossario dei termini
- Elementi visivi: schemi, diagrammi, mappe concettuali
- Esempi svolti / casi
- **Domande di pratica e quiz** (richiamo attivo)
- Auto-valutazione

**Evidenza per i default** — Le guide basate su DOMANDE superano del ~22% quelle basate
solo su riassunti; in ambito tecnico/STEM le guide con PROBLEMI PRATICI danno ~28% in più.
→ Per questo tipo, **quiz ed esercizi sono default ATTIVI, non opzionali**.

**Lunghezza tipica** — 4–8 sezioni/argomenti.

**Default wizard** — Modalità Balanced · 4–8 sezioni · **quiz sì** · **esercizi sì** ·
schemi/diagrammi sì · glossario sì · output PDF.

**Fonte** — Ricerca su tecniche di studio / retrieval practice (active recall).

---

## 4. Manuale
**Definizione** — Spiegazione operativa passo dopo passo per usare/installare/mantenere
un prodotto, software, macchinario o procedura.

**Struttura standard** (IEC/IEEE 82079-1:2019 — norma per le "instructions for use"):
Organizzare per **tipi di informazione**:
- *Concettuale* — cos'è, a cosa serve, panoramica.
- *Istruzionale* — procedure passo-passo, istruzioni operative, checklist.
- *Di riferimento* — specifiche, parametri, tabelle.

Quando i destinatari sono diversi (es. installatore / operatore / manutentore),
**separare in capitoli o sezioni per pubblico**. Aggiungere: informazioni di sicurezza,
troubleshooting/diagnostica, glossario.

**Lunghezza tipica** — 6–10 capitoli/sezioni (in base a complessità e pubblici).

**Default wizard** — Modalità Technical · 6–10 capitoli · procedure/checklist sì ·
glossario sì · sezione sicurezza/troubleshooting sì · output PDF + DOCX.

**Fonte** — IEC/IEEE 82079-1:2019 (Preparation of information for use of products).

---

## 5. Report
**Definizione** — Analisi professionale di dati e documenti, orientata alla decisione,
per stakeholder/azienda.

**Struttura standard** (business report — prassi consolidata):
- Title page
- **Executive summary** (findings + raccomandazioni in sintesi, stand-alone)
- Indice
- Introduzione (contesto, obiettivi)
- Metodologia (come sono stati raccolti/analizzati i dati)
- Findings (cosa mostrano i dati — ogni finding ancorato a un dato specifico)
- Analisi
- Conclusioni e **Raccomandazioni** (ogni raccomandazione discende da un finding)
- Appendici / riferimenti

**Lunghezza tipica** — 4–8 sezioni principali.

**Default wizard** — Modalità Business · 4–8 sezioni · executive summary sì ·
tabelle/grafici sì · raccomandazioni sì · output PDF + DOCX.

**Fonte** — Standard business report (executive summary → findings → recommendations).

---

## 6. Corso
**Definizione** — Percorso formativo completo, strutturato per far apprendere
progressivamente un insieme di competenze.

**Struttura standard** (instructional design — modello ADDIE):
- Panoramica/introduzione del corso (obiettivi generali, prerequisiti)
- **Moduli** → ciascuno con più **lezioni**
- Ogni lezione: obiettivi di apprendimento specifici · contenuto · attività/esercizi ·
  valutazione (quiz)
- Valutazione finale / progetto conclusivo

A livello di singola lezione, struttura efficace (Gagne): hook → obiettivo →
richiamo prerequisiti → contenuto → guida → pratica → feedback → verifica.

**Lunghezza tipica** — 6–12 moduli (con lezioni multiple ciascuno).

**Default wizard** — Modalità Balanced · 6–12 moduli · obiettivi per lezione sì ·
esercizi sì · **quiz per modulo sì** · output PDF + DOCX.

**Fonte** — ADDIE / instructional design; Gagne's Nine Events (livello lezione).

---

## 7. Tesi / Ricerca
**Definizione** — Documento accademico strutturato che riporta una ricerca in modo
rigoroso e verificabile.

**Struttura standard** (IMRaD — standard ANSI 1972 per articoli scientifici):
- Abstract (sintesi, scritto per ultimo, posto per primo)
- **I**ntroduction (problema, contesto, gap, obiettivi/ipotesi)
- **M**ethods (come è stato condotto lo studio)
- **R**esults (cosa è stato trovato — solo dati, senza commento)
- **a**nd **D**iscussion (interpretazione, significato, collegamento alla letteratura)
- Conclusione (può essere sezione a sé o ultimo paragrafo della Discussion)
- Bibliografia / References
- (opzionali) Acknowledgments, Appendici

**Lunghezza tipica** — 5–8 sezioni principali.

**Default wizard** — Modalità Academic · 5–8 sezioni · abstract sì · metodologia sì ·
**bibliografia sì** · appendici opzionali · output PDF + DOCX.

**Fonte** — IMRaD (formalizzato ANSI 1972; standard de facto per la ricerca empirica).

---

## 8. Personalizzato
**Definizione** — Configurazione libera per utenti avanzati: nessuna struttura imposta,
l'utente definisce sezioni, lunghezza e opzioni manualmente (tutte le Avanzate aperte).

**Default wizard** — Nessun default imposto; pannello Avanzate completamente aperto e
modificabile; suggerimenti contestuali ma non preselezionati.

---

## Tabella riassuntiva default
| Tipo              | Modalità   | Capitoli/Sez. | Bibliografia | Quiz/Esercizi | Output default |
|-------------------|------------|---------------|--------------|---------------|----------------|
| Libro             | Balanced   | 8–12          | sì           | no            | PDF + EPUB     |
| Riassunto         | Fast Draft | —             | no           | no            | PDF            |
| Guida allo studio | Balanced   | 4–8           | no           | **sì (attivi)**| PDF           |
| Manuale           | Technical  | 6–10          | sì           | no            | PDF + DOCX     |
| Report            | Business   | 4–8           | sì (refs)    | no            | PDF + DOCX     |
| Corso             | Balanced   | 6–12 moduli   | no           | **sì (quiz)** | PDF + DOCX     |
| Tesi / Ricerca    | Academic   | 5–8           | sì           | no            | PDF + DOCX     |
| Personalizzato    | —          | libero        | libero       | libero        | libero         |

## Note d'uso
- Questi default sono **modificabili** dall'utente nelle Opzioni avanzate: sono punti di
  partenza intelligenti, non vincoli.
- Le **strutture standard** sopra servono anche come scaffold per il prompt di
  generazione: passare al modello la sequenza di sezioni attesa per il tipo scelto
  migliora coerenza e qualità dell'output.
- I numeri di capitoli sono range tipici per le stime client-side (tempo, capitoli) del
  preview panel.

## Fonti/standard di riferimento
- **IMRaD** — standard ANSI (1972) per articoli scientifici (Tesi/Ricerca).
- **IEC/IEEE 82079-1:2019** — preparazione delle istruzioni per l'uso (Manuale).
- **Business report standard** — title page → exec summary → findings → recommendations.
- **ADDIE / instructional design** — moduli/lezioni con obiettivi e valutazione (Corso).
- **Parti del libro** (front/body/back matter) — prassi editoriale saggistica.
- **Ricerca su tecniche di studio** — active recall, question-based > summary-based.

---

## Implicazioni di prodotto (flusso "scegli modello → personalizza struttura → genera")

> Annotato dalla direzione dell'utente. Da formalizzare in `PRODUCT-ARCHITECTURE.md`.

- **Modello = punto di partenza**: porta con sé **info di default + struttura standard**
  (le tabelle sopra). Il **modello resta INTATTO**: ogni modifica vale solo sul progetto.
- Scelto un modello, la pagina di destinazione **enfatizza la struttura, parte per parte**,
  e accanto a ciascuna parte un **"Modifica"**. Per ogni parte si può:
  - includere/escludere la parte (es. prefazione, appendici, glossario…);
  - definire il **numero di parti/capitoli** (rispetto al range default);
  - impostare le **parole per parte** (rispetto al default) e/o il **totale parole** del
    manoscritto;
- Area **tipografia/impaginazione** (rispetto ai default del modello): **carattere (font),
  dimensione, colore del carattere, interlinea** e le opzioni di formattazione comunemente
  richieste.
- Su **Salva** → si **genera il progetto** con il **titolo del libro** + il **pacchetto
  info** (default rimasti + personalizzazioni). Il progetto è una **derivazione del
  modello**: tutte le differenze rispetto al modello sono riflesse sul nuovo progetto.

### Modello dati da introdurre (bozza, da formalizzare in architettura)
- `ProjectTemplate { id, kind, parts: StructurePart[], defaults (mode/chapters/flags/
  outputFormats/typography), source }` — i template di questo documento.
- `StructurePart { key, label, optional, defaultWordCount?, included }` — parti standard
  per tipo (front/body/back matter, IMRaD, moduli/lezioni…).
- `TypographySettings { fontFamily, fontSizePt, textColor, lineHeight, … }` con default
  per modello, override sul progetto.
- Il `Project` derivato conserva `templateId` + gli **override** rispetto al modello
  (parti incluse/escluse, conteggi parole, tipografia), lasciando il template immutato.
