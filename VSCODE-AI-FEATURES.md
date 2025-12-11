# VS Code 1.107.0+ AI Features

Questo documento descrive le nuove funzionalità AI disponibili in VS Code 1.107.0 e versioni successive.

## 🎯 Funzionalità Principali

### 1. **MCP (Model Context Protocol)**

Il Model Context Protocol permette all'AI assistant di accedere direttamente a informazioni del repository GitHub.

**Cosa può fare:**

- Leggere PR e Issue aperti
- Vedere la commit history
- Accedere a file history e git blame
- Ottenere informazioni su branch

**Esempio:**

```
Tu: "Quali PR sono aperte?"
Tu: "Chi ha modificato il file auth.service.ts?"
Tu: "Mostrami gli ultimi 5 commit"
```

### 2. **Chat Sessions**

Le conversazioni rimangono attive anche dopo aver chiuso la chat.

**Vantaggi:**

- Task lunghi continuano in background
- Puoi tornare alla conversazione in qualsiasi momento
- Multitasking: più sessioni parallele su task diversi

**Comandi:**

- `Chat: New Session` - Crea nuova sessione
- `Chat: Show Sessions` - Visualizza tutte le sessioni
- `Chat: Resume Session` - Riprendi sessione esistente

### 3. **Claude Skills**

Automazioni personalizzate attivabili con linguaggio naturale.

**Come funziona:**

1. Definisci skill in file JSON
2. Attiva con trigger in chat
3. Claude esegue tutti gli step automaticamente

**Esempio skill `debug`:**

```
Tu: "debug"
Claude: [Esegue automaticamente]
  - git status
  - check dependencies
  - build check
  - lint check
  - test check
```

### 4. **Multi-Agent Orchestration**

L'AI può delegare task a più agenti che lavorano in parallelo.

**Esempio:**

```
Tu: "Analizza tutto il progetto auth e scrivi test"

Claude (Agent HQ):
  ├─ Agent 1: Analyzing auth service
  ├─ Agent 2: Analyzing auth guards
  └─ Agent 3: Writing unit tests
```

### 5. **Terminal Integration**

Output dei comandi terminal mostrato direttamente nella chat con syntax highlighting.

**Vantaggi:**

- Nessun switch context tra terminal e chat
- Storia comandi integrata
- Output colorato e formattato

### 6. **Context Attachments**

Allega file e cartelle alla conversazione per dare contesto specifico.

**Sintassi:**

```
@file:src/app/auth/auth.service.ts "Spiega questo service"
@folder:src/app/auth/ "Analizza tutti i file auth"
@symbol:AuthService "Dove viene usato?"
```

## 🚀 Come Abilitare

### Opzione 1: Configurazione Manuale

Crea `.vscode/settings.json`:

```json
{
  "github.copilot.chat.githubMcpServer.enabled": true,
  "chat.viewSessions.enabled": true,
  "chat.useClaudeSkills": true,
  "github.copilot.chat.customAgents.showOrganizationAndEnterpriseAgents": true,
  "chat.customAgentInSubagent.enabled": true,
  "chat.terminal.showCommandStatus": true,
  "chat.experimental.contextAttachments": true
}
```

### Opzione 2: Copia da Altro Progetto

Se hai già configurato un altro progetto, copia la cartella `.vscode/` completa.

## 📚 Risorse

- **VS Code Docs**: https://code.visualstudio.com/docs
- **MCP Documentation**: https://github.com/anthropics/model-context-protocol
- **Claude Skills**: https://docs.anthropic.com/claude/docs/skills

## 💡 Tips

1. **Usa MCP per Context**: Invece di copiare/incollare codice, chiedi a Claude di accedere via MCP
2. **Sessioni per Task Lunghi**: Avvia sessione per refactoring grandi, continua quando vuoi
3. **Skills per Ripetitività**: Crea skills per workflow ripetitivi (deploy, test, review)
4. **Multi-Agent per Complessità**: Delega task complessi a più agenti in parallelo

---

**Note**: Queste features richiedono VS Code 1.107.0+ e GitHub Copilot attivo.
