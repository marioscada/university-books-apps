/**
 * workspace-seed — DATI MOCK dello Studio (indice + capitoli + chat).
 *
 * ⚠️ TEMPORANEO: file da ABOLIRE quando subentra il backend AWS. Contiene solo
 * DATI di esempio, nessuna logica. Il `MockApiService` li usa per simulare la
 * `Version` (outline → capitoli) e il thread di chat. Con l'API reale (stessa
 * firma `ApiPort`) questo file e `MockApiService` spariscono insieme.
 */

/** Titoli capitolo dell'indice generato (mock). */
export const SEED_CHAPTER_TITLES: readonly string[] = [
  'Introduzione',
  'Panoramica del mercato',
  'Analisi della domanda',
  'Analisi competitiva',
  'Trend e scenari',
  'Opportunità e rischi',
  'Raccomandazioni',
  'Conclusioni',
];

/** Corpo segnaposto di un capitolo sviluppato (mock). */
export const SEED_CHAPTER_BODY = [
  'Il mercato presenta opportunità rilevanti legate alla digitalizzazione dei processi e all’ingresso in segmenti adiacenti ancora poco presidiati. La domanda mostra una crescita costante, trainata da clienti che cercano soluzioni integrate.',
  'Un esempio concreto: nel comparto retail l’adozione di piattaforme self-service ha ridotto del 18% i tempi di evasione, liberando margine per investire in servizi a valore aggiunto.',
  'Sul fronte dei rischi, la pressione competitiva sui prezzi e la concentrazione di pochi fornitori chiave possono erodere i margini nel medio periodo.',
].join('\n\n');

/** Corpo "lungo" (≈ doppio) per un capitolo — utile a testare la paginazione del lettore. */
export const SEED_CHAPTER_BODY_LONG = [
  'Il mercato presenta opportunità rilevanti legate alla digitalizzazione dei processi e all’ingresso in segmenti adiacenti ancora poco presidiati. La domanda mostra una crescita costante, trainata da clienti che cercano soluzioni integrate e tempi di adozione più rapidi.',
  'La trasformazione digitale ridisegna le catene del valore: gli operatori che integrano dati, automazione e servizi guadagnano un vantaggio difendibile, mentre chi resta ancorato a processi manuali vede erodersi quote e marginalità.',
  'Un esempio concreto: nel comparto retail l’adozione di piattaforme self-service ha ridotto del 18% i tempi di evasione, liberando margine per investire in servizi a valore aggiunto e nella relazione con il cliente.',
  'La segmentazione della domanda evidenzia tre cluster: clienti price-sensitive, clienti orientati al servizio e clienti enterprise con esigenze di integrazione. Ciascun cluster richiede una proposta di valore distinta e canali dedicati.',
  'Sul fronte dei rischi, la pressione competitiva sui prezzi e la concentrazione di pochi fornitori chiave possono erodere i margini nel medio periodo. Si raccomanda di diversificare le fonti di approvvigionamento e presidiare le nicchie a maggiore marginalità.',
  'In sintesi, il bilanciamento tra espansione e controllo del rischio operativo sarà determinante: le scelte dei prossimi due trimestri definiranno la traiettoria di crescita sostenibile e la capacità di assorbire shock esterni.',
].join('\n\n');

/** Messaggio di benvenuto dell'assistente all'apertura del thread (mock). */
export const SEED_CHAT_GREETING =
  'Ho preparato l’indice in capitoli. Posso accorciarlo, aggiungere dati o cambiare il tono: chiedimi pure una modifica.';

/** Risposte simulate dell'assistente (mock). */
export const SEED_CHAT_REPLY_WITH_OP =
  'Fatto: ho applicato la modifica al capitolo. Rileggilo e, se va bene, approvalo.';
export const SEED_CHAT_REPLY_DEFAULT =
  'Ricevuto. Posso accorciare, espandere, aggiungere esempi o cambiare tono — dimmi pure.';
