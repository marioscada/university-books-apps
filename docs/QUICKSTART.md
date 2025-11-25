# ⚡ Quick Start - Template Monorepo Angular

## 🎯 Setup Nuovo Progetto (5 minuti)

### 1. Clone Template
```bash
git clone https://github.com/marioscada/cicd-test.git my-client-project
cd my-client-project
rm -rf .git
git init
```

### 2. Configura per il Cliente
Apri `project.config.js` e modifica:

```javascript
module.exports = {
  client: {
    name: 'Acme Corp',              // ← CAMBIA
    companyName: 'Acme Corporation',// ← CAMBIA
    website: 'https://acme.com',    // ← CAMBIA
    email: 'info@acme.com',         // ← CAMBIA
  },
  repository: {
    name: 'acme-frontend',          // ← CAMBIA
    owner: 'acme-corp',             // ← CAMBIA
    url: 'https://github.com/acme-corp/acme-frontend',  // ← CAMBIA
  },
  // ... modifica anche aws, styling, etc.
};
```

### 3. Applica Configurazione
```bash
npm install
npm run configure
```

### 4. Test
```bash
npm run build:all
npm run docker:build:all  # opzionale
```

### 5. Push to GitHub
```bash
git add .
git commit -m "chore: initial setup from template"
gh repo create acme-corp/acme-frontend --private
git branch -M main
git push -u origin main
```

### 6. Setup GitHub Secrets
GitHub → Settings → Secrets → Actions → New:
```
AWS_ACCESS_KEY_ID = <your-key>
AWS_SECRET_ACCESS_KEY = <your-secret>
AWS_REGION = us-east-1
```

### 7. Enable Branch Protection
Settings → Branches → Add rule:
- Branch name: `main`
- ☑ Require pull request
- ☑ Require approvals (1)
- ☑ Require status checks

## ✅ Done!

Ora hai un progetto Angular production-ready con:
- ✅ CI/CD configurato
- ✅ Docker pronto
- ✅ Branch protection attivo
- ✅ Conventional commits enforced
- ✅ Tailwind CSS + SCSS architecture
- ✅ 3 progetti Angular pronti

## 📚 Docs Completa

- `TEMPLATE.md` - Guida dettagliata
- `SUMMARY.md` - Panoramica completa
- `MONOREPO.md` - Struttura monorepo

## 🆘 Help

Problema? Controlla:
1. `node --version` (>= 20)
2. `npm install` completato senza errori
3. `project.config.js` correttamente modificato
4. `npm run configure` eseguito

---

**Template by:** Mariano Scada | **Version:** 1.0.0
