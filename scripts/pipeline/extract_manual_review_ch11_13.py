import json
from numbers_parser import Document

doc_path = "/Users/wanglimin/Desktop/edgeone-ex/docs/Topic_Review_Reports/Chapter11_13_Topics_Review_Detailed.numbers"
try:
    doc = Document(doc_path)
    sheets = doc.sheets
    tables = sheets[0].tables
    data = tables[0].rows()

    headers = [cell.value if cell else "" for cell in data[0]]
    print("Headers:", headers)
    
    idx_bcode = headers.index("businessCode")
    idx_manual = headers.index("人工意见")
    idx_opt = headers.index("options检查结果")
    idx_exp = headers.index("explanation检查结果")
    idx_stem = headers.index("概要")

    updates = []
    for row in data[1:]:
        if len(row) <= max(idx_bcode, idx_manual, idx_opt, idx_exp, idx_stem): continue
        bcode = row[idx_bcode].value if row[idx_bcode] else ""
        manual = row[idx_manual].value if row[idx_manual] else ""
        opt = row[idx_opt].value if row[idx_opt] else ""
        exp = row[idx_exp].value if row[idx_exp] else ""
        stem = row[idx_stem].value if row[idx_stem] else ""
        
        needs_attention = False
        if manual and str(manual).strip(): needs_attention = True
        if opt and str(opt).strip() != "正常": needs_attention = True
        if exp and str(exp).strip() != "正常": needs_attention = True

        if needs_attention:
            updates.append({
                "businessCode": str(bcode).strip(),
                "manual_review": str(manual).strip() if manual else "",
                "options_issue": str(opt).strip() if opt else "",
                "explanation_issue": str(exp).strip() if exp else "",
                "stem": str(stem).strip()
            })

    out_path = "/Users/wanglimin/Desktop/edgeone-ex/docs/manual_review_updates_ch11_13.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(updates, f, ensure_ascii=False, indent=2)

    print(f"Extracted {len(updates)} items that need attention.")
except Exception as e:
    print(f"Error reading numbers file: {e}")