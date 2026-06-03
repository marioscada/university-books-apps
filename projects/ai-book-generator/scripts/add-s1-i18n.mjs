import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const i18nDir = join(here, '..', 'public', 'i18n');

const DATA = {
  en: {
    'i18n.Setup.S1.eyebrow': 'First step',
    'i18n.Setup.S1.possM': 'your', 'i18n.Setup.S1.possF': 'your',
    'i18n.Setup.S1.artM': 'a', 'i18n.Setup.S1.artF': 'a',
    'i18n.Setup.S1.genM': '', 'i18n.Setup.S1.genF': '',
    'i18n.Setup.S1.title': 'Define {{poss}} {{name}}',
    'i18n.Setup.S1.subtitle': 'Give {{poss}} {{nameLower}} a name and briefly describe what it will contain.',
    'i18n.Setup.S1.titleLabel': '{{name}} title',
    'i18n.Setup.S1.titlePlaceholder': 'e.g. Italian Market Analysis 2024',
    'i18n.Setup.S1.descLabel': '{{name}} description',
    'i18n.Setup.S1.descPlaceholder': 'Describe the goal of the {{nameLower}} and the main topics you want to include…',
    'i18n.Setup.S1.optional': '(optional)',
    'i18n.Setup.S1.aboutTitle': 'What is {{art}} {{name}}',
    'i18n.Setup.S1.includesTitle': 'This {{nameLower}} can include:',
    'i18n.Setup.S1.more': 'and much more',
    'i18n.Models.book.about': 'A book is a complete, self-contained publication, organized in chapters, that develops a topic from start to finish.',
    'i18n.Models.summary.about': 'A summary is a short, easy-to-review version that captures the essentials of the material without extensive development.',
    'i18n.Models.study_guide.about': 'A study guide is material organized to learn and review quickly, with outlines, examples and quizzes.',
    'i18n.Models.manual.about': 'A manual is a step-by-step operational explanation for using, installing or maintaining a product or procedure.',
    'i18n.Models.report.about': 'A report is a structured document that gathers analysis, data, findings and recommendations in a clear, professional way.',
    'i18n.Models.presentation.about': 'A presentation is content ready for slides, with titles, key points and speaker notes.',
    'i18n.Models.course.about': 'A course is a complete learning path, structured in modules and lessons with exercises and quizzes.',
    'i18n.Models.thesis.about': 'A thesis is a structured academic document that reports research in a rigorous, verifiable way.',
    'i18n.Models.custom.about': 'A custom project lets you freely define structure, length and options, part by part.',
  },
  it: {
    'i18n.Setup.S1.eyebrow': 'Primo passo',
    'i18n.Setup.S1.possM': 'il tuo', 'i18n.Setup.S1.possF': 'la tua',
    'i18n.Setup.S1.artM': 'un', 'i18n.Setup.S1.artF': 'una',
    'i18n.Setup.S1.genM': 'del', 'i18n.Setup.S1.genF': 'della',
    'i18n.Setup.S1.title': 'Definisci {{poss}} {{name}}',
    'i18n.Setup.S1.subtitle': 'Scegli un nome per {{poss}} {{nameLower}} e descrivi brevemente cosa conterrà.',
    'i18n.Setup.S1.titleLabel': 'Titolo {{gen}} {{nameLower}}',
    'i18n.Setup.S1.titlePlaceholder': 'Es. Analisi del mercato italiano 2024',
    'i18n.Setup.S1.descLabel': 'Descrizione {{gen}} {{nameLower}}',
    'i18n.Setup.S1.descPlaceholder': 'Descrivi l’obiettivo {{gen}} {{nameLower}} e i principali argomenti che vuoi includere…',
    'i18n.Setup.S1.optional': '(facoltativa)',
    'i18n.Setup.S1.aboutTitle': 'Cos’è {{art}} {{name}}',
    'i18n.Setup.S1.includesTitle': 'In questo {{nameLower}} potrai includere:',
    'i18n.Setup.S1.more': 'e molto altro',
    'i18n.Models.book.about': 'Un libro è una pubblicazione completa e autoconsistente, organizzata in capitoli, che sviluppa un argomento dall’inizio alla fine.',
    'i18n.Models.summary.about': 'Un riassunto è una versione breve e facile da consultare che cattura l’essenziale del materiale senza sviluppo esteso.',
    'i18n.Models.study_guide.about': 'Una guida allo studio è materiale organizzato per imparare e ripassare velocemente, con schemi, esempi e quiz.',
    'i18n.Models.manual.about': 'Un manuale è una spiegazione operativa passo dopo passo per usare, installare o mantenere un prodotto o una procedura.',
    'i18n.Models.report.about': 'Un report è un documento strutturato che raccoglie analisi, dati, risultati e raccomandazioni in modo chiaro e professionale.',
    'i18n.Models.presentation.about': 'Una presentazione è un contenuto pronto per slide, con titoli, punti chiave e note del relatore.',
    'i18n.Models.course.about': 'Un corso è un percorso formativo completo, strutturato in moduli e lezioni con esercizi e quiz.',
    'i18n.Models.thesis.about': 'Una tesi è un documento accademico strutturato che riporta una ricerca in modo rigoroso e verificabile.',
    'i18n.Models.custom.about': 'Un progetto personalizzato ti lascia definire liberamente struttura, lunghezza e opzioni, parte per parte.',
  },
  de: {
    'i18n.Setup.S1.eyebrow': 'Erster Schritt',
    'i18n.Setup.S1.possM': 'dein', 'i18n.Setup.S1.possF': 'dein',
    'i18n.Setup.S1.artM': 'ein', 'i18n.Setup.S1.artF': 'ein',
    'i18n.Setup.S1.genM': '', 'i18n.Setup.S1.genF': '',
    'i18n.Setup.S1.title': 'Definiere {{poss}} {{name}}',
    'i18n.Setup.S1.subtitle': 'Gib {{poss}} {{nameLower}} einen Namen und beschreibe kurz den Inhalt.',
    'i18n.Setup.S1.titleLabel': 'Titel ({{nameLower}})',
    'i18n.Setup.S1.titlePlaceholder': 'z. B. Marktanalyse Italien 2024',
    'i18n.Setup.S1.descLabel': 'Beschreibung ({{nameLower}})',
    'i18n.Setup.S1.descPlaceholder': 'Beschreibe das Ziel {{gen}} {{nameLower}} und die wichtigsten Themen…',
    'i18n.Setup.S1.optional': '(optional)',
    'i18n.Setup.S1.aboutTitle': 'Was ist {{art}} {{name}}',
    'i18n.Setup.S1.includesTitle': 'Dieser {{nameLower}} kann enthalten:',
    'i18n.Setup.S1.more': 'und vieles mehr',
    'i18n.Models.book.about': 'Ein Buch ist eine vollständige, eigenständige Publikation in Kapiteln, die ein Thema von Anfang bis Ende entwickelt.',
    'i18n.Models.summary.about': 'Eine Zusammenfassung ist eine kurze, leicht zu lesende Version, die das Wesentliche ohne ausführliche Entwicklung erfasst.',
    'i18n.Models.study_guide.about': 'Eine Lernhilfe ist Material zum schnellen Lernen und Wiederholen, mit Übersichten, Beispielen und Quiz.',
    'i18n.Models.manual.about': 'Ein Handbuch ist eine Schritt-für-Schritt-Anleitung zum Verwenden, Installieren oder Warten eines Produkts oder Verfahrens.',
    'i18n.Models.report.about': 'Ein Bericht ist ein strukturiertes Dokument, das Analysen, Daten, Ergebnisse und Empfehlungen klar und professionell zusammenfasst.',
    'i18n.Models.presentation.about': 'Eine Präsentation ist Inhalt für Folien, mit Titeln, Kernpunkten und Sprechernotizen.',
    'i18n.Models.course.about': 'Ein Kurs ist ein vollständiger Lernpfad aus Modulen und Lektionen mit Übungen und Quiz.',
    'i18n.Models.thesis.about': 'Eine These ist ein strukturiertes akademisches Dokument, das Forschung rigoros und überprüfbar darstellt.',
    'i18n.Models.custom.about': 'Ein benutzerdefiniertes Projekt lässt dich Struktur, Länge und Optionen frei festlegen, Teil für Teil.',
  },
};

for (const [lang, entries] of Object.entries(DATA)) {
  const file = join(i18nDir, `${lang}.json`);
  const json = JSON.parse(readFileSync(file, 'utf8'));
  Object.assign(json, entries);
  const sorted = Object.fromEntries(Object.entries(json).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(file, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
  console.log(`${lang}.json: ${Object.keys(entries).length} S1 keys merged → ${Object.keys(sorted).length} total`);
}
