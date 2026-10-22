/**
 * 本地 H5 预览用 mock 数据层（仅 development 生效，生产构建自动跳过）。
 * 通过 Taro.addInterceptor 拦截请求并直接返回假数据；未匹配的接口仍走真实请求。
 */
import Taro from '@tarojs/taro';

const MOCK_USER = {
  id: 1,
  username: 'demo',
  nickname: '演示同学',
  target_exam: 'EJU 理科',
};

const MOCK_QUESTIONS = [
  {
    id: 900001,
    businessCode: 'chem-che1-qA1',
    questionType: 1,
    difficultyLevel: 2,
    score: 2,
    stem: '次の物質のうち、純物質であるものはどれか。',
    options: ['空気', '酸素', '海水', '石油'],
    correctIndex: 1,
    explanation:
      '酸素 $\\mathrm{O_2}$ は単一の元素からなる単体であり、純物質に分類される。空気・海水・石油はいずれも混合物である。',
    subtopics: [{ id: 11, code: 'chem_1_1_1_01', name: '純物質と混合物' }],
  },
  {
    id: 900002,
    businessCode: 'chem-che1-qB2',
    questionType: 1,
    difficultyLevel: 3,
    score: 2,
    stem: '0.10 mol/L の塩酸 100 mL を中和するのに必要な 0.20 mol/L の水酸化ナトリウム水溶液の体積はどれか。',
    options: ['25 mL', '50 mL', '100 mL', '200 mL'],
    correctIndex: 1,
    explanation:
      '塩酸の物質量は $0.10 \\times 0.100 = 0.010\\ \\mathrm{mol}$。中和に必要な $\\mathrm{NaOH}$ も同じ $0.010\\ \\mathrm{mol}$ なので、$0.010 \\div 0.20 = 0.050\\ \\mathrm{L} = 50\\ \\mathrm{mL}$。',
    subtopics: [
      { id: 12, code: 'chem_1_2_1_01', name: '酸と塩基' },
      { id: 13, code: 'chem_1_2_1_02', name: '中和反応' },
    ],
  },
  {
    id: 900003,
    businessCode: 'chem-che2-qC1',
    questionType: 1,
    difficultyLevel: 1,
    score: 2,
    stem: 'メタン（CH₄）の完全燃焼を表す化学反応式として正しいものはどれか。',
    options: [
      'CH₄ + O₂ → CO₂ + H₂O',
      'CH₄ + 2O₂ → CO₂ + 2H₂O',
      '2CH₄ + O₂ → 2CO₂ + H₂O',
      'CH₄ + 3O₂ → CO₂ + 3H₂O',
    ],
    correctIndex: 1,
    explanation:
      '完全燃焼では炭素が $\\mathrm{CO_2}$、水素が $\\mathrm{H_2O}$ になる。原子数合わせより $\\mathrm{CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O}$ が正しい。',
    subtopics: [{ id: 21, code: 'chem_2_1_1_01', name: '有機化合物の燃焼' }],
  },
];

const MOCK_ERRORBOOK = [
  {
    questionId: 900002,
    subjectId: 'science',
    stem: '0.10 mol/L の塩酸 100 mL を中和するのに必要な 0.20 mol/L の水酸化ナトリウム水溶液の体積はどれか。',
    wrongCount: 3,
    isBookmarked: true,
    lastWrongAt: '2026-10-18',
  },
  {
    questionId: 900003,
    subjectId: 'science',
    stem: 'メタン（CH₄）の完全燃焼を表す化学反応式として正しいものはどれか。',
    wrongCount: 1,
    isBookmarked: false,
    lastWrongAt: '2026-10-17',
  },
];

const MOCK_TREND_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 200">' +
      '<polyline fill="none" stroke="#3B6EC9" stroke-width="4" points="40,150 140,120 240,135 340,90 440,95 540,55 600,60"/>' +
      '<circle cx="40" cy="150" r="6" fill="#3B6EC9"/><circle cx="140" cy="120" r="6" fill="#3B6EC9"/>' +
      '<circle cx="240" cy="135" r="6" fill="#3B6EC9"/><circle cx="340" cy="90" r="6" fill="#3B6EC9"/>' +
      '<circle cx="440" cy="95" r="6" fill="#3B6EC9"/><circle cx="540" cy="55" r="6" fill="#3B6EC9"/>' +
      '<circle cx="600" cy="60" r="6" fill="#3B6EC9"/>' +
      '<line x1="20" y1="180" x2="620" y2="180" stroke="#E2E5EA" stroke-width="2"/>' +
      '</svg>'
  );

const MOCK_DASHBOARD = {
  todayAnswered: 12,
  totalAnswered: 340,
  totalCorrect: 289,
  streakDays: 7,
  trendSvg: MOCK_TREND_SVG,
  subjectCounts: { japanese: 60, bunso: 40, math1: 55, math2: 48, science: 137 },
};

function ok(data: any) {
  return { statusCode: 200, data, header: {}, errMsg: 'request:ok' } as any;
}

function matchMock(url: string) {
  if (url.includes('/api/login')) {
    return ok({ success: true, message: '登录成功', data: MOCK_USER });
  }
  if (url.includes('/api/register')) {
    return ok({ success: true, message: '注册成功', recordId: 1 });
  }
  if (url.includes('/api/get_dashboard_stats')) {
    return ok({ success: true, data: MOCK_DASHBOARD });
  }
  if (url.includes('/api/get_questions')) {
    return ok({
      success: true,
      data: MOCK_QUESTIONS,
      userAnswers: {},
      meta: { filteredOutExpiredStemImageCount: 0, sanitizedExpiredExplanationImageCount: 0 },
    });
  }
  if (url.includes('/api/get_errorbook')) {
    return ok({ success: true, data: MOCK_ERRORBOOK });
  }
  if (url.includes('/api/submit_answer') || url.includes('/api/remove_error')) {
    return ok({ success: true });
  }
  return null;
}

export function setupMock() {
  if (process.env.NODE_ENV !== 'development') return;
  if ((globalThis as any).__mockReady) return;
  (globalThis as any).__mockReady = true;

  if (!Taro.getStorageSync('userInfo')) {
    Taro.setStorageSync('userInfo', MOCK_USER);
  }

  Taro.addInterceptor(((chain: any) => {
    const url: string = chain.requestParams?.url || '';
    const mocked = matchMock(url);
    if (mocked) return Promise.resolve(mocked);
    return chain.proceed(chain.requestParams);
  }) as any);

  console.log('[mock] 本地预览 mock 已启用，接口均返回假数据');
}
