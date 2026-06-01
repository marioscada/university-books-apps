# University Books Apps - Monorepo

**Multi-project repository for University Educational Books applications**

This monorepo contains all client applications for the University Educational Books platform, supporting FAD (Formazione A Distanza) requirements.

---

## 📦 Projects

### 1. **ai-book-generator** 📱
Mobile application for accessing educational books

- **Type**: Angular application
- **Platform**: Web/Mobile (Ionic/Capacitor ready)
- **Branch naming**: `feat/ai-book-generator/*`
- **Port**: 4200
- **Status**: ✅ Active development

### 2. **cicd-second-project**
Secondary project (to be renamed/repurposed)
- **Port**: 4201
- **Status**: ⚪ Inactive

### 3. **cicd-third-project**
Third project (to be renamed/repurposed)
- **Port**: 4202
- **Status**: ⚪ Inactive

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run start:mobile        # ai-book-generator on http://localhost:4200
npm run start:second        # cicd-second-project on http://localhost:4201
npm run start:third         # cicd-third-project on http://localhost:4202

# Build for production
npm run build:all
npm run build:mobile:prod

# Run with Docker
npm run docker:build:all
npm run docker:up

# Run tests
npm run test:mobile

# Lint
npm run lint:mobile
```

---

## 📱 ai-book-generator

### Features
- 📚 Book browsing and reading
- ✅ FAD compliance (4 UD, 16 Lessons structure)
- 📴 Offline reading support
- 📊 Progress tracking
- 🔐 Authentication with AWS Cognito
- 🔌 API integration with backend

### Tech Stack
- **Framework**: Angular 19
- **Language**: TypeScript
- **Styling**: SCSS + TailwindCSS
- **State Management**: RxJS/NgRx
- **HTTP Client**: Angular HttpClient
- **Authentication**: AWS Cognito (30-day refresh tokens)

### Development

```bash
# Serve development
ng serve ai-book-generator

# Build production
ng build ai-book-generator --configuration=production

# Run tests
ng test ai-book-generator

# Lint
ng lint ai-book-generator
```

### Environment Configuration

Create environment files in `projects/ai-book-generator/src/environments/`:

#### Development (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://dev-api.university-books.edu',
  cognitoUserPoolId: 'eu-south-1_XXXXXXXXX',
  cognitoClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
  awsRegion: 'eu-south-1',
};
```

#### Production (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.university-books.edu',
  cognitoUserPoolId: 'eu-south-1_XXXXXXXXX',
  cognitoClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
  awsRegion: 'eu-south-1',
};
```

---

## 🏗️ Monorepo Structure

```
university-books-apps/
├── projects/
│   ├── ai-book-generator/    # 📱 Mobile app
│   │   ├── src/
│   │   │   ├── app/               # Application code
│   │   │   ├── environments/      # Environment configs
│   │   │   ├── styles/            # Global styles
│   │   │   ├── index.html
│   │   │   └── main.ts
│   │   ├── public/                # Static assets
│   │   └── tsconfig.*.json        # TypeScript configs
│   ├── cicd-second-project/       # Project 2
│   └── cicd-third-project/        # Project 3
├── libs/
│   └── auth/                      # 🔐 Shared authentication library
├── docs/                          # 📚 Documentation
├── scripts/                       # 🛠️ Build and deployment scripts
├── .github/
│   └── workflows/                 # 🚀 CI/CD pipelines
├── angular.json                   # Angular workspace config
├── package.json                   # Dependencies
├── project.config.js              # Project configuration
└── README.md                      # This file
```

---

## 🔀 Branch Naming Convention

### Mobile App Features
```
feat/ai-book-generator/feature-name
fix/ai-book-generator/bug-description
chore/ai-book-generator/task-description
```

### Backend/Infrastructure
```
feat/university-books-aws/feature-name
fix/university-books-aws/bug-description
```

### Examples
- `feat/ai-book-generator/book-reader`
- `feat/ai-book-generator/offline-sync`
- `fix/ai-book-generator/auth-token-refresh`
- `feat/university-books-aws/mobile-app-integration`

---

## 🚀 CI/CD Pipeline

### Automated Workflows
- **Build**: Automatic build on every push
- **Test**: Unit and E2E tests
- **Lint**: Code quality checks
- **Deploy**: Automatic deployment to staging/production

### Deployment Targets
- **Development**: Auto-deploy to dev environment
- **Staging**: Auto-deploy on merge to `develop`
- **Production**: Manual approval required

---

## 📚 Documentation

### Getting Started
- [Quick Start Guide](docs/QUICKSTART.md) - Setup in 5 minutes
- [Template Usage](docs/TEMPLATE.md) - Complete template guide
- [Project Summary](docs/SUMMARY.md) - Complete overview

### Architecture
- [Monorepo Structure](docs/MONOREPO.md) - Structure and organization
- [Shared Module](projects/ai-book-generator/src/shared/README.md) - Shared components

### DevOps & Deployment
- [Docker Setup](docs/DOCKER-MONOREPO.md) - Containerization
- [AWS Deployment](docs/AWS-SETUP.md) - Cloud deployment
- [GitHub Settings](docs/GITHUB-SETTINGS.md) - CI/CD configuration

### Extensions
- [Auth Library](docs/AUTH-LIBRARY-IMPLEMENTATION.md) - Complete Auth library (Login, Register, Social Auth)
- [Firebase Integration](docs/FIREBASE-SETUP.md) - Complete Firebase setup
- [Future Integrations](docs/FUTURE-INTEGRATIONS.md) - Libraries and features to add

---

## 🔐 Authentication

### Test User Credentials
```
Username: test@example.com
Password: Mariotest@1974
```

### Token Management
- **Access Token**: 1 hour validity
- **ID Token**: 1 hour validity
- **Refresh Token**: 30 days validity
- **Auto-refresh**: Implemented in auth service

### Backend Integration
The mobile app connects to the University Books AWS backend:
- **API Gateway**: RESTful API endpoints
- **AWS Cognito**: User authentication and authorization
- **DynamoDB**: Data persistence
- **S3**: Document storage

---

## 🛠️ Development Tools

### Required
- Node.js 18+
- npm 9+
- Angular CLI 19+

### Recommended
- VS Code with Angular extensions
- Postman for API testing
- AWS CLI for deployment

---

## 🔧 Configuration

All customizable configurations are in `project.config.js`.

To apply changes:
```bash
npm run configure
```

---

## 📊 Project Status

| Project | Status | Branch | Port | Last Updated |
|---------|--------|--------|------|--------------|
| ai-book-generator | 🟢 Active | feat/ai-book-generator/* | 4200 | 2025-12-04 |
| cicd-second-project | ⚪ Inactive | - | 4201 | - |
| cicd-third-project | ⚪ Inactive | - | 4202 | - |

---

## 🤝 Contributing

1. Create feature branch following naming convention
2. Make changes in appropriate project
3. Test locally
4. Commit with conventional commits
5. Push and create PR
6. Wait for CI/CD checks
7. Request review
8. Merge after approval

---

## 📝 License

Private - University Educational Books Platform

---

## 📧 Support

For issues or questions:
- Technical issues: Create GitHub issue
- Platform questions: Contact platform team

---

## 👥 Team

University Educational Books Platform Team
- Repository: https://github.com/marioscada/university-books-apps
- Backend: https://github.com/marioscada/ai-platform-university-books

---

**Last Updated**: December 2025
**Version**: 2.0.0 (Monorepo restructure)
**Main Project**: ai-book-generator
