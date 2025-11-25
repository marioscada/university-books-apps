#!/usr/bin/env node

/**
 * ============================================================================
 * PROJECT CONFIGURATION SCRIPT
 * ============================================================================
 *
 * Questo script applica la configurazione da project.config.js a tutti i file
 * del progetto che necessitano di personalizzazione.
 *
 * Usage: npm run configure
 */

const fs = require('fs');
const path = require('path');
const config = require('../project.config.js');

console.log('🔧 Configuring project from project.config.js...\n');

// =============================================================================
// Helper Functions
// =============================================================================

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf-8');
}

function updateFile(filePath, replacements) {
  let content = readFile(filePath);
  let modified = false;

  for (const [search, replace] of Object.entries(replacements)) {
    if (content.includes(search)) {
      content = content.replace(new RegExp(search, 'g'), replace);
      modified = true;
    }
  }

  if (modified) {
    writeFile(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }

  return false;
}

// =============================================================================
// Configuration Steps
// =============================================================================

console.log('📦 Step 1: Updating package.json...');
try {
  const packageJson = JSON.parse(readFile('package.json'));
  packageJson.name = config.repository.name;
  packageJson.description = `${config.client.name} - Angular Monorepo`;
  packageJson.repository = {
    type: 'git',
    url: config.repository.url,
  };
  packageJson.author = config.client.companyName;
  writeFile('package.json', JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Updated: package.json\n');
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
}

console.log('📦 Step 2: Updating environment files...');
config.projects.forEach(project => {
  const envPath = `projects/${project.name}/src/environments/environment.ts`;
  const envProdPath = `projects/${project.name}/src/environments/environment.prod.ts`;

  try {
    // Development environment
    const devEnv = `export const environment = {
  production: false,
  appName: '${project.displayName}',
  apiUrl: '${config.environment.development.apiUrl}',
  enableDebug: ${config.environment.development.enableDebug},
  version: '1.0.0'
};
`;
    writeFile(envPath, devEnv);
    console.log(`✅ Updated: ${envPath}`);

    // Production environment
    const prodEnv = `export const environment = {
  production: true,
  appName: '${project.displayName}',
  apiUrl: '${config.environment.production.apiUrl}',
  enableDebug: ${config.environment.production.enableDebug},
  version: '1.0.0'
};
`;
    writeFile(envProdPath, prodEnv);
    console.log(`✅ Updated: ${envProdPath}`);
  } catch (error) {
    console.error(`❌ Error updating environment for ${project.name}:`, error.message);
  }
});
console.log('');

console.log('📦 Step 3: Updating config.json files...');
config.projects.forEach(project => {
  const configPath = `projects/${project.name}/public/data/config.json`;

  try {
    const projectConfig = {
      appName: project.displayName,
      apiUrl: config.environment.production.apiUrl,
      features: config.features,
      supportedLanguages: ['en', 'it']
    };
    writeFile(configPath, JSON.stringify(projectConfig, null, 2) + '\n');
    console.log(`✅ Updated: ${configPath}`);
  } catch (error) {
    console.error(`❌ Error updating config for ${project.name}:`, error.message);
  }
});
console.log('');

console.log('📦 Step 4: Updating Tailwind configuration...');
try {
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./projects/*/src/**/*.{html,ts}",
  ],
  theme: {
    extend: ${JSON.stringify(config.styling.tailwind.extend, null, 6).replace(/\n/g, '\n    ')},
  },
  plugins: [],
}
`;
  writeFile('tailwind.config.js', tailwindConfig);
  console.log('✅ Updated: tailwind.config.js\n');
} catch (error) {
  console.error('❌ Error updating tailwind.config.js:', error.message);
}

console.log('📦 Step 5: Updating SCSS variables...');
try {
  const scssVarsPath = 'projects/cicd-test/src/styles/_variables.scss';
  const scssVars = readFile(scssVarsPath);

  // Update primary color
  let updatedScss = scssVars.replace(
    /\$primary-color:\s*#[0-9a-fA-F]{6};/,
    `$primary-color: ${config.styling.primaryColor};`
  );

  // Update accent color
  updatedScss = updatedScss.replace(
    /\$accent-color:\s*#[0-9a-fA-F]{6};/,
    `$accent-color: ${config.styling.accentColor};`
  );

  // Update font family
  updatedScss = updatedScss.replace(
    /\$font-family-base:\s*'[^']+'/,
    `$font-family-base: ${config.styling.fontFamily}`
  );

  writeFile(scssVarsPath, updatedScss);
  console.log(`✅ Updated: ${scssVarsPath}`);

  // Copy to other projects
  ['cicd-second-project', 'cicd-third-project'].forEach(proj => {
    const targetPath = `projects/${proj}/src/styles/_variables.scss`;
    writeFile(targetPath, updatedScss);
    console.log(`✅ Updated: ${targetPath}`);
  });
  console.log('');
} catch (error) {
  console.error('❌ Error updating SCSS variables:', error.message);
}

console.log('📦 Step 6: Updating commitlint configuration...');
try {
  const commitlintConfig = `module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ${JSON.stringify(config.ci.commitFormat.types)}],
    'scope-enum': [2, 'always', ${JSON.stringify(config.ci.commitFormat.scopes)}],
    'scope-empty': [2, ${config.ci.commitFormat.requireScope ? "'never'" : "'always'"}]
  }
};
`;
  writeFile('commitlint.config.js', commitlintConfig);
  console.log('✅ Updated: commitlint.config.js\n');
} catch (error) {
  console.error('❌ Error updating commitlint.config.js:', error.message);
}

console.log('📦 Step 7: Updating README.md...');
try {
  const readme = `# ${config.client.name}

