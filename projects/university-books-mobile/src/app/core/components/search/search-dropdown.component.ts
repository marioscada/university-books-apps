import {
  Component,
  computed,
  input,
  output,
  signal,
  ViewChildren,
  QueryList,
  AfterViewInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { IonSearchbar, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  closeOutline,
  bookOutline,
  documentTextOutline,
  documentOutline,
  personOutline,
} from 'ionicons/icons';

import {
  SearchItem,
  SearchCategory,
  SEARCH_CATEGORY_CONFIGS,
} from '../../models/search-item.model';
import { SearchOverlayService } from '../../services/search-overlay.service';
import { SearchItemComponent } from './search-item.component';

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
 * // Opened via SearchOverlayService (parent component)
 * const ref = this.searchOverlayService.open(element, SearchDropdownComponent);
 * ref.instance.items.set(allSearchableItems);
 * ref.instance.itemSelected.subscribe(item => {
 *   // Parent handles navigation logic
 *   this.router.navigate(['/books', item.id]);
 * });
 * ```
 */
@Component({
  selector: 'app-search-dropdown',
  standalone: true,
  imports: [CommonModule, IonSearchbar, IonIcon, SearchItemComponent],
  templateUrl: './search-dropdown.component.html',
  styleUrls: ['./search-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchDropdownComponent implements AfterViewInit {
  private readonly searchOverlayService = inject(SearchOverlayService);

  @ViewChildren(SearchItemComponent)
  itemComponents!: QueryList<SearchItemComponent>;

  private keyManager?: FocusKeyManager<SearchItemComponent>;

  /**
   * All searchable items (provided by parent)
   */
  public readonly items = input.required<SearchItem[]>();

  /**
   * Placeholder text
   */
  public readonly placeholder = input<string>('Search books, chapters, documents...');

  /**
   * Dropdown title
   */
  public readonly title = input<string>('Search');

  /**
   * Empty state message
   */
  public readonly emptyMessage = input<string>('Start typing to search');

  /**
   * Search query signal
   */
  public readonly searchQuery = signal<string>('');

  /**
   * Filtered items based on search query
   */
  public readonly filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return [];
    }

    return this.items().filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.subtitle?.toLowerCase().includes(query) ||
        item.metadata?.toLowerCase().includes(query)
    );
  });

  /**
   * Items grouped by category (GitHub-style)
   */
  public readonly itemsByCategory = computed(() => {
    const items = this.filteredItems();
    const grouped: Map<SearchCategory, SearchItem[]> = new Map();

    // Group items by category
    items.forEach((item) => {
      const existing = grouped.get(item.category) || [];
      grouped.set(item.category, [...existing, item]);
    });

    return grouped;
  });

  /**
   * Categories with items (for template iteration)
   */
  public readonly categoriesWithItems = computed(() => {
    const grouped = this.itemsByCategory();
    return Array.from(grouped.entries()).map(([category, items]) => ({
      config: SEARCH_CATEGORY_CONFIGS[category],
      items,
    }));
  });

  /**
   * Show empty state
   */
  public readonly showEmpty = computed(
    () => this.searchQuery().trim() === ''
  );

  /**
   * Show no results state
   */
  public readonly showNoResults = computed(
    () => this.searchQuery().trim() !== '' && this.filteredItems().length === 0
  );

  /**
   * Item selected event (parent handles navigation)
   */
  public readonly itemSelected = output<SearchItem>();

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
    this.searchQuery.set(value);

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
        this.onItemSelect(activeItem.item());
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
