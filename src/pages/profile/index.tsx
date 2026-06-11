import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Input, Picker } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import styles from './index.module.scss';

export default function ProfilePage() {
  // 系统设置状态
  const [msgEnabled, setMsgEnabled] = useState(true);
  const [eyeCareEnabled, setEyeCareEnabled] = useState(false);

  // 备考控制台
  const [prepConfig, setPrepConfig] = useState({
    examSession: '2025年11月 EJU',
    subjects: '文科综合, 数学1',
    targetUniversity: '早稻田大学',
    dailyGoal: '50'
  });
  const [isEditingPrep, setIsEditingPrep] = useState(false);

  // 学习偏好设置
  const [learningPrefs, setLearningPrefs] = useState({
    reminderTime: '20:00',
    reviewInterval: '1, 2, 4, 7天',
    masteryThreshold: '80',
    difficulty: '中等'
  });
  const [isEditingPrefs, setIsEditingPrefs] = useState(false);

  useDidShow(() => {
    // 恢复护眼模式状态
    const eyeCare = Taro.getStorageSync('eyeCareEnabled');
    setEyeCareEnabled(!!eyeCare);

    const savedPrep = Taro.getStorageSync('prepConfig');
    if (savedPrep) setPrepConfig(savedPrep);

    const savedPrefs = Taro.getStorageSync('learningPrefs');
    if (savedPrefs) setLearningPrefs(savedPrefs);
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

  const handleSavePrep = () => {
    Taro.setStorageSync('prepConfig', prepConfig);
    setIsEditingPrep(false);
    Taro.showToast({ title: '保存成功', icon: 'success' });
  };

  const handleSavePrefs = () => {
    Taro.setStorageSync('learningPrefs', learningPrefs);
    setIsEditingPrefs(false);
    Taro.showToast({ title: '保存成功', icon: 'success' });
  };

  const userInfo = Taro.getStorageSync('userInfo');
  const userName = userInfo?.nickname || userInfo?.username || '留学小生';
  const userEmail = userInfo?.username ? `${userInfo.username}@ejupro.com` : 'liuxue@email.com';
  const targetExam = userInfo?.target_exam || prepConfig.targetUniversity || '暂无目标';

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

            {/* 备考控制台 */}
            <View className={styles.sectionCard}>
              <View className={styles.cardHeaderWithBtn}>
                <Text className={styles.sectionTitleNoPadding}>备考控制台</Text>
                {isEditingPrep ? (
                  <Text className={styles.editBtnPrimary} onClick={handleSavePrep}>保存</Text>
                ) : (
                  <Text className={styles.editBtn} onClick={() => setIsEditingPrep(true)}>✏️ 编辑</Text>
                )}
              </View>
              <View className={styles.formGrid}>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>考试场次</Text>
                  {isEditingPrep ? (
                    <Input className={styles.formInput} value={prepConfig.examSession} onInput={(e) => setPrepConfig({...prepConfig, examSession: e.detail.value})} />
                  ) : (
                    <Text className={styles.formValue}>{prepConfig.examSession}</Text>
                  )}
                </View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>选科配置</Text>
                  {isEditingPrep ? (
                    <Input className={styles.formInput} value={prepConfig.subjects} onInput={(e) => setPrepConfig({...prepConfig, subjects: e.detail.value})} />
                  ) : (
                    <Text className={styles.formValue}>{prepConfig.subjects}</Text>
                  )}
                </View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>目标大学</Text>
                  {isEditingPrep ? (
                    <Input className={styles.formInput} value={prepConfig.targetUniversity} onInput={(e) => setPrepConfig({...prepConfig, targetUniversity: e.detail.value})} />
                  ) : (
                    <Text className={styles.formValue}>{prepConfig.targetUniversity}</Text>
                  )}
                </View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>每日目标(题)</Text>
                  {isEditingPrep ? (
                    <Input className={styles.formInput} type="number" value={prepConfig.dailyGoal} onInput={(e) => setPrepConfig({...prepConfig, dailyGoal: e.detail.value})} />
                  ) : (
                    <Text className={styles.formValue}>{prepConfig.dailyGoal} 题</Text>
                  )}
                </View>
              </View>
            </View>

            {/* 学习偏好设置 */}
            <View className={styles.sectionCard}>
              <View className={styles.cardHeaderWithBtn}>
                <Text className={styles.sectionTitleNoPadding}>学习偏好设置</Text>
                {isEditingPrefs ? (
                  <Text className={styles.editBtnPrimary} onClick={handleSavePrefs}>保存</Text>
                ) : (
                  <Text className={styles.editBtn} onClick={() => setIsEditingPrefs(true)}>✏️ 编辑</Text>
                )}
              </View>
              <View className={styles.formGrid}>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>提醒时间</Text>
                  {isEditingPrefs ? (
                    <Input className={styles.formInput} value={learningPrefs.reminderTime} onInput={(e) => setLearningPrefs({...learningPrefs, reminderTime: e.detail.value})} placeholder="例如: 20:00" />
                  ) : (
                    <Text className={styles.formValue}>{learningPrefs.reminderTime}</Text>
                  )}
                </View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>复习间隔</Text>
                  {isEditingPrefs ? (
                    <Input className={styles.formInput} value={learningPrefs.reviewInterval} onInput={(e) => setLearningPrefs({...learningPrefs, reviewInterval: e.detail.value})} placeholder="例如: 1, 2, 4, 7天" />
                  ) : (
                    <Text className={styles.formValue}>{learningPrefs.reviewInterval}</Text>
                  )}
                </View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>掌握阈值(%)</Text>
                  {isEditingPrefs ? (
                    <Input className={styles.formInput} type="number" value={learningPrefs.masteryThreshold} onInput={(e) => setLearningPrefs({...learningPrefs, masteryThreshold: e.detail.value})} placeholder="例如: 80" />
                  ) : (
                    <Text className={styles.formValue}>正确率 {'>'} {learningPrefs.masteryThreshold}%</Text>
                  )}
                </View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>难度偏好</Text>
                  {isEditingPrefs ? (
                    <Picker mode="selector" range={['简单', '中等', '困难']} onChange={(e) => {
                      const arr = ['简单', '中等', '困难'];
                      setLearningPrefs({...learningPrefs, difficulty: arr[e.detail.value as number]});
                    }}>
                      <View className={styles.formPicker}>
                        <Text>{learningPrefs.difficulty}</Text>
                        <Text style={{ color: '#9CA3B0' }}>▾</Text>
                      </View>
                    </Picker>
                  ) : (
                    <Text className={styles.formValue}>{learningPrefs.difficulty}</Text>
                  )}
                </View>
              </View>
            </View>

            {/* 系统设置 */}
            <View className={styles.sectionCard}>
              <View className={styles.cardHeader}>
                <Text className={styles.sectionTitleNoPadding}>系统设置</Text>
              </View>

              <View className={styles.settingItem}>
                <View className={styles.settingLeft}>
                  <Text className={styles.settingName}>消息通知</Text>
                  <Text className={styles.settingDesc}>接收系统更新通知</Text>
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
