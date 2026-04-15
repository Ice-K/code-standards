#!/usr/bin/env node

/**
 * PostToolUse Hook: 文件写入后自动检查编码规范
 *
 * 作为 Claude Code 的 PostToolUse hook 使用，在 Write/Edit 操作后自动执行基础规范检查。
 *
 * 用法: node scripts/post-write-check.js <file-path>
 *
 * 配置示例（.claude/settings.local.json）：
 * {
 *   "hooks": {
 *     "PostToolUse": [{
 *       "matcher": "Write|Edit",
 *       "command": "node scripts/post-write-check.js"
 *     }]
 *   }
 * }
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- 配置 ---

const EXTENSION_MAP = {
  '.java': 'java',
  '.vue': 'vue',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.css': 'css',
  '.less': 'css',
  '.scss': 'css',
};

// 按扩展名的基础模式检查规则
const PATTERN_CHECKS = {
  '.java': [
    { id: 'R-JAVA-BP-01', pattern: /catch\s*\(\s*Exception\s+\w+\s*\)/, level: '必须', desc: '不应捕获 Exception 基类，应捕获具体异常' },
    { id: 'R-JAVA-BP-03', pattern: /Executors\.(newFixedThreadPool|newCachedThreadPool|newSingleThreadExecutor)/, level: '必须', desc: '不应使用 Executors 创建线程池，应使用 ThreadPoolExecutor' },
    { id: 'R-JAVA-CS-01', pattern: /private\s+boolean\s+is[A-Z]/, level: '必须', desc: 'boolean 变量不应加 is 前缀（序列化问题）' },
    { id: 'R-JAVA-CS-01', pattern: /Boolean\s+is[A-Z]\w+;/, level: '必须', desc: 'POJO 类 Boolean 字段不应加 is 前缀' },
  ],
  '.vue': [
    { id: 'R-V3-CS-09', pattern: /<style(?![^>]*scoped)/, level: '必须', desc: 'Vue 组件样式必须使用 scoped', condition: (content) => content.includes('<style') },
    { id: 'R-V3-CS-11', pattern: /v-for(?![^>]*:key)/, level: '必须', desc: 'v-for 必须绑定 :key' },
  ],
  '.ts': [],
  '.tsx': [],
  '.js': [],
  '.css': [
    { id: 'R-CSS-03', pattern: /!important/, level: '必须', desc: '禁止使用 !important' },
  ],
  '.less': [
    { id: 'R-CSS-03', pattern: /!important/, level: '必须', desc: '禁止使用 !important' },
  ],
};

// --- 核心逻辑 ---

function getFileContent() {
  // 从 stdin 读取（Claude Code hook 通过 stdin 传递工具调用信息）
  // 或从命令行参数获取文件路径
  const filePath = process.argv[2];
  if (filePath && fs.existsSync(filePath)) {
    return { path: filePath, content: fs.readFileSync(filePath, 'utf8') };
  }
  return null;
}

function getProfile() {
  const configPath = path.resolve(process.cwd(), '.codestandardsrc.json');
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.profile || 'recommended';
    }
  } catch (_) { /* ignore */ }
  return 'recommended';
}

function checkFile(filePath, content) {
  const ext = path.extname(filePath);
  const checks = PATTERN_CHECKS[ext] || [];
  const violations = [];

  for (const check of checks) {
    // Apply condition if exists
    if (check.condition && !check.condition(content)) continue;

    if (check.pattern.test(content)) {
      // Skip if profile is core and rule is not 必须
      if (check.level !== '必须') continue;
      violations.push(check);
    }
  }

  return violations;
}

function main() {
  const file = getFileContent();
  if (!file) {
    // No file to check, exit silently
    process.exit(0);
  }

  const ext = path.extname(file.path);
  if (!EXTENSION_MAP[ext]) {
    // Not a recognized file type, exit silently
    process.exit(0);
  }

  const violations = checkFile(file.path, file.content);

  if (violations.length === 0) {
    process.exit(0);
  }

  // Output violations as feedback
  console.log(`[规范检查] ${path.basename(file.path)}: 发现 ${violations.length} 个潜在违规`);
  for (const v of violations) {
    console.log(`  - ${v.id} (${v.level}): ${v.desc}`);
  }

  process.exit(0); // Exit 0 to not block the operation, just provide feedback
}

main();
