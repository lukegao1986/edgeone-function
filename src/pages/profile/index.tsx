import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import styles from './index.module.scss';

export default function ProfilePage() {
  const handleLogout = () => {
    Taro.reLaunch({ url: '/pages/index/index' });
  };

  const handleAction = (action: string) => {
    Taro.showToast({ title: `${action}功能开发中`, icon: 'none' });
  };

  return (
    <View className={styles.pageContainer}>
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
                <Text className={styles.userName}>留学小生</Text>
                <Text className={styles.userEmail}>liuxue@email.com</Text>
                <View className={styles.tag}>
                  <Text className={styles.tagText}>备考 EJU 2026年11月</Text>
                </View>
              </View>
            </View>

            {/* Achievements */}
            <View className={styles.sectionCard}>
              <Text className={styles.sectionTitle}>学习成就</Text>
              <View className={styles.achievementsRow}>
                <View className={styles.achieveItem}>
                  <Text className={styles.achieveIcon} style={{ color: '#C97B4A' }}>🏆</Text>
                  <Text className={styles.achieveVal}>12 天</Text>
                  <Text className={styles.achieveLabel}>连续打卡</Text>
                </View>
                <View className={styles.achieveItem}>
                  <Text className={styles.achieveIcon} style={{ color: '#E04545' }}>🔥</Text>
                  <Text className={styles.achieveVal}>85 题</Text>
                  <Text className={styles.achieveLabel}>本周刷题</Text>
                </View>
                <View className={styles.achieveItem}>
                  <Text className={styles.achieveIcon} style={{ color: '#34A853' }}>📖</Text>
                  <Text className={styles.achieveVal}>78%</Text>
                  <Text className={styles.achieveLabel}>平均正确率</Text>
                </View>
              </View>
            </View>

            {/* Settings */}
            <View className={styles.sectionCard}>
              <View className={styles.cardHeader}>
                <Text className={styles.sectionTitle}>设置</Text>
              </View>

              <View className={styles.settingItem} onClick={() => handleAction('消息通知')}>
                <View className={styles.settingLeft}>
                  <Text className={styles.settingName}>消息通知</Text>
                  <Text className={styles.settingDesc}>接收学习提醒和更新通知</Text>
                </View>
                <Text className={styles.arrow}>→</Text>
              </View>

              <View className={styles.settingItem} onClick={() => handleAction('护眼模式')}>
                <View className={styles.settingLeft}>
                  <Text className={styles.settingName}>护眼模式</Text>
                  <Text className={styles.settingDesc}>开启后降低屏幕蓝光</Text>
                </View>
                <Text className={styles.arrow}>→</Text>
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
