import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * ProseComponent — rende una lista di **blocchi markdown** (titoli `#`/`##`/`###`
 * e paragrafi) come testo leggibile. Dumb/presentational, i18n-agnostico, `OnPush`,
 * token globali. `display:contents` sull'host: i blocchi fluiscono nel layout del
 * contenitore (ne ereditano `gap`/scroll), così è riusabile in lettori diversi
 * (in pagina, in dialog) senza imporre un wrapper. Solo struttura per heading:
 * niente parsing inline (grassetti/link), che subentrerà con il markdown reale.
 *
 * @example
 * ```html
 * <app-prose [blocks]="paragraphs()" />
 * ```
 */
@Component({
  selector: 'app-prose',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'prose' },
  templateUrl: './prose.component.html',
  styleUrl: './prose.component.scss',
})
export class ProseComponent {
  /** Blocchi di testo già divisi (paragrafi e heading markdown). */
  readonly blocks = input<string[]>([]);

  /** Un blocco è un heading markdown se inizia con 1–6 `#` seguiti da spazio. */
  protected isHeading(block: string): boolean {
    return /^#{1,6}\s/.test(block);
  }
  /** Livello del heading (1–6). */
  protected headingLevel(block: string): number {
    return block.match(/^(#{1,6})\s/)?.[1].length ?? 0;
  }
  /** Testo del heading senza i `#`. */
  protected headingText(block: string): string {
    return block.replace(/^#{1,6}\s+/, '');
  }
}
