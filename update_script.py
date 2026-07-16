import json
import re

json_file = "docs/0 数据准备/charpter 2-10/charpter5_MD/phy_1_chapter05_questions.json"
md_file = "docs/0 数据准备/charpter 2-10/charpter5_MD/phy_1_chapter05_questions_preview.md"

with open(json_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

code_mapping = {}

for item in data:
    code = item.get("businessCode", "")
    
    codes = []
    # Q4, Q7, Q14, Q15, Q16
    if code in ["phy-05-qC4", "phy-05-qE3", "phy-05-qB6", "phy-05-qB7", "phy-05-qB8"]:
        codes = ["phy_1_1_4_02"]
    # Q17
    elif code == "phy-05-qB9":
        codes = ["phy_1_1_4_01", "phy_1_1_4_02"]
    else:
        codes = ["phy_1_1_4_01"]
        
    item["subtopicCodes"] = codes
    code_mapping[code] = ", ".join(codes)

with open(json_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open(md_file, 'r', encoding='utf-8') as f:
    md_content = f.read()

def replace_topic_code(match):
    b_code = match.group(1)
    # find the next Topic Code
    rest = match.group(2)
    new_rest = re.sub(r'\*\*Topic Code\*\*:.*?(?=\s*\|\s*\*\*Difficulty\*\*)', f'**Topic Code**: {code_mapping.get(b_code, "phy_1_1_4")}', rest, count=1)
    return f'## {b_code}\n{new_rest}'

# We need to split by "## phy-" and replace the first Topic Code in that section.
new_md_content = md_content
for b_code, t_codes in code_mapping.items():
    # Replace **Topic Code**: phy_1_1_4 with **Topic Code**: t_codes but only under the specific businessCode section
    pattern = re.compile(r'(##\s+' + re.escape(b_code) + r'\s*\n+)\*\*Topic Code\*\*:.*?(?=\s*\|\s*\*\*Difficulty\*\*)')
    new_md_content = pattern.sub(r'\1**Topic Code**: ' + t_codes, new_md_content)

with open(md_file, 'w', encoding='utf-8') as f:
    f.write(new_md_content)

print("Done updating both files.")
