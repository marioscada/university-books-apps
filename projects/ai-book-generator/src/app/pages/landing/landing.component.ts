import { Component, ChangeDetectionStrategy } from '@angular/core';

import { SiteShellComponent } from '../../shared/layout/site-shell/site-shell.component';
import { SiteHeaderNavComponent } from '../../shared/layout/site-header-nav/site-header-nav.component';
import { SiteFooterBlockComponent } from '../../shared/layout/site-footer-block/site-footer-block.component';
import { HeroSectionComponent } from '../../shared/sections/hero-section/hero-section.component';
import { ContentSectionComponent } from '../../shared/sections/content-section/content-section.component';
import { OutputTypesComponent, OutputType } from '../../shared/sections/output-types/output-types.component';
import {
  OutputShowcaseComponent,
  ShowcaseItem,
} from '../../shared/sections/output-showcase/output-showcase.component';
import { HeroSectionData } from '../../shared/sections/hero-section/hero-section.types';
import { ContentSectionData } from '../../shared/sections/content-section/content-section.types';
import { BRAND, APP_FOOTER_COLUMNS } from '../../shared/navigation/site-navigation';

/**
 * Landing Page — vetrina pubblica (prima pagina del sito, no login richiesto).
 * Istruisce sul prodotto; OGNI CTA porta alla login (l'uso dell'app richiede
 * autenticazione). Header minimale: logo + Login + Sign Up (niente nav/search,
 * che appartengono all'app loggata). Vedi docs/CREATE-PAGE-DESIGN.md.
 *
 * Sostituisce i vecchi componenti landing/* (tema dark): quelli restano su
 * disco finché non vengono rimossi in cleanup.
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    SiteShellComponent,
    SiteHeaderNavComponent,
    SiteFooterBlockComponent,
    HeroSectionComponent,
    ContentSectionComponent,
    OutputTypesComponent,
    OutputShowcaseComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  /** Brand + footer condivisi (single source: shared/navigation/site-navigation). */
  readonly brand = BRAND;
  readonly footerColumns = APP_FOOTER_COLUMNS;

  /** Destinazione di tutti i CTA: la login è obbligatoria per usare l'app. */
  private readonly authRoute = '/auth/login';

  // 1. HERO
  readonly hero: HeroSectionData = {
    sectionId: 'hero',
    title: 'Dai tuoi appunti a un libro.',
    subtitle: 'Manuali e riassunti professionali in minuti.',
    imageSrc: 'images/landing-hero.webp',
    imageAlt: 'I tuoi documenti trasformati in un libro AI Books Generator',
    cta: { label: 'Generate', route: this.authRoute },
  };

  // 3. HOW IT WORKS — 4 blocchi alternati
  readonly howItWorks: readonly ContentSectionData[] = [
    {
      id: 'upload',
      eyebrow: 'Step 1',
      title: 'Carica il tuo materiale',
      body: 'PDF, Word, PowerPoint, immagini, URL o semplici note testuali. Trascina tutto in un’unica area: l’AI legge e capisce le tue fonti.',
      layout: 'text-left',
      media: { src: 'images/step-upload.svg', alt: 'Area di upload con drag & drop' },
    },
    {
      id: 'goal',
      eyebrow: 'Step 2',
      title: 'Scegli cosa generare',
      body: 'Libro, riassunto, appunti di studio, corso di formazione, manuale tecnico o report di ricerca. Tu scegli l’obiettivo, l’AI adatta tono e struttura.',
      layout: 'text-right',
      media: { src: 'images/step-goal.svg', alt: 'Selezione del tipo di output' },
    },
    {
      id: 'write',
      eyebrow: 'Step 3',
      title: 'L’AI struttura e scrive',
      body: 'Analizza i documenti, estrae i concetti chiave, organizza i capitoli e genera il contenuto. Tu vedi l’avanzamento in tempo reale.',
      layout: 'text-left',
      media: { src: 'images/step-structure.svg', alt: 'Outline dei capitoli generati' },
    },
    {
      id: 'export',
      eyebrow: 'Step 4',
      title: 'Esporta dove vuoi',
      body: 'Rivedi e modifica i capitoli, poi esporta in PDF, DOCX, EPUB o Markdown. Pronto da condividere, stampare o pubblicare.',
      layout: 'text-right',
      media: { src: 'images/step-export.svg', alt: 'Formati di esportazione' },
    },
  ];

  // 4. OUTPUT TYPES
  readonly outputTypes: readonly OutputType[] = [
    { icon: 'menu_book', label: 'Book', description: 'Libri completi e strutturati in capitoli.' },
    { icon: 'summarize', label: 'Summary', description: 'Riassunti chiari e concisi.' },
    { icon: 'school', label: 'Study Notes', description: 'Appunti di studio pronti da ripassare.' },
    { icon: 'cast_for_education', label: 'Training Course', description: 'Corsi di formazione modulari.' },
    { icon: 'build', label: 'Technical Manual', description: 'Manuali tecnici dettagliati.' },
    { icon: 'science', label: 'Research Report', description: 'Report di ricerca documentati.' },
    { icon: 'tune', label: 'Custom', description: 'Qualunque formato tu descriva.' },
  ];

  // 5. OUTPUT SHOWCASE
  readonly showcase: readonly ShowcaseItem[] = [
    { src: 'images/showcase-1.svg', alt: 'Libro universitario generato', caption: 'Libro universitario · 120 pagine' },
    { src: 'images/showcase-2.svg', alt: 'Manuale tecnico generato', caption: 'Manuale tecnico professionale' },
    { src: 'images/showcase-3.svg', alt: 'Appunti di studio generati', caption: 'Appunti di studio illustrati' },
  ];

  // 10. CTA FINALE (banda scura)
  readonly finalCta: ContentSectionData = {
    id: 'cta',
    title: 'Pronto a generare il tuo primo libro?',
    body: 'Accedi e ottieni un documento professionale in pochi minuti.',
    layout: 'centered',
    cta: { label: 'Inizia ora', route: this.authRoute },
  };

  // FOOTER: usa APP_FOOTER_COLUMNS condivise; in landing showAuthOnly resta
  // false (default) → Create/Projects/Library nascosti automaticamente.
}

