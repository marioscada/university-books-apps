/**
 * Upload dei byte di un file su S3 tramite **presigned URL**, con **progress reale**.
 *
 * Usa `XMLHttpRequest` (non `fetch`): solo `xhr.upload.onprogress` espone l'avanzamento
 * reale dei byte inviati. È volutamente fuori da `HttpClient`/interceptor così la PUT
 * verso S3 **non** porta il Bearer Cognito (S3 firma già l'autorizzazione nella URL).
 *
 * VINCOLO CRITICO: il `Content-Type` della PUT deve coincidere ESATTAMENTE con quello
 * con cui il backend ha firmato la presigned URL, altrimenti S3 risponde **403**.
 *
 * PREREQUISITI INFRA (backend, non aggirabili dal FE):
 * - il bucket deve avere una **CORS policy** che consente `PUT` (e gli header usati)
 *   dall'origin dell'app; errori CORS opachi qui = questa config mancante;
 * - la presigned URL deve essere firmata con lo **stesso** content-type inviato.
 */
export class S3UploadError extends Error {
  constructor(
    message: string,
    /** HTTP status della PUT (0 = rete/CORS/abort). */
    readonly status: number,
  ) {
    super(message);
    this.name = 'S3UploadError';
  }
}

export function s3PutWithProgress(
  uploadUrl: string,
  file: Blob,
  contentType: string,
  onProgress?: (fraction: number) => void,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    // Stesso content-type della firma (causa #1 di 403 sulle presigned URL).
    xhr.setRequestHeader('Content-Type', contentType);

    xhr.upload.onprogress = (e: ProgressEvent) => {
      if (e.lengthComputable && onProgress) {
        onProgress(e.total > 0 ? e.loaded / e.total : 0);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1);
        resolve();
      } else {
        reject(new S3UploadError(`PUT su S3 fallita (HTTP ${xhr.status})`, xhr.status));
      }
    };
    xhr.onerror = () => reject(new S3UploadError('Errore di rete o CORS sulla PUT verso S3', 0));
    xhr.send(file);
  });
}
