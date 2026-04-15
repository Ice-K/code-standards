/**
 * Code Standards Plugin for Claude Code
 *
 * 注入编码规范守卫到每段对话，确保 AI 编写代码时遵循规范。
 * 自动注册 skills 目录，无需手动配置。
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const extractFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return content;
  return match[2];
};

const getProfileConfig = (projectDir) => {
  const configPath = path.resolve(projectDir || process.cwd(), '.codestandardsrc.json');
  try {
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(raw);
      return {
        profile: ['core', 'recommended', 'extended'].includes(config.profile) ? config.profile : 'recommended',
        disabledRules: Array.isArray(config.disabledRules) ? config.disabledRules : [],
        disabledFiles: Array.isArray(config.disabledFiles) ? config.disabledFiles : [],
      };
    }
  } catch (e) {
    console.warn('[code-standards] Failed to read .codestandardsrc.json:', e.message);
  }
  return { profile: 'recommended', disabledRules: [], disabledFiles: [] };
};

const getGuardContent = (projectDir) => {
  try {
    const skillPath = path.resolve(__dirname, '../../skills/code-standards/SKILL.md');
    if (!fs.existsSync(skillPath)) return null;

    const fullContent = fs.readFileSync(skillPath, 'utf8');
    const body = extractFrontmatter(fullContent);
    const profileConfig = getProfileConfig(projectDir);

    const profileInfo = `当前配置 Profile: ${profileConfig.profile}` +
      (profileConfig.disabledRules.length ? ` | 禁用规则: ${profileConfig.disabledRules.join(', ')}` : '') +
      (profileConfig.disabledFiles.length ? ` | 禁用文件: ${profileConfig.disabledFiles.length}个` : '');

    return `<CODE_STANDARDS_GUARD>
${profileInfo}

${body}
</CODE_STANDARDS_GUARD>`;
  } catch (e) {
    console.warn('[code-standards] Failed to load guard content:', e.message);
    return null;
  }
};

export const CodeStandardsPlugin = async ({ client, directory }) => {
  const skillsDir = path.resolve(__dirname, '../../skills');

  return {
    // 注册 skills 目录
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }
    },

    // 注入守卫到首条用户消息
    'experimental.chat.messages.transform': async (_input, output) => {
      const guard = getGuardContent(directory);
      if (!guard || !output.messages.length) return;

      const firstUser = output.messages.find(m => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;

      // 防止重复注入
      if (firstUser.parts.some(p => p.type === 'text' && p.text.includes('CODE_STANDARDS_GUARD'))) return;

      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: guard });
    }
  };
};