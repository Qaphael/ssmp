const { writeFileSync } = require('fs');
const { resolve } = require('path');
const YAML = require('yaml');
const { generateOpenAPI } = require('@ssmp/shared-types/openapi');

const outputDir = resolve(__dirname, '..', 'swagger');
const outputPath = resolve(outputDir, 'openapi.yaml');

try {
  const doc = generateOpenAPI();
  const yaml = YAML.stringify(doc, { indent: 2, lineWidth: 120 });

  writeFileSync(outputPath, yaml, 'utf-8');
  console.log(`✓ OpenAPI spec generated: ${outputPath}`);
  console.log(`  ${Object.keys(doc.paths || {}).length} paths, ${Object.keys(doc.components?.schemas || {}).length} schemas`);
} catch (err) {
  console.error('✗ Failed to generate OpenAPI spec:', err);
  process.exit(1);
}
