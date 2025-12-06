/**
 * Generate TypeScript API Client from OpenAPI Schema
 *
 * This script generates type-safe TypeScript code from the OpenAPI 3.1.0 schema.
 * It creates:
 * - TypeScript interfaces (models)
 * - HTTP client services
 * - Request/Response types
 * - Enums and constants
 *
 * Architecture:
 * - Follows Clean Architecture principles
 * - Generated code is in src/lib/generated/ (gitignored)
 * - Never modify generated code directly
 *
 * @see docs/AWS-BACKEND-INTEGRATION-GUIDE.md
 */

import { generate } from 'openapi-typescript-codegen';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// Configuration
// =============================================================================

const SCHEMAS_DIR = path.join(process.cwd(), 'schemas');
const SCHEMA_PATH = path.join(SCHEMAS_DIR, 'current.json');
const OUTPUT_DIR = path.join(
  process.cwd(),
  'libs',
  'backend-api-client',
  'src',
  'generated'
);

// =============================================================================
// Validation
// =============================================================================

function validateSchemaExists(): void {
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error('❌ Schema file not found!');
    console.error(`   Expected: ${SCHEMA_PATH}\n`);
    console.error('📥 Run this first: npm run schema:fetch\n');
    process.exit(1);
  }
}

function validateSchemaContent(): any {
  try {
    const content = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    const schema = JSON.parse(content);

    // Validate OpenAPI structure
    if (!schema.openapi) {
      throw new Error('Missing "openapi" field');
    }
    if (!schema.info) {
      throw new Error('Missing "info" field');
    }
    if (!schema.paths) {
      throw new Error('Missing "paths" field');
    }

    console.log('✅ Schema validation passed');
    console.log(`   OpenAPI: ${schema.openapi}`);
    console.log(`   Title: ${schema.info.title}`);
    console.log(`   Version: ${schema.info.version}\n`);

    return schema;
  } catch (error: any) {
    console.error('❌ Invalid schema file!');
    console.error(`   Error: ${error.message}\n`);
    console.error('🔄 Try running: npm run schema:fetch\n');
    process.exit(1);
  }
}

// =============================================================================
// Clean Previous Generated Code
// =============================================================================

