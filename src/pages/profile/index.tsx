import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Switch } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { SUBJECTS } from '@/data/subjects';
import styles from './index.module.scss';

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    stats: {
      streakDays: 0,
      thisWeekCount: 0,
      averageRate: 0,
      totalAnswered: 0,
      wrongCount: 0
    },
    trendSvg: '',
    history: [] as any[]
  });

  const [loading, setLoading] = useState(true);
  
  // 设置状态
  const [msgEnabled, setMsgEnabled] = useState(true);
  const [eyeCareEnabled, setEyeCareEnabled] = useState(false);

  useDidShow(() => {
    const fetchProfileStats = async () => {
      const userInfo = Taro.getStorageSync('userInfo');
      if (!userInfo || !userInfo.id) return;

      // 恢复护眼模式状态
      const eyeCare = Taro.getStorageSync('eyeCareEnabled');
      setEyeCareEnabled(!!eyeCare);

      setLoading(true);
      try {
        const res = await Taro.request({
          url: `/api/get_profile_stats?userId=${userInfo.id}`,
          method: 'GET'
        });
        if (res.data && res.data.success) {
          setProfileData(res.data.data);
        }
      } catch (err) {
        console.error('获取个人中心数据失败', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileStats();
  });

  const handleLogout = () => {
    Taro.removeStorageSync('userInfo');
    Taro.reLaunch({ url: '/pages/index/index' });
  };

  const toggleEyeCare = (e) => {
    const isEnabled = e.detail.value;
    setEyeCareEnabled(isEnabled);
    Taro.setStorageSync('eyeCareEnabled', isEnabled);
  };

  const handleAction = (action: string) => {
    Taro.showToast({ title: `${action}功能开发中`, icon: 'none' });
  };

  const userInfo = Taro.getStorageSync('userInfo');
  const userName = userInfo?.nickname || userInfo?.username || '留学小生';
  const userEmail = userInfo?.username ? `${userInfo.username}@ejupro.com` : 'liuxue@email.com';
  const targetExam = userInfo?.target_exam || '暂无目标';

  // 根据护眼模式动态设置背景色
  const pageStyle = eyeCareEnabled ? { backgroundColor: '#C7EDCC' } : {};

  return (
    <View className={styles.pageContainer} style={pageStyle}>
      <Navbar />
      <View className={styles.layoutBody}>
        <Sidebar activePage="profile" />
        
        <ScrollView className={styles.scrollArea} scrollY>
          <View className={styles.mainContent}>
            
            {/* User Info Card */}
            <View className={styles.userCard}>
              <View className={styles.avatarBox}>
                <Text className={styles.avatarIcon}>👤</Text>
              </View>
              <View className={styles.userInfo}>
                <Text className={styles.userName}>{userName}</Text>
                <Text className={styles.userEmail}>{userEmail}</Text>
                <View className={styles.tag}>
                  <Text className={styles.tagText}>{targetExam}</Text>
                </View>
              </View>
            </View>

            {/* Achievements */}
            <View className={styles.sectionCard}>
              <Text className={styles.sectionTitle}>学习成就</Text>
              <View className={styles.achievementsRow}>
                <View className={styles.achieveItem}>
                  <Text className={styles.achieveIcon} style={{ color: '#C97B4A' }}>🏆</Text>
                  <Text className={styles.achieveVal}>{profileData.stats.streakDays} 天</Text>
                  <Text className={styles.achieveLabel}>连续打卡</Text>
                </View>
                <View className={styles.achieveItem}>
                  <Text className={styles.achieveIcon} style={{ color: '#E04545' }}>🔥</Text>
                  <Text className={styles.achieveVal}>{profileData.stats.thisWeekCount} 题</Text>
                  <Text className={styles.achieveLabel}>本周刷题</Text>
                </View>
                <View className={styles.achieveItem}>
                  <Text className={styles.achieveIcon} style={{ color: '#34A853' }}>📖</Text>
                  <Text className={styles.achieveVal}>{profileData.stats.averageRate}%</Text>
                  <Text className={styles.achieveLabel}>平均正确率</Text>
                </View>
              </View>
            </View>

            {/* 30天趋势 */}
            <View className={styles.sectionCard}>
              <View className={styles.statsRow}>
                <View className={styles.statMiniItem}>
                  <Text className={styles.statMiniVal}>{profileData.stats.totalAnswered}</Text>
                  <Text className={styles.statMiniLabel}>累计答题</Text>
                </View>
                <View className={styles.statMiniDivider} />
                <View className={styles.statMiniItem}>
                  <Text className={styles.statMiniVal} style={{ color: '#34A853' }}>{profileData.stats.averageRate}%</Text>
                  <Text className={styles.statMiniLabel}>正确率</Text>
                </View>
                <View className={styles.statMiniDivider} />
                <View className={styles.statMiniItem}>
                  <Text className={styles.statMiniVal} style={{ color: '#E04545' }}>{profileData.stats.wrongCount}</Text>
                  <Text className={styles.statMiniLabel}>错题数</Text>
                </View>
              </View>
              
              <Text className={styles.chartTitle}>📈 近 30 天刷题趋势</Text>
              <View className={styles.chartWrapper}>
                {profileData.trendSvg ? (
                  <Image 
                    src={profileData.trendSvg} 
                    mode="aspectFit" 
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <Text style={{ color: '#9ca3af' }}>暂无数据</Text>
                )}
              </View>
            </View>

            {/* 历史练习记录 */}
            <View className={styles.sectionCard}>
              <Text className={styles.sectionTitle}>历史练习记录</Text>
              <View className={styles.tableContainer}>
                <View className={styles.tableHeader}>
                  <Text className={classnames(styles.th, styles.thDate)}>日期</Text>
                  <Text className={classnames(styles.th, styles.thSubject)}>科目</Text>
                  <Text className={classnames(styles.th, styles.thNum)}>题数</Text>
                  <Text className={classnames(styles.th, styles.thNum)}>正确</Text>
                  <Text className={classnames(styles.th, styles.thRate)}>正确率</Text>
                </View>
                {profileData.history.length === 0 ? (
                  <View className={styles.emptyState}>
                    <Text className={styles.emptyText}>暂无练习记录</Text>
                  </View>
                ) : (
                  profileData.history.map((record, idx) => {
                    const subject = SUBJECTS.find(s => s.id === record.subjectId);
                    return (
                      <View key={idx} className={styles.tableRow}>
                        <Text className={classnames(styles.td, styles.tdDate)}>{record.date}</Text>
                        <View className={classnames(styles.td, styles.tdSubject)}>
                          <Text className={styles.subjectTag} style={{ color: subject?.color || '#333' }}>
                            {subject?.name || '未知科目'}
                          </Text>
                        </View>
                        <Text className={classnames(styles.td, styles.tdNum)}>{record.total}</Text>
                        <Text className={classnames(styles.td, styles.tdNum, styles.textSuccess)}>{record.correct}</Text>
                        <Text className={classnames(styles.td, styles.tdRate)}>{record.rate}</Text>
                      </View>
                    );
                  })
                )}
              </View>
            </View>

            {/* Settings */}
            <View className={styles.sectionCard}>
              <View className={styles.cardHeader}>
                <Text className={styles.sectionTitle}>设置</Text>
              </View>

              <View className={styles.settingItem}>
                <View className={styles.settingLeft}>
                  <Text className={styles.settingName}>消息通知</Text>
                  <Text className={styles.settingDesc}>接收学习提醒和更新通知</Text>
                </View>
                <Switch color="#3B6EC9" checked={msgEnabled} onChange={(e) => setMsgEnabled(e.detail.value)} />
              </View>

              <View className={styles.settingItem}>
                <View className={styles.settingLeft}>
                  <Text className={styles.settingName}>护眼模式</Text>
                  <Text className={styles.settingDesc}>开启后背景将变为豆绿色</Text>
                </View>
                <Switch color="#3B6EC9" checked={eyeCareEnabled} onChange={toggleEyeCare} />
              </View>

              <View className={styles.settingItem} onClick={() => handleAction('帮助与反馈')}>
                <View className={styles.settingLeft}>
                  <Text className={styles.settingName}>帮助与反馈</Text>
                </View>
                <Text className={styles.arrow}>→</Text>
              </View>

              <View className={styles.settingItem} onClick={handleLogout}>
                <View className={styles.settingLeft}>
                  <Text className={styles.settingNameDanger}>退出登录</Text>
                </View>
                <Text className={styles.arrow}>→</Text>
              </View>

            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
