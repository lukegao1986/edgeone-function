import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface AIAnalysisModalProps {
  visible: boolean;
  total: number;
  correct: number;
  onClose: () => void;
  onViewErrors: () => void;
  onAskQuestion: () => void;
}

export default function AIAnalysisModal({ 
  visible, 
  total, 
  correct, 
  onClose,
  onViewErrors,
  onAskQuestion
}: AIAnalysisModalProps) {
  const [loading, setLoading] = useState(true);

  const wrong = total - correct;
  const rate = total > 0 ? Math.round((correct / total) * 100) : 0;

  useEffect(() => {
    if (visible) {
      setLoading(true);
      // 模拟请求大模型分析数据
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View className={styles.modalOverlay}>
      <View className={styles.modalContainer}>
        <View className={styles.modalHeader}>
          <View className={styles.headerTitleWrap}>
            <Text className={styles.headerIcon}>✨</Text>
            <Text className={styles.headerTitle}>AI 诊断报告</Text>
          </View>
          <View className={styles.closeBtn} onClick={onClose}>×</View>
        </View>

        {loading ? (
          <View className={styles.loadingState}>
            <View className={styles.spinner} />
            <Text className={styles.loadingText}>AI 正在分析您的答题数据...</Text>
          </View>
        ) : (
          <ScrollView scrollY className={styles.modalContent}>
            
            {/* 成绩总览 */}
            <View className={styles.statsSection}>
              <View className={styles.statBox}>
                <Text className={styles.statVal}>{total}</Text>
                <Text className={styles.statLabel}>总题数</Text>
              </View>
              <View className={styles.statBox}>
                <Text className={classnames(styles.statVal, styles.textSuccess)}>{correct}</Text>
                <Text className={styles.statLabel}>正确</Text>
              </View>
              <View className={styles.statBox}>
                <Text className={classnames(styles.statVal, styles.textDanger)}>{wrong}</Text>
                <Text className={styles.statLabel}>错误</Text>
              </View>
              <View className={styles.statBox}>
                <Text className={styles.statVal}>{rate}%</Text>
                <Text className={styles.statLabel}>正确率</Text>
              </View>
            </View>

            {/* 薄弱点诊断 */}
            <View className={styles.diagnosisSection}>
              <Text className={styles.sectionTitle}>🎯 薄弱点诊断</Text>
              
              <View className={styles.issueCard}>
                <View className={styles.issueHeader}>
                  <Text className={styles.issueTag}>基础概念</Text>
                  <Text className={styles.issueName}>牛顿第二定律理解偏差</Text>
                </View>
                <Text className={styles.issueDesc}>
                  分析：在涉及斜面受力分析的题目中，未能正确分解重力分量，导致摩擦力计算错误。
                </Text>
                <Text className={styles.issueAdvice}>
                  建议：重温受力分析标准步骤，多练习静摩擦力与滑动摩擦力临界状态的判断。
                </Text>
              </View>

              <View className={styles.issueCard}>
                <View className={styles.issueHeader}>
                  <Text className={styles.issueTag}>解题技巧</Text>
                  <Text className={styles.issueName}>读题粗心，忽略关键条件</Text>
                </View>
                <Text className={styles.issueDesc}>
                  分析：在题干包含“不考虑空气阻力”、“初速度为零”等关键限定词时，容易因阅读过快而漏看。
                </Text>
                <Text className={styles.issueAdvice}>
                  建议：做题时养成圈画题干关键字的习惯，尤其是物理环境的限定词。
                </Text>
              </View>
            </View>

            {/* 推荐学习资源 */}
            <View className={styles.resourceSection}>
              <Text className={styles.sectionTitle}>📚 推荐补习资源</Text>
              <View className={styles.resourceList}>
                <View className={styles.resourceItem} onClick={() => Taro.showToast({title: '链接跳转开发中', icon: 'none'})}>
                  <Text className={styles.resourceIcon}>🔗</Text>
                  <Text className={styles.resourceName}>飞书文档：力学综合受力分析万能模板</Text>
                </View>
                <View className={styles.resourceItem} onClick={() => Taro.showToast({title: '链接跳转开发中', icon: 'none'})}>
                  <Text className={styles.resourceIcon}>📺</Text>
                  <Text className={styles.resourceName}>视频讲解：十分钟搞定牛顿运动定律</Text>
                </View>
              </View>
            </View>

          </ScrollView>
        )}

        <View className={styles.modalFooter}>
          <View className={styles.btnOutline} onClick={onAskQuestion}>
            <Text className={styles.btnIcon}>💬</Text> 我要提问
          </View>
          <View className={styles.btnPrimary} onClick={onViewErrors}>
            查看错题本
          </View>
        </View>

      </View>
    </View>
  );
}