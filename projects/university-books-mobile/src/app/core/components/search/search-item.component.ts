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
  template: `
    <div
      class="search-item"
      [class.search-item-focused]="isFocused"
      (click)="onSelect()"
      (keydown.enter)="onSelect()"
      role="option"
      [attr.aria-selected]="isFocused"
      tabindex="-1"
    >
      <!-- Icon -->
      <ion-icon
        [name]="item().icon"
        class="search-item-icon"
      ></ion-icon>

      <!-- Content -->
      <div class="search-item-content">
        <div class="search-item-title">
          {{ item().title }}
        </div>

        @if (item().subtitle || item().metadata) {
          <div class="search-item-meta">
            @if (item().subtitle) {
              <span class="search-item-subtitle">
                {{ item().subtitle }}
              </span>
            }
            @if (item().metadata) {
              <span class="search-item-metadata">
                {{ item().metadata }}
              </span>
            }
          </div>
        }
      </div>

      <!-- Badge -->
      @if (item().badge) {
        <span
          class="search-item-badge"
          [style.background-color]="getBadgeColor(item().badgeColor)"
        >
          {{ item().badge }}
        </span>
      }

      <!-- "Jump to" hint (GitHub-style) -->
      <span class="search-item-hint">Jump to</span>
    </div>
  `,
  styles: [`
    @use '../../../../../styles/variables' as vars;

    .search-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.15s ease;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      outline: none;

      &:hover,
      &.search-item-focused {
        background: vars.$surface-2;

        .search-item-hint {
          opacity: 1;
        }
      }

      &:active {
        background: vars.$surface-3;
      }
    }

    .search-item-icon {
      font-size: 20px;
      color: vars.$text-color-secondary;
      flex-shrink: 0;
    }

    .search-item-content {
      flex: 1;
      min-width: 0;
    }

    .search-item-title {
      color: vars.$text-color;
      font-weight: vars.$font-weight-medium;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .search-item-meta {
      display: flex;
      gap: 8px;
      margin-top: 2px;
      font-size: 12px;
      color: vars.$text-color-secondary;
    }

    .search-item-subtitle,
    .search-item-metadata {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .search-item-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: vars.$font-weight-semibold;
      color: vars.$white;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .search-item-hint {
      font-size: 11px;
      font-weight: vars.$font-weight-semibold;
      color: vars.$text-color-secondary;
      opacity: 0;
      transition: opacity 0.15s ease;
      white-space: nowrap;
      flex-shrink: 0;
    }
  `],
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

  /**
   * Get badge color hex value
   */
  public getBadgeColor(
    color: SearchItem['badgeColor'] = 'medium'
  ): string {
    const colors: Record<string, string> = {
      primary: '#3B82F6',
      secondary: '#6B7280',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      medium: '#6B7280',
    };
    return colors[color] || colors['medium'];
  }
}
