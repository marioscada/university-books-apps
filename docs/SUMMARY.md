# 📊 Template Monorepo Angular - Summary Completo

## 🎯 Panoramica

Questo è un **template production-ready** per progetti Angular monorepo, completamente configurato con:
- ✅ CI/CD pipelines
- ✅ Docker containerization
- ✅ Branch protection
- ✅ Conventional commits
- ✅ Tailwind CSS + SCSS architecture
- ✅ Environment management
- ✅ Auto-configuration script

## 📦 Struttura Progetto

```
cicd-test/
├── .github/workflows/        # CI/CD pipelines
│   ├── check-pr.yaml        # Lint su PR
│   ├── build-pr.yaml        # Build su PR
│   ├── build-master.yaml    # Build su master
│   ├── run-tests.yaml       # Test automatici
│   └── docker-monorepo.yaml # Build Docker intelligente
├── .husky/                   # Git hooks
│   ├── commit-msg           # Commitlint validation
│   └── pre-push             # Branch naming validation
├── docker/                   # Docker configuration
│   ├── config/
│   │   └── nginx.conf       # Nginx for Angular SPA
│   ├── scripts/
│   │   └── docker-build.sh  # Parametric build script
│   ├── Dockerfile.monorepo  # Multi-stage Dockerfile
│   └── docker-compose.monorepo.yml
├── docs/                     # Documentation
│   ├── AWS-SETUP.md
│   ├── DOCKER-MONOREPO.md
│   ├── GITHUB-SETTINGS.md
│   └── QUICKSTART.md
├── projects/                 # Angular projects
│   ├── cicd-test/
│   │   ├── public/          # Static assets (Angular 18+)
│   │   │   ├── icons/       # Favicons, logos
│   │   │   ├── images/      # Photos, banners
│   │   │   ├── svg/         # Vector graphics
│   │   │   ├── i18n/        # Translations (en.json, it.json)
│   │   │   ├── fonts/       # Custom fonts
│   │   │   ├── data/        # Config JSON
│   │   │   └── README.md
│   │   └── src/
│   │       ├── app/         # Application code
│   │       ├── environments/# Dev/Prod config
│   │       │   ├── environment.ts
│   │       │   └── environment.prod.ts
│   │       └── styles/      # SCSS architecture
│   │           ├── styles.scss
│   │           ├── _variables.scss
│   │           ├── _mixins.scss
│   │           ├── _functions.scss
│   │           ├── _base.scss
│   │           ├── _utilities.scss
│   │           └── README.md
│   ├── cicd-second-project/
│   └── cicd-third-project/
├── scripts/
│   ├── configure-project.js # Auto-configuration script
│   └── upload-to-s3.js      # AWS S3 deployment
├── project.config.js         # ⭐ CENTRAL CONFIGURATION
├── tailwind.config.js
├── postcss.config.js
├── commitlint.config.js
├── angular.json
├── package.json
├── TEMPLATE.md              # Template usage guide
├── MONOREPO.md              # Monorepo documentation
└── README.md                # Auto-generated from config
```

## ⚙️ File di Configurazione Centrale

### `project.config.js` - The Single Source of Truth

Tutte le configurazioni personalizzabili sono in **UN SOLO FILE**:

```javascript
module.exports = {
  client: {
    name: 'Client Name',              // ← Nome cliente
    companyName: 'Company',           // ← Azienda
    website: 'https://...',           // ← Sito
    email: 'info@...',                // ← Email
  },

  repository: {
    name: 'repo-name',                // ← Nome repo
    owner: 'github-user',             // ← Owner GitHub
    defaultBranch: 'main',            // ← Branch principale
    url: 'https://github.com/...',    // ← URL repo
  },

  projects: [                         // ← Progetti Angular
    {
      name: 'project-name',
      displayName: 'Display Name',
      port: 4200,
      dockerPort: 8081,
      domain: { dev: '...', prod: '...' },
    },
  ],

  aws: {                              // ← AWS config
    region: 'eu-west-1',
    accountId: '...',
    s3: { ... },
    cloudfront: { ... },
  },

  docker: {                           // ← Docker config
    registry: 'docker.io',
    namespace: 'user',
  },

  styling: {                          // ← Brand colors
    primaryColor: '#3f51b5',
    accentColor: '#ff4081',
    fontFamily: "'Roboto', sans-serif",
  },

  features: {                         // ← Feature flags
    analytics: true,
    darkMode: true,
    i18n: true,
    pwa: false,
    ssr: false,
  },
};
```

### Auto-Configuration Script

```bash
npm run configure
```

Questo script aggiorna automaticamente:
1. ✅ `package.json` (name, description, repository, author)
2. ✅ `README.md` (auto-generated)
3. ✅ `environments/environment.ts` e `environment.prod.ts` (tutti i progetti)
4. ✅ `public/data/config.json` (tutti i progetti)
5. ✅ `tailwind.config.js` (brand colors)
6. ✅ `src/styles/_variables.scss` (SCSS variables, tutti i progetti)
7. ✅ `commitlint.config.js` (scopes)

