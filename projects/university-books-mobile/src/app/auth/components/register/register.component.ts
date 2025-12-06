import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { signUp, confirmSignUp } from 'aws-amplify/auth';

import { parseRegistrationError, parseConfirmationError } from './register.utils';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  public readonly registerForm: FormGroup;
  public readonly confirmationForm: FormGroup;
  public readonly loading = signal(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly successMessage = signal<string | null>(null);
  public readonly step = signal<'register' | 'verify'>('register');

  protected userEmail = '';

  constructor() {
    this.registerForm = this.fb.group({
      givenName: ['', [Validators.required]],
      familyName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(12),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.confirmationForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { givenName, familyName, email, password } = this.registerForm.value;
    this.userEmail = email;

    signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          'name': `${givenName} ${familyName}`,
          'given_name': givenName,
          'family_name': familyName
        },
        autoSignIn: false
      }
    }).then((result) => {
      this.loading.set(false);

      if (result.isSignUpComplete) {
        this.successMessage.set('Registration successful! Redirecting to login...');
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      } else {
        this.step.set('verify');
        this.successMessage.set('Please check your email and enter the verification code below.');
      }
    }).catch((error) => {
      this.loading.set(false);
      console.error('❌ Registration error:', error);
      console.log('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code
      });
      this.errorMessage.set(parseRegistrationError(error));
    });
  }

  onConfirm(): void {
    if (this.confirmationForm.invalid) {
      this.confirmationForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { code } = this.confirmationForm.value;

    confirmSignUp({
      username: this.userEmail,
      confirmationCode: code
    }).then(() => {
      this.loading.set(false);
      this.successMessage.set('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 2000);
    }).catch((error) => {
      this.loading.set(false);
      this.errorMessage.set(parseConfirmationError(error));
    });
  }

  private readonly passwordStrengthValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

    return !passwordValid ? { passwordStrength: true } : null;
  }

  private readonly passwordMatchValidator = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get givenName() {
    return this.registerForm.get('givenName');
  }

  get familyName() {
    return this.registerForm.get('familyName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get passwordMismatch() {
    return this.registerForm.errors?.['passwordMismatch'] &&
           this.confirmPassword?.touched;
  }

  get code() {
    return this.confirmationForm.get('code');
  }
}
