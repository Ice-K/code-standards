#!/usr/bin/env node

/**
 * Multi-Platform Adapter
 *
 * 将编码规范转换为其他 AI 编码助手的格式。
 *
 * 用法:
 *   node scripts/adapt.js cursor   — 生成 .cursorrules
 *   node scripts/adapt.js copilot  — 生成 .github/copilot-instructions.md
 *   node scripts/adapt.js all      — 生成所有格式
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const STANDARDS_DIR = path.resolve(ROOT_DIR, 'standards');
const OUTPUT_DIR = path.resolve(ROOT_DIR, 'adapters');

// --- Profile ---

function getProfile() {
  const configPath = path.resolve(ROOT_DIR, '.codestandardsrc.json');
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.profile || 'recommended';
    }
  } catch (_) { /* ignore */ }
  return 'recommended';
}

const PROFILE_FILTERS = {
  core: ['必须'],
  recommended: ['必须', '推荐'],
  extended: ['必须', '推荐', '建议'],
};

// --- Standards Reader ---

function walkDir(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (entry.name.endsWith('.md') && entry.name !== '_template.md') {
      files.push(fullPath);
    }
  }
  return files;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: null, body: content };
  return { meta: match[1], body: match[2] };
}

function filterRulesByProfile(body, profile) {
  const allowedLevels = PROFILE_FILTERS[profile];
  const sections = body.split(/(?=### R\d+)/);
  const header = sections.shift() || '';

  const kept = [];
  for (const section of sections) {
    const levelMatch = section.match(/\*\*级别\*\*:\s*(必须|推荐|建议)/);
    const level = levelMatch ? levelMatch[1] : '必须';
    if (allowedLevels.includes(level)) {
      kept.push(section);
    }
  }

  return header + kept.join('');
}

function loadStandards(profile) {
  const files = walkDir(STANDARDS_DIR);
  const categories = {};

  for (const filePath of files) {
    const relativePath = path.relative(STANDARDS_DIR, filePath).replace(/\\/g, '/');
    if (relativePath.startsWith('team/')) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    const { body } = parseFrontmatter(content);
    const filtered = filterRulesByProfile(body, profile);

    const category = relativePath.split('/')[0];
    categories[category] = categories[category] || [];
    categories[category].push({ path: relativePath, content: filtered });
  }

  return categories;
}

// --- Formatters ---

function formatCursorRules(categories, profile) {
  let output = `# 编码规范（自动生成）\n# Profile: ${profile}\n# 生成时间: ${new Date().toISOString().split('T')[0]}\n# 由 scripts/adapt.js 从 standards/ 自动转换\n\n`;

  for (const [category, files] of Object.entries(categories)) {
    output += `# ===== ${category.toUpperCase()} =====\n\n`;
    for (const file of files) {
      output += file.content.trim() + '\n\n';
    }
  }

  return output;
}

function formatCopilotInstructions(categories, profile) {
  let output = `# 编码规范\n\n> Profile: ${profile} | 自动生成: ${new Date().toISOString().split('T')[0]}\n\n`;

  for (const [category, files] of Object.entries(categories)) {
    output += `## ${category.toUpperCase()}\n\n`;
    for (const file of files) {
      output += file.content.trim() + '\n\n';
    }
  }

  return output;
}

// --- Main ---

function main() {
  const target = process.argv[2];

  if (!target || !['cursor', 'copilot', 'all'].includes(target)) {
    console.log('用法: node scripts/adapt.js <cursor|copilot|all>');
    process.exit(1);
  }

  const profile = getProfile();
  console.log(`Profile: ${profile}`);

  const categories = loadStandards(profile);
  const ruleCount = Object.values(categories).reduce((sum, files) =>
    sum + files.reduce((s, f) => s + (f.content.match(/### R\d+:/g) || []).length, 0), 0);
  console.log(`加载 ${ruleCount} 条规则（${Object.keys(categories).length} 个分类）`);

  if (target === 'cursor' || target === 'all') {
    const content = formatCursorRules(categories, profile);
    const outPath = path.join(OUTPUT_DIR, 'cursor', '.cursorrules');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, content, 'utf8');
    console.log(`✓ Cursor: ${outPath} (${(content.length / 1024).toFixed(1)} KB)`);
  }

  if (target === 'copilot' || target === 'all') {
    const content = formatCopilotInstructions(categories, profile);
    const outPath = path.join(OUTPUT_DIR, 'copilot', '.github', 'copilot-instructions.md');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, content, 'utf8');
    console.log(`✓ Copilot: ${outPath} (${(content.length / 1024).toFixed(1)} KB)`);
  }
}

main();
