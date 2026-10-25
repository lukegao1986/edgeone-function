# -*- coding: utf-8 -*-
import json

def score(d, diff, conv, reuse, cost, t):
    raw = d*3 + diff*2.5 + conv*2.5 + reuse*2 - cost*2
    s = raw * t
    if s >= 85: g = "S"
    elif s >= 70: g = "A"
    elif s >= 50: g = "B"
    else: g = "C"
    return round(s, 1), g

topics = [
    dict(
        title="香港vs台北vs东京：内地考生EJU考场怎么选",
        cats=["院校"], intents=["对比"],
        d=8, diff=10, conv=9, reuse=7, cost=6, t=1.3, excl=False,
        note="内地无考点，港/台/日三地的报名方式、费用、证件要求分散在多份官方文件里，目前没有一篇完整对照；12.15出分前是决策窗口。",
    ),
    dict(
        title="EJU报名32853人创新高：香港考场涨42%",
        cats=["院校"], intents=["数据"],
        d=9, diff=9, conv=7, reuse=6, cost=4, t=1.3, excl=False,
        note="JASSO 10/15 公布第2回报名数据（国内24509/东京17347，海外8344，香港2135同比+42%）；纯增量热点，需配 EJU Pro 自己的解读角度，不贩卖焦虑。",
    ),
    dict(
        title="12月15日出分倒计时：30天出愿清单",
        cats=["院校"], intents=["科普"],
        d=9, diff=5, conv=9, reuse=7, cost=6, t=1.3, excl=False,
        note="11/8考试→12/15出分→12月底私立出愿→2月国公立，窗口公开但无人做成可勾选清单；工具型，收藏率高。东大12/1-12/7可作为样本。",
    ),
    dict(
        title="新考纲第一年考题变了，旧教材还能用吗",
        cats=["文数", "理数", "文综"], intents=["数据"],
        d=9, diff=8, conv=8, reuse=8, cost=9, t=1.3, excl=False,
        note="2026起理科/数学/综合科目启用新大纲，为全年最大备考变量；需逐座对照新旧 syllabus 才能下结论，故生产成本高。",
    ),
    dict(
        title="认EJU的507所大学：国公私分布一图看懂",
        cats=["院校"], intents=["数据"],
        d=7, diff=8, conv=8, reuse=8, cost=7, t=1.15, excl=False,
        note="截至2026/9采用EJU的四年制大学507所（国立77/公立60/私立370）；清单型工具内容，长尾搜索稳定，可与出愿线系列复用。",
    ),
]

create_records = []
for i, t in enumerate(topics, start=11):
    s, g = score(t["d"], t["diff"], t["conv"], t["reuse"], t["cost"], t["t"])
    create_records.append({
        "选题标题": t["title"],
        "topicId": "20261024-bm-%02d" % i,
        "分类": t["cats"],
        "intent": t["intents"],
        "需求强度": t["d"],
        "差异化": t["diff"],
        "转化价值": t["conv"],
        "复用性": t["reuse"],
        "生产成本": t["cost"],
        "时效系数": t["t"],
        "独家素材": t["excl"],
        "关卡状态": ["待审"],
        "排期周": "W44",
        "来源": "周一联网热点",
        "备注": "得分 %.1f / %s —— %s" % (s, g, t["note"]),
    })

payload = {"create_records": create_records}
with open("/Users/wanglimin/Desktop/edgeone-ex/content-ops/tmp-create.json", "w") as f:
    json.dump(payload, f, ensure_ascii=False)

for r in create_records:
    print(r["topicId"], "|", r["选题标题"], "|", r["备注"][:24])
