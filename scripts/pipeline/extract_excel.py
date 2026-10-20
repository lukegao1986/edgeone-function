import pandas as pd
import json

def extract_manual_topics(excel_path):
    df = pd.read_excel(excel_path, header=1)
    # 筛选人工意见不为空的行
    df_filtered = df[df['人工意见'].notna()]
    
    overrides = []
    for _, row in df_filtered.iterrows():
        bcode = str(row['businessCode']).strip()
        manual = str(row['人工意见']).strip()
        
        # 排除可能被 pandas 解析为空字符串或 'nan' 的情况
        if bcode and manual and manual != 'nan':
            overrides.append({"businessCode": bcode, "topicCode": manual})
            
    with open("manual_topics_xlsx.json", "w", encoding="utf-8") as f:
        json.dump(overrides, f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(overrides)} manual overrides from Excel.")

if __name__ == "__main__":
    extract_manual_topics("docs/Topic_Review_Reports/char21-29 check.xlsx")