import React, { useState } from 'react';
import { View, Text, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import Layout from '@/components/Layout';
import styles from './index.module.scss';

export default function ProfilePage() {
  const [notifications, setNotifications] = useState(true);
  const [eyeCareMode, setEyeCareMode] = useState(false);

  // Mock 数据
  const stats = {
    totalAnswered: 1250,
    totalCorrect: 980,
    totalErrors: 24,
    streakDays: 12,
    weeklyAnswered: 156
  };
  const correctRate = stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;

  const achievements = [
    { icon: '🏆', label: '连续打卡', value: `${stats.streakDays} 天`, color: '#C97B4A' },
    { icon: '🔥', label: '本周刷题', value: `${stats.weeklyAnswered} 题`, color: '#E04545' },
    { icon: '📖', label: '平均正确率', value: `${correctRate}%`, color: '#34A853' },
  ];

  const statItems = [
    { label: '累计答题', value: stats.totalAnswered.toLocaleString(), color: '#3B6EC9' },
    { label: '正确率', value: `${correctRate}%`, color: '#34A853' },
    { label: '错题数', value: stats.totalErrors, color: '#E04545' },
    { label: '连续学习', value: `${stats.streakDays}天`, color: '#F5A623' },
    { label: '本周刷题', value: `${stats.weeklyAnswered}题`, color: '#8B6DC9' },
  ];

  const practiceHistory = [
    { date: '2023-10-27', subjectName: '理科', total: 20, correct: 16, rate: 80 },
    { date: '2023-10-26', subjectName: '数学1', total: 15, correct: 10, rate: 66 },
    { date: '2023-10-25', subjectName: '日语', total: 30, correct: 28, rate: 93 },
  ];

  const handleToggleNotifications = (e: any) => {
    setNotifications(e.detail.value);
    Taro.showToast({ title: e.detail.value ? '已开启消息通知' : '已关闭消息通知', icon: 'none' });
  };

  const handleToggleEyeCare = (e: any) => {
    setEyeCareMode(e.detail.value);
    Taro.showToast({ title: e.detail.value ? '已开启护眼模式' : '已关闭护眼模式', icon: 'none' });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.reLaunch({ url: '/pages/index/index' });
        }
      }
    });
  };

  return (
    <Layout activePage="profile">
      <View className={styles.mainContent}>
        
        {/* 用户信息卡片 */}
        <View className={styles.userInfoCard}>
          <View className={styles.avatarBox}>
            <Text className={styles.avatarIcon}>👤</Text>
          </View>
          <View className={styles.infoBox}>
            <Text className={styles.userName}>留学小生</Text>
            <Text className={styles.userEmail}>liuxue@email.com</Text>
            <View className={styles.tagWrapper}>
              <Text className={styles.tagText}>备考 EJU 2025年11月</Text>
            </View>
          </View>
        </View>

        {/* 学习成就 */}
        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>学习成就</Text>
          <View className={styles.achievementGrid}>
            {achievements.map((a, i) => (
              <View key={i} className={styles.achievementItem}>
                <Text className={styles.achIcon} style={{ color: a.color }}>{a.icon}</Text>
                <Text className={styles.achValue}>{a.value}</Text>
                <Text className={styles.achLabel}>{a.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 详细统计 */}
        <View className={styles.sectionCard}>
          <View className={styles.statsRow}>
            {statItems.map((s, i) => (
              <React.Fragment key={i}>
                <View className={styles.statItem}>
                  <Text className={styles.statValue} style={{ color: s.color }}>{s.value}</Text>
                  <Text className={styles.statLabel}>{s.label}</Text>
                </View>
                {i < statItems.length - 1 && <View className={styles.statDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* 历史练习记录 (简易表格) */}
        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>历史练习记录</Text>
          <View className={styles.table}>
            <View className={styles.tableHeader}>
              <Text className={styles.thDate}>日期</Text>
              <Text className={styles.thSubject}>科目</Text>
              <Text className={styles.thNum}>题数</Text>
              <Text className={styles.thNum}>正确</Text>
              <Text className={styles.thNum}>正确率</Text>
              <Text className={styles.thAction}>操作</Text>
            </View>
            {practiceHistory.map((r, i) => (
              <View key={i} className={styles.tableRow}>
                <Text className={styles.tdDate}>{r.date}</Text>
                <Text className={styles.tdSubject}>{r.subjectName}</Text>
                <Text className={styles.tdNum}>{r.total}</Text>
                <Text className={styles.tdNumCorrect}>{r.correct}</Text>
                <Text className={classnames(styles.tdRate, r.rate >= 80 ? styles.rateHigh : r.rate >= 60 ? styles.rateMid : styles.rateLow)}>
                  {r.rate}%
                </Text>
                <Text className={styles.tdAction}>查看</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 设置面板 */}
        <View className={classnames(styles.sectionCard, styles.settingsCard)}>
          <View className={styles.settingsHeader}>
            <Text className={styles.sectionTitle}>设置</Text>
          </View>
          
          <View className={styles.settingItem}>
            <View className={styles.settingInfo}>
              <Text className={styles.settingName}>消息通知</Text>
              <Text className={styles.settingDesc}>接收学习提醒和更新通知</Text>
            </View>
            <Switch checked={notifications} color="#165dff" onChange={handleToggleNotifications} />
          </View>

          <View className={styles.settingItem}>
            <View className={styles.settingInfo}>
              <Text className={styles.settingName}>护眼模式</Text>
              <Text className={styles.settingDesc}>开启后降低屏幕蓝光</Text>
            </View>
            <Switch checked={eyeCareMode} color="#165dff" onChange={handleToggleEyeCare} />
          </View>

          <View className={styles.settingItem}>
            <View className={styles.settingInfo}>
              <Text className={styles.settingName}>关于我们</Text>
            </View>
            <Text className={styles.arrowIcon}>→</Text>
          </View>

          <View className={styles.settingItem}>
            <View className={styles.settingInfo}>
              <Text className={styles.settingName}>帮助与反馈</Text>
            </View>
            <Text className={styles.arrowIcon}>→</Text>
          </View>

          <View className={classnames(styles.settingItem, styles.logoutItem)} onClick={handleLogout}>
            <View className={styles.settingInfo}>
              <Text className={styles.logoutText}>退出登录</Text>
            </View>
            <Text className={styles.arrowIcon}>→</Text>
          </View>

        </View>
      </View>
    </Layout>
  );
}