function cleanGeneratedDir(): void {
  if (fs.existsSync(OUTPUT_DIR)) {
    console.log('🧹 Cleaning previous generated code...');
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('✅ Generated directory ready\n');
}

// =============================================================================
// Generate TypeScript Code
// =============================================================================

async function generateClient(): Promise<void> {
  console.log('🔨 Generating TypeScript client from OpenAPI schema...\n');

  try {
    await generate({
      input: SCHEMA_PATH,
      output: OUTPUT_DIR,
      httpClient: 'fetch', // Use native fetch API
      clientName: 'ApiClient',
      useOptions: true, // Use options parameter
      useUnionTypes: true, // Use union types instead of enums where possible
      exportCore: true, // Export core functionality (OpenAPI config, etc.)
      exportServices: true, // Export service classes
      exportModels: true, // Export TypeScript interfaces
      exportSchemas: false, // Don't export JSON schemas (large)
      indent: '2', // 2-space indentation
      postfixServices: 'Service', // Suffix for service classes
      postfixModels: '', // No suffix for models
    });

    console.log('✅ TypeScript client generated successfully!\n');
  } catch (error: any) {
    console.error('❌ Failed to generate client!');
    console.error(`   Error: ${error.message}\n`);

    if (error.message.includes('parse')) {
      console.error('🔍 The schema might be malformed or incompatible');
      console.error('   Try downloading a fresh schema: npm run schema:fetch\n');
    }

    throw error;
  }
}

// =============================================================================
// Post-Generation: Create Index Files
// =============================================================================

function createIndexFiles(): void {
  console.log('📝 Creating barrel exports...');

  // Create main index.ts
  const mainIndexContent = `/**
 * Generated API Client
 *
 * Auto-generated from OpenAPI 3.1.0 schema
 * Do NOT modify this file manually!
 *
 * To regenerate: npm run schema:generate
 */

// Core
export { ApiError } from './core/ApiError';
export { CancelablePromise, CancelError } from './core/CancelablePromise';
export { OpenAPI } from './core/OpenAPI';
export type { OpenAPIConfig } from './core/OpenAPI';

// Models (auto-exported by generator)
export * from './models';

// Services (auto-exported by generator)
export * from './services';
`;

  const mainIndexPath = path.join(OUTPUT_DIR, 'index.ts');
  fs.writeFileSync(mainIndexPath, mainIndexContent);

  // Create models/index.ts
  createModelsIndex();

  // Create services/index.ts
  createServicesIndex();

  console.log('✅ Index files created\n');
}

/**
 * Create models/index.ts by scanning all model files
 */
function createModelsIndex(): void {
  const modelsDir = path.join(OUTPUT_DIR, 'models');

  if (!fs.existsSync(modelsDir)) {
    console.warn('⚠️  Models directory not found');
    return;
  }

  const modelFiles = fs.readdirSync(modelsDir)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts')
    .sort();

  const exports = modelFiles.map(file => {
    const name = file.replace('.ts', '');
    // Check if it's a type or enum by reading first line
    const content = fs.readFileSync(path.join(modelsDir, file), 'utf-8');
    const isEnum = content.includes('export enum');

    if (isEnum) {
      return `export { ${name} } from './${name}';`;
    } else {
      return `export type { ${name} } from './${name}';`;
    }
  });

  const modelsIndexContent = `/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

${exports.join('\n')}
`;

  fs.writeFileSync(path.join(modelsDir, 'index.ts'), modelsIndexContent);
}

/**
 * Create services/index.ts by scanning all service files
 */
function createServicesIndex(): void {
  const servicesDir = path.join(OUTPUT_DIR, 'services');

  if (!fs.existsSync(servicesDir)) {
    console.warn('⚠️  Services directory not found');
    return;
  }

  const serviceFiles = fs.readdirSync(servicesDir)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts')
    .sort();

  const exports = serviceFiles.map(file => {
    const name = file.replace('.ts', '');
    return `export { ${name} } from './${name}';`;
  });

  const servicesIndexContent = `/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

${exports.join('\n')}
`;

  fs.writeFileSync(path.join(servicesDir, 'index.ts'), servicesIndexContent);
}

// =============================================================================
// Post-Generation: Add README
// =============================================================================

function createReadme(): void {
  const readmeContent = `# Generated API Client

## ⚠️ Warning

**DO NOT MODIFY FILES IN THIS DIRECTORY!**

All files in this directory are **auto-generated** from the OpenAPI schema.
Any manual changes will be lost on the next generation.

## Regeneration

To regenerate this code after schema updates:

\`\`\`bash
npm run schema:fetch    # Download latest schema
npm run schema:generate # Generate TypeScript code
# Or combined:
npm run schema:update   # Does both
\`\`\`

## Usage

### Import Models

\`\`\`typescript
import type { User, AuthTokens } from '@/lib/generated';
\`\`\`

### Import Services

\`\`\`typescript
import { AuthService, TemplatesService } from '@/lib/generated';

const authService = new AuthService();
const tokens = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});
\`\`\`

### Configure OpenAPI Client

\`\`\`typescript
import { OpenAPI } from '@/lib/generated';

// Set base URL
OpenAPI.BASE = 'https://api.example.com';

// Set token (JWT from Cognito)
OpenAPI.TOKEN = async () => {
  const session = await Auth.currentSession();
  return session.getAccessToken().getJwtToken();
};
\`\`\`

## Documentation

See \`docs/AWS-BACKEND-INTEGRATION-GUIDE.md\` for complete integration guide.

## Generated Files Structure

\`\`\`
generated/
├── index.ts              # Main barrel export
├── core/                 # OpenAPI client core
│   ├── OpenAPI.ts        # Configuration
│   ├── ApiError.ts       # Error handling
│   ├── request.ts        # HTTP request logic
│   └── ...
├── models/               # TypeScript interfaces
│   ├── User.ts
│   ├── AuthTokens.ts
│   └── ...
└── services/             # API client services
    ├── AuthService.ts
    ├── TemplatesService.ts
    └── ...
\`\`\`

---

**Last Generated**: ${new Date().toISOString()}
**Generator**: openapi-typescript-codegen
**Source Schema**: schemas/current.json
`;

  const readmePath = path.join(OUTPUT_DIR, 'README.md');
  fs.writeFileSync(readmePath, readmeContent);

  console.log('✅ README.md created\n');
}

// =============================================================================
// Statistics
// =============================================================================

function printStatistics(): void {
  const modelsDir = path.join(OUTPUT_DIR, 'models');
  const servicesDir = path.join(OUTPUT_DIR, 'services');

  let modelCount = 0;
  let serviceCount = 0;

  if (fs.existsSync(modelsDir)) {
    modelCount = fs.readdirSync(modelsDir).filter(f => f.endsWith('.ts')).length - 1; // -1 for index.ts
  }

  if (fs.existsSync(servicesDir)) {
    serviceCount = fs.readdirSync(servicesDir).filter(f => f.endsWith('.ts')).length - 1;
  }

  console.log('📊 Generation Statistics:');
  console.log(`   Models: ${modelCount}`);
  console.log(`   Services: ${serviceCount}`);
  console.log(`   Location: ${OUTPUT_DIR}\n`);
}

// =============================================================================
// Main Function
// =============================================================================

async function main(): Promise<void> {
  console.log('🚀 Starting API client generation...\n');

  try {
    // Step 1: Validate schema exists
    validateSchemaExists();

    // Step 2: Validate schema content
    const schema = validateSchemaContent();

    // Step 3: Clean previous generated code
    cleanGeneratedDir();

    // Step 4: Generate TypeScript client
    await generateClient();

    // Step 5: Create index files
    createIndexFiles();

    // Step 6: Create README
    createReadme();

    // Step 7: Print statistics
    printStatistics();

    // Step 8: Success message
    console.log('🎉 API client generation complete!\n');
    console.log('📝 Next steps:');
    console.log('   1. Import generated types in your components');
    console.log('   2. Configure OpenAPI client (see generated/README.md)');
    console.log('   3. Start using type-safe API calls!\n');
    console.log('💡 Tip: Generated code is gitignored, safe to regenerate anytime\n');

  } catch (error: any) {
    console.error('\n❌ Generation failed!');
    console.error(`   Error: ${error.message}\n`);
    process.exit(1);
  }
}

// =============================================================================
// Execute
// =============================================================================

main();
