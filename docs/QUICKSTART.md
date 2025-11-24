# Quick Start - Setup CI/CD in 10 minuti

Checklist rapida per configurare la pipeline CI/CD su un nuovo progetto.

---

## Checklist

### 1. Preparazione Repository
- [ ] Crea repository su GitHub
- [ ] Clona in locale
- [ ] Crea cartella `.github/workflows/`

### 2. Copia Workflow Files
```bash
# Dalla cartella del tuo nuovo progetto
mkdir -p .github/workflows

# Copia i file dalla cartella workflows/ di questa guida
# Rinomina rimuovendo i numeri iniziali:
# - 01-check-pr.yaml → check-pr.yaml
# - 02-build-pr.yaml → build-pr.yaml
# - 03-build-master.yaml → build-master.yaml
```

### 3. Personalizza Placeholder

Apri ogni file e sostituisci:

| Trova | Sostituisci con |
|-------|-----------------|
| `{{NODE_VERSION}}` | `18.19.0` (o la tua versione) |
| `{{PROJECT_1}}` | Nome del tuo primo progetto |
| `{{PROJECT_2}}` | Nome del tuo secondo progetto |
| `{{PROJECT_3}}` | Nome del tuo terzo progetto |
| `{{S3_BUCKET_BASE}}` | `tuodominio.com` |
| `{{S3_REGION}}` | `eu-west-1` |

### 4. Configura Secrets su GitHub

Vai su: Repository → Settings → Secrets and variables → Actions

Aggiungi:
- [ ] `S3_ACCESS_KEY`
- [ ] `S3_SECRET_KEY`
- [ ] `SENTRY_AUTH_TOKEN` (opzionale)
- [ ] `SENTRY_ORG` (opzionale)

### 5. Verifica package.json

Assicurati di avere questi script:

```json
{
  "scripts": {
    "check": "npm run lint",
    "lint": "eslint .",
    "build:libs": "ng build my-shared-lib",
    "build:project1": "ng build project1 --configuration=production",
    "build:project2": "ng build project2 --configuration=production",
    "upload": "node scripts/upload-to-s3.js"
  }
}
```

### 6. Test

1. Crea un branch: `git checkout -b test/ci-cd`
2. Fai una modifica qualsiasi
3. Commit e push
4. Apri una PR
5. Verifica che i workflow partano in Actions tab

---

## Esempio Completo

### Scenario
- Progetto: `acme-platform`
- Applicazioni: `customer-app`, `admin-dashboard`, `public-website`
- Node: 18.19.0
- S3: `acme-platform.com` in `eu-central-1`

### Valori da usare

```yaml
node-version: ['18.19.0']

# In build-pr.yaml
echo "CHANGED_CUSTOMER_APP=$(git diff-tree ... -- ./projects/customer-app | head -n 1 )" >> $GITHUB_ENV
echo "CHANGED_ADMIN_DASHBOARD=$(git diff-tree ... -- ./projects/admin-dashboard | head -n 1 )" >> $GITHUB_ENV
echo "CHANGED_PUBLIC_WEBSITE=$(git diff-tree ... -- ./projects/public-website | head -n 1 )" >> $GITHUB_ENV

# Build steps
- name: Build customer-app
  if: env.CHANGED_CUSTOMER_APP != ''
  run: npm run build:customer-app

# Deploy URLs
http://${{github.sha}}.dev.acme-platform.com.s3-website-eu-central-1.amazonaws.com
```

---

## Comandi Utili

```bash
# Verifica sintassi YAML
yamllint .github/workflows/*.yaml

# Test locale con act (https://github.com/nektos/act)
act pull_request

# Verifica secrets configurati
gh secret list

# Visualizza workflow runs
gh run list
```

---

## Troubleshooting Rapido

| Problema | Soluzione |
|----------|-----------|
| Workflow non parte | Verifica che il file sia in `.github/workflows/` |
| Secrets non trovati | Controlla maiuscole/minuscole nel nome |
| Cache non funziona | Verifica `package-lock.json` nel repo |
| Build out of memory | Aggiungi `NODE_OPTIONS="--max-old-space-size=4096"` |

---

## Prossimi Passi

1. [ ] Aggiungi workflow per tests automatici
2. [ ] Configura branch protection rules
3. [ ] Aggiungi notifiche Slack/Teams
4. [ ] Configura ambienti staging/production
