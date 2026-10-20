const fs = require("fs");
const path = require("path");

const chapters = [8, 9, 10];
const baseDir =
  "/Users/wanglimin/Desktop/edgeone-ex/docs/0 数据准备/Charpter 1-30";
const reportPath =
  "/Users/wanglimin/Desktop/edgeone-ex/docs/Chapter8_10_Format_Issues_Report.md";

let reportContent = "# Chapter 8-10 题库格式诊断报告\n\n";

// 辅助函数：检查未闭合的 $
function checkUnclosedDollar(text) {
  if (!text) return false;
  // 匹配单个 $（前后非反斜杠转义）
  const matches = text.match(/(?<!\\)\$/g);
  if (matches && matches.length % 2 !== 0) {
    return true;
  }
  return false;
}

for (const ch of chapters) {
  reportContent += `## Chapter ${ch}\n\n`;
  const jsonPath = path.join(
    baseDir,
    `charpter${ch}`,
    `phy_1_chapter${ch}_questions.json`,
  );

  if (!fs.existsSync(jsonPath)) {
    reportContent += `- ⚠️ JSON 文件不存在: ${jsonPath}\n\n`;
    continue;
  }

  let data = [];
  try {
    data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  } catch (e) {
    reportContent += `- ⚠️ JSON 解析失败: ${e.message}\n\n`;
    continue;
  }

  let issuesFound = 0;

  for (const q of data) {
    const issues = [];

    // 1. 检查解析和答案是否为 undefined
    if (
      q.explanation === undefined ||
      q.explanation === "undefined" ||
      (typeof q.explanation === "string" && q.explanation.includes("undefined"))
    ) {
      issues.push("解析 (explanation) 包含 undefined 或为空");
    }

    // 检查答案
    if (
      q.correctIndex === undefined ||
      q.correctIndex === null ||
      q.correctIndex === "undefined"
    ) {
      issues.push("答案索引 (correctIndex) 为 undefined 或空");
    }

    // 2. 选项不完整或不合法
    if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
      if (q.options && q.options.length === 1 && q.options[0].includes(";")) {
        issues.push(
          `选项不完整或少于2个: 仅 1 个选项，但内部包含分号 (可能被 LLM 错误合并为单字符串)`,
        );
      } else {
        issues.push(
          `选项不完整或少于2个: ${q.options ? q.options.length : 0} 个`,
        );
      }
    } else {
      if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
        issues.push(
          `答案索引 (correctIndex: ${q.correctIndex}) 越界，选项总数: ${q.options.length}`,
        );
      }

      // 检查选项是否包含 undefined
      const hasUndefinedOption = q.options.some(
        (opt) =>
          opt === undefined ||
          opt === "undefined" ||
          (typeof opt === "string" && opt.includes("undefined")),
      );
      if (hasUndefinedOption) {
        issues.push("选项中包含 undefined");
      }
    }

    // 3. LaTeX 格式问题 (未闭合的 $)
    if (checkUnclosedDollar(q.stem)) {
      issues.push("题干 (stem) 存在未闭合的 LaTeX $ 符号");
    }
    if (checkUnclosedDollar(q.explanation)) {
      issues.push("解析 (explanation) 存在未闭合的 LaTeX $ 符号");
    }
    if (q.options && Array.isArray(q.options)) {
      q.options.forEach((opt, idx) => {
        if (checkUnclosedDollar(opt)) {
          issues.push(`选项 ${idx} 存在未闭合的 LaTeX $ 符号`);
        }
      });
    }

    if (issues.length > 0) {
      issuesFound++;
      reportContent += `### ${q.businessCode || "未知编号"}\n`;
      issues.forEach((issue) => {
        reportContent += `- ${issue}\n`;
      });
      reportContent += "\n";
    }
  }

  if (issuesFound === 0) {
    reportContent += `- ✅ 未发现明显格式问题。\n\n`;
  }
}

fs.writeFileSync(reportPath, reportContent, "utf8");
console.log("诊断报告已生成:", reportPath);
