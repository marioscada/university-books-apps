/**
 * Contenuto delle pagine informative/legali (footer): un'unica `LegalPage`
 * generica le renderizza in base alla `legalKey` di rotta. Testo segnaposto da
 * sostituire con quello definitivo (struttura titolo + intro + sezioni).
 */
export type LegalKey = 'about' | 'contact' | 'privacy' | 'terms' | 'cookie' | 'imprint';

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalPageModel {
  /** Titolo della pagina. */
  title: string;
  /** Paragrafo introduttivo. */
  intro: string;
  /** Sezioni con titolo (opzionali). */
  sections?: LegalSection[];
  /** Nota "bozza" finché il testo definitivo non è pronto. */
  draft?: boolean;
}

export const LEGAL_PAGES: Record<LegalKey, LegalPageModel> = {
  about: {
    title: 'Chi siamo',
    intro:
      'AI Books Generator trasforma i tuoi materiali — appunti, documenti, fonti — in libri, manuali e riassunti professionali in pochi minuti.',
    sections: [
      {
        heading: 'La nostra missione',
        body: 'Rendere la creazione di documenti strutturati accessibile a tutti, unendo i tuoi contenuti alla potenza dei modelli di linguaggio.',
      },
    ],
    draft: true,
  },
  contact: {
    title: 'Contatti',
    intro: 'Hai domande o richieste? Scrivici, ti rispondiamo il prima possibile.',
    sections: [{ heading: 'Email', body: 'support@aibooksgenerator.com' }],
    draft: true,
  },
  privacy: {
    title: 'Privacy Policy',
    intro:
      'Questa informativa descrive come trattiamo i dati personali degli utenti di AI Books Generator.',
    draft: true,
  },
  terms: {
    title: 'Termini di servizio',
    intro: "Condizioni d'uso del servizio AI Books Generator.",
    draft: true,
  },
  cookie: {
    title: 'Cookie Policy',
    intro: 'Informativa sull’uso dei cookie e delle tecnologie simili.',
    draft: true,
  },
  imprint: {
    title: 'Note legali',
    intro: 'Informazioni societarie e dati identificativi del titolare del servizio.',
    draft: true,
  },
};
