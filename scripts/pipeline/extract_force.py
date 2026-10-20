import pandas as pd
import json

def extract_manual_topics(excel_path):
    df = pd.read_excel(excel_path)
    # Filter rows where "人工意见" is not null
    df_filtered = df[df['人工意见'].notna()]
    
    overrides = []
    for _, row in df_filtered.iterrows():
        bcode = str(row['businessCode']).strip()
        manual = str(row['人工意见']).strip()
        current_topic = str(row['topicCode']).strip()
        
        # 排除 nan 
        if bcode and manual and manual.lower() != 'nan':
            overrides.append({"businessCode": bcode, "topicCode": manual})
            
    with open("manual_topics_force.json", "w", encoding="utf-8") as f:
        json.dump(overrides, f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(overrides)} manual overrides from Excel.")
    # debug some of them
    for o in overrides:
        if 'phy-28' in o['businessCode']:
            print(f"  {o['businessCode']} -> {o['topicCode']}")

if __name__ == "__main__":
    extract_manual_topics("docs/Topic_Review_Reports/Chapter21_29_Topics_Review_Detailed.xlsx")