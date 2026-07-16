import json
import random

with open('phy_1_chapter05_questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

replacements = {
    "phy-05-qC1": [
        "M_1 = 6.0 \\mathrm{N}\\cdot\\mathrm{m}, M_2 = -17 \\mathrm{N}\\cdot\\mathrm{m}, M_3 = 12 \\mathrm{N}\\cdot\\mathrm{m}, M_4 = 0 \\mathrm{N}\\cdot\\mathrm{m}",
        "M_1 = -6.0 \\mathrm{N}\\cdot\\mathrm{m}, M_2 = 17 \\mathrm{N}\\cdot\\mathrm{m}, M_3 = -12 \\mathrm{N}\\cdot\\mathrm{m}, M_4 = 0 \\mathrm{N}\\cdot\\mathrm{m}",
        "M_1 = 6.0 \\mathrm{N}\\cdot\\mathrm{m}, M_2 = 17 \\mathrm{N}\\cdot\\mathrm{m}, M_3 = 12 \\mathrm{N}\\cdot\\mathrm{m}, M_4 = 0 \\mathrm{N}\\cdot\\mathrm{m}",
        "M_1 = 6.0 \\mathrm{N}\\cdot\\mathrm{m}, M_2 = -17 \\mathrm{N}\\cdot\\mathrm{m}, M_3 = -12 \\mathrm{N}\\cdot\\mathrm{m}, M_4 = 0 \\mathrm{N}\\cdot\\mathrm{m}",
        "M_1 = 3.0 \\mathrm{N}\\cdot\\mathrm{m}, M_2 = -8.5 \\mathrm{N}\\cdot\\mathrm{m}, M_3 = 6.0 \\mathrm{N}\\cdot\\mathrm{m}, M_4 = 0 \\mathrm{N}\\cdot\\mathrm{m}",
        "M_1 = 6.0 \\mathrm{N}\\cdot\\mathrm{m}, M_2 = -12 \\mathrm{N}\\cdot\\mathrm{m}, M_3 = 17 \\mathrm{N}\\cdot\\mathrm{m}, M_4 = 0 \\mathrm{N}\\cdot\\mathrm{m}",
        "M_1 = 6.0 \\mathrm{N}\\cdot\\mathrm{m}, M_2 = -17 \\mathrm{N}\\cdot\\mathrm{m}, M_3 = 12 \\mathrm{N}\\cdot\\mathrm{m}, M_4 = 20 \\mathrm{N}\\cdot\\mathrm{m}",
        "M_1 = -6.0 \\mathrm{N}\\cdot\\mathrm{m}, M_2 = -17 \\mathrm{N}\\cdot\\mathrm{m}, M_3 = -12 \\mathrm{N}\\cdot\\mathrm{m}, M_4 = 20 \\mathrm{N}\\cdot\\mathrm{m}",
        "M_1 = 12 \\mathrm{N}\\cdot\\mathrm{m}, M_2 = -17 \\mathrm{N}\\cdot\\mathrm{m}, M_3 = 6.0 \\mathrm{N}\\cdot\\mathrm{m}, M_4 = 0 \\mathrm{N}\\cdot\\mathrm{m}",
        "M_1 = 6.0 \\mathrm{N}\\cdot\\mathrm{m}, M_2 = -8.5 \\mathrm{N}\\cdot\\mathrm{m}, M_3 = 12 \\mathrm{N}\\cdot\\mathrm{m}, M_4 = 0 \\mathrm{N}\\cdot\\mathrm{m}"
    ],
    "phy-05-qC2": [
        "(1) 図省略 (2) 図省略 (3) F = 5\\mathrm{N}, x = 0.6\\mathrm{m}",
        "(1) 図省略 (2) 図省略 (3) F = 5\\mathrm{N}, x = 0.4\\mathrm{m}",
        "(1) 図省略 (2) 図省略 (3) F = 1\\mathrm{N}, x = 0.6\\mathrm{m}",
        "(1) 図省略 (2) 図省略 (3) F = 1\\mathrm{N}, x = 0.4\\mathrm{m}",
        "(1) 図省略 (2) 図省略 (3) F = 5\\mathrm{N}, x = 0.8\\mathrm{m}",
        "(1) 図省略 (2) 図省略 (3) F = 1\\mathrm{N}, x = 0.8\\mathrm{m}"
    ],
    "phy-05-qC3": [
        "M = 4.0 \\mathrm{N}\\cdot\\mathrm{m}",
        "M = 2.0 \\mathrm{N}\\cdot\\mathrm{m}",
        "M = 8.0 \\mathrm{N}\\cdot\\mathrm{m}",
        "M = 0 \\mathrm{N}\\cdot\\mathrm{m}"
    ],
    "phy-05-qC4": [
        "24 \\mathrm{cm}",
        "16 \\mathrm{cm}",
        "20 \\mathrm{cm}",
        "36 \\mathrm{cm}"
    ],
    "phy-05-qE1": [
        "T = \\frac{2mgd}{l}, F = mg\\left(1-\\frac{d}{l}\\right), N = \\frac{\\sqrt{3}mgd}{l}",
        "T = \\frac{mgd}{l}, F = mg\\left(1-\\frac{d}{l}\\right), N = \\frac{\\sqrt{3}mgd}{2l}",
        "T = \\frac{2mgd}{l}, F = mg\\left(1+\\frac{d}{l}\\right), N = \\frac{\\sqrt{3}mgd}{l}",
        "T = \\frac{mgd}{2l}, F = mg\\left(1-\\frac{d}{l}\\right), N = \\frac{\\sqrt{3}mgd}{l}",
        "T = \\frac{2mgd}{l}, F = mg\\left(1-\\frac{d}{l}\\right), N = \\frac{mgd}{\\sqrt{3}l}",
        "T = \\frac{mgd}{l}, F = mg\\left(1+\\frac{d}{l}\\right), N = \\frac{\\sqrt{3}mgd}{2l}",
        "T = \\frac{2mgd}{l}, F = mg, N = \\frac{\\sqrt{3}mgd}{l}",
        "T = \\frac{\\sqrt{3}mgd}{l}, F = mg\\left(1-\\frac{d}{l}\\right), N = \\frac{2mgd}{l}"
    ],
    "phy-05-qE2": [
        "(1) N_A = \\frac{mg}{2\\tan\\theta}, N_B = mg, F = \\frac{mg}{2\\tan\\theta} (2) \\tan\\theta \\geq \\frac{1}{2\\mu}",
        "(1) N_A = \\frac{mg}{\\tan\\theta}, N_B = mg, F = \\frac{mg}{\\tan\\theta} (2) \\tan\\theta \\geq \\frac{1}{\\mu}",
        "(1) N_A = \\frac{mg}{2\\tan\\theta}, N_B = mg, F = \\frac{mg}{2\\tan\\theta} (2) \\tan\\theta \\geq \\frac{1}{\\mu}",
        "(1) N_A = \\frac{mg}{\\tan\\theta}, N_B = mg, F = \\frac{mg}{\\tan\\theta} (2) \\tan\\theta \\geq \\frac{1}{2\\mu}",
        "(1) N_A = \\frac{mg}{2\\sin\\theta}, N_B = mg, F = \\frac{mg}{2\\sin\\theta} (2) \\tan\\theta \\geq \\frac{1}{2\\mu}",
        "(1) N_A = \\frac{mg}{2\\cos\\theta}, N_B = mg, F = \\frac{mg}{2\\cos\\theta} (2) \\tan\\theta \\geq \\frac{1}{2\\mu}",
        "(1) N_A = \\frac{mg}{2\\tan\\theta}, N_B = \\frac{mg}{2}, F = \\frac{mg}{2\\tan\\theta} (2) \\tan\\theta \\geq \\frac{1}{2\\mu}",
        "(1) N_A = \\frac{mg}{2\\tan\\theta}, N_B = mg, F = \\frac{mg}{\\tan\\theta} (2) \\tan\\theta \\geq \\frac{1}{\\mu}",
        "(1) N_A = \\frac{mg}{\\tan\\theta}, N_B = \\frac{mg}{2}, F = \\frac{mg}{2\\tan\\theta} (2) \\tan\\theta \\geq \\frac{1}{\\mu}",
        "(1) N_A = \\frac{mg}{2\\tan\\theta}, N_B = mg, F = \\frac{mg}{2\\tan\\theta} (2) \\tan\\theta \\leq \\frac{1}{2\\mu}"
    ],
    "phy-05-qE3": [
        "(1) x = 17 \\mathrm{cm} (2) x = \\frac{r}{6}",
        "(1) x = 15 \\mathrm{cm} (2) x = \\frac{r}{6}",
        "(1) x = 17 \\mathrm{cm} (2) x = \\frac{r}{4}",
        "(1) x = 15 \\mathrm{cm} (2) x = \\frac{r}{4}",
        "(1) x = 12.5 \\mathrm{cm} (2) x = \\frac{r}{3}",
        "(1) x = 17 \\mathrm{cm} (2) x = \\frac{r}{3}"
    ],
    "phy-05-qE4": [
        "(1) T = \\frac{mgl}{2h} (2) \\mu > \\frac{l}{2h}",
        "(1) T = \\frac{mgl}{h} (2) \\mu > \\frac{l}{2h}",
        "(1) T = \\frac{mgl}{2h} (2) \\mu > \\frac{l}{h}",
        "(1) T = \\frac{mgl}{h} (2) \\mu > \\frac{l}{h}",
        "(1) T = \\frac{mgh}{2l} (2) \\mu > \\frac{h}{2l}",
        "(1) T = \\frac{mgl}{2h} (2) \\mu < \\frac{l}{2h}"
    ],
    "phy-05-qB1": [
        "m_A = 6.0 \\mathrm{kg}, m_B = 3.0 \\mathrm{kg}",
        "m_A = 3.0 \\mathrm{kg}, m_B = 6.0 \\mathrm{kg}",
        "m_A = 4.0 \\mathrm{kg}, m_B = 5.0 \\mathrm{kg}",
        "m_A = 5.0 \\mathrm{kg}, m_B = 4.0 \\mathrm{kg}",
        "m_A = 6.0 \\mathrm{kg}, m_B = 4.0 \\mathrm{kg}",
        "m_A = 4.0 \\mathrm{kg}, m_B = 3.0 \\mathrm{kg}"
    ],
    "phy-05-qB2": [
        "(a) T = 40\\sqrt{3} \\mathrm{N}, F = 20\\sqrt{3} \\mathrm{N} (b) T = 24 \\mathrm{N}, F = 36 \\mathrm{N} (c) T = 30\\sqrt{2} \\mathrm{N}, F = 30\\sqrt{2} \\mathrm{N}",
        "(a) T = 20\\sqrt{3} \\mathrm{N}, F = 40\\sqrt{3} \\mathrm{N} (b) T = 24 \\mathrm{N}, F = 36 \\mathrm{N} (c) T = 30\\sqrt{2} \\mathrm{N}, F = 30\\sqrt{2} \\mathrm{N}",
        "(a) T = 40\\sqrt{3} \\mathrm{N}, F = 20\\sqrt{3} \\mathrm{N} (b) T = 36 \\mathrm{N}, F = 24 \\mathrm{N} (c) T = 30\\sqrt{2} \\mathrm{N}, F = 30\\sqrt{2} \\mathrm{N}",
        "(a) T = 40\\sqrt{3} \\mathrm{N}, F = 20\\sqrt{3} \\mathrm{N} (b) T = 24 \\mathrm{N}, F = 36 \\mathrm{N} (c) T = 60 \\mathrm{N}, F = 60 \\mathrm{N}",
        "(a) T = 20\\sqrt{3} \\mathrm{N}, F = 20\\sqrt{3} \\mathrm{N} (b) T = 36 \\mathrm{N}, F = 36 \\mathrm{N} (c) T = 30\\sqrt{2} \\mathrm{N}, F = 30\\sqrt{2} \\mathrm{N}",
        "(a) T = 80 \\mathrm{N}, F = 40 \\mathrm{N} (b) T = 24 \\mathrm{N}, F = 36 \\mathrm{N} (c) T = 30\\sqrt{2} \\mathrm{N}, F = 30\\sqrt{2} \\mathrm{N}",
        "(a) T = 40\\sqrt{3} \\mathrm{N}, F = 20\\sqrt{3} \\mathrm{N} (b) T = 30 \\mathrm{N}, F = 30 \\mathrm{N} (c) T = 30\\sqrt{2} \\mathrm{N}, F = 30\\sqrt{2} \\mathrm{N}",
        "(a) T = 20\\sqrt{3} \\mathrm{N}, F = 40\\sqrt{3} \\mathrm{N} (b) T = 36 \\mathrm{N}, F = 24 \\mathrm{N} (c) T = 60 \\mathrm{N}, F = 60 \\mathrm{N}"
    ],
    "phy-05-qB3": [
        "(1) T = \\frac{\\sqrt{3}}{2}W (2) R_x = \\frac{\\sqrt{3}}{4}W (右向き), R_y = \\frac{1}{4}W (上向き)",
        "(1) T = \\frac{1}{2}W (2) R_x = \\frac{\\sqrt{3}}{4}W (右向き), R_y = \\frac{1}{4}W (上向き)",
        "(1) T = \\frac{\\sqrt{3}}{2}W (2) R_x = \\frac{1}{4}W (右向き), R_y = \\frac{\\sqrt{3}}{4}W (上向き)",
        "(1) T = \\frac{\\sqrt{3}}{2}W (2) R_x = \\frac{\\sqrt{3}}{4}W (左向き), R_y = \\frac{1}{4}W (上向き)",
        "(1) T = \\frac{\\sqrt{3}}{2}W (2) R_x = \\frac{\\sqrt{3}}{4}W (右向き), R_y = \\frac{3}{4}W (上向き)",
        "(1) T = \\frac{1}{2}W (2) R_x = \\frac{1}{4}W (右向き), R_y = \\frac{\\sqrt{3}}{4}W (上向き)",
        "(1) T = W (2) R_x = \\frac{\\sqrt{3}}{4}W (右向き), R_y = \\frac{1}{4}W (上向き)",
        "(1) T = \\frac{\\sqrt{3}}{2}W (2) R_x = \\frac{1}{2}W (右向き), R_y = \\frac{1}{2}W (上向き)"
    ],
    "phy-05-qB4": [
        "(1) 鉛直: N_B - W = 0, 水平: N_A - F = 0, モーメント: W \\times \\frac{1}{3}l - N_A \\times \\frac{\\sqrt{3}}{2}l = 0 (2) N_A = \\frac{2\\sqrt{3}}{9}W, N_B = W, F = \\frac{2\\sqrt{3}}{9}W",
        "(1) 鉛直: N_B - W = 0, 水平: N_A - F = 0, モーメント: W \\times \\frac{1}{3}l - N_A \\times \\frac{1}{2}l = 0 (2) N_A = \\frac{2}{3}W, N_B = W, F = \\frac{2}{3}W",
        "(1) 鉛直: N_B - W = 0, 水平: N_A - F = 0, モーメント: W \\times \\frac{2}{3}l - N_A \\times \\frac{\\sqrt{3}}{2}l = 0 (2) N_A = \\frac{4\\sqrt{3}}{9}W, N_B = W, F = \\frac{4\\sqrt{3}}{9}W",
        "(1) 鉛直: N_B - W = 0, 水平: N_A - F = 0, モーメント: W \\times \\frac{1}{3}l - N_B \\times \\frac{\\sqrt{3}}{2}l = 0 (2) N_A = \\frac{2\\sqrt{3}}{9}W, N_B = W, F = \\frac{2\\sqrt{3}}{9}W",
        "(1) 鉛直: N_B - W = 0, 水平: N_A - F = 0, モーメント: W \\times \\frac{1}{3}l - N_A \\times \\frac{\\sqrt{3}}{2}l = 0 (2) N_A = \\frac{\\sqrt{3}}{3}W, N_B = W, F = \\frac{\\sqrt{3}}{3}W",
        "(1) 鉛直: N_B - W = 0, 水平: N_A + F = 0, モーメント: W \\times \\frac{1}{3}l - N_A \\times \\frac{\\sqrt{3}}{2}l = 0 (2) N_A = \\frac{2\\sqrt{3}}{9}W, N_B = W, F = -\\frac{2\\sqrt{3}}{9}W"
    ],
    "phy-05-qB5": [
        "(a) F = 50 \\mathrm{N} (b) F = 10 \\mathrm{N} (c) F = 40 \\mathrm{N}",
        "(a) F = 70 \\mathrm{N} (b) F = 10 \\mathrm{N} (c) F = 40 \\mathrm{N}",
        "(a) F = 50 \\mathrm{N} (b) F = 30 \\mathrm{N} (c) F = 40 \\mathrm{N}",
        "(a) F = 50 \\mathrm{N} (b) F = 10 \\mathrm{N} (c) F = 20 \\mathrm{N}",
        "(a) F = 70 \\mathrm{N} (b) F = 30 \\mathrm{N} (c) F = 20 \\mathrm{N}",
        "(a) F = 10 \\mathrm{N} (b) F = 30 \\mathrm{N} (c) F = 40 \\mathrm{N}",
        "(a) F = 50 \\mathrm{N} (b) F = 30 \\mathrm{N} (c) F = 20 \\mathrm{N}",
        "(a) F = 70 \\mathrm{N} (b) F = 10 \\mathrm{N} (c) F = 60 \\mathrm{N}"
    ],
    "phy-05-qB6": [
        "0.75 \\mathrm{m}",
        "0.25 \\mathrm{m}",
        "0.50 \\mathrm{m}",
        "0.80 \\mathrm{m}"
    ],
    "phy-05-qB7": [
        "(0.40 \\mathrm{m}, 0.10 \\mathrm{m})",
        "(0.10 \\mathrm{m}, 0.40 \\mathrm{m})",
        "(0.30 \\mathrm{m}, 0.15 \\mathrm{m})",
        "(0.45 \\mathrm{m}, 0.15 \\mathrm{m})",
        "(0.20 \\mathrm{m}, 0.20 \\mathrm{m})",
        "(0.40 \\mathrm{m}, 0.20 \\mathrm{m})"
    ],
    "phy-05-qB8": [
        "点Oから左へ 3.0 \\times 10^{-2} \\mathrm{m}",
        "点Oから右へ 3.0 \\times 10^{-2} \\mathrm{m}",
        "点Oから左へ 6.0 \\times 10^{-2} \\mathrm{m}",
        "点Oから右へ 6.0 \\times 10^{-2} \\mathrm{m}"
    ],
    "phy-05-qB9": [
        "W = 25 \\mathrm{N}, x = 1.2 \\mathrm{m}",
        "W = 25 \\mathrm{N}, x = 0.8 \\mathrm{m}",
        "W = 20 \\mathrm{N}, x = 1.2 \\mathrm{m}",
        "W = 20 \\mathrm{N}, x = 1.5 \\mathrm{m}",
        "W = 30 \\mathrm{N}, x = 1.0 \\mathrm{m}",
        "W = 30 \\mathrm{N}, x = 1.2 \\mathrm{m}"
    ],
    "phy-05-qB10": [
        "ア: \\mu mg, イ: \\frac{w}{2\\mu}",
        "ア: \\mu mg, イ: \\frac{w}{\\mu}",
        "ア: \\frac{1}{2}\\mu mg, イ: \\frac{w}{2\\mu}",
        "ア: \\mu mg, イ: \\frac{2w}{\\mu}",
        "ア: \\frac{1}{2}\\mu mg, イ: \\frac{w}{\\mu}",
        "ア: 2\\mu mg, イ: \\frac{w}{2\\mu}"
    ],
    "phy-05-qA1": [
        "(1) N_C = 12 \\mathrm{N}, N_D = 24 \\mathrm{N} (2) Dより0.10m右の所",
        "(1) N_C = 24 \\mathrm{N}, N_D = 12 \\mathrm{N} (2) Dより0.10m右の所",
        "(1) N_C = 12 \\mathrm{N}, N_D = 24 \\mathrm{N} (2) Dより0.20m右の所",
        "(1) N_C = 18 \\mathrm{N}, N_D = 18 \\mathrm{N} (2) Dより0.10m右の所",
        "(1) N_C = 12 \\mathrm{N}, N_D = 24 \\mathrm{N} (2) Dより0.15m右の所",
        "(1) N_C = 24 \\mathrm{N}, N_D = 12 \\mathrm{N} (2) Dより0.20m右の所",
        "(1) N_C = 14 \\mathrm{N}, N_D = 36 \\mathrm{N} (2) Dより0.10m右の所",
        "(1) N_C = 14 \\mathrm{N}, N_D = 36 \\mathrm{N} (2) Dより0.20m右の所"
    ],
    "phy-05-qA2": [
        "(1) F = \\frac{3(l+10x)}{8l}mg (2) B端から距離 \\frac{7}{10}l の所",
        "(1) F = \\frac{3(l+5x)}{8l}mg (2) B端から距離 \\frac{7}{10}l の所",
        "(1) F = \\frac{3(l+10x)}{8l}mg (2) B端から距離 \\frac{1}{2}l の所",
        "(1) F = \\frac{3(l+5x)}{8l}mg (2) B端から距離 \\frac{1}{2}l の所",
        "(1) F = \\frac{4(l+10x)}{8l}mg (2) B端から距離 \\frac{7}{10}l の所",
        "(1) F = \\frac{3(l+10x)}{8l}mg (2) B端から距離 \\frac{3}{5}l の所"
    ],
    "phy-05-qA3": [
        "(1) \\frac{b-a\\tan\\theta}{2} (2) \\tan\\theta > \\frac{b}{a} (3) \\mu < \\tan\\theta",
        "(1) \\frac{b+a\\tan\\theta}{2} (2) \\tan\\theta > \\frac{b}{a} (3) \\mu < \\tan\\theta",
        "(1) \\frac{b-a\\tan\\theta}{2} (2) \\tan\\theta < \\frac{b}{a} (3) \\mu < \\tan\\theta",
        "(1) \\frac{b-a\\tan\\theta}{2} (2) \\tan\\theta > \\frac{b}{a} (3) \\mu > \\tan\\theta",
        "(1) \\frac{b+a\\tan\\theta}{2} (2) \\tan\\theta < \\frac{b}{a} (3) \\mu < \\tan\\theta",
        "(1) \\frac{b-a\\tan\\theta}{2} (2) \\tan\\theta < \\frac{b}{a} (3) \\mu > \\tan\\theta",
        "(1) \\frac{b+a\\tan\\theta}{2} (2) \\tan\\theta > \\frac{b}{a} (3) \\mu > \\tan\\theta",
        "(1) \\frac{a-b\\tan\\theta}{2} (2) \\tan\\theta > \\frac{a}{b} (3) \\mu < \\tan\\theta"
    ]
}

random.seed(42)

for q in data:
    bcode = q["businessCode"]
    q["topicCode"] = "phy_1_1_4"
    q["subtopicCodes"] = ["phy_1_1_4_01"]
    
    if bcode in replacements:
        opts = replacements[bcode]
        correct_opt = opts[0]
        shuffled = opts[:]
        random.shuffle(shuffled)
        q["options"] = shuffled
        q["correctIndex"] = shuffled.index(correct_opt)

with open('phy_1_chapter05_questions.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Modification complete.")
