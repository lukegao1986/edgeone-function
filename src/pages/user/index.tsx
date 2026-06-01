import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { SUBJECTS } from '@/data/subjects';
import Layout from '@/components/Layout';
import styles from './index.module.scss';

const statIcons = [
  { icon: '📖', color: '#3B6EC9', bg: '#EBF0FA', label: '今日刷题', key: 'todayAnswered' },
  { icon: '📈', color: '#8B6DC9', bg: '#F2EDF9', label: '累计刷题', key: 'totalAnswered' },
  { icon: '🎯', color: '#34A853', bg: '#E8F5E9', label: '正确率', key: 'rate' },
  { icon: '🏆', color: '#C97B4A', bg: '#F9F0EB', label: '连续学习', key: 'streakDays' },
];

export default function DashboardPage() {
  // Mock 数据：实际应从后端获取
  const stats = {
    todayAnswered: 24,
    totalAnswered: 1250,
    totalCorrect: 980,
    streakDays: 12
  };
  const correctRate = stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;

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
    // 确保使用 Taro.navigateTo 进行正确的页面跳转
    Taro.navigateTo({ url: `/pages/practice/index?subjectId=${subjectId}` });
  };

  return (
    <Layout activePage="dashboard">
      <View className={styles.mainContent}>
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

        {/* 推荐题库 */}
        <View className={classnames(styles.sectionHeader, styles.marginTop)}>
          <Text className={styles.sectionTitle}>推荐题库</Text>
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
                <Text className={styles.subjectCount}>共 {120 + i * 20} 题</Text>
                <View className={styles.actionBtn}>
                  <Text className={styles.actionBtnText}>开始练习</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Layout>
  );
}
