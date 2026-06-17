import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import AuthModal from '@/components/AuthModal';
import styles from './index.module.scss';

export default function LandingPage() {
  const [authVisible, setAuthVisible] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // 如果已经登录，直接去大厅
  useEffect(() => {
    const userInfo = Taro.getStorageSync('userInfo');
    if (userInfo) {
      Taro.switchTab({ url: '/pages/dashboard/index' });
    }
  }, []);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthVisible(true);
  };

  const handleAuthSuccess = () => {
    setAuthVisible(false);
    Taro.switchTab({ url: '/pages/dashboard/index' });
  };

  return (
    <View className={styles.pageContainer}>
      {/* 顶部固定导航 */}
      <View className={styles.header}>
        <View className={styles.headerContainer}>
          <View className={styles.logoBox}>
            <Text className={styles.logoIcon}>🎓</Text>
            <Text className={styles.logoText}>EJU Pro</Text>
          </View>
          <View className={styles.navRight}>
            <View className={styles.btnLogin} onClick={() => openAuth('login')}>登录</View>
            <View className={styles.btnRegister} onClick={() => openAuth('register')}>注册</View>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.mainContent}>
        
        {/* Hero 区域 */}
        <View className={styles.heroSection}>
          <View className={styles.heroContainer}>
            <View className={styles.heroTextWrap}>
              <View className={styles.heroTag}>
                <Text className={styles.heroTagIcon}>✨</Text>
                <Text>2025年度 EJU备考利器</Text>
              </View>
              <Text className={styles.heroTitle}>为EJU考生<br/><Text className={styles.heroTitleHighlight}>量身打造</Text>的智能刷题平台</Text>
              <Text className={styles.heroSubtitle}>
                覆盖日语、文综、数学、理科全科题库。AI薄弱点诊断、知识图谱追踪、全真模考——让每一分钟备考都高效。
              </Text>
              <View className={styles.heroActions}>
                <View className={styles.heroBtn} onClick={() => openAuth('register')}>
                  免费开始 <Text className={styles.arrowIcon}>→</Text>
                </View>
                <View className={styles.heroBtnOutline} onClick={() => openAuth('login')}>
                  已有账号？登录
                </View>
              </View>
              <View className={styles.heroFeatures}>
                <View className={styles.heroFeatureItem}>
                  <Text className={styles.checkIcon}>✓</Text>全科题库
                </View>
                <View className={styles.heroFeatureItem}>
                  <Text className={styles.checkIcon}>✓</Text>AI诊断
                </View>
                <View className={styles.heroFeatureItem}>
                  <Text className={styles.checkIcon}>✓</Text>真题模考
                </View>
              </View>
            </View>
            <View className={styles.heroImageWrap}>
              <View className={styles.mockDashboardContainer}>
                {/* 模拟的 Dashboard 界面 */}
                <View className={styles.mockDashboardCard}>
                  <View className={styles.mockWindowControls}>
                    <View className={styles.mockDotRed} />
                    <View className={styles.mockDotYellow} />
                    <View className={styles.mockDotGreen} />
                    <Text className={styles.mockWindowTitle}>EJU Pro · 学习大厅</Text>
                  </View>
                  
                  <View className={styles.mockStatsGrid}>
                    <View className={styles.mockStatItem}>
                      <Text className={styles.mockStatVal}>12</Text>
                      <Text className={styles.mockStatLabel}>今日刷题</Text>
                    </View>
                    <View className={styles.mockStatItem}>
                      <Text className={styles.mockStatVal}>1286</Text>
                      <Text className={styles.mockStatLabel}>累计刷题</Text>
                    </View>
                    <View className={styles.mockStatItem}>
                      <Text className={styles.mockStatVal}>78%</Text>
                      <Text className={styles.mockStatLabel}>正确率</Text>
                    </View>
                    <View className={styles.mockStatItem}>
                      <Text className={styles.mockStatVal}>5天</Text>
                      <Text className={styles.mockStatLabel}>连续学习</Text>
                    </View>
                  </View>

                  <View className={styles.mockProgressSection}>
                    <Text className={styles.mockProgressLabel}>预定进度 100% · 实际进度 64%</Text>
                    <View className={styles.mockProgressBarBg}>
                      <View className={styles.mockProgressBarFill} style={{ width: '64%' }} />
                    </View>
                  </View>

                  <View className={styles.mockSubjectGrid}>
                    <View className={styles.mockSubjectItemJapanese}>
                      <View className={styles.mockRingJapanese} />
                      <Text className={styles.mockSubjectLabel}>日语 75%</Text>
                    </View>
                    <View className={styles.mockSubjectItemMath}>
                      <View className={styles.mockRingMath} />
                      <Text className={styles.mockSubjectLabel}>数学 68%</Text>
                    </View>
                    <View className={styles.mockSubjectItemScience}>
                      <View className={styles.mockRingScience} />
                      <Text className={styles.mockSubjectLabel}>理综 72%</Text>
                    </View>
                  </View>
                </View>

                {/* 悬浮小组件 */}
                <View className={styles.mockFloatingStreak}>+5 连续打卡</View>
                <View className={styles.mockFloatingAccuracy}>
                  <Text className={styles.mockChartIcon}>📊</Text> 本周正确率 82%
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 核心功能区 */}
        <View className={styles.featuresSection} id="features">
          <View className={styles.featuresHeader}>
            <Text className={styles.featuresTitle}>全方位备考支持</Text>
            <Text className={styles.featuresSubtitle}>从题库练习到薄弱点诊断，从知识图谱到全真模考，每一步都为你精心设计</Text>
          </View>
          <View className={styles.featuresGrid}>
            {/* 全科覆盖 */}
            <View className={styles.featureCard}>
              <View className={classnames(styles.featureIconWrap, styles.iconBlue)}>
                <Image className={styles.featureIconImg} src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='%233B6EC9' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 7v14'/%3E%3Cpath d='M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z'/%3E%3C/svg%3E" />
              </View>
              <Text className={styles.featureCardTitle}>全科覆盖</Text>
              <Text className={styles.featureCardDesc}>日语、文综、数学（コース1/2）、理科（物理/化学/生物），五大科目系统化题库</Text>
              <View className={classnames(styles.featureLearnMore, styles.textBlue)}>
                了解更多 <Text className={styles.chevronIcon}>&gt;</Text>
              </View>
            </View>

            {/* 薄弱点诊断 */}
            <View className={styles.featureCard}>
              <View className={classnames(styles.featureIconWrap, styles.iconGreen)}>
                <Image className={styles.featureIconImg} src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='%2334A853' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Ccircle cx='12' cy='12' r='6'/%3E%3Ccircle cx='12' cy='12' r='2'/%3E%3C/svg%3E" />
              </View>
              <Text className={styles.featureCardTitle}>薄弱点诊断</Text>
              <Text className={styles.featureCardDesc}>AI智能分析每次答题数据，精准定位知识盲区，生成个性化复习方案</Text>
              <View className={classnames(styles.featureLearnMore, styles.textGreen)}>
                了解更多 <Text className={styles.chevronIcon}>&gt;</Text>
              </View>
            </View>

            {/* 进度追踪 */}
            <View className={styles.featureCard}>
              <View className={classnames(styles.featureIconWrap, styles.iconPurple)}>
                <Image className={styles.featureIconImg} src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='%238B6DC9' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M16 7h6v6'/%3E%3Cpath d='m22 7-8.5 8.5-5-5L2 17'/%3E%3C/svg%3E" />
              </View>
              <Text className={styles.featureCardTitle}>进度追踪</Text>
              <Text className={styles.featureCardDesc}>可视化学习进度追踪，预定vs实际双轨对比，选考科目环形进度一目了然</Text>
              <View className={classnames(styles.featureLearnMore, styles.textPurple)}>
                了解更多 <Text className={styles.chevronIcon}>&gt;</Text>
              </View>
            </View>

            {/* 同期竞速 */}
            <View className={styles.featureCard}>
              <View className={classnames(styles.featureIconWrap, styles.iconOrange)}>
                <Image className={styles.featureIconImg} src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='%23C97B4A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/%3E%3Cpath d='M16 3.128a4 4 0 0 1 0 7.744'/%3E%3Cpath d='M22 21v-2a4 4 0 0 0-3-3.87'/%3E%3Ccircle cx='9' cy='7' r='4'/%3E%3C/svg%3E" />
              </View>
              <Text className={styles.featureCardTitle}>同期竞速</Text>
              <Text className={styles.featureCardDesc}>与全站考生实时PK刷题数和正确率，激发学习动力，查看自己的排名变化</Text>
              <View className={classnames(styles.featureLearnMore, styles.textOrange)}>
                了解更多 <Text className={styles.chevronIcon}>&gt;</Text>
              </View>
            </View>

            {/* 知识地图 */}
            <View className={styles.featureCard}>
              <View className={classnames(styles.featureIconWrap, styles.iconRed)}>
                <Image className={styles.featureIconImg} src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='%23E04545' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 18V5'/%3E%3Cpath d='M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4'/%3E%3Cpath d='M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5'/%3E%3Cpath d='M17.997 5.125a4 4 0 0 1 2.526 5.77'/%3E%3Cpath d='M18 18a4 4 0 0 0 2-7.464'/%3E%3Cpath d='M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517'/%3E%3Cpath d='M6 18a4 4 0 0 1-2-7.464'/%3E%3Cpath d='M6.003 5.125a4 4 0 0 0-2.526 5.77'/%3E%3C/svg%3E" />
              </View>
              <Text className={styles.featureCardTitle}>知识地图</Text>
              <Text className={styles.featureCardDesc}>物理/化学/数学等科目的知识图谱，绿黄红三色标记掌握程度，虚线连接知识依赖</Text>
              <View className={classnames(styles.featureLearnMore, styles.textRed)}>
                了解更多 <Text className={styles.chevronIcon}>&gt;</Text>
              </View>
            </View>

            {/* 全真模考 */}
            <View className={styles.featureCard}>
              <View className={classnames(styles.featureIconWrap, styles.iconTeal)}>
                <Image className={styles.featureIconImg} src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='%231A7A5E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526'/%3E%3Ccircle cx='12' cy='8' r='6'/%3E%3C/svg%3E" />
              </View>
              <Text className={styles.featureCardTitle}>全真模考</Text>
              <Text className={styles.featureCardDesc}>历年真题+模拟试卷，倒计时考试环境，交卷后AI薄弱点分析+推荐学习资源</Text>
              <View className={classnames(styles.featureLearnMore, styles.textTeal)}>
                了解更多 <Text className={styles.chevronIcon}>&gt;</Text>
              </View>
            </View>
          </View>
        </View>



        {/* 备考路径区 */}
        <View className={styles.pathSection}>
          <View className={styles.pathHeader}>
            <Text className={styles.pathTitle}>科学备考路径</Text>
            <Text className={styles.pathSubtitle}>四步闭环，让备考事半功倍</Text>
          </View>
          <View className={styles.pathGrid}>
            <View className={styles.pathStep}>
              <View className={classnames(styles.stepNum, styles.bgBlue)}>01</View>
              <Text className={styles.stepTitle}>诊断定位</Text>
              <Text className={styles.stepDesc}>通过全真模考或专项练习，AI智能诊断薄弱知识点</Text>
              <View className={styles.stepArrow}>
                <Image className={styles.arrowImg} src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23C4C9D4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12h14'/%3E%3Cpath d='m12 5 7 7-7 7'/%3E%3C/svg%3E" />
              </View>
            </View>
            <View className={styles.pathStep}>
              <View className={classnames(styles.stepNum, styles.bgGreen)}>02</View>
              <Text className={styles.stepTitle}>专项突破</Text>
              <Text className={styles.stepDesc}>针对薄弱点进行定向刷题，配合笔记功能记录疑点</Text>
              <View className={styles.stepArrow}>
                <Image className={styles.arrowImg} src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23C4C9D4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12h14'/%3E%3Cpath d='m12 5 7 7-7 7'/%3E%3C/svg%3E" />
              </View>
            </View>
            <View className={styles.pathStep}>
              <View className={classnames(styles.stepNum, styles.bgPurple)}>03</View>
              <Text className={styles.stepTitle}>错题复盘</Text>
              <Text className={styles.stepDesc}>错题本自动归类，间隔重复提醒，直到完全掌握</Text>
              <View className={styles.stepArrow}>
                <Image className={styles.arrowImg} src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23C4C9D4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12h14'/%3E%3Cpath d='m12 5 7 7-7 7'/%3E%3C/svg%3E" />
              </View>
            </View>
            <View className={styles.pathStep}>
              <View className={classnames(styles.stepNum, styles.bgOrange)}>04</View>
              <Text className={styles.stepTitle}>模考检验</Text>
              <Text className={styles.stepDesc}>定期全真模考检验复习成果，循环迭代提升</Text>
            </View>
          </View>
        </View>

        {/* 考生反馈区 */}
        <View className={styles.testimonialSection}>
          <Text className={styles.sectionTitle}>听听大家怎么说</Text>
          <View className={styles.testimonialGrid}>
            <View className={styles.testimonialCard}>
              <Text className={styles.quoteText}>"排版非常舒服，化学方程式和各种图表显示得很完美。帮我省去了整理纸质错题本的大把时间。"</Text>
              <View className={styles.authorInfo}>
                <View className={styles.authorAvatar}>👨‍🎓</View>
                <View className={styles.authorMeta}>
                  <Text className={styles.authorName}>李同学</Text>
                  <Text className={styles.authorSchool}>已合格 东京工业大学</Text>
                </View>
              </View>
            </View>
            <View className={styles.testimonialCard}>
              <Text className={styles.quoteText}>"AI 诊断真的绝了！之前文综总是凭感觉选，它直接帮我指出了我在历史板块的明显短板。"</Text>
              <View className={styles.authorInfo}>
                <View className={styles.authorAvatar}>👩‍🎓</View>
                <View className={styles.authorMeta}>
                  <Text className={styles.authorName}>张同学</Text>
                  <Text className={styles.authorSchool}>已合格 早稻田大学</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View className={styles.ctaSection}>
          <Text className={styles.ctaTitle}>准备好拿高分了吗？</Text>
          <Text className={styles.ctaSubtitle}>今天就开始你的 EJU 备考计划</Text>
          <View className={styles.heroBtn} onClick={() => openAuth('register')}>立即免费注册</View>
        </View>

        <View className={styles.footer}>
          <Text>© 2026 EJU Pro. All rights reserved.</Text>
        </View>

      </ScrollView>

      {/* 弹窗 */}
      <AuthModal 
        visible={authVisible}
        defaultMode={authMode}
        onClose={() => setAuthVisible(false)}
        onSuccess={handleAuthSuccess}
      />
    </View>
  );
}