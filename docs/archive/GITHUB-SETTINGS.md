# GitHub Repository Settings

Configurazione ottimale del repository GitHub per CI/CD enterprise-grade.

---

## Indice

1. [Branch Protection Rules](#branch-protection-rules)
2. [Required Status Checks](#required-status-checks)
3. [Environments](#environments)
4. [Secrets Management](#secrets-management)
5. [CODEOWNERS](#codeowners)
6. [Automazioni Aggiuntive](#automazioni-aggiuntive)

---

## Branch Protection Rules

### Configurazione per `master`/`main`

Vai su: **Repository → Settings → Branches → Add branch protection rule**

**Pattern**: `master` (o `main`)

### Impostazioni Raccomandate

#### 1. Protect matching branches

| Opzione | Valore | Descrizione |
|---------|--------|-------------|
| **Require a pull request before merging** | ✅ | Nessun push diretto |
| → Required approvals | `1` o `2` | Numero di reviewer |
| → Dismiss stale PR approvals | ✅ | Nuovi commit richiedono re-review |
| → Require review from CODEOWNERS | ✅ | Owner del codice deve approvare |
| **Require status checks to pass** | ✅ | CI deve passare |
| → Require branches to be up to date | ✅ | Deve essere aggiornato con master |
| **Require conversation resolution** | ✅ | Tutti i commenti risolti |
| **Require signed commits** | Opzionale | Per alta sicurezza |
| **Require linear history** | ✅ | Squash o rebase only |
| **Include administrators** | ✅ | Anche admin seguono le regole |

#### 2. Rules applied to everyone

| Opzione | Valore |
|---------|--------|
| **Allow force pushes** | ❌ |
| **Allow deletions** | ❌ |

### Configurazione per Branch di Sviluppo

Per branch pattern come `develop`, `feature/*`, `release/*`:

```
Pattern: develop
- Require pull request: ✅ (1 approval)
- Require status checks: ✅
- Allow force pushes: ❌
```

```
Pattern: release/*
- Require pull request: ✅ (2 approvals)
- Require status checks: ✅
- Require CODEOWNERS review: ✅
```

---

## Required Status Checks

### Status Checks da Richiedere

Seleziona i workflow che devono passare prima del merge:

| Check Name | Workflow | Obbligatorio |
|------------|----------|--------------|
| `pr-check` | check-pr.yaml | ✅ |
| `pr-build` | build-pr.yaml | ✅ |
| `test` | run-tests.yaml | ✅ |

### Come Trovare i Nomi dei Check

1. Apri una PR
2. Scorri fino alla sezione "Checks"
3. I nomi mostrati sono quelli da usare

### Best Practice

> ⚠️ **Importante**: Usa nomi di job unici. Se due workflow hanno lo stesso job name, GitHub non può distinguerli.

```yaml
# ✅ Buono - nome univoco
jobs:
  check-pr-lint:
    name: "PR Check - Lint"

# ❌ Cattivo - nome generico
jobs:
  check:
    name: "Check"
```

---

## Environments

Gli ambienti permettono di gestire deploy separati con approvazioni.

### Crea Environment

**Repository → Settings → Environments → New environment**

### Ambienti Consigliati

#### 1. `staging`

```yaml
Protection rules:
  - Required reviewers: 0
  - Wait timer: 0 minutes

Secrets:
  - AWS_ROLE_ARN: arn:aws:iam::xxx:role/staging-deploy
  - S3_BUCKET: staging.myapp.com
```

#### 2. `production`

```yaml
Protection rules:
  - Required reviewers: 2
  - Wait timer: 5 minutes
  - Restrict to protected branches: ✅

Secrets:
  - AWS_ROLE_ARN: arn:aws:iam::xxx:role/prod-deploy
  - S3_BUCKET: myapp.com
```

### Uso nel Workflow

```yaml
jobs:
  deploy-staging:
    environment: staging
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: aws s3 sync ./dist s3://${{ secrets.S3_BUCKET }}

  deploy-production:
    needs: deploy-staging
    environment: production
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: aws s3 sync ./dist s3://${{ secrets.S3_BUCKET }}
```

---

## Secrets Management

### Organizzazione Secrets

| Livello | Uso | Esempio |
|---------|-----|---------|
| **Repository** | Specifici del repo | `SENTRY_DSN` |
| **Environment** | Per ambiente | `AWS_ROLE_ARN` |
| **Organization** | Condivisi tra repo | `NPM_TOKEN` |

### Naming Convention

```
# Formato: PROVIDER_SCOPE_TYPE
AWS_PROD_ROLE_ARN
AWS_STAGING_ROLE_ARN
SENTRY_AUTH_TOKEN
SLACK_WEBHOOK_URL
```

### Rotazione Secrets

Anche se usi OIDC (no secrets AWS), altri secrets vanno ruotati:

| Secret | Frequenza |
|--------|-----------|
| `NPM_TOKEN` | Ogni 90 giorni |
| `SENTRY_AUTH_TOKEN` | Ogni 90 giorni |
| `SLACK_WEBHOOK_URL` | Quando necessario |

---

## CODEOWNERS

File `.github/CODEOWNERS` per assegnare automaticamente reviewer.

### Esempio Completo

```
# Default owners per tutto il repo
* @team-leads

# Frontend
/projects/customer-app/** @frontend-team
/projects/admin-portal/** @frontend-team

# Backend (se presente)
/projects/api/** @backend-team

# DevOps
/.github/** @devops-team
/infrastructure/** @devops-team

# Documentazione
/docs/** @tech-writers
*.md @tech-writers

# Configurazioni critiche
package.json @team-leads
package-lock.json @team-leads
angular.json @team-leads
```

### Come Funziona

1. Quando apri una PR che modifica `/projects/customer-app/`
2. GitHub assegna automaticamente `@frontend-team` come reviewer
3. Se "Require review from CODEOWNERS" è attivo, devono approvare

---

## Automazioni Aggiuntive

### 1. Auto-merge Dependabot

```yaml
# .github/workflows/dependabot-automerge.yaml
name: Dependabot Auto-merge

on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  automerge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Auto-merge minor/patch updates
        uses: fastify/github-action-merge-dependabot@v3
        with:
          target: minor
          merge-method: squash
```

### 2. Stale Issues/PRs

```yaml
# .github/workflows/stale.yaml
name: Close Stale Issues

on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/stale@v9
        with:
          stale-issue-message: 'This issue is stale'
          stale-pr-message: 'This PR is stale'
          days-before-stale: 30
          days-before-close: 7
```

### 3. PR Labeler

```yaml
# .github/labeler.yml
frontend:
  - 'projects/customer-app/**'
  - 'projects/admin-portal/**'

backend:
  - 'projects/api/**'

documentation:
  - '**/*.md'
  - 'docs/**'

dependencies:
  - 'package*.json'
```

---

## Checklist Setup

### Repository Base
- [ ] Branch protection su `master`
- [ ] Required status checks configurati
- [ ] CODEOWNERS creato
- [ ] Default branch impostato

### Sicurezza
- [ ] Require signed commits (se necessario)
- [ ] Require linear history
- [ ] Prevent force push
- [ ] Prevent branch deletion

### Environments
- [ ] Environment `staging` creato
- [ ] Environment `production` creato
- [ ] Required reviewers per production
- [ ] Secrets per environment

### Automazioni
- [ ] Dependabot abilitato
- [ ] Auto-labeler configurato
- [ ] Stale bot configurato

---

## Risorse

- [GitHub Docs: Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [GitHub Docs: Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [GitHub Docs: CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
