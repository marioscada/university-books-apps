# Monorepo Angular - cicd-test

Monorepo Angular con 3 progetti.

## Struttura

```
cicd-test/
├── projects/                   # Tutti i progetti Angular
│   ├── cicd-test/             # Progetto principale
│   │   ├── public/            # Asset statici (Angular 18+ convention)
│   │   │   ├── icons/        # Favicon, loghi
│   │   │   ├── images/       # Foto, banner
│   │   │   ├── svg/          # Grafica vettoriale
│   │   │   ├── i18n/         # Traduzioni (en.json, it.json)
│   │   │   ├── fonts/        # Font custom
│   │   │   └── data/         # Config, mock data
│   │   └── src/
│   │       ├── app/          # Codice applicazione
│   │       └── environments/ # Configurazioni ambiente
│   │           ├── environment.ts      # Development
│   │           └── environment.prod.ts # Production
│   ├── cicd-second-project/   # Secondo progetto
│   └── cicd-third-project/    # Terzo progetto
├── docker/                     # Configurazione Docker
│   ├── config/                # Nginx, etc.
│   ├── scripts/               # Script helper
│   ├── Dockerfile.monorepo    # Dockerfile parametrico
│   └── docker-compose.monorepo.yml
├── docs/                       # Documentazione
├── scripts/                    # Script vari
├── .github/workflows/          # CI/CD
├── angular.json               # Configurazione Angular
├── package.json               # Dependencies condivise
└── tsconfig.json              # TypeScript config base
```

## Quick Start

### Development

```bash
# Avvia progetto specifico
npm run start:cicd-test     # http://localhost:4200
npm run start:second        # http://localhost:4201
npm run start:third         # http://localhost:4202

# Oppure
ng serve cicd-test
ng serve cicd-second-project --port 4201
ng serve cicd-third-project --port 4202
```

### Build

```bash
# Build singolo progetto
npm run build:cicd-test
npm run build:second
npm run build:third

# Build tutti i progetti
npm run build:all

# Output in:
# - dist/cicd-test
# - dist/cicd-second-project
# - dist/cicd-third-project
```

### Lint

```bash
# Lint singolo progetto
npm run lint:cicd-test
npm run lint:second
npm run lint:third

# Lint tutti i progetti
npm run lint:all
```

## Docker

### Build immagini Docker

```bash
# Build singolo progetto
npm run docker:build:cicd-test
npm run docker:build:second
npm run docker:build:third

# Build tutti
npm run docker:build:all

# Oppure con script diretto
./docker/scripts/docker-build.sh cicd-test
./docker/scripts/docker-build.sh cicd-second-project
./docker/scripts/docker-build.sh cicd-third-project
```

### Run con Docker Compose

```bash
# Avvia tutti i progetti
npm run docker:up

# Porta:
# - cicd-test:          http://localhost:8081
# - cicd-second-project: http://localhost:8082
# - cicd-third-project:  http://localhost:8083

# Stop
npm run docker:down
```

## Assets (public/ folder - Angular 18+)

Ogni progetto usa la cartella `public/` secondo la **convenzione Angular 18+**:

```
public/
├── icons/           # Favicon, loghi, icone
├── images/          # Foto, banner, immagini raster
├── svg/             # Grafica vettoriale SVG
├── i18n/            # File di traduzione (en.json, it.json)
├── fonts/           # Font personalizzati (.woff2, .woff)
└── data/            # Config JSON, mock data
```

### Vantaggi public/ vs vecchio src/assets/

- ✅ **Convenzione ufficiale Angular 18+**
- ✅ **Percorsi più semplici**: `/icons/logo.svg` invece di `/assets/icons/logo.svg`
- ✅ **Flat structure**: icons, images, svg separati (LIFT principle)
- ✅ **Root del build**: file copiati direttamente in `dist/{project}/browser/`

### Utilizzo Assets

