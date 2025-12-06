# @university-books/decorators

Shared TypeScript decorators for University Books Angular applications.

## 📦 What's Inside

This library contains reusable TypeScript decorators to reduce boilerplate code and improve development experience.

### Available Decorators

#### `@Unsubscribe()` - Automatic RxJS Subscription Cleanup

Automatically unsubscribes from RxJS subscriptions when Angular component is destroyed.

## 🚀 Installation

This is an internal library. Path mapping is already configured in `tsconfig.json`:

```json
{
  "paths": {
    "@university-books/decorators": ["./libs/decorators/src/index.ts"]
  }
}
```

## 📖 Usage

### @Unsubscribe Decorator

```typescript
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Unsubscribe } from '@university-books/decorators';

export class MyComponent implements OnInit {
  @Unsubscribe()
  private dataSubscription!: Subscription;

  @Unsubscribe()
  private userSubscription!: Subscription;

  @Unsubscribe()
  private notificationSubscription!: Subscription;

  ngOnInit(): void {
    // The decorator automatically unsubscribes when component is destroyed
    this.dataSubscription = this.dataService.getData$().subscribe({
      next: (data) => console.log(data)
    });

    this.userSubscription = this.userService.getCurrentUser$().subscribe({
      next: (user) => console.log(user)
    });

    this.notificationSubscription = this.notificationService.getNotifications$().subscribe({
      next: (notifications) => console.log(notifications)
    });
  }

  // No need to implement ngOnDestroy - decorator handles it automatically!
}
```

### How It Works

The `@Unsubscribe` decorator:
1. Marks subscription properties for automatic cleanup
2. Hooks into `ngOnDestroy` lifecycle
3. Automatically calls `unsubscribe()` on all marked subscriptions
4. Preserves any existing `ngOnDestroy` logic you may have

## ⚠️ Important Notes

### When to Use @Unsubscribe

Use `@Unsubscribe` decorator **ONLY** in these cases:

✅ **Good use cases:**
- Components with 3+ subscriptions that cannot use `async` pipe
- Dynamic subscriptions that are added/removed at runtime
- Legacy code refactoring where `takeUntilDestroyed()` is not applicable

❌ **Avoid if possible:**
- Use `async` pipe in template instead (best practice)
- Use `takeUntilDestroyed()` for simple cases (Angular 16+)
- Modern Angular signals-based state management

### Preference Order

1. 🥇 **BEST**: Use `async` pipe in template
   ```typescript
   users$ = this.userService.getUsers$();
   // Template: {{ users$ | async }}
   ```

2. 🥈 **GOOD**: Use `takeUntilDestroyed()` (Angular 16+)
   ```typescript
   this.service.getData$()
     .pipe(takeUntilDestroyed())
     .subscribe();
   ```

3. 🥉 **ACCEPTABLE**: Use `@Unsubscribe` decorator (complex cases only)
   ```typescript
   @Unsubscribe()
   private sub!: Subscription;
   ```

## 🔧 Requirements

- `reflect-metadata` package (already installed in Angular projects)
- RxJS 7.8+
- TypeScript decorators enabled in `tsconfig.json`:
  ```json
  {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
  ```

## 📝 Examples

### Complex Component Example

```typescript
import { Component, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { Unsubscribe } from '@university-books/decorators';

export class DashboardComponent implements OnInit {
  // All subscriptions marked for auto-cleanup
  @Unsubscribe()
  private dataPolling!: Subscription;

  @Unsubscribe()
  private userUpdates!: Subscription;

  @Unsubscribe()
  private analyticsTracking!: Subscription;

  ngOnInit(): void {
    // Poll data every 30 seconds
    this.dataPolling = interval(30000)
      .pipe(switchMap(() => this.api.fetchData$()))
      .subscribe((data) => this.updateDashboard(data));

    // Listen for user updates
    this.userUpdates = this.userService.getUserUpdates$()
      .subscribe((user) => this.updateUserInfo(user));

    // Track page views
    this.analyticsTracking = this.analytics.trackPageView$()
      .subscribe();
  }

  // Optional: you can still have ngOnDestroy for other cleanup
  ngOnDestroy(): void {
    console.log('Cleaning up dashboard');
    // @Unsubscribe decorator handles subscriptions automatically
    // This is called AFTER subscriptions are cleaned up
  }
}
```

### With Existing ngOnDestroy

```typescript
export class MyComponent implements OnInit, OnDestroy {
  @Unsubscribe()
  private subscription!: Subscription;

  private timer: any;

  ngOnInit(): void {
    this.subscription = this.service.getData$().subscribe();
    this.timer = setInterval(() => console.log('tick'), 1000);
  }

  ngOnDestroy(): void {
    // Custom cleanup logic
    clearInterval(this.timer);

    // @Unsubscribe handles subscription automatically
    // No need to manually unsubscribe
  }
}
```

## 🐛 Troubleshooting

**Decorator not working?**
1. Ensure `experimentalDecorators: true` in `tsconfig.json`
2. Check that `reflect-metadata` is installed
3. Verify the property is typed as `Subscription`

**Memory leaks still happening?**
1. Check DevTools to verify subscriptions are actually being cleaned up
2. Enable debug logging by checking console (decorator logs cleanup)
3. Consider using `async` pipe instead

## 📚 References

- [Angular RxJS Interop](https://angular.dev/guide/rxjs-interop)
- [RxJS Subscription](https://rxjs.dev/guide/subscription)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)

---

**Part of University Books monorepo**
