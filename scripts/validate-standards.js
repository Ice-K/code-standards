#!/usr/bin/env node

/**
 * Code Standards Validator
 *
 * 验证所有规范文件的一致性和完整性。
 * 用法: node scripts/validate-standards.js [standards-dir]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STANDARDS_DIR = process.argv[2] || path.resolve(__dirname, '../standards');
const RULE_INDEX_PATH = path.resolve(__dirname, '../skills/code-standards/rule-index.md');

const errors = [];
const warnings = [];
const fileIds = new Set();

// --- Parsers ---

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: null, body: content };

  const metaStr = match[1];
  const body = match[2];
  const meta = {};

  // Simple YAML parser for our flat structure
  let currentKey = null;
  let inArray = false;
  for (const line of metaStr.split('\n')) {
    const arrayItemMatch = line.match(/^  - (.+)$/);
    if (inArray && arrayItemMatch && currentKey) {
      meta[currentKey].push(arrayItemMatch[1].replace(/^["']|["']$/g, ''));
      continue;
    }

    const kvMatch = line.match(/^(\w+):\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const val = kvMatch[2].trim();

      if (val === '') {
        meta[key] = [];
        currentKey = key;
        inArray = true;
        continue;
      }

      if (val.startsWith('[') && val.endsWith(']')) {
        meta[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      } else if (val.startsWith('{') || val.includes(':')) {
        meta[key] = val;
      } else {
        meta[key] = val.replace(/^["']|["']$/g, '');
      }
      currentKey = key;
      inArray = Array.isArray(meta[key]);
    }
  }

  return { meta, body };
}

function parseRules(body) {
  const rules = [];
  const ruleRegex = /### (R\d+):\s*(.+)/g;
  let match;

  while ((match = ruleRegex.exec(body)) !== null) {
    const id = match[1];
    const title = match[2].trim();

    // Extract the rule block (from this heading to the next ### or ## or EOF)
    const blockStart = match.index + match[0].length;
    const nextHeading = body.indexOf('\n### ', blockStart);
    const nextH2 = body.indexOf('\n## ', blockStart);
    let blockEnd = body.length;
    if (nextHeading > 0 && nextH2 > 0) blockEnd = Math.min(nextHeading, nextH2);
    else if (nextHeading > 0) blockEnd = nextHeading;
    else if (nextH2 > 0) blockEnd = nextH2;

    const block = body.substring(blockStart, blockEnd);

    // Extract level
    const levelMatch = block.match(/\*\*级别\*\*:\s*(必须|推荐|建议)/);
    const level = levelMatch ? levelMatch[1] : null;

    // Check for description (any text after level)
    const hasDescription = block.includes('**描述**') || block.length > 50;

    // Check for examples
    const codeBlocks = block.match(/```[\s\S]*?```/g) || [];
    const hasGoodExample = codeBlocks.length >= 1;
    const hasBadExample = codeBlocks.length >= 2;

    rules.push({
      id,
      title,
      level,
      hasDescription,
      hasGoodExample,
      hasBadExample,
      lineNum: body.substring(0, match.index).split('\n').length,
    });
  }

  return rules;
}

// --- Validators ---

function validateFrontmatter(meta, filePath) {
  if (!meta) {
    errors.push(`${filePath}: 缺少 frontmatter 元数据`);
    return;
  }

  const required = ['id', 'title', 'tags'];
  for (const field of required) {
    if (!meta[field]) {
      errors.push(`${filePath}: frontmatter 缺少 '${field}' 字段`);
    }
  }

  if (meta.id) {
    if (!/^[a-z][a-z0-9-]*$/.test(meta.id)) {
      errors.push(`${filePath}: id '${meta.id}' 不符合 kebab-case 规范`);
    }
    if (fileIds.has(meta.id)) {
      errors.push(`${filePath}: id '${meta.id}' 与其他文件重复`);
    }
    fileIds.add(meta.id);
  }

  if (meta.tags && !Array.isArray(meta.tags)) {
    warnings.push(`${filePath}: tags 应为数组格式`);
  }
}

function validateRules(rules, filePath) {
  if (rules.length === 0) {
    warnings.push(`${filePath}: 未找到任何规则 (### R{N}: 格式)`);
    return;
  }

  if (rules.length < 2) {
    warnings.push(`${filePath}: 规则数量过少 (${rules.length})，建议至少 2 条`);
  }

  // Check sequential numbering
  const numbers = rules.map(r => parseInt(r.id.replace('R', ''), 10));
  for (let i = 0; i < numbers.length; i++) {
    const expected = i + 1;
    if (numbers[i] !== expected) {
      errors.push(`${filePath}: 规则编号不连续，期望 R${expected}，实际 R${numbers[i]}`);
    }
  }

  // Check each rule
  for (const rule of rules) {
    const loc = `${filePath}:${rule.lineNum}`;

    if (!rule.level) {
      errors.push(`${loc} [${rule.id}]: 缺少级别字段 (**级别**: 必须/推荐/建议)`);
    } else if (!['必须', '推荐', '建议'].includes(rule.level)) {
      errors.push(`${loc} [${rule.id}]: 级别值 '${rule.level}' 不合法，必须为 必须/推荐/建议`);
    }

    if (!rule.hasGoodExample) {
      errors.push(`${loc} [${rule.id}]: 缺少正确示例代码块`);
    }

    if (!rule.hasBadExample) {
      warnings.push(`${loc} [${rule.id}]: 缺少错误示例代码块`);
    }
  }
}

function validateFileStructure(body, filePath) {
  if (!body.match(/^# /m)) {
    errors.push(`${filePath}: 缺少 H1 标题`);
  }

  const normalized = filePath.replace(/\\/g, '/');
  const isSpecialFile = normalized.includes('_template.md') || normalized.includes('team/');
  if (!body.includes('## 适用范围') && !isSpecialFile) {
    warnings.push(`${filePath}: 缺少 '## 适用范围' 章节`);
  }

  if (!body.includes('## 规则') && !isSpecialFile) {
    errors.push(`${filePath}: 缺少 '## 规则' 章节`);
  }
}

function validateRuleIndex() {
  if (!fs.existsSync(RULE_INDEX_PATH)) {
    warnings.push('skills/code-standards/rule-index.md 不存在，跳过全局 ID 验证');
    return;
  }

  const indexContent = fs.readFileSync(RULE_INDEX_PATH, 'utf8');
  const globalIds = [];
  const idRegex = /^\| (R-[A-Z0-9-]+\d+) \|/gm;
  let match;
  while ((match = idRegex.exec(indexContent)) !== null) {
    globalIds.push(match[1]);
  }

  // Check uniqueness
  const seen = new Set();
  for (const id of globalIds) {
    if (seen.has(id)) {
      errors.push(`rule-index.md: 全局规则 ID '${id}' 重复`);
    }
    seen.add(id);
  }

  console.log(`  全局规则 ID 总数: ${globalIds.length}`);
}

// --- Main ---

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

function main() {
  console.log('=== Code Standards Validator ===\n');

  if (!fs.existsSync(STANDARDS_DIR)) {
    console.error(`错误: 目录不存在 ${STANDARDS_DIR}`);
    process.exit(1);
  }

  const files = walkDir(STANDARDS_DIR);
  console.log(`扫描 ${files.length} 个规范文件...\n`);

  for (const filePath of files) {
    const relativePath = path.relative(STANDARDS_DIR, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');
    const { meta, body } = parseFrontmatter(content);
    const isTeamFile = relativePath.startsWith('team/');

    console.log(`  检查: ${relativePath}`);

    if (!isTeamFile) {
      validateFrontmatter(meta, relativePath);
      validateFileStructure(body, relativePath);
      const rules = parseRules(body);
      validateRules(rules, relativePath);
    }
  }

  console.log('');
  validateRuleIndex();

  // Report
  console.log('\n--- 验证结果 ---\n');

  if (errors.length === 0 && warnings.length === 0) {
    console.log('  所有检查通过！');
  } else {
    if (errors.length > 0) {
      console.log(`  错误 (${errors.length}):`);
      errors.forEach(e => console.log(`    ✘ ${e}`));
    }
    if (warnings.length > 0) {
      console.log(`\n  警告 (${warnings.length}):`);
      warnings.forEach(w => console.log(`    ⚠ ${w}`));
    }
  }

  console.log(`\n  文件数: ${files.length}`);
  console.log(`  错误数: ${errors.length}`);
  console.log(`  警告数: ${warnings.length}`);

  process.exit(errors.length > 0 ? 1 : 0);
}

main();
