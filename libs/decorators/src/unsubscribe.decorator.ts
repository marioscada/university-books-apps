/**
 * @Unsubscribe Decorator
 *
 * Automatically unsubscribes from RxJS subscriptions when component is destroyed.
 *
 * Usage:
 * ```typescript
 * export class MyComponent implements OnInit {
 *   @Unsubscribe()
 *   private subscription1!: Subscription;
 *
 *   @Unsubscribe()
 *   private subscription2!: Subscription;
 *
 *   ngOnInit(): void {
 *     this.subscription1 = this.service.getData$().subscribe();
 *     this.subscription2 = this.service.getMore$().subscribe();
 *   }
 *
 *   // ngOnDestroy is handled automatically by decorator
 * }
 * ```
 *
 * @important Use this decorator ONLY for complex cases with 3+ subscriptions.
 * Prefer `async` pipe in templates or `takeUntilDestroyed()` for simple cases.
 *
 * @see https://angular.dev/guide/rxjs-interop#takeuntildestroyed
 */

import 'reflect-metadata';
import { Subscription } from 'rxjs';

const UNSUBSCRIBE_METADATA_KEY = Symbol('unsubscribe');

interface UnsubscribeMetadata {
  propertyKeys: string[];
}

/**
 * Property decorator to mark RxJS subscriptions for automatic cleanup
 *
 * @returns PropertyDecorator
 */
export function Unsubscribe(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol): void {
    // Get existing metadata or create new
    const metadata: UnsubscribeMetadata = Reflect.getMetadata(
      UNSUBSCRIBE_METADATA_KEY,
      target.constructor
    ) || { propertyKeys: [] };

    // Add property to list
    metadata.propertyKeys.push(propertyKey.toString());

    // Store metadata
    Reflect.defineMetadata(
      UNSUBSCRIBE_METADATA_KEY,
      metadata,
      target.constructor
    );

    // Hook into ngOnDestroy
    const originalOnDestroy = target.ngOnDestroy;

    target.ngOnDestroy = function (): void {
      // Get metadata
      const storedMetadata: UnsubscribeMetadata = Reflect.getMetadata(
        UNSUBSCRIBE_METADATA_KEY,
        this.constructor
      );

      if (storedMetadata?.propertyKeys) {
        // Unsubscribe from all marked subscriptions
        storedMetadata.propertyKeys.forEach((key) => {
          const subscription = (this as any)[key];

          if (subscription && subscription instanceof Subscription) {
            if (!subscription.closed) {
              subscription.unsubscribe();
              console.debug(`[Unsubscribe] Cleaned up subscription: ${key}`);
            }
          } else if (subscription) {
            console.warn(
              `[Unsubscribe] Property "${key}" is not a Subscription. Skipping.`
            );
          }
        });
      }

      // Call original ngOnDestroy if it exists
      if (originalOnDestroy && typeof originalOnDestroy === 'function') {
        originalOnDestroy.apply(this);
      }
    };
  };
}
