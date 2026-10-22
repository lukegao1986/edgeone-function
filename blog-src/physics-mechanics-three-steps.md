---
title: 理科物理：力学综合题的「三步拆解法」
slug: physics-mechanics-three-steps
cat: physics
date: 2026-10-12
updated: 2026-10-12
minutes: 15
summary: 受力分析→运动分析→能量/动量选择，让复杂力学题变得条理清晰。
cover: orange
glyph: ⚗
keywords:
  - 物理
  - 力学
  - 综合题
  - 三步拆解法
  - 受力分析
  - 动量
  - 能量
recap:
  - <strong>顺序不可颠倒</strong>：先隔离受力、再判断运动、最后择优使用能量或动量。
  - <strong>受力分析用隔离法</strong>，按「重力→支持力→摩擦力→张力→弹簧弹力」固定顺序逐一确认，避免遗漏。
  - <strong>静摩擦不能直接代 f = μN</strong>；先判断物块是否平衡，静止时摩擦力由平衡条件反推。
  - <strong>运动分析看模型</strong>：匀变速直线三个公式 / 抛体运动按两个垂直方向分解。
  - <strong>选择依据</strong>：求位移与速度大小用能量，求时间与方向用动力学，涉及碰撞用动量。
  - <strong>单位统一</strong>：cm→m、g→kg 是「公式对但结果错」的头号原因。
---

## 引言：公式都会，为什么还是丢分

<p>在 EJU 理科的物理卷里，力学（運動とエネルギー、力のつりあい）长期占据约三分之一的分值，而且最容易以「斜面 + 摩擦 + 弹簧」「碰撞 + 能量」这类多过程综合题的形式出现。很多同学的复习方式是背公式：牛顿第二定律、动能定理、动量守恒，一条不落。但一到综合题就卡住——不是不会公式，而是<strong>不知道该用哪一条、按什么顺序用</strong>。</p>

<p>综合题的失分点往往集中在一开始：受力没画全，漏掉摩擦力或把方向搞反；过程没拆开，把几段性质完全不同的运动当成一段；到最后又在「用动能定理还是动量守恒」之间反复横跳，白白耗掉考试时间。下面给出一个可以机械执行的三步框架，让力学综合题从「靠感觉」变成「按流程走」。</p>

## 三步法总览

<p>任何一个力学综合题，都可以拆成三步，每步都有明确的输出物：</p>

<ol>
<li><strong>①受力分析</strong>——隔离研究对象，逐一确认它受到的每一个力。输出物：<em>受力图 + 沿各坐标轴写出的方程</em>（含 <span class="formula--inline">f = μN</span>、<span class="formula--inline">F = kx</span> 等辅助关系）。</li>
<li><strong>②运动分析</strong>——判断每一段运动的性质（匀速、匀变速直线、平抛/斜抛），选对应的运动学公式。输出物：<em>加速度 a 与所属运动模型</em>，以及各段的速度、位移关系。</li>
<li><strong>③能量/动量选择</strong>——当题目涉及「求位移」「求末速度」「碰撞后速度」「摩擦生热」时，优先绕过运动学，用能量或动量关系一步到位。输出物：<em>一条守恒式或动能定理式</em>。</li>
</ol>

<blockquote>
<p>顺序不能颠倒：受力分析决定了每一步有哪些力做功，运动分析决定了能量方程里的位移该怎么写。跳过第一步直接列能量方程，几乎一定会漏掉摩擦力做的功。</p>
</blockquote>

## 第一步：受力分析

<p>核心方法是<strong>隔离法</strong>：把要研究的物体单独拿出来（哪怕它正与其他物体接触），只画「别的物体对它的力」。按固定顺序逐一确认，可以有效避免遗漏：</p>

<ol>
<li><strong>重力</strong> <span class="formula--inline">mg</span>，竖直向下，永远存在；</li>
<li><strong>支持力/弹力</strong> <span class="formula--inline">N</span>，垂直于接触面，指向被压的物体；</li>
<li><strong>摩擦力</strong> <span class="formula--inline">f = μN</span>，沿接触面，方向与相对运动（或相对运动趋势）相反；</li>
<li><strong>张力</strong>，沿绳方向，指向绳的收缩一侧；</li>
<li><strong>弹簧弹力</strong> <span class="formula--inline">F = kx</span>，方向由形变方向决定，x 是形变量而非弹簧全长。</li>
</ol>

<p>摩擦力是最容易出错的。判断顺序应该是：<strong>先看物体是否处于平衡（或给定运动状态），再决定是静摩擦还是动摩擦</strong>。如果物体静止，接触面上的是静摩擦 <span class="formula--inline">f_s</span>，它的大小由平衡条件反推，<strong>不能直接用 f = μN</strong>；只有当物体已经发生相对滑动时，才可用 <span class="formula--inline">f = μN</span> 计算动摩擦。常见的翻车方式是：先默认「它是动摩擦」，算完才发现物块其实静止，整道题作废。</p>

<div class="tip">
<span class="tip__label">提示</span>列式前先问一句：这个物体处于平衡吗？已知静止或匀速 → 合力为零，用平衡方程；已知有加速度 → 用牛顿第二定律。这一步决定了后面所有方程的形式。
</div>

