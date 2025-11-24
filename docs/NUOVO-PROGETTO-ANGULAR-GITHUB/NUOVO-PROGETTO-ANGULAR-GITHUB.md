# Guida: Nuovo Progetto Angular con GitHub (VS Code)

Guida passo-passo per creare un nuovo progetto Angular e configurarlo su GitHub tramite VS Code.

---

## Prerequisiti

- [ ] Node.js installato (v18+)
- [ ] Angular CLI installato (`npm install -g @angular/cli`)
- [ ] VS Code con estensione GitHub
- [ ] GitHub CLI (`gh`) installato
- [ ] Account GitHub con SSH key configurata

Verifica:
```bash
node --version
ng version
gh auth status
```

---

## PARTE 1: Creazione Progetto Angular

### 1.1 Crea il progetto

```bash
# Vai nella cartella dove vuoi creare il progetto
cd ~/projects  # o la tua cartella preferita

# Crea nuovo progetto Angular
ng new nome-progetto --routing --style=scss --strict

# Opzioni consigliate:
# - Would you like to add Angular routing? YES
# - Which stylesheet format? SCSS
```

### 1.2 Apri in VS Code

```bash
cd nome-progetto
code .
```

### 1.3 Verifica che funzioni

```bash
ng serve
# Apri http://localhost:4200
```

---

## PARTE 2: Configurazione Git Locale

### 2.1 Git è già inizializzato

Angular CLI inizializza automaticamente git. Verifica:

```bash
git status
# Dovresti vedere: "On branch main" o "master"
```

### 2.2 Configura .gitignore (se necessario)

Il file `.gitignore` è già creato da Angular CLI. Aggiungi se serve:

```gitignore
# Environment files with secrets
.env
.env.local
*.local

# IDE
.idea/
*.swp
*.swo

# Build outputs
/dist
/tmp
/out-tsc

# Dependencies
/node_modules

# Misc
/.angular/cache
.DS_Store
Thumbs.db
```

### 2.3 Primo commit locale

```bash
git add .
git commit -m "Initial commit: Angular project setup"
```

---

## PARTE 3: Creazione Repository GitHub

### Opzione A: Via GitHub CLI (Consigliata)

```bash
# Crea repo pubblico
gh repo create nome-progetto --public --source=. --remote=origin --push

# Oppure repo privato
gh repo create nome-progetto --private --source=. --remote=origin --push
```

Questo comando:
- Crea il repository su GitHub
- Aggiunge il remote `origin`
- Pusha il codice

### Opzione B: Via VS Code

1. Apri **Source Control** (Ctrl+Shift+G)
2. Click su **Publish to GitHub**
3. Scegli **Public** o **Private**
4. Conferma il nome del repository

### Opzione C: Via GitHub Web

1. Vai su https://github.com/new
2. Inserisci nome repository
3. NON inizializzare con README (hai già il progetto)
4. Click **Create repository**
5. Copia i comandi e esegui localmente:

```bash
git remote add origin git@github.com:TUO-USERNAME/nome-progetto.git
git branch -M main
git push -u origin main
```

---

## PARTE 4: Configurazione GitHub (Prima della CI/CD)

### 4.1 Branch Protection Rules

1. Vai su **Settings** → **Branches**
2. Click **Add branch protection rule**
3. Branch name pattern: `main`
4. Abilita:
   - [ ] Require a pull request before merging
   - [ ] Require status checks to pass before merging
   - [ ] Require branches to be up to date before merging
   - [ ] Do not allow bypassing the above settings

> **Nota**: Configura gli status checks DOPO aver creato i workflow CI/CD

### 4.2 Crea Branch di Sviluppo

```bash
# Crea branch develop
git checkout -b develop
git push -u origin develop

# Torna su main
git checkout main
```

### 4.3 Configura Environments (Opzionale ma consigliato)

1. Vai su **Settings** → **Environments**
2. Crea environment **production**:
   - Protection rules: Required reviewers
   - Deployment branches: `main` only
3. Crea environment **staging** (se serve):
   - Deployment branches: `develop`

### 4.4 Aggiungi Secrets (per CI/CD)

1. Vai su **Settings** → **Secrets and variables** → **Actions**
2. Aggiungi i secrets necessari per il deploy:

Per AWS S3:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET_NAME`

Per altri servizi (Firebase, Netlify, etc.):
- Consulta documentazione specifica

### 4.5 Configura CODEOWNERS (Opzionale)

Crea file `.github/CODEOWNERS`:

```
# Default owners
* @tuo-username

# Frontend specifico
/src/ @tuo-username
```

---

## PARTE 5: Struttura Progetto Consigliata

### 5.1 Crea cartella per workflow

```bash
mkdir -p .github/workflows
```

### 5.2 Struttura finale

```
nome-progetto/
├── .github/
│   ├── workflows/        # CI/CD workflows
│   └── CODEOWNERS        # Code owners
├── src/
│   ├── app/
│   ├── assets/
│   ├── environments/
│   └── ...
├── .gitignore
├── angular.json
├── package.json
├── README.md
└── tsconfig.json
```

---

## PARTE 6: Verifica Configurazione

### 6.1 Checklist pre-CI/CD

- [ ] Progetto Angular funziona localmente (`ng serve`)
- [ ] Build funziona (`ng build`)
- [ ] Lint funziona (`ng lint`)
- [ ] Test funzionano (`ng test --watch=false --browsers=ChromeHeadless`)
- [ ] Repository GitHub creato
- [ ] Codice pushato su main
- [ ] Branch develop creato
- [ ] Secrets configurati (se deploy su AWS/altro)

### 6.2 Test build production

```bash
ng build --configuration=production
```

Se funziona, sei pronto per la CI/CD!

---

## Prossimi Passi

1. **Copia i workflow CI/CD** dalla documentazione nella cartella `.github/workflows/`
2. **Adatta i workflow** al tuo progetto (nomi, paths, etc.)
3. **Configura branch protection** con i nuovi status checks
4. **Testa con una PR** da develop a main

---

## Comandi Utili

```bash
# Status git
git status

# Visualizza remotes
git remote -v

# Log commits
git log --oneline

# Push nuovo branch
git push -u origin nome-branch

# Verifica GitHub auth
gh auth status

# Visualizza repo info
gh repo view
```

---

## Troubleshooting

### "Permission denied (publickey)"
```bash
# Verifica SSH key
ssh -T git@github.com

# Se fallisce, aggiungi key
ssh-add ~/.ssh/id_ed25519
```

### "Repository not found"
```bash
# Verifica URL remote
git remote -v

# Correggi se sbagliato
git remote set-url origin git@github.com:USERNAME/REPO.git
```

### Build fallisce
```bash
# Pulisci cache
rm -rf node_modules
rm package-lock.json
npm install
ng build
```
