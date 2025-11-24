# CI/CD Pipeline Template per Monorepo Angular

Guida completa per configurare una pipeline CI/CD con GitHub Actions per progetti Angular monorepo.

## Indice

1. [Struttura del Progetto](#struttura-del-progetto)
2. [Prerequisiti](#prerequisiti)
3. [Configurazione Secrets](#configurazione-secrets)
4. [Workflow Files](#workflow-files)
5. [Personalizzazione](#personalizzazione)
6. [Troubleshooting](#troubleshooting)

---

## Struttura del Progetto

```
my-monorepo/
├── .github/
│   └── workflows/
│       ├── check-pr.yaml        # Lint e validazione
│       ├── build-pr.yaml        # Build su PR
│       └── build-master.yaml    # Build su master
├── projects/
│   ├── app1/                    # Applicazione 1
│   ├── app2/                    # Applicazione 2
│   └── shared-lib/              # Librerie condivise
├── package.json
└── angular.json
```

---

## Prerequisiti

### 1. Account e Servizi
- [ ] Account GitHub con repository creato
- [ ] Account AWS con accesso S3 (per deploy)
- [ ] (Opzionale) Account Sentry per error tracking

### 2. Repository Setup
```bash
# Clona il repository
git clone https://github.com/YOUR_ORG/your-repo.git
cd your-repo

# Crea la struttura delle cartelle
mkdir -p .github/workflows
```

### 3. Package.json Scripts
Assicurati di avere questi script nel tuo `package.json`:

```json
{
  "scripts": {
    "check": "npm run lint && npm run lint:i18n",
    "lint": "eslint --ext .ts,.html .",
    "lint:i18n": "node scripts/validate-i18n.js",
    "build:libs": "ng build shared-lib",
    "build:app1": "ng build app1 --configuration=production",
    "build:app2": "ng build app2 --configuration=production",
    "upload": "node scripts/upload-to-s3.js"
  }
}
```

---

## Configurazione Secrets

### GitHub Repository Secrets

Vai su: `Repository → Settings → Secrets and variables → Actions`

| Secret Name | Descrizione | Esempio |
|-------------|-------------|---------|
| `S3_ACCESS_KEY` | AWS Access Key ID | `AKIAIOSFODNN7EXAMPLE` |
| `S3_SECRET_KEY` | AWS Secret Access Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `SENTRY_AUTH_TOKEN` | Token Sentry (opzionale) | `sntrys_eyJ...` |
| `SENTRY_ORG` | Organizzazione Sentry | `my-org` |

### Come creare secrets

1. Vai su GitHub → Repository → Settings
2. Sidebar: Security → Secrets and variables → Actions
3. Click "New repository secret"
4. Inserisci nome e valore
5. Click "Add secret"

---

## Workflow Files

I file workflow sono nella cartella `workflows/`:

| File | Descrizione | Uso |
|------|-------------|-----|
| [01-check-pr.yaml](./workflows/01-check-pr.yaml) | Lint e validazione | Ogni PR |
| [02-build-pr.yaml](./workflows/02-build-pr.yaml) | Build su PR (Access Keys) | Ogni PR |
| [03-build-master.yaml](./workflows/03-build-master.yaml) | Build completo | Push su master |
| [04-run-tests.yaml](./workflows/04-run-tests.yaml) | Test unitari, lint, security | Ogni PR |
| [05-build-pr-oidc.yaml](./workflows/05-build-pr-oidc.yaml) | Build su PR (OIDC) ⭐ | Ogni PR |

> ⭐ **Raccomandato**: Usa `05-build-pr-oidc.yaml` invece di `02-build-pr.yaml` per maggiore sicurezza (no secrets statici).

## Documentazione Aggiuntiva

| File | Contenuto |
|------|-----------|
| [QUICKSTART.md](./QUICKSTART.md) | Setup rapido in 10 minuti |
| [AWS-SETUP.md](./AWS-SETUP.md) | Configurazione AWS (OIDC, IAM, S3) |
| [GITHUB-SETTINGS.md](./GITHUB-SETTINGS.md) | Branch protection, environments, secrets |

## Scripts

| File | Descrizione |
|------|-------------|
| [scripts/upload-to-s3.js](./scripts/upload-to-s3.js) | Script Node.js per deploy su S3 |

---

## Personalizzazione

### Variabili da Modificare

Cerca e sostituisci queste variabili nei workflow:

| Placeholder | Descrizione | Esempio |
|-------------|-------------|---------|
| `{{NODE_VERSION}}` | Versione Node.js | `18.19.0` |
| `{{PROJECT_1}}` | Nome primo progetto | `customer-app` |
| `{{PROJECT_2}}` | Nome secondo progetto | `admin-portal` |
| `{{PROJECT_3}}` | Nome terzo progetto | `api-dashboard` |
| `{{S3_BUCKET_BASE}}` | Base URL bucket S3 | `my-company.com` |
| `{{S3_REGION}}` | Regione AWS | `eu-west-1` |

### Aggiungere un Nuovo Progetto

1. **Nel workflow `build-pr.yaml`**, aggiungi la detection:
```yaml
echo "CHANGED_NEW_PROJECT=$(git diff-tree --numstat --no-commit-id -r ${{ env.BASE_SHA }} ${{ env.HEAD_SHA }} -- ./projects/new-project | head -n 1 )" >> $GITHUB_ENV
```

2. **Aggiungi lo step di build**:
```yaml
- name: Build New Project
  if: env.CHANGED_NEW_PROJECT != ''
  run: npm run build:new-project
```

3. **Aggiorna il commento PR** con il nuovo link deploy.

### Configurare Ambienti Diversi

Per gestire staging/production, crea workflow separati o usa variabili d'ambiente:

```yaml
env:
  ENVIRONMENT: ${{ github.ref == 'refs/heads/master' && 'production' || 'staging' }}
```

---

## Troubleshooting

### Errori Comuni

#### 1. Cache non funziona
```yaml
# Verifica che il path sia corretto
path: |
  node_modules
  */*/node_modules
```

#### 2. Build fallisce per memoria
```yaml
# Aumenta la memoria Node
- name: Build
  run: NODE_OPTIONS="--max-old-space-size=4096" npm run build:app
```

#### 3. Secrets non trovati
- Verifica che i nomi siano esattamente come definiti
- Controlla che siano nel repository corretto (non in un fork)

#### 4. Deploy S3 fallisce
- Verifica le policy IAM dell'utente
- Controlla che il bucket esista e sia accessibile

### Debug Workflow

Aggiungi questo step per debug:
```yaml
- name: Debug Info
  run: |
    echo "Event: ${{ github.event_name }}"
    echo "Ref: ${{ github.ref }}"
    echo "SHA: ${{ github.sha }}"
    echo "Actor: ${{ github.actor }}"
```

---

## Prossimi Passi

1. Copia i workflow nella cartella `.github/workflows/`
2. Sostituisci i placeholder con i tuoi valori
3. Configura i secrets
4. Fai un test con una PR
5. Verifica i log in Actions tab

---

## Risorse Utili

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS S3 CLI](https://docs.aws.amazon.com/cli/latest/reference/s3/)
- [Angular CLI Build](https://angular.io/cli/build)
