/**
 * ============================================================================
 * PROJECT CONFIGURATION
 * ============================================================================
 *
 * Questo file contiene TUTTE le variabili personalizzabili per ogni cliente.
 * Modifica SOLO questo file quando crei un nuovo progetto da questo template.
 *
 * IMPORTANTE: Dopo aver modificato questo file, esegui:
 * npm run configure
 */

module.exports = {
  // ==========================================================================
  // INFORMAZIONI CLIENTE/PROGETTO
  // ==========================================================================

  client: {
    name: 'CICD Test',                    // Nome cliente/progetto
    companyName: 'Example Company',       // Nome azienda
    website: 'https://example.com',       // Sito web cliente
    email: 'info@example.com',            // Email contatto
  },

  // ==========================================================================
  // REPOSITORY & GIT
  // ==========================================================================

  repository: {
    name: 'cicd-test',                    // Nome repository
    owner: 'marioscada',                  // Owner GitHub/GitLab
    defaultBranch: 'master',              // Branch principale
    url: 'https://github.com/marioscada/cicd-test',
  },

  // ==========================================================================
  // PROGETTI ANGULAR NEL MONOREPO
  // ==========================================================================

  projects: [
    {
      name: 'cicd-test',                  // Nome progetto Angular
      displayName: 'CICD Test',           // Nome visualizzato
      description: 'CI/CD Test Application',
      port: 4200,                         // Porta dev server
      dockerPort: 8081,                   // Porta Docker
      domain: {
        dev: 'dev.cicd-test.example.com',
        prod: 'cicd-test.example.com',
      },
    },
    {
      name: 'cicd-second-project',
      displayName: 'CICD Second Project',
      description: 'Second Angular Project',
      port: 4201,
      dockerPort: 8082,
      domain: {
        dev: 'dev.second.example.com',
        prod: 'second.example.com',
      },
    },
    {
      name: 'cicd-third-project',
      displayName: 'CICD Third Project',
      description: 'Third Angular Project',
      port: 4202,
      dockerPort: 8083,
      domain: {
        dev: 'dev.third.example.com',
        prod: 'third.example.com',
      },
    },
  ],

  // ==========================================================================
  // AWS CONFIGURATION
  // ==========================================================================

  aws: {
    region: 'eu-west-1',                  // Regione AWS
    accountId: 'YOUR_AWS_ACCOUNT_ID',     // ID Account AWS

    s3: {
      devBucketPattern: '{SHA}.dev.{PROJECT}.example.com',  // Pattern bucket dev
      prodBucketPattern: '{PROJECT}.example.com',           // Pattern bucket prod
    },

    cloudfront: {
      enabled: true,                      // Usa CloudFront?
      devDistributionId: 'YOUR_DEV_DISTRIBUTION_ID',
      prodDistributionId: 'YOUR_PROD_DISTRIBUTION_ID',
    },

    oidc: {
      enabled: false,                     // Usa OIDC per GitHub Actions?
      roleArn: 'arn:aws:iam::ACCOUNT_ID:role/GitHubActionsRole',
    },
  },

  // ==========================================================================
  // DOCKER CONFIGURATION
  // ==========================================================================

  docker: {
    registry: 'docker.io',                // Docker registry (docker.io, ghcr.io, ecr)
    namespace: 'marioscada',              // Namespace/organization
    imageNamePattern: '{PROJECT}',        // Pattern nome immagine

    // Nginx configuration
    nginx: {
      port: 80,
      gzipEnabled: true,
      cacheMaxAge: '1y',                  // Cache per static assets
    },
  },

  // ==========================================================================
  // CI/CD CONFIGURATION
  // ==========================================================================

  ci: {
    // Workflow triggers
    triggers: {
      pullRequest: ['main', 'master', 'develop', 'feat/**'],
      push: ['main', 'master'],
    },

    // Node.js versions da testare
    nodeVersions: ['20'],

    // Branch protection rules
    branchProtection: {
      requirePullRequest: true,
      requireReviews: 1,
      requireStatusChecks: true,
      requiredChecks: [
        'pr-check',
        'Unit Tests',
        'Lint & Type Check',
      ],
    },

    // Commit message format
    commitFormat: {
      types: ['feat', 'fix', 'refactor', 'docs', 'chore', 'test'],
      scopes: ['cicd-test', 'cicd-second-project', 'cicd-third-project'],
      requireScope: true,
    },
  },

  // ==========================================================================
  // ENVIRONMENT VARIABLES PER PROGETTI
  // ==========================================================================

  environment: {
    development: {
      apiUrl: 'http://localhost:3000/api',
      enableDebug: true,
      logLevel: 'debug',
    },

    production: {
      apiUrl: 'https://api.example.com',
      enableDebug: false,
      logLevel: 'error',
    },
  },

  // ==========================================================================
  // TAILWIND & STYLING
  // ==========================================================================

  styling: {
    primaryColor: '#3f51b5',              // Colore primario brand
    accentColor: '#ff4081',               // Colore accent
    fontFamily: "'Roboto', sans-serif",   // Font principale

    // Custom Tailwind theme extensions
    tailwind: {
      // Verrà mergiato in tailwind.config.js
      extend: {
        colors: {
          brand: {
            primary: '#3f51b5',
            secondary: '#ff4081',
          },
        },
      },
    },
  },

  // ==========================================================================
  // FEATURES FLAGS
  // ==========================================================================

  features: {
    analytics: true,                      // Google Analytics / Matomo
    darkMode: true,                       // Dark mode support
    i18n: true,                           // Internazionalizzazione
    pwa: false,                           // Progressive Web App
    ssr: false,                           // Server-Side Rendering
  },

  // ==========================================================================
  // TOOLS & INTEGRATIONS
  // ==========================================================================

  integrations: {
    sentry: {
      enabled: false,
      dsn: 'YOUR_SENTRY_DSN',
    },

    googleAnalytics: {
      enabled: false,
      trackingId: 'UA-XXXXXXXXX-X',
    },

    slack: {
      enabled: false,
      webhookUrl: 'YOUR_SLACK_WEBHOOK',
      notifyOn: ['deployment', 'failure'],
    },
  },
};
