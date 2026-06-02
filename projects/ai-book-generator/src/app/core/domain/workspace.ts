/**
 * Tenancy (predisposta, NON attiva in v1).
 *
 * Copia fedele di PRODUCT-ARCHITECTURE.md §1.1. In v1 esiste un solo workspace
 * personale implicito per utente e il ruolo è sempre `owner`; le entità però
 * prevedono già team/ruoli/piani per un'estensione indolore.
 */

export type Plan = 'free' | 'pro' | 'team';
export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;          // userId
  plan: Plan;
  createdAt: string;        // ISO
}

export interface Member {
  id: string;
  workspaceId: string;
  userId: string;
  role: Role;               // v1: sempre 'owner'
  createdAt: string;
}
