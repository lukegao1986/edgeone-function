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
        <View className={styles.logoBox}>
          <Text className={styles.logoIcon}>🎓</Text>
          <Text className={styles.logoText}>EJU Pro</Text>
        </View>
        <View className={styles.navRight}>
          <View className={styles.btnLogin} onClick={() => openAuth('login')}>登录</View>
          <View className={styles.btnRegister} onClick={() => openAuth('register')}>注册</View>
        </View>
      </View>

      <ScrollView scrollY className={styles.mainContent}>
        
        {/* Hero 区域 */}
        <View className={styles.heroSection}>
          <View className={styles.heroTextWrap}>
            <Text className={styles.heroTitle}>科学备考 EJU，\n上名校更简单。</Text>
            <Text className={styles.heroSubtitle}>
              完全免费的留考刷题神器。精选题库，智能诊断，带你沉浸式攻克文理综和数学难关。
            </Text>
            <View className={styles.heroBtn} onClick={() => openAuth('register')}>免费开启学习</View>
          </View>
          <View className={styles.heroImageWrap}>
            <View className={styles.heroImagePlaceholder}>🚀</View>
          </View>
        </View>

        {/* 核心功能区 */}
        <View className={styles.featuresSection}>
          <Text className={styles.sectionTitle}>为什么选择 EJU Pro？</Text>
          <View className={styles.featuresGrid}>
            <View className={styles.featureCard}>
              <Text className={styles.featureIcon}>📚</Text>
              <Text className={styles.featureTitle}>历年真题全覆盖</Text>
              <Text className={styles.featureDesc}>精选历年 EJU 核心真题与高频考点，告别题海战术，直击考试重点。</Text>
            </View>
            <View className={styles.featureCard}>
              <Text className={styles.featureIcon}>🤖</Text>
              <Text className={styles.featureTitle}>AI 薄弱点诊断</Text>
              <Text className={styles.featureDesc}>每次练习后自动生成能力雷达图，精准定位薄弱知识点并推荐专项练习。</Text>
            </View>
            <View className={styles.featureCard}>
              <Text className={styles.featureIcon}>✨</Text>
              <Text className={styles.featureTitle}>极简专注体验</Text>
              <Text className={styles.featureDesc}>没有广告，没有干扰。护眼模式与极简排版让你沉浸在思考的纯粹中。</Text>
            </View>
          </View>
        </View>

        {/* 考试科目区 */}
        <View className={styles.examSection}>
          <Text className={styles.sectionTitle}>支持科目</Text>
          <View className={styles.examGrid}>
            <View className={styles.examSubject}>
              <Text className={styles.subjectIcon}>📖</Text>
              <Text className={styles.subjectName}>日本語</Text>
            </View>
            <View className={styles.examSubject}>
              <Text className={styles.subjectIcon}>🌍</Text>
              <Text className={styles.subjectName}>総合科目</Text>
            </View>
            <View className={styles.examSubject}>
              <Text className={styles.subjectIcon}>📐</Text>
              <Text className={styles.subjectName}>数学 (コース1/2)</Text>
            </View>
            <View className={styles.examSubject}>
              <Text className={styles.subjectIcon}>⚗️</Text>
              <Text className={styles.subjectName}>理科 (物/化/生)</Text>
            </View>
          </View>
        </View>

        {/* 备考路径区 */}
        <View className={styles.pathSection}>
          <Text className={styles.pathTitle}>科学的备考路径</Text>
          <View className={styles.pathGrid}>
            <View className={styles.pathStep}>
              <View className={styles.stepNum}>1</View>
              <Text className={styles.stepTitle}>设定目标</Text>
              <Text>选择考期与目标院校，系统为你倒计时</Text>
            </View>
            <View className={styles.pathStep}>
              <View className={styles.stepNum}>2</View>
              <Text className={styles.stepTitle}>沉浸刷题</Text>
              <Text>分章节专项突破，做题自动批改并出解析</Text>
            </View>
            <View className={styles.pathStep}>
              <View className={styles.stepNum}>3</View>
              <Text className={styles.stepTitle}>错题复盘</Text>
              <Text>错题本集中收录，支持定期重做与记笔记</Text>
            </View>
            <View className={styles.pathStep}>
              <View className={styles.stepNum}>4</View>
              <Text className={styles.stepTitle}>能力进阶</Text>
              <Text>根据 AI 诊断填补漏洞，稳步提升正确率</Text>
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