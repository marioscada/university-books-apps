# Docker Monorepo Setup

Configurazione Docker per monorepo con progetti multipli.

## Quick Start

### Build singolo progetto

```bash
# Metodo 1: Script helper
chmod +x docker-build.sh
./docker-build.sh customer-app
./docker-build.sh admin-portal staging

# Metodo 2: Docker diretto
docker build -f Dockerfile.monorepo \
  --build-arg PROJECT_NAME=customer-app \
  -t customer-app:latest .
```

### Build tutti i progetti

```bash
docker-compose -f docker-compose.monorepo.yml build
```

### Run tutti i progetti

```bash
docker-compose -f docker-compose.monorepo.yml up

# In background
docker-compose -f docker-compose.monorepo.yml up -d

# Stop tutti
docker-compose -f docker-compose.monorepo.yml down
```

## Porte

| Progetto | Porta | URL |
|----------|-------|-----|
| Customer App | 8081 | http://localhost:8081 |
| Admin Portal | 8082 | http://localhost:8082 |
| Mobile API | 3000 | http://localhost:3000 |
| Nginx Proxy | 80 | http://localhost |

## Struttura Monorepo

```
monorepo/
├── projects/
│   ├── customer-app/       # Frontend clienti
│   ├── admin-portal/       # Admin dashboard
│   └── mobile-api/         # Backend API
├── Dockerfile.monorepo     # Dockerfile parametrico
├── Dockerfile.node         # Dockerfile per backend Node.js
├── docker-build.sh         # Script helper build
├── docker-compose.monorepo.yml
└── .github/
    └── workflows/
        └── docker-monorepo.yaml  # CI/CD intelligente
```

## Package.json Scripts

Aggiungi al tuo `package.json`:

```json
{
  "scripts": {
    "build:customer-app": "ng build customer-app --configuration=production",
    "build:admin-portal": "ng build admin-portal --configuration=production",
    "build:mobile-api": "tsc && node dist/index.js",

    "docker:build:customer-app": "./docker-build.sh customer-app",
    "docker:build:admin-portal": "./docker-build.sh admin-portal",
    "docker:build:mobile-api": "./docker-build.sh mobile-api",

    "docker:up": "docker-compose -f docker-compose.monorepo.yml up",
    "docker:down": "docker-compose -f docker-compose.monorepo.yml down"
  }
}
```

## CI/CD Intelligente

Il workflow `.github/workflows/docker-monorepo.yaml`:

1. **Detect changes**: Controlla quali progetti sono stati modificati
2. **Build parallelo**: Builda solo progetti modificati
3. **Test automatico**: Testa ogni container
4. **Summary**: Report finale

**Esempio:**
```
Modificato: projects/customer-app/
Risultato: Builda SOLO customer-app (non admin-portal, non mobile-api)
Tempo risparmiato: 70%
```

## Ottimizzazioni

### Cache Layers

Il Dockerfile è ottimizzato per il caching:

```dockerfile
# Layer 1: Dependencies (99% cache hit)
COPY package*.json ./
RUN npm ci

# Layer 2: Source code (cambia spesso)
COPY . .
RUN npm run build
```

### Build Configurations

```bash
# Development
./docker-build.sh customer-app development

# Staging
./docker-build.sh customer-app staging

# Production
./docker-build.sh customer-app production
```

## Comandi Utili

```bash
# Lista immagini
docker images | grep -E "customer-app|admin-portal"

# Stats tutti i container
docker stats

# Logs di un progetto
docker-compose -f docker-compose.monorepo.yml logs -f customer-app

# Rebuild senza cache
docker-compose -f docker-compose.monorepo.yml build --no-cache customer-app

# Remove tutti i container
docker-compose -f docker-compose.monorepo.yml down -v

# Prune (clean up)
docker system prune -a
```

## Deploy Production

### Opzione 1: Docker Hub

```bash
# Tag
docker tag customer-app:latest username/customer-app:v1.0.0

# Push
docker push username/customer-app:v1.0.0

# Pull su server
docker pull username/customer-app:v1.0.0
docker run -d -p 80:80 username/customer-app:v1.0.0
```

### Opzione 2: GitHub Container Registry

```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag
docker tag customer-app:latest ghcr.io/marioscada/customer-app:latest

# Push
docker push ghcr.io/marioscada/customer-app:latest
```

### Opzione 3: AWS ECR

```bash
# Login
aws ecr get-login-password --region eu-west-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.eu-west-1.amazonaws.com

# Push
docker tag customer-app:latest 123456789.dkr.ecr.eu-west-1.amazonaws.com/customer-app:latest
docker push 123456789.dkr.ecr.eu-west-1.amazonaws.com/customer-app:latest
```

## Troubleshooting

### Build fallisce per un progetto

```bash
# Build con output dettagliato
docker build -f Dockerfile.monorepo \
  --build-arg PROJECT_NAME=customer-app \
  --progress=plain \
  -t customer-app:latest .
```

### Container non si avvia

```bash
# Logs
docker logs customer-app

# Ispeziona
docker inspect customer-app

# Entra nel container
docker exec -it customer-app sh
```

### Porta già in uso

```bash
# Cambia porta in docker-compose.monorepo.yml
ports:
  - "8091:80"  # invece di 8081
```

## Limiti di Risorse

Aggiungi limiti in `docker-compose.monorepo.yml`:

```yaml
services:
  customer-app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```