## 🚀 Tecnologie Utilizzate

### Frontend
- **Angular 19.2** - Framework
- **TypeScript 5.6** - Language
- **RxJS 7.8** - Reactive programming
- **Tailwind CSS 3.4** - Utility-first CSS
- **SCSS** - CSS preprocessor

### Build & Development
- **Angular CLI 19** - Build system
- **esbuild** - Fast bundler
- **PostCSS** - CSS processing
- **Autoprefixer** - Vendor prefixes

### Code Quality
- **ESLint 9** - Linting
- **Commitlint** - Commit message validation
- **Husky** - Git hooks
- **Karma + Jasmine** - Testing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD
- **Nginx** - Web server (production)

### Cloud (Optional)
- **AWS S3** - Static hosting
- **AWS CloudFront** - CDN
- **AWS OIDC** - GitHub Actions authentication

## 📋 Workflows CI/CD

### 1. check-pr.yaml
**Trigger:** Pull Request
**Actions:**
- Lint code
- Type check
- Security audit

### 2. build-pr.yaml
**Trigger:** Pull Request
**Actions:**
- Build all projects
- Run tests
- Generate coverage report

### 3. build-master.yaml
**Trigger:** Push to master/main
**Actions:**
- Production build
- Deploy to AWS S3 (optional)
- Invalidate CloudFront

### 4. run-tests.yaml
**Trigger:** Push, Pull Request
**Actions:**
- Unit tests (Karma + Jasmine)
- Lint
- Type check
- Security audit

### 5. docker-monorepo.yaml
**Trigger:** Push, Pull Request
**Actions:**
- Detect changed projects
- Build only changed Docker images (~70% time saving)
- Test container startup

## 🐳 Docker Support

### Multi-Stage Build
```dockerfile
FROM node:20-alpine AS build
# Install dependencies & build

FROM nginx:alpine
# Copy build output & serve
```

### Parametric Build Script
```bash
./docker/scripts/docker-build.sh PROJECT_NAME
```

### Docker Compose
```bash
npm run docker:up      # Start all containers
npm run docker:down    # Stop all containers
```

**Ports:**
- cicd-test: http://localhost:8081
- cicd-second-project: http://localhost:8082
- cicd-third-project: http://localhost:8083

## 🎨 Styling Architecture

### Tailwind CSS v3
- Utility-first approach
- Customizable theme
- PurgeCSS enabled (production)
- JIT mode

### SCSS Organization
```
src/styles/
├── _variables.scss    # Colors, spacing, breakpoints
├── _mixins.scss       # Reusable mixins (flex, responsive, etc.)
├── _functions.scss    # SCSS functions (rem, spacing, z-index)
├── _base.scss         # CSS reset + base HTML elements
├── _utilities.scss    # Custom utility classes
└── styles.scss        # Main entry point
```

### Modern @use Syntax
```scss
// ❌ Old (deprecated)
@import 'variables';

// ✅ New (modern)
@use '../styles/variables' as vars;
@use '../styles/mixins' as mix;

.component {
  color: vars.$primary-color;
  @include mix.flex-center;
}
```

## 📂 Assets Organization (Angular 18+)

### public/ Folder Convention
```
public/
├── icons/       # Favicon, logos
├── images/      # Photos, banners
├── svg/         # Vector graphics
├── i18n/        # Translations
├── fonts/       # Custom fonts
└── data/        # Config JSON
```

### Benefits
- ✅ Official Angular 18+ convention
- ✅ Files copied to root of build output
- ✅ Simpler paths: `/icons/logo.svg` vs `/assets/icons/logo.svg`
- ✅ Flat structure (LIFT principle)

## 🔒 Git Workflow

### Branch Naming Convention
```
feat/PROJECT_NAME/feature-description
fix/PROJECT_NAME/bug-description
refactor/PROJECT_NAME/refactor-description
```

### Commit Message Format
```
type(scope): description

type: feat, fix, refactor, docs, chore, test
scope: cicd-test, cicd-second-project, cicd-third-project
```

### Branch Protection
- ✅ Require pull request
- ✅ Require 1 approval
- ✅ Require status checks:
  - pr-check
  - Unit Tests
  - Lint & Type Check

### Git Hooks
- **commit-msg:** Validate commit format (commitlint)
- **pre-push:** Validate branch naming

## 🧪 Testing Strategy

### Unit Tests
```bash
npm run test:ci        # Headless mode for CI
npm test               # Watch mode for development
```

### Coverage
- Karma + Jasmine
- Chrome Headless
- Coverage reports in `/coverage`

### Continuous Testing
- All PRs run tests automatically
- Required to pass before merge

## 🚢 Deployment

