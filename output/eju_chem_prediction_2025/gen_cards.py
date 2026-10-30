# -*- coding: utf-8 -*-
"""EJU 化学 11月预测卷 · 小红书图文笔记生成器（18页，3:4竖版，日系清新白底）"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, textwrap

# ============ 尺寸与字体 ============
W, H = 1080, 1440  # 3:4
OUT = os.path.dirname(os.path.abspath(__file__))

FONT_BOLD = "/System/Library/Fonts/STHeiti Medium.ttc"
FONT_REG  = "/System/Library/Fonts/Hiragino Sans GB.ttc"

def F(sz, bold=False):
    p = FONT_BOLD if bold else FONT_REG
    return ImageFont.truetype(p, sz)

# ============ 配色（日系清新）============
INK    = (34, 40, 49)      # 主文字
SUB    = (110, 122, 138)   # 次要文字
BG     = (255, 255, 255)   # 白底
BLUE   = (62, 123, 190)    # 主蓝
BLUE_D = (37, 78, 125)     # 深蓝
LBLUE  = (232, 242, 251)   # 浅蓝底
RED    = (214, 80, 80)     # 强调红（日语考点常用红）
GOLD   = (214, 158, 64)    # 点缀金
GREEN  = (72, 143, 105)
LGRAY  = (245, 247, 250)
LINE   = (224, 230, 238)

# ============ 通用绘制工具 ============
def new_canvas():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    return img, d

def header(d, title, sub, idx=None):
    """页面顶部：细线 + 标题 + 副标题"""
    # 顶部蓝色细条
    d.rectangle([0, 0, W, 10], fill=BLUE)
    # 右上角页码标签
    if idx:
        tag = f"第 {idx} 页"
        tw = d.textlength(tag, font=F(26, True))
        d.rounded_rectangle([W-24-tw-30, 34, W-24, 34+56], radius=28, fill=LBLUE)
        d.text((W-24-tw-15, 44), tag, font=F(26, True), fill=BLUE_D)
    # 标题
    d.text((64, 60), title, font=F(58, True), fill=INK)
    if sub:
        d.text((64, 136), sub, font=F(30), fill=SUB)
    # 分隔线
    d.line([64, 190, W-64, 190], fill=LINE, width=2)
    return 190

def footer(d, text="EJU 化学 11月预测 · 收藏考前突击"):
    d.text((64, H-70), text, font=F(24), fill=SUB)

def draw_pill(d, x, y, text, fill=LBLUE, tcol=BLUE_D, sz=26, pad=18):
    tw = d.textlength(text, font=F(sz, True))
    d.rounded_rectangle([x, y, x+tw+pad*2, y+46], radius=23, fill=fill)
    d.text((x+pad, y+8), text, font=F(sz, True), fill=tcol)
    return x + tw + pad*2 + 16

def wrap_cn(d, text, font, maxw):
    """中文按字符折行"""
    text = sanitize(text)
    lines = []
    cur = ""
    for ch in text:
        if d.textlength(cur+ch, font=font) > maxw:
            lines.append(cur); cur = ch
        else:
            cur += ch
    if cur: lines.append(cur)
    return lines

SUB_MAP = {"₂":"2","₃":"3","₄":"4","₁₀":"10","₅":"5","₆":"6","₇":"7","₈":"8","₉":"9","₀":"0","₁":"1",
           "⁺":"+","⁻":"-","¹":"1","²":"2","³":"3","⁴":"4","−":"-","≈":"≈"}
def sanitize(t):
    for k, v in SUB_MAP.items():
        t = t.replace(k, v)
    return t

def draw_block(d, x, y, maxw, title, body, title_color=BLUE_D, title_sz=32, body_sz=28, body_color=INK, line_h=46, title_gap=10):
    """绘制一个标题+正文块，返回结束 y"""
    d.text((x, y), title, font=F(title_sz, True), fill=title_color)
    y += title_sz + title_gap
    for ln in wrap_cn(d, body, F(body_sz), maxw):
        d.text((x, y), ln, font=F(body_sz), fill=body_color)
        y += line_h
    return y + 8

# ============ P1 封面 ============
def page_cover():
    img, d = new_canvas()
    # 顶部渐变蓝条 + 装饰圆
    for i in range(H):
        t = i/H
        c = (int(62+(37-62)*t), int(123+(78-123)*t), int(190+(125-190)*t))
        d.line([(0,i),(W,i)], fill=c)
    # 装饰圆点
    for cx, cy, r, col in [(980, 180, 120, (255,255,255,40)),
                            (90, 260, 60, (255,255,255,30)),
                            (950, 900, 90, (255,255,255,25))]:
        ov = Image.new("RGBA", (W,H), (0,0,0,0))
        ImageDraw.Draw(ov).ellipse([cx-r,cy-r,cx+r,cy+r], fill=col)
        img = Image.alpha_composite(img.convert("RGBA"), ov).convert("RGB")
        d = ImageDraw.Draw(img)

    # 主标题
    d.text((64, 300), "EJU 化学", font=F(100, True), fill=(255,255,255))
    d.text((64, 430), "11月 预测卷", font=F(100, True), fill=(255,255,255))
    d.line([64, 570, W-64, 570], fill=(255,255,255), width=3)
    d.text((64, 600), "20 题 · 16 大核心考点", font=F(44, True), fill=(255,255,255))
    d.text((64, 670), "基于 2021–2025 年真题考频", font=F(34), fill=(230,238,247))

    # 底部标签
    tags = ["考点预测", "真题溯源", "解题套路"]
    x = 64
    for t in tags:
        tw = d.textlength(t, font=F(30, True))
        d.rounded_rectangle([x, 780, x+tw+40, 830], radius=25, fill=(255,255,255))
        d.text((x+20, 788), t, font=F(30, True), fill=BLUE_D)
        x += tw + 40 + 20

    d.text((64, 900), "小红书图文笔记 · 18 页", font=F(30), fill=(210,225,240))
    d.text((64, 950), "考前突击 · 建议收藏", font=F(30), fill=(210,225,240))
    # 底部署名
    d.text((64, H-120), "EJU Pro · 布克", font=F(34, True), fill=(255,255,255))
    return img

# ============ P2 考频地图 ============
def page_overview():
    img, d = new_canvas()
    y = header(d, "考频地图 & 命题趋势", "5 年真题统计 · 命题规律一目了然")

    # 四大模块占比条
    mods = [
        ("I 物质的构成", "问1–5", 5, BLUE),
        ("II 物质状态与变化", "问6–10", 5, (72,143,105)),
        ("III 无机化学", "问11–15", 5, (214,158,64)),
        ("IV 有机化学", "问16–20", 5, RED),
    ]
    y += 10
    for name, rng, n, col in mods:
        d.rounded_rectangle([64, y, W-64, y+86], radius=14, fill=LGRAY)
        d.rounded_rectangle([64, y, 64+ (W-128)*n//5, y+86], radius=14, fill=col)
        d.text((84, y+18), name, font=F(34, True), fill=(255,255,255))
        d.text((W-220, y+20), f"{n} 题 · {rng}", font=F(28, True), fill=INK)
        y += 106

    y += 10
    d.text((64, y), "⚠️ 2026 新考纲关键变化", font=F(34, True), fill=RED)
    y += 54
    changes = [
        "热化学全面改用「焓变 ΔH」符号体系",
        "配位键、溶度积 Ksp 权重上升",
        "题目越来越「情境化 + 定量计算」",
    ]
    for c in changes:
        d.text((64, y), "· "+c, font=F(28), fill=INK)
        y += 48

    y += 16
    d.text((64, y), "高频 TOP 考点（必会）", font=F(34, True), fill=BLUE_D)
    y += 54
    tops = [
        "① 电子排布 / 原子结构  ② 共价键 & 分子极性",
        "③ 物质的量计算  ④ 化学平衡 & 平衡常数",
        "⑤ 电离平衡 / pH  ⑥ 电解 & 法拉第定律",
        "⑦ 金属离子分离  ⑧ 异构体 / 手性碳",
        "⑨ 芳香族反应网络  ⑩ 官能团鉴别",
    ]
    for t in tops:
        d.text((64, y), t, font=F(30, True), fill=INK)
        y += 56

    footer(d)
    return img

# ============ 考点页通用框架 ============
def page_kw(idx, tag, tagcol, title, subtitle, points, qform, trace, tip=None):
    """points: [(小标题, 正文)]；qform: 提问形式文字；trace: 真题溯源文字；tip: 解题要点(可选)"""
    title, subtitle, qform, trace = sanitize(title), sanitize(subtitle), sanitize(qform), sanitize(trace)
    tag = sanitize(tag)
    points = [(sanitize(a), sanitize(b)) for a, b in points]
    if tip: tip = sanitize(tip)
    img, d = new_canvas()
    y = header(d, title, subtitle, idx)
    # 顶部考点标签
    x = draw_pill(d, 64, y+6, tag, fill=LBLUE, tcol=tagcol)
    y += 70

    # 核心考点区（先动态测量高度，防止溢出）
    d.text((64, y), "核心考点", font=F(32, True), fill=BLUE_D)
    y += 48
    # 预计算：每条 = 标题行46 + 正文行数*40 + 间距14
    box_h = 18
    tmp_x = 84
    tmp_maxw = W - 64 - tmp_x - 40
    for pt_title, pt_body in points:
        box_h += 46 + len(wrap_cn(d, pt_body, F(26), tmp_maxw)) * 40 + 14
    d.rounded_rectangle([64, y, W-64, y+box_h], radius=16, fill=LBLUE)
    py = y + 18
    for pt_title, pt_body in points:
        d.text((84, py), "◆ "+pt_title, font=F(30, True), fill=BLUE_D)
        py += 46
        for ln in wrap_cn(d, pt_body, F(26), tmp_maxw):
            d.text((84, py), ln, font=F(26), fill=INK)
            py += 40
        py += 14
    y = y + box_h + 24

    # 提问形式区
    d.text((64, y), "会这样问", font=F(32, True), fill=RED)
    y += 48
    qh = 0
    qlines = wrap_cn(d, qform, F(28), W-64-80)
    qh = len(qlines)*48 + 40
    d.rounded_rectangle([64, y, W-64, y+qh], radius=16, fill=(253,243,243))
    qy = y + 20
    d.text((84, qy), "「", font=F(40, True), fill=RED)
    for ln in qlines:
        d.text((120, qy), ln, font=F(28), fill=INK)
        qy += 48
    y = y + qh + 24

    # 真题溯源区
    d.text((64, y), "真题溯源", font=F(32, True), fill=GOLD)
    y += 48
    th = 0
    tlines = wrap_cn(d, trace, F(27), W-64-80)
    th = len(tlines)*44 + 30
    d.rounded_rectangle([64, y, W-64, y+th], radius=16, fill=(252,247,238))
    ty = y + 18
    for ln in tlines:
        d.text((84, ty), ln, font=F(27), fill=INK)
        ty += 44
    y = y + th + 24

    # 解题要点（可选）
    if tip:
        d.text((64, y), "解题要点", font=F(32, True), fill=GREEN)
        y += 48
        tplines = wrap_cn(d, tip, F(27), W-64-80)
        d.rounded_rectangle([64, y, W-64, y+len(tplines)*44+30], radius=16, fill=(238,246,241))
        ty = y + 18
        for ln in tplines:
            d.text((84, ty), ln, font=F(27), fill=(40,90,65))
            ty += 44
    footer(d)
    return img

# ============ 16 页考点内容 ============
def build():
    pages = []

    # P1 封面
    pages.append(page_cover())
    # P2 总览
    pages.append(page_overview())

    # P3 问1：原子结构 / 电子排布
    pages.append(page_kw(3, "问1 · 原子结构", BLUE_D,
        "原子结构与电子排布",
        "周期表、同位素、电子壳层是每年「开卷必考」",
        [("同位素与原子量", "质子数相同、中子数不同为同位素；原子量可能随原子序数倒置（Ar vs K）"),
         ("电子排布", "最外层电子决定化学性质；稀有气体构型是稳定基准"),
         ("离子电子数", "得电子成阴离子、失电子成阳离子，先算总电子数再排布")],
        "「关于原子/同位素/周期表的描述，选出正确的组合」",
        "2025 问1 · 2021第1回 问1 · 2022第1回 问2",
        "原子序数=质子数=核电荷数；电子数=质子数-电荷数"))

    # P4 问2：化学键（共价/配位/极性）
    pages.append(page_kw(4, "问2 · 化学键", BLUE_D,
        "化学键与分子极性",
        "共价键、配位键、分子构型决定极性",
        [("共价键 vs 配位键", "共价键双方各出电子；配位键一方出孤对电子（NH₄⁺、H₃O⁺）"),
         ("分子极性判断", "键有极性≠分子有极性，看空间构型是否对称（CO₂非极性、H₂O极性）"),
         ("电子式与结构式", "数清共有电子对、孤电子对是送分项")],
        "「选出电子排布不同的一组」或「选出含配位键的分子」",
        "2025 问2/3/4 · 2024 问3 · 2022第1回 问1 · 2021第1回 问2/3",
        "记住典型：直线型(CO₂)、V型(H₂O)、三角锥(NH₃)"))

    # P5 问3：物质的量计算
    pages.append(page_kw(5, "问3 · 物质的量", BLUE_D,
        "物质的量 & 定量计算",
        "摩尔、方程式配比、限量反应物是计算地基",
        [("n = m/M 与气体", "标准状态 22.4 L/mol；密度×22.4 = 平均摩尔质量"),
         ("限量反应物", "先判断谁先用完，再按比例算产物"),
         ("配平技巧", "氧化还原配平先看电子转移数")],
        "「求某反应生成气体的体积/某物质的质量」",
        "2025 问5/6 · 2022第1回 问4 · 2021第1回 问5 · 2021第2回 问5/7",
        "单位统一到 mol；22.4 只在标准状态用"))

    # P6 问4：气体定律 / 分压
    pages.append(page_kw(6, "问4 · 气体定律", GREEN,
        "气体定律与分压",
        "理想气体、分压、混合气是高频计算",
        [("理想气体方程", "PV=nRT，注意单位换算（Pa、L、K）"),
         ("分压定律", "分压=总压×摩尔分数；混合后体积变化按玻意耳定律"),
         ("平均分子量", "密度×22.4 求平均分子量，反推组成")],
        "「混合气体在某条件下，求分压/总压/摩尔分数」",
        "2025 问6 · 2021第2回 问6 · 2021第1回 问6 · 2022第1回 问6",
        "同温下分压比=体积比=物质的量比"))

    # P7 问5：反应热 / 焓变
    pages.append(page_kw(7, "问5 · 反应热", GREEN,
        "反应热与焓变 ΔH",
        "新考纲改用焓变符号，盖斯定律是核心",
        [("盖斯定律", "ΔH = 生成物焓和 − 反应物焓和"),
         ("符号约定", "放热 ΔH<0，吸热 ΔH>0（旧式热化学已淘汰）"),
         ("键能/蒸发热", "蒸发热=生成热(气)−生成热(液)")],
        "「已知生成焓，求反应 ΔH / 蒸发热」",
        "2025 问7 · 2022第2回 问5 · 2021 相关问",
        "画「生成焓→产物」路径图，用盖斯定律闭合"))

    # P8 问6：溶解平衡 / Ksp
    pages.append(page_kw(8, "问6 · 溶解平衡", GREEN,
        "溶解平衡与溶度积",
        "亨利定律、Ksp 判断沉淀是新考纲重难点",
        [("亨利定律", "难溶气体溶解度∝分压；折算回自身分压时体积恒定"),
         ("溶度积 Ksp", "Qc>Ksp 析出沉淀；Qc<Ksp 不沉淀"),
         ("依数性", "沸点升高/凝固点降低，看电离粒子数")],
        "「判断是否产生沉淀」或「气体溶解度图像选择」",
        "2025 问8 · 2024 问9 · 2024 问6",
        "沉淀判断三要素：离子积、Ksp、临界浓度"))

    # P9 问7：电离平衡 / pH
    pages.append(page_kw(9, "问7 · 电离平衡", GREEN,
        "酸碱与电离平衡",
        "强弱酸、pH、盐类水解、缓冲是必考",
        [("强弱酸判断", "强酸完全电离；弱酸用 Ka 近似 [H⁺]=√(c·Ka)"),
         ("pH 计算", "pH=−lg[H⁺]；水电离 [H⁺][OH⁻]=10⁻¹⁴"),
         ("盐类水解", "强碱弱酸盐显碱性（Na₂CO₃）、强酸弱碱盐显酸性")],
        "「按 [OH⁻]/pH 大小排序」或「求弱酸 pH」",
        "2025 问9 · 2022第2回 问8 · 2022第1回 问5 · 2021第1回 问7",
        "记住：浓度相同，二元强酸酸性 > 一元强酸 > 弱酸"))

    # P10 问8：化学平衡
    pages.append(page_kw(10, "问8 · 化学平衡", GREEN,
        "化学平衡与勒夏特列",
        "平衡常数、平衡移动方向是高频",
        [("平衡常数 K", "只与温度有关；催化剂/压强不改变 K"),
         ("勒夏特列原理", "降温向放热方向移动；加压向气体系数小方向"),
         ("平衡计算", "用三段式列「初-变-平」求 K")],
        "「改变条件后平衡如何移动 / 求平衡常数」",
        "2025 问(相关) · 2022第1回 问7 · 2021第1回 问10 · 2021第2回 问8",
        "三段式是万能钥匙：初始量、变化量、平衡量"))

    # P11 问9：氧化还原 / 氧化数
    pages.append(page_kw(11, "问9 · 氧化还原", GREEN,
        "氧化还原与氧化数",
        "氧化数、氧化剂还原剂、滴定是固定题型",
        [("氧化数规则", "单质0、O通常−2、H通常+1、化合物代数和0"),
         ("氧化剂/还原剂", "氧化数降低=氧化剂（被还原）；升高=还原剂"),
         ("氧化还原滴定", "按电子转移守恒配平比例")],
        "「划线元素氧化数变化 / 判断氧化剂还原剂」",
        "2025 问15 · 2021第1回 问8 · 2021第2回 问9/14",
        "KMnO₄、K₂Cr₂O₇ 是常考氧化剂，Mn+7、Cr+6"))

    # P12 问10：电解 / 法拉第
    pages.append(page_kw(12, "问10 · 电解", GREEN,
        "电解与法拉第定律",
        "电极反应、电解水量是定量计算常客",
        [("电极反应", "阴极得电子（还原）、阳极失电子（氧化）"),
         ("法拉第定律", "电量 Q = 电流 × 时间；1 mol 电子 = 96500 C"),
         ("电解水", "阴极 H₂ : 阳极 O₂ = 2:1（体积比）")],
        "「通电后两极产生气体的体积/析出金属的质量」",
        "2025 问10 · 2021第1回 问9 · 2021第2回 问10",
        "先算转移电子 mol 数 = Q/96500，再按系数分配"))

    # P13 问11：典型元素（卤素/硫/氮）
    pages.append(page_kw(13, "问11 · 典型元素", GOLD,
        "典型元素（卤素·硫·氮）",
        "无机送分题，性质规律要记牢",
        [("卤素", "氧化性 F₂>Cl₂>Br₂>I₂；HF 弱酸、其余强酸；HF 腐蚀玻璃"),
         ("硫与 SO₂", "SO₂ 漂白靠还原性（非氧化性）；浓硫酸有脱水性"),
         ("氮与 NH₃", "NH₃ 易溶于水、碱性；喷泉实验；向下排空气收集")],
        "「关于卤素/含氧酸/SO₂ 的描述，选错误的」",
        "2025 问12 · 2024 问14 · 2021第1回 问14 · 2021第2回 问12/15",
        "气体收集：NH₃ 向下排空气；CO₂/Cl₂/SO₂ 向上排空气"))

    # P14 问12：氧化物分类 / 工业制法
    pages.append(page_kw(14, "问12 · 氧化物·工业", GOLD,
        "氧化物分类与工业制法",
        "酸性/碱性/两性氧化物、氨碱法必考",
        [("氧化物分类", "酸性=非金属氧化物(CO₂,SiO₂)；两性=Al₂O₃,ZnO；碱性=CuO,MgO"),
         ("氨碱法(索尔维)", "最终产物 Na₂CO₃；原料 NaCl、CaCO₃"),
         ("铁工业", "高炉 Fe₂O₃ 被 CO 还原")],
        "「选出酸性/两性/碱性氧化物的正确组合」",
        "2025 问11/13 · 2022第2回 问13 · 2021第1回 问4",
        "两性氧化物口诀：铝锌铅锡（Al、Zn、Pb、Sn）"))

    # P15 问13：金属离子分离
    pages.append(page_kw(15, "问13 · 金属离子", GOLD,
        "金属离子分离与鉴定",
        "沉淀反应、络离子形成是经典题",
        [("沉淀规律", "AgCl 白色、CuS 黑色；酸性下 H₂S 只沉淀 CuS 等"),
         ("络离子", "Zn²⁺、Cu²⁺、Ag⁺ 溶于过量氨水"),
         ("焰色反应", "Na 黄、K 紫（透过钴玻璃）")],
        "「选出无法区别两离子的方法」或「根据现象推断离子」",
        "2025 问14 · 2021第1回 问15 · 2022第1回 问12",
        "两性：溶于过量 NaOH 有 Al³⁺/Zn²⁺/Pb²⁺"))

    # P16 问14：官能团鉴别
    pages.append(page_kw(16, "问14 · 官能团", RED,
        "官能团鉴别与反应",
        "醇、醛、酮、羧酸的鉴别是高频",
        [("醇 vs 醚", "加金属 Na，醇放 H₂、醚不放"),
         ("醛 vs 酮", "银镜反应：醛阳性、酮阴性"),
         ("碘仿反应", "含 CH₃-CO- 或 CH₃-CH(OH)- 结构才发生")],
        "「选出正确鉴别某两种物质的方法」",
        "2025 问16/19 · 2022第1回 问16 · 2021第2回 问16",
        "NaHCO₃ 检验羧基；FeCl₃ 检验酚羟基"))

    # P17 问15：异构体 / 手性碳
    pages.append(page_kw(17, "问15 · 异构体", RED,
        "同分异构体与手性碳",
        "结构异构、立体异构是固定压轴考点",
        [("结构异构", "按碳骨架、官能团位置、官能团类型逐一列举"),
         ("手性碳", "连 4 个不同基团的碳原子"),
         ("加成后手性", "加 Br₂ 后判断产物是否含手性碳")],
        "「某分子式的异构体数 / 加溴后含手性碳的异构体数」",
        "2025 问17 · 2021第1回 问16/19 · 2021第2回 问18",
        "数异构体：先碳链、再位置、后官能团，不重不漏"))

    # P18 问16：芳香族反应网络
    pages.append(page_kw(18, "问16 · 芳香族", RED,
        "芳香族反应网络",
        "苯→苯酚→水杨酸→阿司匹林是经典路线",
        [("苯的取代", "硝化→硝基苯、卤代、磺化"),
         ("苯酚制法", "异丙苯法：苯→异丙苯→苯酚+丙酮"),
         ("水杨酸→阿司匹林", "水杨酸+乙酸酐→乙酰水杨酸；+甲醇→水杨酸甲酯")],
        "「根据反应路线图推断中间体 A/B/C 结构」",
        "2025 问18 · 2022第1回 问18 · 2021两回 问18",
        "记住水杨酸=邻羟基苯甲酸，两官能团位置是邻位"))

    return pages

def main():
    pages = build()
    for i, img in enumerate(pages, 1):
        path = os.path.join(OUT, f"page_{i:02d}.png")
        img.save(path, "PNG")
        print(f"已生成 {path}")
    print(f"\n共 {len(pages)} 页，全部完成！")

if __name__ == "__main__":
    main()
