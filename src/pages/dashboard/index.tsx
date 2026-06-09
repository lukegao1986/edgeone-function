import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Image, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { SUBJECTS } from '@/data/subjects';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import styles from './index.module.scss';

const statIcons = [
  { icon: '📖', color: '#3B6EC9', bg: '#EBF0FA', label: '今日刷题', key: 'todayAnswered' },
  { icon: '📈', color: '#8B6DC9', bg: '#F2EDF9', label: '累计刷题', key: 'totalAnswered' },
  { icon: '🎯', color: '#34A853', bg: '#E8F5E9', label: '正确率', key: 'rate' },
  { icon: '🏆', color: '#C97B4A', bg: '#F9F0EB', label: '连续学习', key: 'streakDays' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayAnswered: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    streakDays: 0,
    trendSvg: '',
    subjectCounts: {} as Record<string, number>
  });

  const [goals, setGoals] = useState({
    examDate: '2025-11-09',
    targetQuestions: 2000,
    targetCorrectRate: 85,
    startDate: '2024-11-09'
  });
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [sortType, setSortType] = useState<'targetRate' | 'correctRate' | 'answered'>('targetRate');

  useDidShow(() => {
    const fetchStats = async () => {
      const userInfo = Taro.getStorageSync('userInfo');
      if (!userInfo || !userInfo.id) return;

      try {
        const res = await Taro.request({
          url: `/api/get_dashboard_stats?userId=${userInfo.id}`,
          method: 'GET'
        });
        if (res.data && res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('获取统计数据失败', err);
      }
    };
    fetchStats();

    const savedGoals = Taro.getStorageSync('userGoals');
    if (savedGoals) {
      setGoals(savedGoals);
    }
  });

  const handleSaveGoals = () => {
    Taro.setStorageSync('userGoals', goals);
    setShowGoalModal(false);
  };

  const correctRate = stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;

  // --- Calculations for Progress Tracker ---
  const today = new Date();
  const examD = new Date(goals.examDate);
  const startD = new Date(goals.startDate);

  const totalDays = Math.max((examD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24), 1);
  const passedDays = Math.max((today.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24), 0);
  const remainingDays = Math.max(Math.ceil((examD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)), 0);

  const expectedProgress = Math.min((passedDays / totalDays) * 100, 100);

  const actualAnswered = stats.totalAnswered;
  const remainingQuestions = Math.max(goals.targetQuestions - actualAnswered, 0);
  const actualProgress = Math.min((actualAnswered / goals.targetQuestions) * 100, 100);

  const dailyRequired = remainingDays > 0 ? Math.ceil(remainingQuestions / remainingDays) : 0;
  
  const progressDiff = actualProgress - expectedProgress;
  const isAhead = progressDiff >= 0;
  const diffAbs = Math.abs(Math.round(progressDiff));

  // --- Calculations for Leaderboard ---
  const leaderboardData = useMemo(() => {
    const userInfo = Taro.getStorageSync('userInfo');
    const myName = userInfo?.nickname || userInfo?.username || '留学小生';
    
    const combined = [
      { id: '1', name: '東京大学志望', answered: 3245, correctRate: 92, targetRate: 108 },
      { id: '2', name: '早稲田目指す', answered: 2890, correctRate: 88, targetRate: 96 },
      { id: '4', name: '慶應チャレンジ', answered: 2156, correctRate: 82, targetRate: 72 },
      { id: '5', name: '京大への道', answered: 1876, correctRate: 80, targetRate: 63 },
      { id: '6', name: '毎日勉強中', answered: 1567, correctRate: 76, targetRate: 52 },
      { id: '7', name: 'EJU頑張る', answered: 987, correctRate: 71, targetRate: 33 },
      { id: '8', name: '日本留学夢', answered: 654, correctRate: 68, targetRate: 22 },
      { id: 'me', name: myName, answered: actualAnswered, correctRate: correctRate, targetRate: Math.round(actualProgress), isMe: true }
    ];

    return combined.sort((a, b) => b[sortType] - a[sortType]).map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [actualAnswered, correctRate, actualProgress, sortType]);

  const statValues = {
    todayAnswered: stats.todayAnswered,
    totalAnswered: stats.totalAnswered,
    rate: `${correctRate}%`,
    streakDays: `${stats.streakDays} 天`,
  };

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }, []);

  const handleSubjectClick = (subjectId: string) => {
    Taro.navigateTo({ url: `/pages/practice/index?subjectId=${subjectId}` });
  };

  return (
    <View className={styles.pageContainer}>
      <Navbar />
      <View className={styles.layoutBody}>
        <Sidebar activePage="dashboard" onSubjectClick={handleSubjectClick} />
        
        <ScrollView className={styles.scrollArea} scrollY>
          <View className={styles.mainContent}>

            {/* --- Top Section: Tracker & Leaderboard --- */}
            <View className={styles.twoColLayout}>
              {/* Left Column */}
              <View className={styles.leftCol}>
                
                {/* Progress Tracker */}
                <View className={styles.progressTrackerCard}>
                  <View className={styles.ptHeader}>
                    <View className={styles.ptTitleWrap}>
                      <Text className={styles.ptIcon}>🎯</Text>
                      <Text className={styles.ptTitle}>学习进度追踪</Text>
                    </View>
                    <View className={styles.ptAdjustBtn} onClick={() => setShowGoalModal(true)}>
                      <Text>✏️ 调整目标</Text>
                    </View>
                  </View>

                  <View className={styles.ptGoals}>
                    <View className={styles.ptGoalTag}>📅 考试日 {goals.examDate}</View>
                    <View className={styles.ptGoalTag}>🏆 目标 {goals.targetQuestions}题 / {goals.targetCorrectRate}%</View>
                    <View className={classnames(styles.ptDiffTag, isAhead ? styles.ptDiffAhead : styles.ptDiffBehind)}>
                      <Text>{isAhead ? '📈 超前' : '📉 落后'} {diffAbs}%</Text>
                    </View>
                  </View>

                  <View className={styles.ptBars}>
                    <View className={styles.ptBarRow}>
                      <Text className={styles.ptBarLabel}>预定进度</Text>
                      <View className={styles.ptBarTrack}>
                        <View className={styles.ptBarExpected} style={{ width: `${expectedProgress}%` }} />
                      </View>
                      <Text className={styles.ptBarValueBlue}>{Math.round(expectedProgress)}%</Text>
                    </View>
                    <View className={styles.ptBarRow}>
                      <Text className={styles.ptBarLabel}>实际进度</Text>
                      <View className={styles.ptBarTrack}>
                        <View className={styles.ptBarActual} style={{ width: `${actualProgress}%` }}>
                          <View className={styles.ptBarDot} />
                        </View>
                      </View>
                      <Text className={styles.ptBarValueRed}>{Math.round(actualProgress)}% <Text className={styles.ptBarValueSub}>({actualAnswered}/{goals.targetQuestions}题)</Text></Text>
                    </View>
                  </View>

                  <View className={styles.ptGrid}>
                    <View className={styles.ptGridItem}>
                      <Text className={styles.ptGridVal}>{remainingDays}</Text>
                      <Text className={styles.ptGridLabel}>剩余天数</Text>
                    </View>
                    <View className={styles.ptGridItem}>
                      <Text className={styles.ptGridValRed}>{remainingQuestions}</Text>
                      <Text className={styles.ptGridLabel}>剩余题数</Text>
                    </View>
                    <View className={styles.ptGridItem}>
                      <Text className={styles.ptGridValYellow}>{dailyRequired}</Text>
                      <Text className={styles.ptGridLabel}>每日需刷</Text>
                    </View>
                    <View className={styles.ptGridItem}>
                      <Text className={classnames(styles.ptGridVal, correctRate >= goals.targetCorrectRate ? styles.textSuccess : styles.textDanger)}>{correctRate}%</Text>
                      <Text className={styles.ptGridLabel}>当前正确率</Text>
                    </View>
                  </View>
                </View>

                {/* --- Existing Content Now inside Left Column --- */}
                
                {/* 数据概览 Header */}
                <View className={styles.sectionHeader}>
                  <Text className={styles.sectionTitle}>学习概览</Text>
                  <Text className={styles.dateText}>{todayStr}</Text>
                </View>

                {/* 统计卡片 (Grid 布局) */}
                <View className={styles.statsGrid}>
                  {statIcons.map((s) => (
                    <View key={s.key} className={styles.statCard}>
                      <View className={styles.iconWrapper} style={{ backgroundColor: s.bg }}>
                        <Text className={styles.iconText} style={{ color: s.color }}>{s.icon}</Text>
                      </View>
                      <Text className={styles.statValue} style={{ color: s.color }}>
                        {statValues[s.key as keyof typeof statValues]}
                      </Text>
                      <Text className={styles.statLabel}>{s.label}</Text>
                    </View>
                  ))}
                </View>

                {/* 趋势图卡片 */}
                <View className={classnames(styles.statCard, styles.chartCard)}>
                  <Text className={styles.chartTitle}>📈 本周正确率趋势</Text>
                  <View className={styles.chartWrapper}>
                    {stats.trendSvg ? (
                      <Image 
                        src={stats.trendSvg} 
                        mode="aspectFit" 
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <Text style={{ color: '#9ca3af' }}>暂无数据</Text>
                    )}
                  </View>
                </View>

                {/* 推荐题库 */}
                <View className={classnames(styles.sectionHeader, styles.marginTop)}>
                  <Text className={styles.sectionTitle}>推荐题库 / 选考科目进度</Text>
                  <Text className={styles.moreLink}>查看全部 →</Text>
                </View>

                <View className={styles.subjectGrid}>
                  {SUBJECTS.map((subject, i) => (
                    <View
                      key={subject.id}
                      className={styles.subjectCard}
                      onClick={() => handleSubjectClick(subject.id)}
                    >
                      <View className={styles.cardTopBar} style={{ backgroundColor: subject.color }} />
                      <View className={styles.cardBody}>
                        <View className={styles.subjectIconWrapper} style={{ backgroundColor: subject.bgColor }}>
                          <Text className={styles.subjectIcon} style={{ color: subject.color }}>{subject.icon}</Text>
                        </View>
                        <Text className={styles.subjectName}>{subject.name}</Text>
                        <Text className={styles.subjectSubtitle}>{subject.subtitle}</Text>
                        <Text className={styles.subjectCount}>共 {stats.subjectCounts[subject.id] || 0} 题</Text>
                        <View className={styles.actionBtn}>
                          <Text className={styles.actionBtnText}>开始练习</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

              </View>

              {/* Right Column: Leaderboard */}
              <View className={styles.rightCol}>
                <View className={styles.leaderboardCard}>
                  <View className={styles.lbHeader}>
                    <View className={styles.lbTitleWrap}>
                      <Text className={styles.lbIcon}>👑</Text>
                      <Text className={styles.lbTitle}>同期考生排行</Text>
                    </View>
                    <Text className={styles.lbCountTag}>共8人</Text>
                  </View>
                  
                  <View className={styles.lbTabs}>
                    <Text className={classnames(styles.lbTab, sortType === 'targetRate' && styles.lbTabActive)} onClick={() => setSortType('targetRate')}>目标完成度</Text>
                    <Text className={classnames(styles.lbTab, sortType === 'correctRate' && styles.lbTabActive)} onClick={() => setSortType('correctRate')}>正确率</Text>
                    <Text className={classnames(styles.lbTab, sortType === 'answered' && styles.lbTabActive)} onClick={() => setSortType('answered')}>刷题数</Text>
                  </View>

                  <View className={styles.lbList}>
                    {leaderboardData.map(user => (
                      <View key={user.id} className={classnames(styles.lbItem, user.isMe && styles.lbItemMe)}>
                        <View className={styles.lbRank}>
                          {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                        </View>
                        <View className={styles.lbUserInfo}>
                          <View className={styles.lbAvatar}>{user.name[0]}</View>
                          <View className={styles.lbNameWrap}>
                            <View className={styles.lbNameRow}>
                              <Text className={styles.lbName}>{user.name}</Text>
                              {user.isMe && <Text className={styles.lbMeTag}>我</Text>}
                            </View>
                            <Text className={styles.lbSub}>{user.answered}题 {user.correctRate}%</Text>
                          </View>
                        </View>
                        <Text className={classnames(styles.lbScore, sortType === 'targetRate' && styles.textSuccess)}>
                          {user[sortType as keyof typeof user]}{sortType !== 'answered' ? '%' : ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Text className={styles.lbFooter}>数据每日更新·保持刷题提升排名</Text>
                </View>
              </View>

            </View>
          </View>
        </ScrollView>
      </View>

      {/* Adjust Goal Modal */}
      {showGoalModal && (
        <View className={styles.modalOverlay}>
          <View className={styles.modalContent}>
            <View className={styles.modalTitle}>调整学习目标</View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>考试日期 (YYYY-MM-DD)</Text>
              <Input 
                className={styles.formInput} 
                value={goals.examDate} 
                onInput={(e) => setGoals({...goals, examDate: e.detail.value})}
              />
            </View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>备考开始日期 (YYYY-MM-DD)</Text>
              <Input 
                className={styles.formInput} 
                value={goals.startDate} 
                onInput={(e) => setGoals({...goals, startDate: e.detail.value})}
              />
            </View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>目标题数 (题)</Text>
              <Input 
                className={styles.formInput} 
                type="number"
                value={String(goals.targetQuestions)} 
                onInput={(e) => setGoals({...goals, targetQuestions: parseInt(e.detail.value) || 0})}
              />
            </View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>目标正确率 (%)</Text>
              <Input 
                className={styles.formInput} 
                type="number"
                value={String(goals.targetCorrectRate)} 
                onInput={(e) => setGoals({...goals, targetCorrectRate: parseInt(e.detail.value) || 0})}
              />
            </View>
            <View className={styles.modalBtns}>
              <View className={styles.btnCancel} onClick={() => setShowGoalModal(false)}>取消</View>
              <View className={styles.btnSave} onClick={handleSaveGoals}>保存</View>
            </View>
          </View>
        </View>
      )}

    </View>
  );
}
