import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { CounterFieldComponent } from '../../../shared/ui/counter-field/counter-field.component';
import { fieldError } from '../../auth-form.util';
import { parsePasswordResetError } from './forgot-password.utils';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CounterFieldComponent],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  public readonly emailForm: FormGroup;
  public readonly resetForm: FormGroup;
  public readonly loading = signal(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly successMessage = signal<string | null>(null);
  public readonly step = signal<'email' | 'code'>('email');

  private email = '';

  constructor() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(12)]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validators: this.passwordMatchValidator,
    });
  }

  onRequestCode(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.email = this.emailForm.value.email;

    this.auth.resetPassword(this.email)
      .then(() => {
        this.loading.set(false);
        this.step.set('code');
        this.successMessage.set('Verification code sent to your email!');
      })
      .catch((error) => {
        this.loading.set(false);
        this.errorMessage.set(parsePasswordResetError(error));
      });
  }

  onResetPassword(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { code, newPassword } = this.resetForm.value;

    this.auth.confirmResetPassword(this.email, code, newPassword)
      .then(() => {
        this.loading.set(false);
        this.successMessage.set('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      })
      .catch((error) => {
        this.loading.set(false);
        this.errorMessage.set(parsePasswordResetError(error));
      });
  }

  private readonly passwordMatchValidator = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get emailControl() {
    return this.emailForm.get('email');
  }

  get code() {
    return this.resetForm.get('code');
  }

  get newPassword() {
    return this.resetForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetForm.get('confirmPassword');
  }

  get passwordMismatch() {
    return this.resetForm.errors?.['passwordMismatch'] &&
           this.confirmPassword?.touched;
  }

  get emailError(): string {
    return fieldError(this.emailControl, {
      required: 'Email is required',
      email: 'Please enter a valid email',
    });
  }

  get codeError(): string {
    return fieldError(this.code, {
      required: 'Code is required',
      minlength: 'Code must be 6 digits',
    });
  }

  get newPasswordError(): string {
    return fieldError(this.newPassword, {
      required: 'Password is required',
      minlength: 'Password must be at least 12 characters',
    });
  }

  get confirmPasswordError(): string {
    if (this.passwordMismatch) return 'Passwords do not match';
    return fieldError(this.confirmPassword, { required: 'Please confirm your password' });
  }
}
