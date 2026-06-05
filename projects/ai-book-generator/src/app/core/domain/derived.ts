/**
 * Contenuto di un **derivato** (riassunto, slide, quiz, manuale, guida, traduzione).
 * È ciò che il server restituisce dopo aver elaborato il derivato: il frontend lo
 * mostra in sola lettura, con possibilità di segnalare errori all'AI e rigenerare.
 *
 * Un'unica interfaccia con payload opzionali per tipo (lo switch è sul `kind`):
 * il componente di risultato renderizza la parte pertinente.
 */
import type { DerivedKind } from './project';

/** Domanda a risposta multipla (quiz). */
export interface QuizItem {
  question: string;
  options: string[];
  /** Indice (0-based) della risposta corretta. */
  answerIndex: number;
  explanation?: string;
}

/** Slide di una presentazione. */
export interface Slide {
  title: string;
  bullets: string[];
}

/** Passo di un manuale operativo. */
export interface ManualStep {
  title: string;
  body: string;
}

/** Scheda di ripasso (guida allo studio). */
export interface StudyCard {
  front: string;
  back: string;
}

export interface DerivedContent {
  kind: DerivedKind;
  /** Titolo del derivato. */
  title: string;
  /** Lingua di destinazione (solo per `translation`). */
  language?: string;
  /** Paragrafi (summary, translation). */
  paragraphs?: string[];
  /** Slide (slides). */
  slides?: Slide[];
  /** Domande (quiz). */
  quiz?: QuizItem[];
  /** Passi (manual). */
  steps?: ManualStep[];
  /** Schede (study_guide). */
  cards?: StudyCard[];
}