## 第二步：运动分析

<p>受力分析完成后，加速度 a 一般就确定了（<span class="formula--inline">a = F_合 / m</span>）。接下来判断每一段运动属于哪种模型，套对应公式即可。</p>

<p>最常见的是<strong>匀变速直线运动</strong>，三个公式覆盖全部情况：</p>

<div class="formula">v = v₀ + at</div>

<div class="formula">x = v₀t + ½at²</div>

<p>以及不含时间的位移–速度关系：</p>

<div class="formula">v² − v₀² = 2ax</div>

<p>另一个高频模型是<strong>抛体运动</strong>，处理方式是把运动分解到两个互相垂直的方向上，各自独立：水平方向匀速（<span class="formula--inline">v_x = v₀cosθ</span>、<span class="formula--inline">x = v₀cosθ·t</span>），竖直方向匀变速（<span class="formula--inline">v_y = v₀sinθ − gt</span>、<span class="formula--inline">y = v₀sinθ·t − ½gt²</span>）。分解之后，每个方向都退化成上面三种直线运动，问题立刻降级。</p>

## 第三步：能量与动量如何选择

<p>能用运动学硬解，不代表应该硬解。当题目里出现「求位移」「多段运动」「碰撞」这些关键词时，能量或动量往往能一步到位。选择依据如下表：</p>

<table>
<thead>
<tr><th>题目特征</th><th>优先选择</th><th>理由</th></tr>
</thead>
<tbody>
<tr><td>有摩擦、求滑行位移</td><td>动能定理</td><td>摩擦力做功 = −fx，位移可直接解出，无需过程细节</td></tr>
<tr><td>碰撞 / 爆炸 / 反冲</td><td>动量守恒</td><td>作用时间极短，内力远大于外力，动量守恒成立</td></tr>
<tr><td>求时间或求加速度</td><td>牛顿定律 + 运动学</td><td>能量方程不含时间，求 t、a 必须回到动力学</td></tr>
<tr><td>含弹簧 / 有高度变化且无摩擦</td><td>机械能守恒</td><td>只有重力与弹力做功，动能与势能相互转化</td></tr>
<tr><td>已知冲量或求平均作用力</td><td>动量定理</td><td>冲量等于动量变化，适合处理短时冲击</td></tr>
</tbody>
</table>

<p>一句话记住：<strong>求「位移、速度大小」用能量，求「时间、方向」用动力学，涉及「碰撞」用动量</strong>。</p>

## 完整例题：斜面下滑 + 弹簧压缩

<p>场景：质量 <span class="formula--inline">m</span> 的物块，从高度 <span class="formula--inline">h</span>、倾角 <span class="formula--inline">θ</span> 的<strong>光滑</strong>斜面顶端由静止下滑，斜面底端与水平面平滑连接；水平面粗糙，动摩擦因数为 <span class="formula--inline">μ</span>；斜面底端到弹簧自由端的水平距离为 <span class="formula--inline">L</span>；弹簧劲度系数为 <span class="formula--inline">k</span>。物块最终压缩弹簧。重力加速度为 <span class="formula--inline">g</span>。</p>

<p><strong>力的分析要点（逐条列出）：</strong></p>

<ul>
<li><strong>斜面上</strong>：受重力 <span class="formula--inline">mg</span>（竖直向下）与斜面支持力 <span class="formula--inline">N₁</span>（垂直斜面向上）。斜面光滑，无摩擦力。</li>
<li><strong>沿斜面分解</strong>：重力沿斜面向下的分量为 <span class="formula--inline">mg sinθ</span>，垂直斜面的分量为 <span class="formula--inline">mg cosθ</span>。</li>
<li><strong>水平面上</strong>：受重力 <span class="formula--inline">mg</span>、竖直向上支持力 <span class="formula--inline">N₂ = mg</span>、水平方向与运动反向的滑动摩擦力 <span class="formula--inline">f = μmg</span>。</li>
<li><strong>接触弹簧后</strong>：除上述力外，增加与运动反向的弹簧弹力 <span class="formula--inline">kx</span>（随压缩量增大而增大），摩擦力仍为 <span class="formula--inline">μmg</span>。</li>
</ul>

<p><strong>各阶段运动性质：</strong>阶段一（斜面）——初速度为零的匀加速直线运动，沿斜面向下的加速度 <span class="formula--inline">a = g sinθ</span>；阶段二（水平面滑向弹簧）——水平方向匀减速运动，加速度大小为 <span class="formula--inline">μg</span>；阶段三（压缩弹簧）——加速度大小不断增大的变减速运动，最终速度减为零。正因为阶段三是变减速，运动学公式不再适用，必须改用动能定理。</p>

<p><strong>第（1）问：</strong>物块在斜面上的加速度 a，以及滑到斜面底端的速度 v。</p>

<p>沿斜面方向由牛顿第二定律：</p>

<div class="formula">mg sinθ = ma &nbsp;⟹&nbsp; a = g sinθ</div>

