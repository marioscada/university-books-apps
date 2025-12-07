import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Subject, of } from 'rxjs';
import { switchMap, map, catchError, startWith, tap, shareReplay } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public readonly loginForm: FormGroup;

  // ✅ Subject per trigger del submit (no subscribe nel .ts)
  private readonly submitTrigger$ = new Subject<{ email: string; password: string }>();

  // ✅ Observable per lo stato - usato con async pipe nel template
  public readonly loginState$ = this.submitTrigger$.pipe(
    switchMap(({ email, password }) =>
      this.authService.signIn$(email, password).pipe(
        map((result) => ({
          loading: false,
          error: null as string | null,
          success: result.isSignedIn
        })),
        tap((state) => {
          // ✅ Navigation side effect (eseguito dall'async pipe)
          if (state.success) {
            this.router.navigate(['/home']);
          }
        }),
        catchError((error: unknown) => {
          const errorMessage = error && typeof error === 'object' && 'message' in error
            ? (error as { message: string }).message
            : 'Login failed. Please check your credentials and try again.';
          return of({
            loading: false,
            error: errorMessage,
            success: false
          });
        }),
        startWith({ loading: true, error: null as string | null, success: false })
      )
    ),
    startWith({ loading: false, error: null as string | null, success: false }),
    shareReplay(1) // ✅ Condivide stream per multiple async pipe
  );

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    // Auto-redirect if already authenticated
    effect(() => {
      const isAuthenticated = this.authService.state().isAuthenticated;
      const loading = this.authService.state().loading;

      if (isAuthenticated && !loading) {
        // Get return URL from query params or default to /home
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.router.navigateByUrl(returnUrl);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;
    // ✅ Trigger observable stream (no subscribe)
    this.submitTrigger$.next({ email, password });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
