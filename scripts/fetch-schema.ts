/**
 * Fetch OpenAPI Schema from AWS Backend
 *
 * This script downloads the OpenAPI 3.1.0 schema from the AWS API Gateway.
 * It implements caching, hash validation, and error handling according to AWS best practices.
 *
 * Security:
 * - Uses API Key (developer-only, NOT for production app)
 * - Never commit .env.local with real API keys
 *
 * @see docs/AWS-BACKEND-INTEGRATION-GUIDE.md
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: path.join(process.cwd(), '.env.local') });

// =============================================================================
// Configuration
// =============================================================================

const API_KEY = process.env.VITE_DEV_API_KEY;
const API_BASE_URL = process.env.VITE_API_BASE_URL;
const ENABLE_CACHE = process.env.VITE_ENABLE_SCHEMA_CACHE === 'true';

// Validation
if (!API_KEY || !API_BASE_URL) {
  console.error('❌ Missing required environment variables!');
  console.error('   Please ensure .env.local contains:');
  console.error('   - VITE_DEV_API_KEY');
  console.error('   - VITE_API_BASE_URL');
  console.error('\n   See docs/AWS-BACKEND-INTEGRATION-GUIDE.md for setup instructions.');
  process.exit(1);
}

// =============================================================================
// Types
// =============================================================================

interface SchemaVersion {
  version: string;
  hash: string;
  endpoints: number;
  schemas: number;
  timestamp: string;
}

interface SchemaMetadata {
  version: string;
  hash: string;
  downloadedAt: string;
  source: string;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Calculate SHA-256 hash of schema content
 */
function calculateHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Ensure schemas directory exists
 */
function ensureSchemasDir(): string {
  const schemasDir = path.join(process.cwd(), 'schemas');
  if (!fs.existsSync(schemasDir)) {
    fs.mkdirSync(schemasDir, { recursive: true });
    console.log('📁 Created schemas directory');
  }
  return schemasDir;
}

/**
 * Load local schema metadata if exists
 */
function loadLocalMetadata(schemasDir: string): SchemaMetadata | null {
  const metadataPath = path.join(schemasDir, 'metadata.json');
  if (fs.existsSync(metadataPath)) {
    try {
      return JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    } catch (error) {
      console.warn('⚠️  Failed to parse metadata.json, will re-download');
      return null;
    }
  }
  return null;
}

/**
 * Save schema metadata
 */