### AWS S3 + CloudFront
1. Build: `npm run build:PROJECT`
2. Upload: `npm run upload`
3. Invalidate CloudFront cache

### Docker Deployment
1. Build: `npm run docker:build:all`
2. Push to registry (Docker Hub, AWS ECR, GitHub Container Registry)
3. Deploy to ECS, Kubernetes, etc.

### Manual Deployment
```bash
npm run build:all
# Upload dist/ to your hosting
```

## 📊 Performance

### Build Output (Production)
```
Project: ~255 kB total
├── main.js:      208 kB (57 kB gzipped)
├── polyfills.js:  35 kB (11 kB gzipped)
└── styles.css:    13 kB ( 3 kB gzipped)
```

### Docker Image Size
```
~25 MB (Nginx Alpine + compiled Angular app)
```

### Build Times
- Single project: ~1.5s
- All projects (3): ~4.5s
- Docker build: ~30s per project

## 🔧 Customization Points

### Per Nuovo Cliente

1. **project.config.js** ← Modifica qui TUTTO
2. Run `npm run configure`
3. Done! ✅

### File Auto-Aggiornati
- package.json
- README.md
- environments/
- public/data/config.json
- tailwind.config.js
- src/styles/_variables.scss
- commitlint.config.js

### File da Modificare Manualmente (se necessario)
- .github/workflows/*.yaml (se cambiano branch names)
- angular.json (se rinomini progetti)
- docker/* (customizzazioni Docker/Nginx)

## 📚 Documentazione

| File | Descrizione |
|------|-------------|
| `docs/TEMPLATE.md` | **START HERE** - Guida uso template |
| `docs/QUICKSTART.md` | Quick start in 5 minuti |
| `docs/SUMMARY.md` | Questo file - Overview completo |
| `docs/MONOREPO.md` | Struttura monorepo completa |
| `docs/DOCKER-MONOREPO.md` | Docker setup e usage |
| `docs/FIREBASE-SETUP.md` | **Setup completo Firebase** (Auth, Firestore, Storage) |
| `docs/FUTURE-INTEGRATIONS.md` | **Librerie e feature future** |
| `docs/AWS-SETUP.md` | AWS deployment guide |
| `docs/GITHUB-SETTINGS.md` | GitHub configuration |
| `projects/*/public/README.md` | Assets organization |
| `projects/*/src/styles/README.md` | SCSS architecture |
| `projects/*/src/shared/README.md` | **Shared module structure** |

## ✅ Checklist Template → Produzione

- [ ] Clone repository come template
- [ ] Modifica `project.config.js`
- [ ] Run `npm install && npm run configure`
- [ ] Test `npm run build:all`
- [ ] Test `npm run docker:build:all`
- [ ] Create GitHub repository
- [ ] Setup GitHub Secrets (AWS, etc.)
- [ ] Enable Branch Protection
- [ ] Customize README.md (se necessario)
- [ ] First deploy to staging
- [ ] Production deploy
- [ ] Setup monitoring (Sentry, Analytics, etc.)

## 🎯 Best Practices Implementate

### Code Quality
- ✅ Conventional commits enforced
- ✅ Lint on every PR
- ✅ Type checking strict
- ✅ Security audit in CI

### Architecture
- ✅ Monorepo for code sharing
- ✅ Component-scoped styles
- ✅ Environment-based configuration
- ✅ Lazy loading ready

### DevOps
- ✅ Docker multi-stage builds
- ✅ Nginx optimized for SPA
- ✅ gzip compression enabled
- ✅ Cache headers configured
- ✅ CI/CD automated

### Styling
- ✅ Utility-first with Tailwind
- ✅ Design system with SCSS
- ✅ Mobile-first responsive
- ✅ Dark mode ready
- ✅ Accessibility focus

### Performance
- ✅ Minimal bundle size
- ✅ Tree-shaking enabled
- ✅ Lazy loading support
- ✅ Production optimizations
- ✅ CDN-ready

## 🆘 Support & Troubleshooting

### Common Issues

**Build fails:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build:all
```

**Git hooks not working:**
```bash
npm run prepare
```

**Docker build fails:**
```bash
docker system prune -a
npm run docker:build:all
```

**Tailwind not purging:**
```bash
# Check tailwind.config.js content paths
content: ["./projects/*/src/**/*.{html,ts}"]
```

## 📈 Future Enhancements

- [ ] Add PWA support
- [ ] Add SSR (Angular Universal)
- [ ] Add E2E tests (Playwright/Cypress)
- [ ] Add Storybook
- [ ] Add Bundle analyzer
- [ ] Add Performance monitoring
- [ ] Add Error tracking (Sentry)
- [ ] Add i18n extraction workflow
- [ ] Add Visual regression testing
- [ ] Add Kubernetes manifests

## 📄 License

Copyright © 2025 Mariano Scada

---

**Template Version:** 1.0.0
**Last Updated:** November 2025
**Maintained by:** Mariano Scada
