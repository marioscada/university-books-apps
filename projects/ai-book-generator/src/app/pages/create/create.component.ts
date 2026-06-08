import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import { ChoiceCardComponent } from '../../shared/components-v2/choice-card/choice-card.component';
import { TemplatesStore } from '../../core/state/templates.store';
import { injectI18nText } from '../../shared/services/i18n-text';
import { METER_MAX, toModelChoices, type ModelChoice } from './create.util';

/**
 * Create — pagina "Crea un nuovo progetto": intestazione + callout informativo +
 * **galleria di modelli** resa iterando il componente dumb `ChoiceCard` dai dati
 * del `TemplatesStore`. Scegliere un modello apre la personalizzazione
 * (`/create/new?template=<id>`). Tutta la presentazione è preparata qui (i18n
 * risolto), il componente card resta agnostico dal dominio.
 */
@Component({
  selector: 'app-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChoiceCardComponent, MatIconModule, TranslateModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent {
  private readonly router = inject(Router);
  private readonly templatesStore = inject(TemplatesStore);

  /** Risolutore i18n reattivo (ricalcola i computed al cambio lingua). */
  private readonly t = injectI18nText();

  readonly meterMax = METER_MAX;
  readonly shortLabel = computed(() => this.t('i18n.Create.short'));
  readonly longLabel = computed(() => this.t('i18n.Create.long'));

  /** Card della galleria, una per modello, con l'i18n già risolto. */
  readonly cards = computed<ModelChoice[]>(() =>
    toModelChoices(this.templatesStore.templates(), this.t),
  );

  /** Scelto un modello → pagina di personalizzazione. */
  chooseModel(id: string): void {
    void this.router.navigate(['/create/new'], { queryParams: { template: id } });
  }
}
