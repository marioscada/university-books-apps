# CICD Test

Example Company - Angular Monorepo

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run start:cicd-test     # http://localhost:4200
npm run start:second        # http://localhost:4201
npm run start:third         # http://localhost:4202

# Build for production
npm run build:all

# Run with Docker
npm run docker:build:all
npm run docker:up
```

## 📦 Projects

- **CICD Test** - CI/CD Test Application (Port: 4200)
- **CICD Second Project** - Second Angular Project (Port: 4201)
- **CICD Third Project** - Third Angular Project (Port: 4202)

## 🔧 Configuration

Tutte le configurazioni personalizzabili si trovano in `project.config.js`.

Per applicare le modifiche:
```bash
npm run configure
```

## 📚 Documentation

### Getting Started
- [Quick Start Guide](docs/QUICKSTART.md) - Setup in 5 minuti
- [Template Usage](docs/TEMPLATE.md) - Guida completa uso template
- [Project Summary](docs/SUMMARY.md) - Overview completo

### Architecture
- [Monorepo Structure](docs/MONOREPO.md) - Struttura e organizzazione
- [Shared Module](projects/cicd-test/src/shared/README.md) - Componenti condivisi

### DevOps & Deployment
- [Docker Setup](docs/DOCKER-MONOREPO.md) - Containerization
- [AWS Deployment](docs/AWS-SETUP.md) - Cloud deployment
- [GitHub Settings](docs/GITHUB-SETTINGS.md) - CI/CD configuration

### Extensions
- [Auth Library](docs/AUTH-LIBRARY-IMPLEMENTATION.md) - **Libreria Auth completa** (Login, Register, Social Auth, Styling dinamico, Ionic support) 🔥
- [Firebase Integration](docs/FIREBASE-SETUP.md) - **Setup completo Firebase** (Auth, Firestore, Storage, Analytics, Hosting)
- [Future Integrations](docs/FUTURE-INTEGRATIONS.md) - Librerie e feature da aggiungere (UI libraries, State Management, Auth, Mobile/Ionic/Capacitor, Testing, etc.)

## 👥 Team

Example Company
- Website: https://example.com
- Email: info@example.com

## 📄 License

Copyright © 2025 Example Company
