#!/bin/bash
# =============================================================================
# Script per buildare immagini Docker di progetti specifici
# =============================================================================
# Uso:
#   ./docker-build.sh customer-app
#   ./docker-build.sh admin-portal staging
# =============================================================================

set -e

PROJECT_NAME=$1
BUILD_CONFIG=${2:-production}
DOCKERFILE=${3:-docker/Dockerfile.monorepo}

if [ -z "$PROJECT_NAME" ]; then
  echo "❌ Errore: specificare il nome del progetto"
  echo ""
  echo "Uso: $0 <project-name> [build-config] [dockerfile]"
  echo ""
  echo "Esempi:"
  echo "  $0 customer-app"
  echo "  $0 admin-portal staging"
  echo "  $0 mobile-app production Dockerfile.monorepo"
  exit 1
fi

echo "🐳 Building Docker image..."
echo "   Project: $PROJECT_NAME"
echo "   Config:  $BUILD_CONFIG"
echo "   Dockerfile: $DOCKERFILE"
echo ""

# Build image
docker build \
  -f "$DOCKERFILE" \
  --build-arg PROJECT_NAME="$PROJECT_NAME" \
  --build-arg BUILD_CONFIGURATION="$BUILD_CONFIG" \
  -t "${PROJECT_NAME}:latest" \
  -t "${PROJECT_NAME}:${BUILD_CONFIG}" \
  .

echo ""
echo "✅ Build completato!"
echo ""
echo "📦 Immagine creata: ${PROJECT_NAME}:latest"
echo ""
echo "🚀 Per eseguire:"
echo "   docker run -d -p 8080:80 --name ${PROJECT_NAME} ${PROJECT_NAME}:latest"
echo ""
echo "📊 Per vedere dimensione:"
echo "   docker images ${PROJECT_NAME}"
