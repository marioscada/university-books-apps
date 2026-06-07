import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  effect,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Ruolo di un messaggio in chat (mirror di `core/domain/chat.ts`). */
export type ChatRole = 'user' | 'assistant' | 'system';

/** Bolla di conversazione (view-model dumb, i18n-agnostico). */
export interface ChatBubble {
  /** Chiave stabile per il tracking. */
  id: string;
  role: ChatRole;
  /** Testo del messaggio (già tradotto/risolto dal padre). */
  text: string;
  /** Etichetta dell'operazione tipizzata applicata (già tradotta), es. "lunghezza −20% · cap. 6". */
  operationLabel?: string;
  /** Stato transitorio: l'assistente sta elaborando ("sta scrivendo…"). */
  pending?: boolean;
}

/** Operazione rapida proposta sotto il thread. */
export interface QuickOp {
  /** Chiave emessa al click (es. 'reduce_length'). */
  key: string;
  /** Etichetta visibile (già tradotta). */
  label: string;
}

/**
 * AiChatPanelComponent — pannello dumb/presentational di **comunicazione con l'AI**:
 * intestazione, thread di bolle (utente/assistente con eventuale tag operazione e
 * stato "sta scrivendo"), riga di **operazioni rapide** e composer (campo + invio).
 *
 * Non conosce il dominio: riceve le bolle e le operazioni già pronte, emette
 * `send` (testo) e `quickOp` (chiave). i18n-agnostico (label via input), two-way
 * `[(value)]` sul campo, `OnPush` + signals, stile dai soli token globali, a11y
 * (thread `aria-live`, label del campo). Riusabile su Indice, Capitoli, Analisi
 * (in stato d'attesa via `disabled` + `waitingHint`).
 *
 * @example
 * ```html
 * <app-ai-chat-panel
 *   [title]="'Assistente AI'" [subtitle]="'Modifica il capitolo 6'"
 *   [messages]="bubbles()" [quickOps]="ops()"
 *   [placeholder]="'Scrivi un’istruzione…'"
 *   [(value)]="draft"
 *   (send)="onSend($event)" (quickOp)="onQuickOp($event)" />
 * ```
 */
@Component({
  selector: 'app-ai-chat-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ai-chat' },
  imports: [MatIconModule],
  templateUrl: './ai-chat-panel.component.html',
  styleUrl: './ai-chat-panel.component.scss',
})
export class AiChatPanelComponent {
  /** Titolo del pannello (già tradotto). */
  readonly title = input<string>('');
  /** Sottotitolo/contesto (già tradotto). */
  readonly subtitle = input<string>('');
  /** Bolle del thread, in ordine cronologico. */
  readonly messages = input<ChatBubble[]>([]);
  /** Operazioni rapide mostrate sopra il composer. */
  readonly quickOps = input<QuickOp[]>([]);
  /** Placeholder del campo. */
  readonly placeholder = input<string>('');
  /** Etichetta a11y del bottone d'invio. */
  readonly sendLabel = input<string>('');
  /** Messaggio mostrato quando il thread è vuoto (già tradotto). */
  readonly emptyHint = input<string>('');
  /** Composer in attesa (campo disabilitato): mostra `waitingHint`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Nota mostrata sopra il composer disabilitato (es. "Potrai intervenire…"). */
  readonly waitingHint = input<string>('');
  /** Mostra il bottone di chiusura nell'header (es. bottom-sheet mobile). */
  readonly closable = input(false, { transform: booleanAttribute });

  /** Testo corrente del campo (two-way `[(value)]`). */
  readonly value = model<string>('');

  /** Emesso all'invio: porta il testo corrente (il padre azzera `value`). */
  readonly send = output<string>();
  /** Emesso al click su un'operazione rapida: porta la `key`. */
  readonly quickOp = output<string>();
  /** Emesso alla chiusura (se `closable`). */
  readonly closed = output<void>();

  private static seq = 0;
  protected readonly fieldId = `chat-${AiChatPanelComponent.seq++}`;

  /** Riferimento al thread per l'auto-scroll. */
  private readonly threadRef = viewChild<ElementRef<HTMLElement>>('thread');
  /**
   * Auto-scroll all'ultimo messaggio quando il thread cambia (come Claude/ChatGPT):
   * dopo il render porta lo scroll in fondo. Costruttore magro → effect come campo.
   */
  private readonly autoScroll = effect(() => {
    this.messages();
    const el = this.threadRef()?.nativeElement;
    if (el) {
      requestAnimationFrame(() => (el.scrollTop = el.scrollHeight));
    }
  });

  protected onSubmit(): void {
    const text = this.value().trim();
    if (!text || this.disabled()) {
      return;
    }
    this.send.emit(text);
  }

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLTextAreaElement).value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    // Invio = invia, Shift+Invio = a capo.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }
}
