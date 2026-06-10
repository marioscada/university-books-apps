#!/usr/bin/env python3
"""Aggiorna name/desc/tags dei 9 modelli nelle 3 lingue, preservando il formato
(flat keys, ordinate, indent 2, accenti letterali)."""
import json

BASE = "projects/ai-book-generator/public/i18n"

# id -> {lang: (name, desc, tags)}
M = {
    "book": {
        "it": ("Libro", "Scrivi un libro completo organizzato in capitoli.", "Trama|Personaggi|Capitoli"),
        "en": ("Book", "Write a complete book organised chapter by chapter.", "Plot|Characters|Chapters"),
        "de": ("Buch", "Schreibe ein vollständiges Buch, Kapitel für Kapitel.", "Handlung|Figuren|Kapitel"),
    },
    "summary": {
        "it": ("Riassunto", "Sintetizza testi lunghi in modo chiaro, ordinato e immediato.", "Sintesi|Punti chiave|Mappe"),
        "en": ("Summary", "Summarise long texts clearly, neatly and instantly.", "Synthesis|Key points|Maps"),
        "de": ("Zusammenfassung", "Lange Texte klar, geordnet und sofort zusammenfassen.", "Synthese|Kernpunkte|Maps"),
    },
    "thesis": {
        "it": ("Tesina", "Imposta e sviluppa una tesina accademica con struttura professionale.", "Indice|Fonti|Bibliografia"),
        "en": ("Paper", "Set up and develop an academic paper with a professional structure.", "Outline|Sources|Bibliography"),
        "de": ("Facharbeit", "Eine akademische Facharbeit mit professioneller Struktur erstellen.", "Gliederung|Quellen|Bibliografie"),
    },
    "manual": {
        "it": ("Manuale", "Spiegazioni operative passo dopo passo.", "Guide|Procedure|Istruzioni"),
        "en": ("Manual", "Step-by-step operational explanations.", "Guides|Procedures|Instructions"),
        "de": ("Handbuch", "Operative Erklärungen Schritt für Schritt.", "Anleitungen|Abläufe|Anweisungen"),
    },
    "report": {
        "it": ("Report", "Analisi professionale di dati e documenti.", "Dati|Analisi|Grafici"),
        "en": ("Report", "Professional analysis of data and documents.", "Data|Analysis|Charts"),
        "de": ("Bericht", "Professionelle Analyse von Daten und Dokumenten.", "Daten|Analyse|Diagramme"),
    },
    "presentation": {
        "it": ("Presentazione", "Contenuto pronto per slide e presentazioni efficaci.", "Slide|Struttura|Design"),
        "en": ("Presentation", "Ready-made content for effective slides and presentations.", "Slides|Structure|Design"),
        "de": ("Präsentation", "Fertige Inhalte für wirkungsvolle Folien und Präsentationen.", "Folien|Struktur|Design"),
    },
    "study_guide": {
        "it": ("Materia scientifica", "Contenuti scientifici con metodo, formule e riferimenti.", "Matematica|Fisica|Chimica|Biologia|Informatica|Geometria"),
        "en": ("Scientific subject", "Scientific content with method, formulas and references.", "Maths|Physics|Chemistry|Biology|Computing|Geometry"),
        "de": ("Naturwissenschaft", "Wissenschaftliche Inhalte mit Methode, Formeln und Quellen.", "Mathematik|Physik|Chemie|Biologie|Informatik|Geometrie"),
    },
    "course": {
        "it": ("Materia letteraria", "Temi, analisi e contenuti umanistici in modo chiaro e approfondito.", "Italiano|Storia|Filosofia|Geografia|Arte|Diritto"),
        "en": ("Literary subject", "Themes, analysis and humanities content, clear and in depth.", "Italian|History|Philosophy|Geography|Art|Law"),
        "de": ("Geisteswissenschaft", "Themen, Analysen und geisteswissenschaftliche Inhalte, klar und tief.", "Italienisch|Geschichte|Philosophie|Geografie|Kunst|Recht"),
    },
    "custom": {
        "it": ("Lingua straniera", "Appunti, dialoghi, esercizi e traduzioni per imparare e approfondire.", "Vocabolario|Grammatica|Traduzioni|Conversazione|Ascolto|Lettura"),
        "en": ("Foreign language", "Notes, dialogues, exercises and translations to learn and deepen.", "Vocabulary|Grammar|Translations|Conversation|Listening|Reading"),
        "de": ("Fremdsprache", "Notizen, Dialoge, Übungen und Übersetzungen zum Lernen und Vertiefen.", "Wortschatz|Grammatik|Übersetzungen|Konversation|Hören|Lesen"),
    },
}

for lang in ("it", "en", "de"):
    path = f"{BASE}/{lang}.json"
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    for mid, langs in M.items():
        name, desc, tags = langs[lang]
        data[f"i18n.Models.{mid}.name"] = name
        data[f"i18n.Models.{mid}.desc"] = desc
        data[f"i18n.Models.{mid}.tags"] = tags
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")
    print(f"updated {path}")
