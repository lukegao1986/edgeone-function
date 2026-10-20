import json
import glob
import pandas as pd
import re
import os

def estimate_question_count(stem, opt_count):
    # 1. 首先通过 2N+2 反推（N = (opt_count - 2) / 2）
    # 只要算出来是正整数，通常非常可靠（因为生成规则就是 2N+2）
    if opt_count >= 4 and opt_count <= 16 and opt_count % 2 == 0:
        n = (opt_count - 2) // 2
        return n
    
    # 2. 如果因为熔断等原因不符合 2N+2，则尝试通过题干正则匹配
    matches_num = re.findall(r'\(\s*([1-5])\s*\)', stem)
    matches_kana = re.findall(r'\(\s*([アイウエオカキクケコ])\s*\)', stem)
    
    max_q = 1
    if matches_num:
        max_q = max(max_q, max([int(m) for m in matches_num]))
    if matches_kana:
        # ア=1, イ=2, ウ=3... 粗略估计长度
        max_q = max(max_q, len(set(matches_kana)))
        
    return max_q

chapters = range(21, 30)
records = []

for ch in chapters:
    prefix = 'phy_5' if ch >= 28 else 'phy_4'
    pattern = f'docs/0 数据准备/Charpter 1-30/charpter{ch}/{prefix}_chapter{ch}_questions.json'
    files = glob.glob(pattern)
    
    for f in files:
        with open(f, 'r', encoding='utf-8') as file:
            data = json.load(file)
            for q in data:
                bcode = q.get('businessCode', '')
                topic = q.get('topicCode', '')
                subtopics = ';'.join(q.get('subtopicCodes', []))
                options = q.get('options', [])
                opt_count = len(options)
                correct_idx = q.get('correctIndex', '')
                
                stem = q.get('stem', '')
                q_count = estimate_question_count(stem, opt_count)
                
                records.append({
                    'businessCode': bcode,
                    'topicCode': topic,
                    'subtopicCodes': subtopics,
                    '问题数': q_count,
                    '选项数': opt_count,
                    '正确答案序号': correct_idx,
                    '人工意见': ''
                })

df = pd.DataFrame(records)
out_path = 'docs/Topic_Review_Reports/Chapter21_29_Questions_Details.xlsx'
df.to_excel(out_path, index=False)
print(f"Excel report generated at {out_path} with {len(df)} records.")
