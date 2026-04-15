---
description: 检查当前代码是否符合编码规范
argument-hint: "[rule-id...]"
allowed-tools: [Read, Glob, Grep, Bash]
---

# Check Code

对当前文件执行编码规范检查。参数: $ARGUMENTS

## 指令

1. 检测当前正在编辑的文件的语言和框架
2. 解析参数：
   - 无参数：加载所有对应规范文件并检查全部规则
   - 指定全局规则 ID（如 `R-SB-API-01`）：从 `skills/code-standards/rule-index.md` 定位规则，仅检查指定规则
   - 示例：`/check-code R-SB-API-01 R-SB-API-04 R-JAVA-BP-01`
3. 根据当前 profile（`.codestandardsrc.json`）过滤规则级别
4. 逐条检查规范中的每条规则
5. 输出检查报告：

```
[规范检查报告] 文件: {文件名}
检测到的语言/框架: {检测结果}
当前 Profile: {profile}
加载的规范: {规范文件列表}

检查结果:
- R{N} ({全局ID}): {规则名称} - {PASS / FAIL}
  {如有 FAIL，说明原因和修复建议}

总结: {通过数}/{总数} 条规则通过
```

6. 如有不通过的规则，自动按规范修复并重新检查