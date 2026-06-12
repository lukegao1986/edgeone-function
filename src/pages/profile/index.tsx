import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Slider, Picker } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import styles from './index.module.scss';

export default function ProfilePage() {
  // 系统设置状态
  const [msgEnabled, setMsgEnabled] = useState(true);
  const [eyeCareEnabled, setEyeCareEnabled] = useState(false);

  // 备考控制台
  const [prepConfig, setPrepConfig] = useState({
    examSession: '2025年11月',
    comprehensiveSubject: '文综',
    mathSubject: 'コース1 (文科)',
    targetUniversity: '早稻田大学',
    dailyGoal: 20
  });
  const [isEditingPrep, setIsEditingPrep] = useState(false);
  const uniList = ['东京大学', '京都大学', '早稻田大学', '庆应义塾大学', '大阪大学'];

  // 学习偏好设置
  const [learningPrefs, setLearningPrefs] = useState({
    reminderTime: '09:00、21:00',
    reviewInterval: '1-3-7 天 (标准)',
    masteryThreshold: 3,
    difficulty: '循序渐进'
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
              <View className={styles.cardHeaderComplex}>
                <View className={styles.headerTitleWrap}>
                  <View className={styles.headerIconBox}><Text>🎓</Text></View>
                  <View className={styles.headerTexts}>
                    <Text className={styles.headerTitle}>备考控制台</Text>
                    <Text className={styles.headerSub}>配置你的考试计划，系统将据此调整推荐节奏</Text>
                  </View>
                </View>
                {isEditingPrep ? (
                  <Text className={styles.editingText}>编辑中...</Text>
                ) : (
                  <Text className={styles.editText} onClick={() => setIsEditingPrep(true)}>修改配置</Text>
                )}
              </View>

              {isEditingPrep ? (
                <View className={styles.editContent}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>考试场次</Text>
                    <View className={styles.selectBox}>
                      <Text>{prepConfig.examSession}</Text>
                      <Text style={{ color: '#9CA3B0' }}>▾</Text>
                    </View>
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>综合科目 (二选一)</Text>
                    <View className={styles.segmentControl}>
                      <View 
                        className={classnames(styles.segmentItem, prepConfig.comprehensiveSubject === '文综' && styles.segmentActive)}
                        onClick={() => setPrepConfig({...prepConfig, comprehensiveSubject: '文综'})}
                      >文综</View>
                      <View 
                        className={classnames(styles.segmentItem, prepConfig.comprehensiveSubject === '理综' && styles.segmentActive)}
                        onClick={() => setPrepConfig({...prepConfig, comprehensiveSubject: '理综'})}
                      >理综</View>
                    </View>
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>数学 (二选一)</Text>
                    <View className={styles.segmentControl}>
                      <View 
                        className={classnames(styles.segmentItem, prepConfig.mathSubject === 'コース1 (文科)' && styles.segmentActive)}
                        onClick={() => setPrepConfig({...prepConfig, mathSubject: 'コース1 (文科)'})}
                      >コース1 (文科)</View>
                      <View 
                        className={classnames(styles.segmentItem, prepConfig.mathSubject === 'コース2 (理科)' && styles.segmentActive)}
                        onClick={() => setPrepConfig({...prepConfig, mathSubject: 'コース2 (理科)'})}
                      >コース2 (理科)</View>
                    </View>
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>目标大学 (可选)</Text>
                    <Picker 
                      mode="selector" 
                      range={uniList} 
                      onChange={(e) => setPrepConfig({...prepConfig, targetUniversity: uniList[e.detail.value as number]})}
                    >
                      <View className={styles.selectBox}>
                        <Text>{prepConfig.targetUniversity}</Text>
                        <Text style={{ color: '#9CA3B0' }}>▾</Text>
                      </View>
                    </Picker>
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>每日目标题数</Text>
                    <View className={styles.sliderWrap}>
                      <Slider 
                        className={styles.slider}
                        value={prepConfig.dailyGoal} 
                        min={5} max={100} 
                        activeColor="#3B6EC9" 
                        backgroundColor="#ECEEF2" 
                        blockColor="#3B6EC9" 
                        blockSize={24}
                        onChanging={(e) => setPrepConfig({...prepConfig, dailyGoal: parseInt(e.detail.value as any)})}
                        onChange={(e) => setPrepConfig({...prepConfig, dailyGoal: parseInt(e.detail.value as any)})}
                      />
                      <Text className={styles.sliderVal}>{prepConfig.dailyGoal}题</Text>
                    </View>
                  </View>

                  <View className={styles.actionBtns}>
                    <View className={styles.btnCancel} onClick={() => setIsEditingPrep(false)}>取消</View>
                    <View className={styles.btnSave} onClick={handleSavePrep}>保存配置</View>
                  </View>
                </View>
              ) : (
                <View className={styles.viewContent}>
                  <View className={styles.statsRow}>
                    <View className={styles.statItem}>
                      <Text className={styles.statLabel}>考试场次</Text>
                      <Text className={styles.statValue}>{prepConfig.examSession}</Text>
                      <Text className={styles.statSub}>2025-11-09</Text>
                    </View>
                    <View className={styles.statDivider} />
                    <View className={styles.statItem}>
                      <Text className={styles.statLabel}>倒计时</Text>
                      <View className={styles.statValue}>
                        <Text className={styles.statValueRed}>0</Text>
                        <Text style={{ fontSize: '24px', fontWeight: 'normal' }}>天</Text>
                      </View>
                    </View>
                    <View className={styles.statDivider} />
                    <View className={styles.statItem}>
                      <Text className={styles.statLabel}>每日目标</Text>
                      <View className={styles.statValue}>
                        <Text className={styles.statValueBlue}>{prepConfig.dailyGoal}</Text>
                        <Text style={{ fontSize: '24px', fontWeight: 'normal' }}>题/天</Text>
                      </View>
                    </View>
                  </View>

                  <View className={styles.subjectCards}>
                    <View className={classnames(styles.subCard, styles.subCardWhite)}>
                      <View className={styles.subCardTitle}>
                        <Text>📖</Text><Text>日语</Text>
                      </View>
                      <Text className={classnames(styles.subTag, styles.subTagGreen)}>必考</Text>
                    </View>
                    <View className={classnames(styles.subCard, styles.subCardGreen)}>
                      <View className={styles.subCardTitle}>
                        <Text>⚗</Text><Text>{prepConfig.comprehensiveSubject}</Text>
                      </View>
                      <Text className={styles.subDesc}>综合科目</Text>
                    </View>
                    <View className={classnames(styles.subCard, styles.subCardPurple)}>
                      <View className={styles.subCardTitle}>
                        <Text>☸</Text><Text>数学{prepConfig.mathSubject.split(' ')[0]}</Text>
                      </View>
                      <Text className={styles.subDesc}>数学</Text>
                    </View>
                  </View>

                  <View className={styles.targetUni}>
                    <Text>🎓</Text>
                    <Text>目标大学:</Text>
                    <Text className={styles.targetUniVal}>{prepConfig.targetUniversity}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* 学习偏好设置 */}
            <View className={styles.sectionCard}>
              <View className={styles.cardHeaderComplex}>
                <View className={styles.headerTitleWrap}>
                  <View className={classnames(styles.headerIconBox, styles.headerIconBoxYellow)}><Text>🧠</Text></View>
                  <View className={styles.headerTexts}>
                    <Text className={styles.headerTitle}>学习偏好</Text>
                    <Text className={styles.headerSub}>定制你的学习节奏和复习策略</Text>
                  </View>
                </View>
                {isEditingPrefs ? (
                  <Text className={styles.editingText}>编辑中...</Text>
                ) : (
                  <Text className={styles.editText} onClick={() => setIsEditingPrefs(true)}>调整偏好</Text>
                )}
              </View>

              {isEditingPrefs ? (
                <View className={styles.editContent}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>每日提醒时间</Text>
                    <View className={styles.timeTags}>
                      <View className={styles.timeTag}>09:00 <Text style={{ color: '#9CA3B0' }}>⏱</Text></View>
                      <View className={styles.timeTag}>21:00 <Text style={{ color: '#9CA3B0' }}>⏱</Text></View>
                    </View>
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>薄弱知识复习间隔</Text>
                    <View className={styles.listOptions}>
                      <View 
                        className={classnames(styles.listOption, learningPrefs.reviewInterval === '1-3-7 天 (标准)' && styles.listOptionActive)}
                        onClick={() => setLearningPrefs({...learningPrefs, reviewInterval: '1-3-7 天 (标准)'})}
                      >1-3-7 天 (标准)</View>
                      <View 
                        className={classnames(styles.listOption, learningPrefs.reviewInterval === '1-2-4-7 天 (密集)' && styles.listOptionActive)}
                        onClick={() => setLearningPrefs({...learningPrefs, reviewInterval: '1-2-4-7 天 (密集)'})}
                      >1-2-4-7 天 (密集)</View>
                      <View 
                        className={classnames(styles.listOption, learningPrefs.reviewInterval === '2-5-10 天 (宽松)' && styles.listOptionActive)}
                        onClick={() => setLearningPrefs({...learningPrefs, reviewInterval: '2-5-10 天 (宽松)'})}
                      >2-5-10 天 (宽松)</View>
                    </View>
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>错题掌握阈值 (连续答对几次移除错题)</Text>
                    <View className={styles.sliderWrap}>
                      <Slider 
                        className={styles.slider}
                        value={learningPrefs.masteryThreshold} 
                        min={1} max={5} 
                        activeColor="#3B6EC9" 
                        backgroundColor="#ECEEF2" 
                        blockColor="#3B6EC9" 
                        blockSize={24}
                        onChanging={(e) => setLearningPrefs({...learningPrefs, masteryThreshold: parseInt(e.detail.value as any)})}
                        onChange={(e) => setLearningPrefs({...learningPrefs, masteryThreshold: parseInt(e.detail.value as any)})}
                      />
                      <Text className={styles.sliderVal}>{learningPrefs.masteryThreshold}次</Text>
                    </View>
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>推荐难度偏好</Text>
                    <View className={styles.diffControl}>
                      <View 
                        className={classnames(styles.diffItem, learningPrefs.difficulty === '循序渐进' && styles.diffActive)}
                        onClick={() => setLearningPrefs({...learningPrefs, difficulty: '循序渐进'})}
                      >
                        <View className={styles.diffTitle}>循序渐进</View>
                        <View className={styles.diffSub}>从基础到进阶逐步推进</View>
                      </View>
                      <View 
                        className={classnames(styles.diffItem, learningPrefs.difficulty === '随机挑战' && styles.diffActive)}
                        onClick={() => setLearningPrefs({...learningPrefs, difficulty: '随机挑战'})}
                      >
                        <View className={styles.diffTitle}>随机挑战</View>
                        <View className={styles.diffSub}>混合难度随机出题</View>
                      </View>
                    </View>
                  </View>

                  <View className={styles.actionBtns}>
                    <View className={styles.btnCancel} onClick={() => setIsEditingPrefs(false)}>取消</View>
                    <View className={styles.btnSave} onClick={handleSavePrefs}>保存偏好</View>
                  </View>
                </View>
              ) : (
                <View className={styles.viewContent}>
                  <View className={styles.prefGrid}>
                    <View className={styles.prefItem}>
                      <View className={styles.prefHeader}><Text>⏱</Text> 每日提醒</View>
                      <View className={styles.prefVal}>{learningPrefs.reminderTime}</View>
                    </View>
                    <View className={styles.prefItem}>
                      <View className={styles.prefHeader}><Text>💡</Text> 复习间隔</View>
                      <View className={styles.prefVal}>{learningPrefs.reviewInterval}</View>
                    </View>
                    <View className={styles.prefItem}>
                      <View className={styles.prefHeader}><Text>✓</Text> 掌握阈值</View>
                      <View className={styles.prefVal}>连续答对 {learningPrefs.masteryThreshold} 次移除错题</View>
                    </View>
                    <View className={styles.prefItem}>
                      <View className={styles.prefHeader}><Text>⚖</Text> 难度偏好</View>
                      <View className={styles.prefVal}>{learningPrefs.difficulty}</View>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* 系统设置 */}
            <View className={styles.sectionCard}>
              <View className={styles.cardHeader}>
                <Text className={styles.headerTitle}>系统设置</Text>
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
