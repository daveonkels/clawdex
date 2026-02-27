import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const REQUIRED_FIELDS = ['name', 'slug', 'tagline', 'description', 'language', 'category', 'status', 'highlight', 'emoji', 'added'];
const VALID_LANGUAGES = ['typescript', 'rust', 'python', 'go', 'c', 'bash', 'zig', 'multi'];
const VALID_STATUSES = ['active', 'experimental', 'archived'];

const dir = path.join(process.cwd(), 'src', 'data', 'projects');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));

let errors = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf-8');
  let data;

  try {
    data = yaml.load(content);
  } catch (e) {
    console.error(`❌ ${file}: Invalid YAML — ${e.message}`);
    errors++;
    continue;
  }

  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) {
      console.error(`❌ ${file}: Missing required field "${field}"`);
      errors++;
    }
  }

  if (data.language && !VALID_LANGUAGES.includes(data.language)) {
    console.error(`❌ ${file}: Invalid language "${data.language}" (must be: ${VALID_LANGUAGES.join(', ')})`);
    errors++;
  }

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    console.error(`❌ ${file}: Invalid status "${data.status}" (must be: ${VALID_STATUSES.join(', ')})`);
    errors++;
  }

  if (!Array.isArray(data.category)) {
    console.error(`❌ ${file}: "category" must be an array`);
    errors++;
  }

  if (errors === 0) {
    console.log(`✅ ${file}`);
  }
}

if (errors > 0) {
  console.error(`\n${errors} error(s) found.`);
  process.exit(1);
} else {
  console.log(`\n✅ All ${files.length} project files valid.`);
}
