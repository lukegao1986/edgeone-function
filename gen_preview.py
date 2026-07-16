import json

with open('phy_1_chapter05_questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

md_lines = ["# 第5章 剛体にはたらく力のつりあい\n"]

for q in data:
    md_lines.append(f"## {q['businessCode']}")
    md_lines.append(f"**Topic Code**: {q['topicCode']} | **Difficulty**: {q['difficultyLevel']}\n")
    md_lines.append("### 题目")
    md_lines.append(q['stem'] + "\n")
    md_lines.append("### 选项")
    for i, opt in enumerate(q['options']):
        check = "✓" if i == q['correctIndex'] else " "
        md_lines.append(f"- [{check}] {opt}")
    md_lines.append("\n### 解析")
    md_lines.append(q['explanation'])
    md_lines.append("\n---")

with open('phy_1_chapter05_questions_preview.md', 'w', encoding='utf-8') as f:
    f.write("\n".join(md_lines) + "\n")

print("Preview generated.")