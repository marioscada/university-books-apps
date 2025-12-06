#!/usr/bin/env node

/**
 * =============================================================================
 * S3 Upload Script
 * =============================================================================
 *
 * Script per upload dei build su AWS S3.
 * Supporta upload multipli per progetti diversi in una monorepo.
 *
 * USAGE:
 *   node scripts/upload-to-s3.js
 *
 * ENVIRONMENT VARIABLES:
 *   - PR_SHA: Commit SHA (per preview URL)
 *   - REF: Git ref (branch)
 *   - CHANGED_PROJECT_1: "true" se project1 è stato modificato
 *   - CHANGED_PROJECT_2: "true" se project2 è stato modificato
 *   - etc.
 *
 * NOTA: Se usi OIDC (raccomandato), AWS credentials sono già configurate
 * dal workflow. Se usi Access Keys, configura AWS_ACCESS_KEY_ID e
 * AWS_SECRET_ACCESS_KEY come environment variables.
 * =============================================================================
 */

const { execSync } = require('child_process');
const path = require('path');

// =============================================================================
// CONFIGURAZIONE - MODIFICA QUESTI VALORI
// =============================================================================

const CONFIG = {
  // Regione AWS
  region: '{{S3_REGION}}', // es: 'eu-west-1'

  // Mapping progetti -> buckets
  projects: {
    'project1': {
      distPath: 'dist/project1',
      bucket: '{{SHA}}.dev.project1.{{S3_BUCKET_BASE}}',
      prodBucket: 'project1.{{S3_BUCKET_BASE}}'
    },
    'project2': {
      distPath: 'dist/project2',
      bucket: '{{SHA}}.dev.project2.{{S3_BUCKET_BASE}}',
      prodBucket: 'project2.{{S3_BUCKET_BASE}}'
    },
    'project3': {
      distPath: 'dist/project3',
      bucket: '{{SHA}}.dev.project3.{{S3_BUCKET_BASE}}',
      prodBucket: 'project3.{{S3_BUCKET_BASE}}'
    }
  },

  // Opzioni S3 sync
  syncOptions: [
    '--delete',                    // Rimuove file non presenti nel source
    '--cache-control', 'max-age=31536000,public',  // 1 anno cache
    '--exclude', '*.map',          // Escludi source maps in prod
  ],

  // File senza cache (sempre freschi)
  noCacheFiles: [
    'index.html',
    'ngsw.json',
    'manifest.webmanifest'
  ]
};

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const sha = process.env.PR_SHA || 'local';
  const ref = process.env.REF || '';
  const isProduction = ref === 'refs/heads/master' || ref === 'refs/heads/main';

  console.log('🚀 S3 Upload Script');
  console.log(`   SHA: ${sha}`);
  console.log(`   Ref: ${ref}`);
  console.log(`   Mode: ${isProduction ? 'PRODUCTION' : 'PREVIEW'}`);
  console.log('');

  // Trova quali progetti uploadare
  const projectsToUpload = Object.keys(CONFIG.projects).filter(project => {
    const envVar = `CHANGED_${project.toUpperCase().replace(/-/g, '_')}`;
    return process.env[envVar] === 'true' || process.env[envVar];
  });

  if (projectsToUpload.length === 0) {
    console.log('⚠️  Nessun progetto da uploadare');
    return;
  }

  console.log(`📦 Progetti da uploadare: ${projectsToUpload.join(', ')}`);
  console.log('');

  // Upload ogni progetto
  for (const project of projectsToUpload) {
    await uploadProject(project, sha, isProduction);
  }

  console.log('');
  console.log('✅ Upload completato!');
}

// =============================================================================
// UPLOAD SINGOLO PROGETTO
// =============================================================================

async function uploadProject(projectName, sha, isProduction) {
  const project = CONFIG.projects[projectName];
  if (!project) {
    console.error(`❌ Progetto "${projectName}" non trovato nella configurazione`);
    return;
  }

  // Determina il bucket
  let bucket = isProduction ? project.prodBucket : project.bucket;
  bucket = bucket.replace('{{SHA}}', sha);

  const distPath = path.resolve(process.cwd(), project.distPath);

  console.log(`📤 Uploading ${projectName}`);
  console.log(`   From: ${distPath}`);
  console.log(`   To: s3://${bucket}`);

  // Verifica che la cartella dist esista
  try {
    execSync(`test -d "${distPath}"`, { stdio: 'pipe' });
  } catch {
    console.log(`   ⚠️  Cartella non trovata, skip`);
    return;
  }

  try {
    // Upload principale con cache
    const syncCmd = buildSyncCommand(distPath, bucket, CONFIG.syncOptions);
    execSync(syncCmd, { stdio: 'inherit' });

    // Upload file senza cache
    await uploadNoCacheFiles(distPath, bucket);

    console.log(`   ✅ Upload completato`);
    console.log(`   🌐 URL: http://${bucket}.s3-website-${CONFIG.region}.amazonaws.com`);
  } catch (error) {
    console.error(`   ❌ Upload fallito: ${error.message}`);
    throw error;
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function buildSyncCommand(source, bucket, options) {
  const optionsStr = options.join(' ');
  return `aws s3 sync "${source}" "s3://${bucket}" ${optionsStr}`;
}

async function uploadNoCacheFiles(distPath, bucket) {
  const noCacheOptions = '--cache-control "no-cache, no-store, must-revalidate"';

  for (const file of CONFIG.noCacheFiles) {
    const filePath = path.join(distPath, file);
    try {
      execSync(`test -f "${filePath}"`, { stdio: 'pipe' });
      const cmd = `aws s3 cp "${filePath}" "s3://${bucket}/${file}" ${noCacheOptions}`;
      execSync(cmd, { stdio: 'pipe' });
    } catch {
      // File non esiste, skip
    }
  }
}

// =============================================================================
// RUN
// =============================================================================

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});
