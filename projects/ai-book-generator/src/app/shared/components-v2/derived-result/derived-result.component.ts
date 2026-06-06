import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

// View-model LOCALE (il dumb non dipende da `core/domain`): strutturalmente
// compatibile con il `DerivedContent` di dominio, così il padre lo passa così com'è.
export type DerivedResultKind =
  | 'summary'
  | 'slides'
  | 'quiz'
  | 'manual'
  | 'study_guide'
  | 'translation';

export interface DerivedResultQuiz {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}
export interface DerivedResultSlide {
  title: string;
  bullets: string[];
}
export interface DerivedResultStep {
  title: string;
  body: string;
}
export interface DerivedResultCard {
  front: string;
  back: string;
}

export interface DerivedResultContent {
  kind: DerivedResultKind;
  title: string;
  language?: string;
  paragraphs?: string[];
  slides?: DerivedResultSlide[];
  quiz?: DerivedResultQuiz[];
  steps?: DerivedResultStep[];
  cards?: DerivedResultCard[];
}

/**
 * DerivedResultComponent — rende il **risultato di un derivato** (riassunto,
 * presentazione, quiz, manuale, guida, traduzione) in sola lettura. Dumb 100%:
 * riceve `content` (view-model locale, no dominio) ed esegue lo switch sul tipo;
 * la label di sola lettura arriva via input (i18n-agnostico).
 */
@Component({
  selector: 'app-derived-result',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'derived-result' },
  imports: [MatIconModule],
  templateUrl: './derived-result.component.html',
  styleUrl: './derived-result.component.scss',
})
export class DerivedResultComponent {
  readonly content = input.required<DerivedResultContent>();
  /** Etichetta "sola lettura" (già tradotta). Vuoto = nascosta. */
  readonly readonlyLabel = input<string>('');
}
