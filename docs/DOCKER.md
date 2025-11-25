# Docker Setup

## Quick Start

### Con Docker installato:

```bash
# Build immagine
npm run docker:build

# Run produzione (porta 8080)
npm run docker:run

# Apri browser: http://localhost:8080

# Stop container
npm run docker:stop
```

### Con Docker Compose:

```bash
# Development (hot reload, porta 4200)
npm run docker:dev

# Production (porta 8080)
npm run docker:prod
```

## Struttura

```
Dockerfile          - Multi-stage build (Node + Nginx)
docker-compose.yml  - Development & Production setup
nginx.conf          - Nginx configuration
.dockerignore       - Files esclusi dal build
```

## Comandi Utili

```bash
# Build manuale
docker build -t cicd-test:latest .

# Run con custom port
docker run -d -p 3000:80 cicd-test:latest

# Logs
docker logs -f cicd-test

# Shell nel container
docker exec -it cicd-test sh

# Clean up
docker stop cicd-test
docker rm cicd-test
docker rmi cicd-test:latest
```

## CI/CD

GitHub Actions builderà e testerà l'immagine Docker automaticamente su ogni PR.

Workflow: `.github/workflows/docker-build.yaml`

## Deploy

Per pubblicare su GitHub Container Registry, decommenta la sezione "Push to GHCR" in `docker-build.yaml`.

L'immagine sarà disponibile su:
```
ghcr.io/marioscada/cicd-test:latest
```
