/**
 * Dati MOCK dei derivati — da ABOLIRE col backend AWS. Simulano ciò che il
 * server restituisce dopo aver elaborato il derivato (riassunto, slide, quiz,
 * manuale, guida, traduzione). Vedi [[data-layer-aws-ready]].
 */
import type { DerivedContent, DerivedKind } from '../domain';

const SUMMARY: string[] = [
  'Il mercato 2024 mostra una crescita a doppia cifra trainata dalla domanda nei segmenti enterprise, con una netta accelerazione nel secondo semestre.',
  'I tre fattori chiave sono l’adozione di soluzioni cloud-native, il consolidamento dei fornitori e una maggiore attenzione ai costi operativi.',
  'I rischi principali restano la volatilità della supply chain e la pressione regolatoria, mentre le opportunità si concentrano su automazione e analisi dei dati.',
  'Raccomandazione: investire in partnership strategiche e in capacità di delivery, mantenendo flessibilità sui prezzi per difendere la quota nei segmenti core.',
];

const TRANSLATION: string[] = [
  'The 2024 market shows double-digit growth driven by enterprise demand, with a clear acceleration in the second half of the year.',
  'The three key drivers are the adoption of cloud-native solutions, vendor consolidation, and a stronger focus on operating costs.',
  'The main risks remain supply-chain volatility and regulatory pressure, while opportunities concentrate on automation and data analytics.',
  'Recommendation: invest in strategic partnerships and delivery capacity, keeping pricing flexible to defend share in the core segments.',
];

const SLIDES: DerivedContent['slides'] = [
  { title: 'Analisi del mercato 2024', bullets: ['Crescita a doppia cifra', 'Focus enterprise', 'Accelerazione H2'] },
  { title: 'Driver di crescita', bullets: ['Cloud-native', 'Consolidamento fornitori', 'Efficienza dei costi'] },
  { title: 'Rischi & opportunità', bullets: ['Supply chain volatile', 'Pressione regolatoria', 'Automazione e dati'] },
  { title: 'Raccomandazioni', bullets: ['Partnership strategiche', 'Capacità di delivery', 'Prezzi flessibili'] },
];

const QUIZ: DerivedContent['quiz'] = [
  {
    question: 'Cosa ha trainato la crescita del mercato 2024?',
    options: ['La domanda consumer', 'La domanda enterprise', 'I tassi di interesse', 'Le esportazioni'],
    answerIndex: 1,
    explanation: 'La crescita è stata trainata dalla domanda nei segmenti enterprise.',
  },
  {
    question: 'Quale NON è un driver chiave indicato nel documento?',
    options: ['Cloud-native', 'Consolidamento fornitori', 'Efficienza dei costi', 'Espansione retail fisica'],
    answerIndex: 3,
    explanation: 'L’espansione retail fisica non è tra i driver citati.',
  },
  {
    question: 'Quando si è registrata l’accelerazione?',
    options: ['Primo trimestre', 'Secondo semestre', 'Fine 2023', 'Non indicata'],
    answerIndex: 1,
  },
  {
    question: 'Su cosa si concentra la raccomandazione finale?',
    options: ['Tagli al personale', 'Partnership e delivery', 'Uscita dai segmenti core', 'Aumento generalizzato dei prezzi'],
    answerIndex: 1,
  },
];

const STEPS: DerivedContent['steps'] = [
  { title: '1 · Raccogli i dati di mercato', body: 'Aggrega fonti interne ed esterne sui segmenti rilevanti, normalizzando i periodi.' },
  { title: '2 · Identifica i driver', body: 'Isola i fattori di crescita ricorrenti e valutane l’impatto relativo.' },
  { title: '3 · Mappa rischi e opportunità', body: 'Classifica i rischi per probabilità/impatto e collega ogni rischio a un’azione.' },
  { title: '4 · Definisci le raccomandazioni', body: 'Traduci l’analisi in 3–5 azioni misurabili con owner e tempistiche.' },
];

const CARDS: DerivedContent['cards'] = [
  { front: 'Driver principale 2024', back: 'Domanda enterprise, in accelerazione nel secondo semestre.' },
  { front: 'Tre fattori chiave', back: 'Cloud-native, consolidamento fornitori, efficienza dei costi.' },
  { front: 'Rischi principali', back: 'Volatilità della supply chain e pressione regolatoria.' },
  { front: 'Opportunità', back: 'Automazione e analisi dei dati.' },
  { front: 'Raccomandazione', back: 'Partnership strategiche, delivery, prezzi flessibili.' },
];

const KIND_LABEL: Record<DerivedKind, string> = {
  summary: 'Riassunto',
  slides: 'Presentazione',
  quiz: 'Quiz',
  manual: 'Manuale',
  study_guide: 'Guida allo studio',
  translation: 'Traduzione',
};

/** Etichetta leggibile del tipo di derivato. */
export function derivedKindLabel(kind: DerivedKind): string {
  return KIND_LABEL[kind];
}

/** Costruisce il contenuto mock del derivato in base al tipo. */
export function buildDerivedContent(
  kind: DerivedKind,
  baseTitle: string,
  language = 'Inglese',
): DerivedContent {
  switch (kind) {
    case 'summary':
      return { kind, title: `Riassunto — ${baseTitle}`, paragraphs: SUMMARY };
    case 'slides':
      return { kind, title: `Presentazione — ${baseTitle}`, slides: SLIDES };
    case 'quiz':
      return { kind, title: `Quiz — ${baseTitle}`, quiz: QUIZ };
    case 'manual':
      return { kind, title: `Manuale — ${baseTitle}`, steps: STEPS };
    case 'study_guide':
      return { kind, title: `Guida allo studio — ${baseTitle}`, cards: CARDS };
    case 'translation':
      return { kind, title: `${baseTitle} (${language})`, language, paragraphs: TRANSLATION };
  }
}
