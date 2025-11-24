#!/usr/bin/env node

/**
 * =============================================================================
 * S3 Upload Script
 * =============================================================================
 *
 * Script per upload dei build su AWS S3.
 *
 * USAGE:
 *   node scripts/upload-to-s3.js
 *
 * ENVIRONMENT VARIABLES:
 *   - PR_SHA: Commit SHA (per preview URL)
 *   - REF: Git ref (branch)
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
  region: 'eu-west-1', // Modifica con la tua regione

  // Configurazione progetto
  project: {
    name: 'cicd-test',
    distPath: 'dist/cicd-test/browser',
    devBucket: '{{SHA}}.dev.cicd-test.example.com', // Modifica con il tuo dominio
    prodBucket: 'cicd-test.example.com' // Modifica con il tuo dominio
  },

  // Opzioni S3 sync
  syncOptions: [
    '--delete',                    // Rimuove file non presenti nel source
    '--cache-control', 'max-age=31536000,public',  // 1 anno cache
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

  console.log('S3 Upload Script');
  console.log(`   SHA: ${sha}`);
  console.log(`   Ref: ${ref}`);
  console.log(`   Mode: ${isProduction ? 'PRODUCTION' : 'PREVIEW'}`);
  console.log('');

  await uploadProject(sha, isProduction);

  console.log('');
  console.log('Upload completato!');
}

// =============================================================================
// UPLOAD PROGETTO
// =============================================================================

async function uploadProject(sha, isProduction) {
  // Determina il bucket
  let bucket = isProduction ? CONFIG.project.prodBucket : CONFIG.project.devBucket;
  bucket = bucket.replace('{{SHA}}', sha);

  const distPath = path.resolve(process.cwd(), CONFIG.project.distPath);

  console.log(`Uploading ${CONFIG.project.name}`);
  console.log(`   From: ${distPath}`);
  console.log(`   To: s3://${bucket}`);

  // Verifica che la cartella dist esista
  try {
    execSync(`test -d "${distPath}"`, { stdio: 'pipe' });
  } catch {
    console.log(`   Cartella non trovata: ${distPath}`);
    process.exit(1);
  }

  try {
    // Upload principale con cache
    const syncCmd = buildSyncCommand(distPath, bucket, CONFIG.syncOptions);
    execSync(syncCmd, { stdio: 'inherit' });

    // Upload file senza cache
    await uploadNoCacheFiles(distPath, bucket);

    console.log(`   Upload completato`);
    console.log(`   URL: http://${bucket}.s3-website-${CONFIG.region}.amazonaws.com`);
  } catch (error) {
    console.error(`   Upload fallito: ${error.message}`);
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
  console.error('Script failed:', error.message);
  process.exit(1);
});