function saveMetadata(schemasDir: string, metadata: SchemaMetadata): void {
  const metadataPath = path.join(schemasDir, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

/**
 * Backup previous schema before updating
 */
function backupPreviousSchema(schemasDir: string): void {
  const currentPath = path.join(schemasDir, 'current.json');
  const previousPath = path.join(schemasDir, 'previous.json');

  if (fs.existsSync(currentPath)) {
    fs.copyFileSync(currentPath, previousPath);
    console.log('💾 Backed up previous schema');
  }
}

/**
 * Fetch with timeout and retry
 */
async function fetchWithRetry(
  url: string,
  headers: Record<string, string>,
  retries = 3
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(url, {
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }

      // Handle HTTP errors
      if (response.status === 403) {
        throw new Error('403 Forbidden - Check your API Key in .env.local');
      }
      if (response.status === 404) {
        throw new Error('404 Not Found - Endpoint does not exist');
      }
      if (response.status >= 500) {
        // Server error, retry
        if (i < retries - 1) {
          console.warn(`⚠️  Server error (${response.status}), retrying in ${(i + 1) * 2}s...`);
          await new Promise((resolve) => setTimeout(resolve, (i + 1) * 2000));
          continue;
        }
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout after 30s');
      }
      if (i === retries - 1) throw error;

      console.warn(`⚠️  Attempt ${i + 1}/${retries} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, (i + 1) * 1000));
    }
  }

  throw new Error('Max retries exceeded');
}

// =============================================================================
// Main Logic
// =============================================================================

async function fetchSchema(): Promise<void> {
  console.log('🔍 Fetching OpenAPI schema from AWS backend...\n');

  const schemasDir = ensureSchemasDir();
  const localMetadata = loadLocalMetadata(schemasDir);

  try {
    // Step 1: Check current version (lightweight)
    console.log('📌 Checking schema version...');
    const versionResponse = await fetchWithRetry(
      `${API_BASE_URL}/v1/schema-version`,
      { 'x-api-key': API_KEY! }
    );

    const remoteVersion: SchemaVersion = await versionResponse.json();

    console.log(`   Version: ${remoteVersion.version}`);
    console.log(`   Hash: ${remoteVersion.hash}`);
    console.log(`   Endpoints: ${remoteVersion.endpoints}`);
    console.log(`   Schemas: ${remoteVersion.schemas}`);
    console.log(`   Timestamp: ${remoteVersion.timestamp}\n`);

    // Step 2: Check if update is needed
    if (ENABLE_CACHE && localMetadata && localMetadata.hash === remoteVersion.hash) {
      console.log('✅ Local schema is up to date!');
      console.log(`   Version: ${localMetadata.version}`);
      console.log(`   Downloaded: ${localMetadata.downloadedAt}`);
      console.log('\n💡 Tip: Use npm run schema:generate to regenerate TypeScript code\n');
      return;
    }

    if (localMetadata) {
      console.log('⚠️  Schema has changed!');
      console.log(`   Local:  ${localMetadata.version} (${localMetadata.hash.substring(0, 8)}...)`);
      console.log(`   Remote: ${remoteVersion.version} (${remoteVersion.hash.substring(0, 8)}...)\n`);
    } else {
      console.log('📥 No local schema found, downloading...\n');
    }

    // Step 3: Backup previous schema
    backupPreviousSchema(schemasDir);

    // Step 4: Download full schema
    console.log('⬇️  Downloading OpenAPI schema...');
    const schemaResponse = await fetchWithRetry(
      `${API_BASE_URL}/v1/openapi.json`,
      { 'x-api-key': API_KEY! }
    );

    const schemaContent = await schemaResponse.text();
    const schema = JSON.parse(schemaContent);

    // Step 5: Validate schema structure
    if (!schema.openapi || !schema.info || !schema.paths) {
      throw new Error('Invalid OpenAPI schema structure');
    }

    console.log(`   OpenAPI Version: ${schema.openapi}`);
    console.log(`   API Title: ${schema.info.title}`);
    console.log(`   API Version: ${schema.info.version}\n`);

    // Step 6: Verify hash matches
    const calculatedHash = calculateHash(schemaContent);
    if (calculatedHash !== remoteVersion.hash) {
      console.warn('⚠️  Warning: Downloaded schema hash does not match remote hash');
      console.warn(`   Expected: ${remoteVersion.hash}`);
      console.warn(`   Got:      ${calculatedHash}`);
      console.warn('   Continuing anyway, but schema might be corrupted\n');
    }

    // Step 7: Save schema
    const currentPath = path.join(schemasDir, 'current.json');
    fs.writeFileSync(currentPath, JSON.stringify(schema, null, 2));
    console.log(`✅ Schema saved to: ${currentPath}`);

    // Step 8: Save metadata
    const metadata: SchemaMetadata = {
      version: remoteVersion.version,
      hash: remoteVersion.hash,
      downloadedAt: new Date().toISOString(),
      source: API_BASE_URL!,
    };
    saveMetadata(schemasDir, metadata);
    console.log('✅ Metadata saved\n');

    // Step 9: Success message
    console.log('🎉 Schema download complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run schema:generate');
    console.log('   2. Or run: npm run schema:update (does both)\n');

  } catch (error: any) {
    console.error('\n❌ Failed to fetch schema!');
    console.error(`   Error: ${error.message}\n`);

    if (error.message.includes('403')) {
      console.error('🔑 Check your API Key:');
      console.error('   - Verify VITE_DEV_API_KEY in .env.local');
      console.error('   - Ensure the API Key is valid\n');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.error('🌐 Network issue:');
      console.error('   - Check your internet connection');
      console.error('   - Verify API_BASE_URL is correct\n');
    }

    console.error('📚 See docs/AWS-BACKEND-INTEGRATION-GUIDE.md for troubleshooting\n');
    process.exit(1);
  }
}

// =============================================================================
// Execute
// =============================================================================

fetchSchema();
