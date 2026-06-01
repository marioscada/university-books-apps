# GitHub Actions CI/CD Workflows

Questo repository utilizza GitHub Actions per l'automazione di build, test e validazioni del codice.

## 📋 Workflows Disponibili

### 1. **Check Pull Request** (`check-pr.yaml`)
**Trigger:** Ogni Pull Request e push su main/master

**Step eseguiti:**
1. ✅ **Check RxJS Subscriptions** - Verifica che tutte le subscriptions siano gestite correttamente
2. ✅ **Run Lint** - Esegue ESLint per verificare la qualità del codice

**Blocca il merge se:**
- Ci sono subscriptions senza `takeUntilDestroyed()` o `@Unsubscribe`
- Ci sono subscriptions senza commenti di spiegazione
- Ci sono errori di lint

### 2. **Build Pull Request** (`build-pr.yaml`)
**Trigger:** Ogni Pull Request

**Step eseguiti:**
1. ✅ **Check RxJS Subscriptions** - Verifica subscriptions
2. ✅ **Run Lint** - Verifica codice
3. ✅ **Build Production** - Compila il progetto

**Blocca il merge se:**
- Fail in subscription check
- Fail in lint
- Fail in build

### 3. **Build Master** (`build-master.yaml`)
**Trigger:** Push su master/main branch

**Step eseguiti:**
1. ✅ **Check RxJS Subscriptions**
2. ✅ **Run Lint**
3. ✅ **Build Production**
4. 🚀 **Deploy** (commentato, da configurare)

### 4. **Run Tests** (`run-tests.yaml`)
**Trigger:** Pull Request e push su master/main/develop

**Jobs eseguiti:**

**Unit Tests Job:**
- Esegue test unitari con coverage
- Upload coverage report come artifact

**Lint & Type Check Job:**
- ✅ **Check RxJS Subscriptions**
- ✅ **Run ESLint**
- ✅ **TypeScript Type Check**

**Security Audit Job:**
- Esegue npm audit per vulnerabilità

## 🔍 Subscription Check Details

Il controllo delle subscriptions è **obbligatorio** e viene eseguito in tutti i workflow.

### Cosa viene verificato:

1. **Cleanup automatico:**
   - Tutte le subscriptions devono avere `takeUntilDestroyed()` o `@Unsubscribe`
   - Eccezione: Persistent subscriptions (AWS Hub listeners, WebSocket globali)

2. **Documentazione obbligatoria:**
   - Ogni `.subscribe()` deve avere un commento che spiega perché non si può usare `async pipe`
   - Pattern regular: `⚠️ Subscribe necessario (non async pipe) perché:`
   - Pattern persistent: `⚠️ Persistent subscription: <motivo>`

3. **Observable properties:**
   - Verifica che Observable nei components usino `async pipe` invece di `.subscribe()`

### Output di esempio:

```bash
🔍 Checking RxJS subscriptions in: ai-book-generator

📊 Finding all subscriptions...
   Found 2 subscription(s)

⚠️  Checking for subscriptions without takeUntilDestroyed()...
   ✅ All subscriptions have proper cleanup!

📝 Checking for subscriptions without explanation comments...
   ✅ All subscriptions have explanation comments!

🔎 Checking for Observable properties that should use async pipe...
   ✅ No Observable properties in components (or all converted to signals)

✅ ai-book-generator: All checks passed! (2 subscriptions)
```

### Se il check fallisce:

```bash
❌ Found issues in 1 project(s)

Guidelines:
  1. Prefer async pipe in templates
  2. Use takeUntilDestroyed() for necessary subscriptions
  3. Document WHY each subscription is needed with ⚠️ comment:
     • Regular: ⚠️ Subscribe necessario (non async pipe) perché:
     • Persistent: ⚠️ Persistent subscription: <reason>

See docs/IMPLEMENTATION-ROADMAP.md section 3 for details
```

## 🚀 Come eseguire i check localmente

Prima di pushare il codice, esegui:

```bash
# Full check (subscriptions + lint)
npm run check

# Solo subscriptions
npm run check:subscriptions

# Subscriptions + lint + build
npm run build:check

# Solo per progetto specifico
npm run check:subscriptions:mobile
```

## 🔧 Configurazione

### Aggiungere progetti al check

Per aggiungere un nuovo progetto Angular al check automatico:

1. Il progetto deve essere in `projects/<project-name>/src/app`
2. Il check verrà eseguito automaticamente su tutti i progetti
3. Per verificare solo un progetto specifico:
   ```bash
   bash scripts/check-subscriptions.sh <project-name>
   ```

### Modificare i workflow

I workflow sono in `.github/workflows/`:
- `check-pr.yaml` - Validazioni su PR
- `build-pr.yaml` - Build su PR
- `build-master.yaml` - Build su master
- `run-tests.yaml` - Test unitari e lint completo

## 📚 Documentazione

- [IMPLEMENTATION-ROADMAP.md](../docs/IMPLEMENTATION-ROADMAP.md) - Best practices Angular e RxJS
- [Script check-subscriptions.sh](../scripts/check-subscriptions.sh) - Script di verifica subscriptions

## ✅ Best Practices

### 1. Git Branch Naming

**OBBLIGATORIO:** Tutte le branch devono seguire il pattern `<type>/<project-name>/<description>`

```bash
# ✅ CORRETTO
git checkout -b feat/ai-book-generator/auth-implementation
git checkout -b fix/ai-book-generator/login-validation
git checkout -b refactor/backend-api-client/error-handling

# ❌ SBAGLIATO - Manca nome progetto
git checkout -b feat/auth-implementation
git checkout -b feature/login-ui
```

**Pattern:** `<type>/<project-name>/<short-description>`
- **type:** feat, fix, refactor, docs, test, chore
- **project-name:** ai-book-generator, backend-api-client
- **description:** 2-4 parole kebab-case

### 2. Prima di creare una PR

- ✅ Esegui `npm run check` localmente
- ✅ Fix tutti gli errori prima di pushare
- ✅ Aggiungi commenti alle subscriptions necessarie
- ✅ Branch naming corretta (`feat/project-name/description`)
- ✅ Commit messages con conventional commits

### 3. Persistent Subscriptions

- Usare SOLO per listener app-wide (AWS Hub, WebSocket globali)
- Documentare con `⚠️ Persistent subscription: <motivo>`
- NON usare `takeUntilDestroyed()` (sono intenzionalmente persistenti)

### 4. Code Review

- Verifica che ogni subscription abbia un commento
- Verifica che non si possa usare `async pipe` invece
- Verifica che il cleanup sia presente
- Verifica naming conventions (branch, file, variabili)

## 🛠️ Troubleshooting

### "Missing explanation comment"
**Soluzione:** Aggiungi un commento prima della subscription:
```typescript
// ⚠️ Subscribe necessario (non async pipe) perché:
// 1. Navigazione imperativa (router.navigate)
// 2. Side effect dopo operazione
this.service.method$()
  .pipe(takeUntilDestroyed())
  .subscribe({...});
```

### "Missing cleanup"
**Soluzione:** Aggiungi `takeUntilDestroyed()`:
```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

this.service.method$()
  .pipe(takeUntilDestroyed())
  .subscribe({...});
```

### CI fallisce ma localmente funziona
**Possibili cause:**
- Cache node_modules: il CI usa `npm ci` (fresh install)
- Versione Node differente: verifica che usi Node 20
- File non committati: verifica con `git status`

## 📞 Support

Per problemi o domande, consulta:
- `docs/IMPLEMENTATION-ROADMAP.md` - Guida completa
- GitHub Issues - Report problemi
