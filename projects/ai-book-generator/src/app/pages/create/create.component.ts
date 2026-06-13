import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import { ChoiceCardComponent } from '../../shared/components-v2/choice-card/choice-card.component';
import { ModelSetupComponent } from '../model-setup/model-setup.component';
import { TemplatesStore } from '../../core/state/templates.store';
import { injectI18nText } from '../../shared/services/i18n-text';
import { toModelChoices, type ModelChoice } from './create.util';

/**
 * Create — **host del flusso di creazione** (URL fisso `/create`).
 * Due step interni guidati dal query param `?template=`:
 *   • assente → **galleria modelli** (`ChoiceCard` dai dati del `TemplatesStore`);
 *   • presente → **personalizzazione** (`ModelSetupComponent` come componente di
 *     servizio, che al "genera" naviga al progetto creato `/project/:id`).
 * La presentazione della galleria è preparata qui (i18n risolto); le card e il
 * setup restano agnostici dal routing. Pattern customer-portal (wizard interno,
 * URL stabile, naviga alla risorsa a fine flusso).
 */
@Component({
  selector: 'app-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChoiceCardComponent, ModelSetupComponent, MatIconModule, TranslateModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly templatesStore = inject(TemplatesStore);

  /**
   * Step del flusso, guidato dal query param `?template=`: assente → galleria;
   * presente → personalizzazione (model-setup come componente di servizio). URL
   * fisso su `/create`; al "genera" model-setup naviga al progetto creato.
   */
  readonly template = input<string>();

  /** Risolutore i18n reattivo (ricalcola i computed al cambio lingua). */
  private readonly t = injectI18nText();

  /** Card della galleria, una per modello, con l'i18n già risolto. */
  readonly cards = computed<ModelChoice[]>(() =>
    toModelChoices(this.templatesStore.templates(), this.t),
  );

  /** Scelto un modello → step di personalizzazione (stesso URL /create, param). */
  chooseModel(id: string): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { template: id } });
  }

  /** Torna alla galleria (rimuove il param). */
  clearTemplate(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { template: null } });
  }
}
