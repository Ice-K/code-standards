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

const getGuardContent = () => {
  const skillPath = path.resolve(__dirname, '../../skills/code-standards/SKILL.md');
  if (!fs.existsSync(skillPath)) return null;

  const fullContent = fs.readFileSync(skillPath, 'utf8');
  const body = extractFrontmatter(fullContent);

  return `<CODE_STANDARDS_GUARD>
${body}
</CODE_STANDARDS_GUARD>`;
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
      const guard = getGuardContent();
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