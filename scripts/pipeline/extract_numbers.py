import sys
from numbers_parser import Document
import json

def extract_manual_topics(numbers_path):
    doc = Document(numbers_path)
    sheets = doc.sheets
    tables = sheets[0].tables
    table = tables[0]

    rows = table.rows()
    if not rows: return
    
    header = rows[0]
    col_idx = {cell.value: idx for idx, cell in enumerate(header) if cell and cell.value}
    
    bcode_idx = col_idx.get("businessCode")
    topic_idx = col_idx.get("topicCode")
    manual_idx = col_idx.get("人工意见")
    
    manual_overrides = []
    
    for row in rows[1:]:
        if len(row) > max(bcode_idx, manual_idx):
            bcode = row[bcode_idx].value if row[bcode_idx] else None
            manual = row[manual_idx].value if row[manual_idx] else None
            
            if bcode and manual:
                manual_overrides.append({"businessCode": bcode, "topicCode": manual})
            
    with open("manual_topics.json", "w", encoding="utf-8") as f:
        json.dump(manual_overrides, f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(manual_overrides)} manual overrides.")

if __name__ == "__main__":
    extract_manual_topics("docs/Topic_Review_Reports/char21-29 check.numbers")