<p>斜面光滑，只有重力做功，机械能守恒（等价于用运动学求解）：</p>

<div class="formula">mgh = ½mv² &nbsp;⟹&nbsp; v = √(2gh)</div>

<p>注意结果 v 中<strong>不含 θ</strong>：只要下滑高度相同、斜面光滑，到底端的速度大小就相同，这是很好的自检点。</p>

<p><strong>第（2）问：</strong>物块滑行距离 L 到达弹簧自由端时的速度 v₁。</p>

<p>从斜面底端到接触弹簧，重力与支持力不做功，只有摩擦力做负功，由动能定理：</p>

<div class="formula">½mv₁² − ½mv² = −μmgL</div>

<p>代入 <span class="formula--inline">v² = 2gh</span>，解得：</p>

<div class="formula">v₁ = √(2gh − 2μgL)</div>

<p>能到达弹簧的条件是根号内为正，即 <span class="formula--inline">h &gt; μL</span>；若 <span class="formula--inline">h = μL</span>，物块恰好在弹簧自由端停下。</p>

<p><strong>第（3）问：</strong>弹簧的最大压缩量 x。</p>

<p>取「物块接触弹簧到速度减为零」这一过程。其间摩擦力做负功 <span class="formula--inline">−μmgx</span>，弹簧弹力做负功 <span class="formula--inline">−½kx²</span>，动能由 <span class="formula--inline">½mv₁²</span> 减到 0，由动能定理：</p>

<div class="formula">0 − ½mv₁² = −μmgx − ½kx²</div>

<p>整理并把 <span class="formula--inline">½mv₁² = mgh − μmgL</span> 代入：</p>

<div class="formula">½kx² + μmgx = mgh − μmgL</div>

<p>这是关于 x 的一元二次方程 <span class="formula--inline">kx² + 2μmgx − 2mg(h − μL) = 0</span>，取正根：</p>

<div class="formula">x = [ −μmg + √( μ²m²g² + 2kmg(h − μL) ) ] / k</div>

<p>用 <span class="formula--inline">μ = 0</span>（水平面也光滑）验证，可退化为 <span class="formula--inline">x = √(2mgh / k)</span>，与纯机械能守恒的结果一致。</p>

## 公式速查表

<table>
<thead>
<tr><th>物理量</th><th>公式</th><th>适用条件</th></tr>
</thead>
<tbody>
<tr><td>牛顿第二定律</td><td>F_合 = ma</td><td>惯性参考系，宏观低速</td></tr>
<tr><td>速度公式</td><td>v = v₀ + at</td><td>匀变速直线运动</td></tr>
<tr><td>位移公式</td><td>x = v₀t + ½at²</td><td>匀变速直线运动</td></tr>
<tr><td>位移–速度关系</td><td>v² − v₀² = 2ax</td><td>匀变速直线运动，不含时间</td></tr>
<tr><td>滑动摩擦力</td><td>f = μN</td><td>已发生相对滑动</td></tr>
<tr><td>动能定理</td><td>W_合 = ½mv² − ½mv₀²</td><td>任意过程，标量式</td></tr>
<tr><td>机械能守恒</td><td>E_k1 + E_p1 = E_k2 + E_p2</td><td>只有重力/弹力做功</td></tr>
<tr><td>动量定理</td><td>F·t = mv − mv₀</td><td>冲量与动量变化的关系</td></tr>
<tr><td>动量守恒</td><td>m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′</td><td>系统外力可忽略（碰撞、爆炸）</td></tr>
<tr><td>弹簧弹性势能</td><td>E_p = ½kx²</td><td>弹性限度内，x 为形变量</td></tr>
</tbody>
</table>

## 五个常见错误

<ol>
<li><strong>漏掉摩擦力方向或大小</strong>：摩擦力方向与<em>相对运动</em>方向相反，而非与「运动方向」相反；物块在斜面上上滑与下滑时，摩擦力方向是相反的。</li>
<li><strong>把静摩擦当动摩擦</strong>：物块静止时 <span class="formula--inline">f_s ≤ μN</span>，其大小由平衡条件求出，直接代 <span class="formula--inline">f = μN</span> 往往偏大。</li>
<li><strong>有摩擦时误用机械能守恒</strong>：只要接触面粗糙、存在滑动摩擦，机械能就不守恒，必须改用动能定理，把摩擦力做的功写成 <span class="formula--inline">−fx</span>。</li>
<li><strong>动量守恒方向未取正方向</strong>：动量是矢量，列守恒式前必须先规定正方向，各速度带符号代入，否则一维碰撞也会算错。</li>
<li><strong>单位未统一</strong>：cm 要换算成 m、g 要换算成 kg，k 的单位是 N/m。单位不统一是「公式对但结果错」的头号原因。</li>
</ol>

<p>把这三步固化成习惯：<strong>先隔离受力、再判断运动、最后择优使用能量或动量</strong>，力学综合题就会从「碰运气」变成「走流程」。下一步的刻意练习方式是：拿到题先只写第①步的受力分析，强迫自己不上手算，坚持两周，选择题的失分会有明显下降。</p>
