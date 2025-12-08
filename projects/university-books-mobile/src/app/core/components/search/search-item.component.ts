import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocusableOption } from '@angular/cdk/a11y';
import { IonIcon } from '@ionic/angular/standalone';

import type { SearchItem } from '../../models/search-item.model';

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
 *   [jumpToHint]="'Jump to'"
 *   (selected)="onItemSelected($event)"
 * ></app-search-item>
 * ```
 *
 * Note: All text content must be provided by parent component (already translated)
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
  /**
   * Search item data
   */
  @Input({ required: true }) item!: SearchItem;

  /**
   * "Jump to" hint text (translated by parent)
   * Example: "Jump to", "Go to", "Navigate to"
   */
  @Input({ required: true }) jumpToHint!: string;

  /**
   * Item selected event
   */
  @Output() selected = new EventEmitter<SearchItem>();

  /**
   * Focus state (managed by ListKeyManager)
   */
  public isFocused = false;

  constructor(private readonly elementRef: ElementRef) {}

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
    this.selected.emit(this.item);
  }
}