```typescript
// Icone in template (nota: NO /assets/ prefix!)
<img src="/icons/logo.svg" alt="Logo">
<img src="/icons/favicon.ico" alt="Icon">

// SVG in template
<img src="/svg/illustration.svg" alt="Illustration">

// Immagini in template
<img src="/images/hero-banner.jpg" alt="Banner">

// i18n (runtime load)
this.http.get<any>('/i18n/en.json').subscribe(...);

// Config/Data
this.http.get('/data/config.json').subscribe(...);

// Font in CSS
@font-face {
  font-family: 'Custom';
  src: url('/fonts/custom-font.woff2') format('woff2');
  font-display: swap;
}
```

### Migrazione da src/assets/

Se hai vecchi riferimenti con `assets/`:

**Find & Replace:**
- `assets/icons/` → `/icons/`
- `assets/images/` → `/images/`
- `assets/i18n/` → `/i18n/`
- `assets/fonts/` → `/fonts/`
- `assets/data/` → `/data/`

Per maggiori dettagli: `projects/cicd-test/public/README.md`

## Aggiungere nuovo progetto

1. **Crea cartella progetto:**
   ```bash
   mkdir -p projects/nuovo-progetto/src
   ```

2. **Copia struttura base:**
   ```bash
   cp -r projects/cicd-test/* projects/nuovo-progetto/
   ```

3. **Aggiungi a `angular.json`:**
   - Copia sezione "cicd-test"
   - Rinomina in "nuovo-progetto"
   - Aggiorna tutti i path

4. **Aggiungi script a `package.json`:**
   ```json
   "start:nuovo": "ng serve nuovo-progetto --port 4203",
   "build:nuovo": "ng build nuovo-progetto --configuration=production"
   ```

## CI/CD

### Workflow Docker Monorepo

Il workflow `.github/workflows/docker-monorepo.yaml` builda automaticamente solo i progetti modificati:

- Modificato `projects/cicd-test/` → builda solo cicd-test
- Modificato `projects/cicd-second-project/` → builda solo cicd-second-project
- Modificato `projects/cicd-third-project/` → builda solo cicd-third-project

Risparmio di tempo: **~70%**

### Branch Protection

Le regole di protezione branch si applicano a:
- `master` - produzione
- `feat/cicd-test/*` - feature branch

## Comandi Utili

```bash
# Lista progetti
ng config projects

# Info progetto specifico
ng config projects.cicd-test

# Genera component in progetto
ng generate component my-component --project=cicd-test

# Test progetto
ng test cicd-test

# Build con watch
ng build cicd-test --watch

# Analyze bundle
ng build cicd-test --stats-json
npx webpack-bundle-analyzer dist/cicd-test/browser/stats.json
```

## Dipendenze Condivise

Tutte le dipendenze sono condivise a livello root (`package.json`).

Per aggiungere dipendenza:
```bash
npm install rxjs          # dependency
npm install -D typescript # devDependency
```

## Troubleshooting

### Build fallisce

```bash
# Pulisci cache
rm -rf .angular dist node_modules
npm install
npm run build:all
```

### ModuleResolution error

Verifica che `tsconfig.json` abbia:
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "moduleResolution": "bundler"
  }
}
```

### Port già in uso

Cambia porta nel comando:
```bash
ng serve cicd-test --port 4210
```

## Performance Tips

### Build Optimization

```bash
# Build production con optimizations
ng build cicd-test --configuration=production

# Analyze bundle size
ng build cicd-test --source-map
```

### Parallel Builds

Per buildare progetti in parallelo:
```bash
npm run build:cicd-test & npm run build:second & npm run build:third & wait
```

## Links

- [Angular Workspace](https://angular.dev/tools/cli/workspace-config)
- [Docker Documentation](docs/DOCKER-MONOREPO.md)
- [AWS Setup](docs/AWS-SETUP.md)
- [GitHub Settings](docs/GITHUB-SETTINGS.md)
