import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  AfterViewInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  closeOutline,
  bookOutline,
  documentTextOutline,
  documentOutline,
  personOutline,
} from 'ionicons/icons';

import type { SearchItem, SearchCategory, SearchCategoryConfig } from '../../../../models/search-item.model';
import { SEARCH_CATEGORY_CONFIGS } from '../../../../models/search-item.model';
import { SearchOverlayService } from '../../../../services/search-overlay.service';
import { SearchItemComponent } from '../search-item/search-item.component';

/**
 * Search Dropdown Component (Pure Presentation)
 *
 * GitHub-style search dropdown with categorized results.
 * Uses CDK A11y ListKeyManager for keyboard navigation.
 *
 * Pure presentation component:
 * - Receives items via input
 * - Emits selection via output
 * - Parent decides what to search and where to navigate
 *
 * Features:
 * - Client-side filtering
 * - Category grouping (Books, Chapters, Documents, Users)
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Accessible (ARIA roles, ListKeyManager)
 *
 * @example
 * ```typescript
 * // Opened via SearchOverlayService (parent component provides all texts)
 * const ref = this.searchOverlayService.open(element, SearchDropdownComponent);
 * ref.instance.items = allSearchableItems;
 * ref.instance.placeholder = 'Search books, chapters, documents...';
 * ref.instance.emptyMessage = 'Start typing to search';
 * ref.instance.noResultsMessage = 'No results found for "{query}"';
 * ref.instance.noResultsHint = 'Try searching for something else';
 * ref.instance.jumpToHint = 'Jump to';
 *
 * // ⚠️ Persistent subscription: parent component manages dropdown lifecycle
 * ref.instance.itemSelected.pipe(takeUntilDestroyed()).subscribe(item => {
 *   // Parent handles navigation logic
 *   this.router.navigate(['/books', item.id]);
 * });
 * ```
 */
@Component({
  selector: 'app-search-dropdown',
  standalone: true,
  imports: [CommonModule, IonIcon, SearchItemComponent],
  templateUrl: './search-dropdown.component.html',
  styleUrls: ['./search-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'search-dropdown-container'
  }
})
export class SearchDropdownComponent implements AfterViewInit {
  @ViewChildren(SearchItemComponent)
  itemComponents!: QueryList<SearchItemComponent>;

  private keyManager?: FocusKeyManager<SearchItemComponent>;

  /**
   * All searchable items (provided by parent)
   */
  @Input({ required: true }) items!: SearchItem[];

  /**
   * Placeholder text (translated by parent)
   */
  @Input({ required: true }) placeholder!: string;

  /**
   * Empty state message (translated by parent)
   */
  @Input({ required: true }) emptyMessage!: string;

  /**
   * No results message template (translated by parent)
   * Use {query} placeholder for search query
   * Example: "No results found for {query}"
   */
  @Input({ required: true }) noResultsMessage!: string;

  /**
   * No results hint text (translated by parent)
   */
  @Input({ required: true }) noResultsHint!: string;

  /**
   * "Jump to" hint text for search items (translated by parent)
   */
  @Input({ required: true }) jumpToHint!: string;

  /**
   * Search query observable (internal state)
   */
  private readonly searchQuerySubject = new BehaviorSubject<string>('');
  public readonly searchQuery$ = this.searchQuerySubject.asObservable();

  /**
   * Filtered items based on search query
   * Shows all items initially (empty query = show all)
   */
  public readonly filteredItems$: Observable<SearchItem[]> = this.searchQuery$.pipe(
    map((query) => {
      // Handle case where items is not yet set
      if (!this.items) {
        return [];
      }

      const trimmedQuery = query.toLowerCase().trim();

      // Show all items when query is empty
      if (!trimmedQuery) {
        return this.items;
      }

      // Filter items based on query
      return this.items.filter(
        (item) =>
          item.title.toLowerCase().includes(trimmedQuery) ||
          item.subtitle?.toLowerCase().includes(trimmedQuery) ||
          item.metadata?.toLowerCase().includes(trimmedQuery)
      );
    })
  );

  /**
   * Items grouped by category (GitHub-style)
   */
  public readonly itemsByCategory$: Observable<Map<SearchCategory, SearchItem[]>> =
    this.filteredItems$.pipe(
      map((items) => {
        const grouped = new Map<SearchCategory, SearchItem[]>();

        // Group items by category
        items.forEach((item) => {
          const existing = grouped.get(item.category) || [];
          grouped.set(item.category, [...existing, item]);
        });

        return grouped;
      })
    );

  /**
   * Categories with items (for template iteration)
   */
  public readonly categoriesWithItems$: Observable<
    { config: SearchCategoryConfig; items: SearchItem[] }[]
  > = this.itemsByCategory$.pipe(
    map((grouped) =>
      Array.from(grouped.entries()).map(([category, items]) => ({
        config: SEARCH_CATEGORY_CONFIGS[category],
        items,
      }))
    )
  );

  /**
   * Show empty state
   */
  public readonly showEmpty$: Observable<boolean> = this.searchQuery$.pipe(
    map((query) => query.trim() === ''),
    startWith(true)
  );

  /**
   * Show no results state
   */
  public readonly showNoResults$: Observable<boolean> = combineLatest([
    this.searchQuery$,
    this.filteredItems$,
  ]).pipe(
    map(([query, items]) => query.trim() !== '' && items.length === 0),
    startWith(false)
  );

  /**
   * Formatted no results message (replaces {query} placeholder)
   */
  public readonly noResultsMessageFormatted$: Observable<string> = this.searchQuery$.pipe(
    map((query) => this.noResultsMessage.replace('{query}', query))
  );

  /**
   * Item selected event (parent handles navigation)
   */
  @Output() itemSelected = new EventEmitter<SearchItem>();

  private readonly searchOverlayService = inject(SearchOverlayService);

  constructor() {
    addIcons({
      searchOutline,
      closeOutline,
      bookOutline,
      documentTextOutline,
      documentOutline,
      personOutline,
    });
  }

  ngAfterViewInit(): void {
    // Initialize CDK ListKeyManager for keyboard navigation
    this.keyManager = new FocusKeyManager(this.itemComponents)
      .withWrap()
      .withTypeAhead()
      .withHomeAndEnd();
  }

  /**
   * Handle search input
   */
  public onSearchInput(event: CustomEvent): void {
    const value = event.detail.value || '';
    this.searchQuerySubject.next(value);

    // Reset keyboard manager when query changes
    if (this.keyManager) {
      this.keyManager.setFirstItemActive();
    }
  }

  /**
   * Handle keyboard events
   */
  public onKeydown(event: KeyboardEvent): void {
    if (!this.keyManager) return;

    // Arrow keys, home, end
    if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      this.keyManager.onKeydown(event);
      return;
    }

    // Enter key - select active item
    if (event.key === 'Enter') {
      event.preventDefault();
      const activeItem = this.keyManager.activeItem;
      if (activeItem) {
        this.onItemSelect(activeItem.item);
      }
      return;
    }

    // Escape key - close dropdown
    if (event.key === 'Escape') {
      this.close();
      return;
    }
  }

  /**
   * Handle item selection
   * Parent component handles navigation logic
   */
  public onItemSelect(item: SearchItem): void {
    this.itemSelected.emit(item);
    this.close();
  }

  /**
   * Close dropdown
   */
  public close(): void {
    this.searchOverlayService.close();
  }
}
