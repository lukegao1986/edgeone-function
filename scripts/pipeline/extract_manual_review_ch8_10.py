import json
from numbers_parser import Document

doc_path = "/Users/wanglimin/Desktop/edgeone-ex/docs/Chapter8_10_Topics_Review.numbers"
try:
    doc = Document(doc_path)
    sheets = doc.sheets
    tables = sheets[0].tables
    data = tables[0].rows()

    headers = [cell.value if cell else "" for cell in data[0]]
    try:
        idx_bcode = headers.index("businessCode")
        idx_manual = headers.index("人工意见")
        idx_topic = headers.index("topicCode")
        idx_stem = headers.index("概要(100字内)")
    except ValueError as e:
        print(f"Header missing: {e}")
        exit(1)

    updates = []
    for row in data[1:]:
        bcode = row[idx_bcode].value if row[idx_bcode] else ""
        manual = row[idx_manual].value if row[idx_manual] else ""
        topic = row[idx_topic].value if row[idx_topic] else ""
        stem = row[idx_stem].value if row[idx_stem] else ""
        
        if manual and str(manual).strip():
            updates.append({
                "businessCode": str(bcode).strip(),
                "topicCode": str(manual).strip(),
                "stem": str(stem).strip()
            })

    out_path = "/Users/wanglimin/Desktop/edgeone-ex/docs/manual_review_updates_ch8_10.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(updates, f, ensure_ascii=False, indent=2)

    print(f"Extracted {len(updates)} manual review updates.")
except Exception as e:
    print(f"Error reading numbers file: {e}")
