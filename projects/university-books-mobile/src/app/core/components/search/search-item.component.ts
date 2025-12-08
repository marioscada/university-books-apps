import {
  Component,
  input,
  output,
  inject,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocusableOption } from '@angular/cdk/a11y';
import { IonIcon } from '@ionic/angular/standalone';

import { SearchItem } from '../../models/search-item.model';

/**
 * Search Item Component
 *
 * Implements FocusableOption for CDK ListKeyManager keyboard navigation.
 * Pure presentation component for individual search results.
 *
 * Inspired by Angular Material's option component pattern.
 *
 * @example
 * ```html
 * <app-search-item
 *   [item]="searchItem"
 *   (selected)="onItemSelected($event)"
 * ></app-search-item>
 * ```
 */
@Component({
  selector: 'app-search-item',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.search-item-focused]': 'isFocused',
  },
})
export class SearchItemComponent implements FocusableOption {
  private readonly elementRef = inject(ElementRef);

  /**
   * Search item data
   */
  public readonly item = input.required<SearchItem>();

  /**
   * Item selected event
   */
  public readonly selected = output<SearchItem>();

  /**
   * Focus state (managed by ListKeyManager)
   */
  public isFocused = false;

  /**
   * FocusableOption interface implementation
   * Called by ListKeyManager to focus this item
   */
  public focus(): void {
    this.isFocused = true;
    this.elementRef.nativeElement.focus();
  }

  /**
   * Blur handler
   */
  public blur(): void {
    this.isFocused = false;
  }

  /**
   * Handle item selection
   */
  public onSelect(): void {
    this.selected.emit(this.item());
  }
}
