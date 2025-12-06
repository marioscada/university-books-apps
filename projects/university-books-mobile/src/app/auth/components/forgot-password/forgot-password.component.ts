import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';

import { parsePasswordResetError } from './forgot-password.utils';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  public readonly emailForm: FormGroup;
  public readonly resetForm: FormGroup;
  public readonly loading = signal(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly successMessage = signal<string | null>(null);
  public readonly step = signal<'email' | 'code'>('email');

  private email = '';

  constructor() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(12)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
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

    resetPassword({ username: this.email })
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

    confirmResetPassword({
      username: this.email,
      confirmationCode: code,
      newPassword
    })
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
}
