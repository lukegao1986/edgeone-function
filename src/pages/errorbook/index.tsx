import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { SUBJECTS } from '@/data/subjects';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
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
  
  // Mock Data
  const errorBook = [
    { questionId: 'q1', subjectId: 'science', stem: '在标准状况下，将 22.4L 氯气通入水中的反应...', wrongCount: 3, lastWrongAt: '2025-05-28' },
    { questionId: 'q2', subjectId: 'math1', stem: '已知函数 f(x) = x^2 - 2x + 1，求其在 [0, 3] 上的最大值...', wrongCount: 1, lastWrongAt: '2025-05-29' },
    { questionId: 'q3', subjectId: 'japanese', stem: '次の文章を読んで、後の問いに答えなさい...', wrongCount: 2, lastWrongAt: '2025-05-30' },
  ];

  const filteredErrors = useMemo(() => {
    if (activeFilter === 'all') return errorBook;
    return errorBook.filter(e => e.subjectId === activeFilter);
  }, [activeFilter]);

  const handleRedo = (subjectId: string) => {
    Taro.navigateTo({ url: `/pages/practice/index?subjectId=${subjectId}&mode=error_redo` });
  };

  const handleRemove = (id: string) => {
    Taro.showToast({ title: '已移出错题本', icon: 'success' });
  };

  return (
    <View className={styles.pageContainer}>
      <Navbar />
      <View className={styles.layoutBody}>
        <Sidebar activePage="errorbook" />
        
        <ScrollView className={styles.scrollArea} scrollY>
          <View className={styles.mainContent}>
            <View className={styles.header}>
              <Text className={styles.title}>我的错题本</Text>
              <Text className={styles.subtitle}>共 {errorBook.length} 道错题</Text>
            </View>

            {/* Filter Bar */}
            <ScrollView className={styles.filterBar} scrollX>
              <View className={styles.filterTabs}>
                {filterTabs.map(tab => (
                  <View
                    key={tab.id}
                    className={classnames(styles.filterTab, activeFilter === tab.id && styles.activeTab)}
                    onClick={() => setActiveFilter(tab.id)}
                  >
                    <Text className={styles.tabText}>{tab.label}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            <Text className={styles.resultCount}>共找到 {filteredErrors.length} 道错题</Text>

            {/* Error Table (List format for cross-platform compatibility) */}
            <View className={styles.listContainer}>
              {filteredErrors.length === 0 ? (
                <View className={styles.emptyState}>
                  <Text className={styles.emptyText}>该科目暂无错题，继续保持！</Text>
                </View>
              ) : (
                filteredErrors.map((record) => {
                  const subject = SUBJECTS.find(s => s.id === record.subjectId);
                  return (
                    <View key={record.questionId} className={styles.listItem}>
                      <View className={styles.itemMain}>
                        <View className={styles.itemHeader}>
                          <View className={styles.subjectTag} style={{ backgroundColor: `${subject?.color}18` }}>
                            <Text className={styles.tagText} style={{ color: subject?.color }}>{subject?.name}</Text>
                          </View>
                          <Text className={styles.dateText}>{record.lastWrongAt}</Text>
                        </View>
                        <Text className={styles.stemText}>{record.stem}</Text>
                        <View className={styles.statsRow}>
                          <Text className={classnames(styles.wrongCount, record.wrongCount >= 3 && styles.highWrongCount)}>
                            做错 {record.wrongCount} 次
                          </Text>
                          {record.wrongCount >= 3 && (
                            <View className={styles.focusTag}><Text className={styles.focusTagText}>重点</Text></View>
                          )}
                        </View>
                      </View>
                      <View className={styles.itemActions}>
                        <View className={styles.btnRedo} onClick={() => handleRedo(record.subjectId)}>
                          <Text className={styles.btnTextWhite}>重做</Text>
                        </View>
                        <View className={styles.btnRemove} onClick={() => handleRemove(record.questionId)}>
                          <Text className={styles.btnTextDanger}>移除</Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
