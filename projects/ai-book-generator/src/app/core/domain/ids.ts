/**
 * Identificatori del dominio.
 *
 * In v1 gli id sono semplici `string`. Esponiamo alias tipizzati per leggibilità
 * del contratto (firme API, store, seed): non cambiano la rappresentazione
 * runtime ma documentano a cosa si riferisce ogni id.
 */

export type Id = string;

export type WorkspaceId = Id;
export type UserId = Id;
export type ProjectId = Id;
export type VersionId = Id;
export type JobId = Id;
export type SourceId = Id;
export type ThreadId = Id;
export type MessageId = Id;
export type OperationId = Id;
export type ChapterId = Id;
