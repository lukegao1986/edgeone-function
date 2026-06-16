import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

export interface AIAnalysisData {
  total: number;
  correct: number;
  wrong: number;
  rate: number;
  diagnoses: {
    category: string;
    errorCount: number;
    advice: string;
  }[];
  resources: {
    title: string;
    type: string;
    url: string;
    icon: string;
  }[];
}

interface AIAnalysisModalProps {
  visible: boolean;
  data: AIAnalysisData;
  onClose: () => void;
  onViewErrors: () => void;
  onAskAI: () => void;
}

export default function AIAnalysisModal({
  visible,
  data,
  onClose,
  onViewErrors,
  onAskAI
}: AIAnalysisModalProps) {
  if (!visible) return null;

  const handleOpenLink = (url: string) => {
    // 在 H5 环境下可以直接打开新窗口
    window.open(url, '_blank');
  };

  return (
    <View className={styles.modalOverlay} onClick={onClose}>
      <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
        
        {/* 头部 */}
        <View className={styles.modalHeader}>
          <View className={styles.titleWrap}>
            <Text className={styles.aiIcon}>🤖</Text>
            <Text className={styles.title}>AI 薄弱点分析报告</Text>
          </View>
          <Text className={styles.closeBtn} onClick={onClose}>×</Text>
        </View>

        {/* 主体内容 */}
        <ScrollView className={styles.modalBody} scrollY>
          
          {/* 成绩总览 */}
          <View className={styles.scoreSection}>
            <View className={styles.scoreItem}>
              <Text className={styles.scoreLabel}>总题数</Text>
              <Text className={styles.scoreVal}>{data.total}</Text>
            </View>
            <View className={styles.scoreItem}>
              <Text className={styles.scoreLabel}>正确</Text>
              <Text className={styles.scoreValSuccess}>{data.correct}</Text>
            </View>
            <View className={styles.scoreItem}>
              <Text className={styles.scoreLabel}>错误</Text>
              <Text className={styles.scoreValError}>{data.wrong}</Text>
            </View>
            <View className={styles.scoreItem}>
              <Text className={styles.scoreLabel}>正确率</Text>
              <Text className={styles.scoreValPrimary}>{data.rate}%</Text>
            </View>
          </View>

          {/* 薄弱点诊断 */}
          <View className={styles.diagnosisSection}>
            <Text className={styles.sectionTitle}>薄弱点诊断</Text>
            <View className={styles.diagnosisList}>
              {data.diagnoses.length > 0 ? data.diagnoses.map((diag, idx) => (
                <View key={idx} className={styles.diagnosisCard}>
                  <View className={styles.diagHeader}>
                    <Text className={styles.diagCategory}>{diag.category}</Text>
                    <Text className={styles.diagErrorCount}>错 {diag.errorCount} 题</Text>
                  </View>
                  <Text className={styles.diagAdvice}>{diag.advice}</Text>
                </View>
              )) : (
                <Text style={{ color: '#86909c', fontSize: '14px' }}>太棒了！本次练习未发现明显薄弱点。</Text>
              )}
            </View>
          </View>

          {/* 推荐学习资源 */}
          {data.resources.length > 0 && (
            <View className={styles.resourceSection}>
              <Text className={styles.sectionTitle}>推荐复习资源</Text>
              <View className={styles.resourceList}>
                {data.resources.map((res, idx) => (
                  <View key={idx} className={styles.resourceItem} onClick={() => handleOpenLink(res.url)}>
                    <Text className={styles.resourceIcon}>{res.icon}</Text>
                    <View className={styles.resourceInfo}>
                      <Text className={styles.resourceTitle}>{res.title}</Text>
                      <Text className={styles.resourceType}>{res.type}</Text>
                    </View>
                    <Text className={styles.resourceArrow}>→</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        </ScrollView>

        {/* 底部操作 */}
        <View className={styles.modalFooter}>
          <View className={styles.footerLeft}>
            <View className={styles.btnSecondary} onClick={onAskAI}>
              💬 针对错题向 AI 提问
            </View>
            <View className={styles.btnSecondary} onClick={onViewErrors}>
              📖 查看错题本
            </View>
          </View>
          <View className={styles.btnPrimary} onClick={onClose}>
            完成并关闭
          </View>
        </View>

      </View>
    </View>
  );
}