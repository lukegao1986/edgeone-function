import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { SUBJECTS } from '@/data/subjects';
import Layout from '@/components/Layout';
import styles from './index.module.scss';

const filterTabs = [
  { id: 'all', label: '全部科目' },
  { id: 'japanese', label: '日语' },
  { id: 'bunso', label: '文综' },
  { id: 'math1', label: '数学1' },
  { id: 'math2', label: '数学2' },
  { id: 'science', label: '理科' },
];

export default function ErrorBookPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Mock 数据
  const [errorBook, setErrorBook] = useState([
    { questionId: 'q1', subjectId: 'japanese', stem: '日本語の特徴として「曖昧な表現」が多いとされるが...', wrongCount: 3, lastWrongAt: '2023-10-25' },
    { questionId: 'q2', subjectId: 'math1', stem: '二次関数 f(x) = x² - 6x + 5 の最小値を求めなさい。', wrongCount: 1, lastWrongAt: '2023-10-26' },
    { questionId: 'q3', subjectId: 'science', stem: '水素の燃焼反応式 H₂ + O₂ → H₂O を係数を含めて正しく書くとどうなるか。', wrongCount: 4, lastWrongAt: '2023-10-27' },
  ]);

  const filteredErrors = useMemo(() => {
    if (activeFilter === 'all') return errorBook;
    return errorBook.filter(e => e.subjectId === activeFilter);
  }, [activeFilter, errorBook]);

  const handleRemove = (questionId: string) => {
    Taro.showModal({
      title: '提示',
      content: '确定要移出错题本吗？',
      success: (res) => {
        if (res.confirm) {
          setRemovingId(questionId);
          setTimeout(() => {
            setErrorBook(prev => prev.filter(e => e.questionId !== questionId));
            setRemovingId(null);
            Taro.showToast({ title: '已移出', icon: 'success' });
          }, 300);
        }
      }
    });
  };

  const handleRedo = (subjectId: string) => {
    Taro.navigateTo({ url: `/pages/practice/index?subjectId=${subjectId}` });
  };

  return (
    <Layout activePage="errorbook">
      <View className={styles.mainContent}>
        <View className={styles.header}>
          <Text className={styles.title}>我的错题本</Text>
          <Text className={styles.countText}>共 {errorBook.length} 道错题</Text>
        </View>

        {/* 筛选器 */}
        <View className={styles.filterBar}>
          <ScrollView scrollX className={styles.filterScroll}>
            <View className={styles.filterList}>
              {filterTabs.map(tab => (
                <View
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={classnames(styles.filterTab, activeFilter === tab.id && styles.filterActive)}
                >
                  <Text>{tab.label}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <Text className={styles.resultCount}>共找到 {filteredErrors.length} 道错题</Text>

        {/* 错题列表 (PC 端宽卡片/Table 形式，移动端卡片) */}
        <View className={styles.tableContainer}>
          {filteredErrors.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>太棒了！该科目暂无错题</Text>
              <View className={styles.btnAction} onClick={() => Taro.navigateTo({ url: '/pages/user/index' })}>
                <Text>去刷题</Text>
              </View>
            </View>
          ) : (
            <View className={styles.list}>
              {filteredErrors.map(record => {
                const subject = SUBJECTS.find(s => s.id === record.subjectId);
                const isRemoving = removingId === record.questionId;
                return (
                  <View key={record.questionId} className={classnames(styles.listItem, isRemoving && styles.removing)}>
                    <View className={styles.itemMain}>
                      <Text className={styles.itemStem}>{record.stem}</Text>
                    </View>
                    <View className={styles.itemMeta}>
                      <View className={styles.badge} style={{ backgroundColor: `${subject?.color}18`, color: subject?.color }}>
                        <Text>{subject?.name || record.subjectId}</Text>
                      </View>
                      <View className={styles.wrongInfo}>
                        <Text className={classnames(styles.wrongCount, record.wrongCount >= 3 && styles.textError)}>
                          {record.wrongCount} 次
                        </Text>
                        {record.wrongCount >= 3 && <Text className={styles.tagHot}>重点</Text>}
                      </View>
                      <Text className={styles.dateText}>{record.lastWrongAt}</Text>
                    </View>
                    <View className={styles.itemActions}>
                      <View className={styles.btnRedo} onClick={() => handleRedo(record.subjectId)}>
                        <Text>重做</Text>
                      </View>
                      <View className={styles.btnRemove} onClick={() => handleRemove(record.questionId)}>
                        <Text>移出</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </Layout>
  );
}