${config.client.companyName} - Angular Monorepo

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run start:cicd-test     # http://localhost:${config.projects[0].port}
npm run start:second        # http://localhost:${config.projects[1].port}
npm run start:third         # http://localhost:${config.projects[2].port}

# Build for production
npm run build:all

# Run with Docker
npm run docker:build:all
npm run docker:up
\`\`\`

## 📦 Projects

${config.projects.map(p => `- **${p.displayName}** - ${p.description} (Port: ${p.port})`).join('\n')}

## 🔧 Configuration

Tutte le configurazioni personalizzabili si trovano in \`project.config.js\`.

Per applicare le modifiche:
\`\`\`bash
npm run configure
\`\`\`

## 📚 Documentation

- [Monorepo Structure](MONOREPO.md)
- [Docker Setup](docs/DOCKER-MONOREPO.md)
- [AWS Deployment](docs/AWS-SETUP.md)
- [GitHub Settings](docs/GITHUB-SETTINGS.md)

## 👥 Team

${config.client.companyName}
- Website: ${config.client.website}
- Email: ${config.client.email}

## 📄 License

Copyright © ${new Date().getFullYear()} ${config.client.companyName}
`;
  writeFile('README.md', readme);
  console.log('✅ Updated: README.md\n');
} catch (error) {
  console.error('❌ Error updating README.md:', error.message);
}

// =============================================================================
// Summary
// =============================================================================

console.log('═══════════════════════════════════════════════════════════');
console.log('✅ Configuration complete!');
console.log('═══════════════════════════════════════════════════════════');
console.log('\n📋 Summary:');
console.log(`   Client: ${config.client.name}`);
console.log(`   Repository: ${config.repository.name}`);
console.log(`   Projects: ${config.projects.length}`);
console.log(`   AWS Region: ${config.aws.region}`);
console.log('');
console.log('🎯 Next steps:');
console.log('   1. Review the updated files');
console.log('   2. Update GitHub Secrets (AWS credentials, etc.)');
console.log('   3. Test the build: npm run build:all');
console.log('   4. Test Docker: npm run docker:build:all');
console.log('   5. Commit changes: git add . && git commit -m "chore: configure project"');
console.log('');
