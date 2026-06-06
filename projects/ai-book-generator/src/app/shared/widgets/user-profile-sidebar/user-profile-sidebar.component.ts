import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { A11yModule } from '@angular/cdk/a11y';
import { trigger, style, transition, animate } from '@angular/animations';

import type { AuthUser } from '../../../auth/models/auth.model';

/**
 * UserProfileSidebar — drawer profilo (DUMB/presentational). Mostra i dati utente
 * e le voci menu/account; **non** conosce auth/router: riceve `user`/`loggingOut`/
 * `logoutError` via input ed emette `closeSidebar`/`logout`. Il container
 * (AuthShell) gestisce signOut e navigazione.
 */
@Component({
  selector: 'app-user-profile-sidebar',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatListModule, MatDividerModule, A11yModule],
  templateUrl: './user-profile-sidebar.component.html',
  styleUrls: ['./user-profile-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms ease-in', style({ opacity: 1 }))]),
      transition(':leave', [animate('200ms ease-out', style({ opacity: 0 }))]),
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0)' })),
      ]),
      transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(100%)' }))]),
    ]),
  ],
})
export class UserProfileSidebarComponent {
  /** Dati utente (dal container). */
  readonly user = input<AuthUser | null>(null);
  /** Logout in corso. */
  readonly loggingOut = input(false);
  /** Errore di logout (già tradotto). */
  readonly logoutError = input<string | null>(null);

  /** Richiesta di chiusura. */
  readonly closeSidebar = output<void>();
  /** Richiesta di logout (gestita dal container). */
  readonly logout = output<void>();

  /** Vista corrente: menu | account. */
  readonly currentView = signal<'menu' | 'account'>('menu');

  /** Nome mostrato sotto l'avatar (solo nome, maiuscolo). */
  readonly displayName = computed(() => {
    const u = this.user();
    return u?.givenName ? u.givenName.toUpperCase() : '';
  });

  onClose(): void {
    this.currentView.set('menu');
    this.closeSidebar.emit();
  }
  showAccount(): void {
    this.currentView.set('account');
  }
  backToMenu(): void {
    this.currentView.set('menu');
  }
  onLogout(): void {
    this.logout.emit();
  }
}
