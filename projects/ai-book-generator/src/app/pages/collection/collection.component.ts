import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { AuthShellComponent } from '../../shared/layout/auth-shell/auth-shell.component';
import {
  CollectionAction,
  CollectionFilter,
  CollectionItem,
  CollectionKind,
} from './collection.types';

interface FilterTab {
  value: CollectionFilter;
  label: string;
}

/** Metadati per categoria (icona Material + etichetta). */
const KIND_META: Record<CollectionKind, { icon: string; label: string }> = {
  book: { icon: 'menu_book', label: 'Libri' },
  summary: { icon: 'summarize', label: 'Riassunti' },
  course: { icon: 'cast_for_education', label: 'Corsi' },
  notes: { icon: 'school', label: 'Note' },
};

/**
 * Collection — archivio storico di TUTTO ciò che l'utente ha già realizzato
 * (solo completati), classificato per categoria. La Dashboard mostra invece i
 * recenti / in corso (presente); qui c'è il passato consultabile/riutilizzabile.
 * Pattern Drive/Notion (archivio vs continue-working). Usa AuthShell. Dati mock.
 * Vedi docs/CREATE-PAGE-DESIGN.md.
 */
@Component({
  selector: 'app-collection',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AuthShellComponent, MatIconModule, MatMenuModule],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.scss',
})
export class CollectionComponent {
  readonly kindMeta = KIND_META;

  /** Filtri per categoria (lo stato non serve: è tutto completato). */
  readonly filters: readonly FilterTab[] = [
    { value: 'all', label: 'Tutti' },
    { value: 'book', label: 'Libri' },
    { value: 'summary', label: 'Riassunti' },
    { value: 'course', label: 'Corsi' },
    { value: 'notes', label: 'Note' },
  ];

  readonly activeFilter = signal<CollectionFilter>('all');

  // Mock: solo elementi COMPLETATI (lo storico). Sostituire con l'API.
  private readonly items = signal<readonly CollectionItem[]>([
    { id: 'c1', title: 'AI & Machine Learning Book', kind: 'book', completedLabel: '2 giorni fa' },
    { id: 'c2', title: 'Physics Summary', kind: 'summary', completedLabel: 'ieri' },
    { id: 'c3', title: 'Public Speaking Course', kind: 'course', completedLabel: '3 giorni fa' },
    { id: 'c4', title: 'History Notes', kind: 'notes', completedLabel: '5 giorni fa' },
    { id: 'c5', title: 'Microeconomics Manual', kind: 'book', completedLabel: '1 settimana fa' },
    { id: 'c6', title: 'Contemporary History Summary', kind: 'summary', completedLabel: '2 settimane fa' },
  ]);

  /** Elementi filtrati per categoria attiva. */
  readonly visibleItems = computed(() => {
    const filter = this.activeFilter();
    const all = this.items();
    return filter === 'all' ? all : all.filter((i) => i.kind === filter);
  });

  setFilter(filter: CollectionFilter): void {
    this.activeFilter.set(filter);
  }

  /** Azioni per un elemento (tutti completati → Open, non Continue). */
  actionsFor(_item: CollectionItem): CollectionAction[] {
    return [
      { id: 'open', label: 'Open', icon: 'open_in_new' },
      { id: 'duplicate', label: 'Duplicate', icon: 'content_copy' },
      { id: 'export', label: 'Export', icon: 'download' },
      { id: 'delete', label: 'Delete', icon: 'delete', danger: true },
    ];
  }

  onAction(action: CollectionAction, item: CollectionItem): void {
    // TODO: collegare alle operazioni reali (apertura editor, export, ecc.).
    void action;
    void item;
  }
}
