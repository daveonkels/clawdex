import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const REQUIRED_FIELDS = ['name', 'slug', 'tagline', 'description', 'language', 'category', 'status', 'highlight', 'emoji', 'added'];
const VALID_LANGUAGES = ['typescript', 'rust', 'python', 'go', 'c', 'bash', 'zig', 'multi'];
const VALID_STATUSES = ['active', 'experimental', 'archived'];
const VALID_PLATFORMS = ['server', 'browser', 'embedded', 'serverless', 'messaging', 'desktop'];
const VALID_ECOSYSTEM_ROLES = ['reference', 'fork', 'reimplementation', 'derivative', 'infrastructure', 'alternative'];
const VALID_MENTION_TYPES = ['tweet', 'article', 'video', 'post'];

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

  // platform validation
  if (data.platform !== undefined) {
    if (!Array.isArray(data.platform)) {
      console.error(`❌ ${file}: "platform" must be an array`);
      errors++;
    } else {
      for (const p of data.platform) {
        if (!VALID_PLATFORMS.includes(p)) {
          console.error(`❌ ${file}: Invalid platform "${p}" (must be: ${VALID_PLATFORMS.join(', ')})`);
          errors++;
        }
      }
    }
  }

  // requires_llm validation
  if (data.requires_llm !== undefined && typeof data.requires_llm !== 'boolean') {
    console.error(`❌ ${file}: "requires_llm" must be a boolean`);
    errors++;
  }

  // mcp_support validation
  if (data.mcp_support !== undefined && typeof data.mcp_support !== 'boolean') {
    console.error(`❌ ${file}: "mcp_support" must be a boolean`);
    errors++;
  }

  // integration_count validation
  if (data.integration_count !== undefined) {
    if (typeof data.integration_count !== 'number' || data.integration_count <= 0) {
      console.error(`❌ ${file}: "integration_count" must be a positive number`);
      errors++;
    }
  }

  // ecosystem_role validation
  if (data.ecosystem_role !== undefined && !VALID_ECOSYSTEM_ROLES.includes(data.ecosystem_role)) {
    console.error(`❌ ${file}: Invalid ecosystem_role "${data.ecosystem_role}" (must be: ${VALID_ECOSYSTEM_ROLES.join(', ')})`);
    errors++;
  }

  // perf validation
  if (data.perf !== undefined) {
    if (typeof data.perf !== 'object' || Array.isArray(data.perf)) {
      console.error(`❌ ${file}: "perf" must be an object`);
      errors++;
    } else {
      for (const [k, v] of Object.entries(data.perf)) {
        if (typeof v !== 'string') {
          console.error(`❌ ${file}: "perf.${k}" must be a string`);
          errors++;
        }
      }
    }
  }

  // mentions validation
  if (data.mentions !== undefined) {
    if (!Array.isArray(data.mentions)) {
      console.error(`❌ ${file}: "mentions" must be an array`);
      errors++;
    } else {
      for (const [i, m] of data.mentions.entries()) {
        if (!VALID_MENTION_TYPES.includes(m.type)) {
          console.error(`❌ ${file}: mentions[${i}].type "${m.type}" invalid (must be: ${VALID_MENTION_TYPES.join(', ')})`);
          errors++;
        }
        if (!m.url || typeof m.url !== 'string') {
          console.error(`❌ ${file}: mentions[${i}].url is required and must be a string`);
          errors++;
        }
        if (!m.author || typeof m.author !== 'string') {
          console.error(`❌ ${file}: mentions[${i}].author is required and must be a string`);
          errors++;
        }
        if (!m.date || typeof m.date !== 'string') {
          console.error(`❌ ${file}: mentions[${i}].date is required and must be a string`);
          errors++;
        }
      }
    }
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
