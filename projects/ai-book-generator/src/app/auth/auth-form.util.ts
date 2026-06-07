import type { AbstractControl } from '@angular/forms';

/**
 * Restituisce il messaggio d'errore del controllo (solo dopo il `touched`),
 * scegliendo il primo `errorKey` presente in `messages`. Centralizza il
 * boilerplate touched/errors condiviso dai form di autenticazione.
 *
 * @example
 * get emailError(): string {
 *   return fieldError(this.email, { required: 'Email is required', email: 'Invalid email' });
 * }
 */
export function fieldError(
  control: AbstractControl | null | undefined,
  messages: Record<string, string>,
): string {
  if (!control?.touched || !control.errors) {
    return '';
  }
  for (const key of Object.keys(messages)) {
    if (control.errors[key]) {
      return messages[key];
    }
  }
  return '';
}
