import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, RichText } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { renderMarkdown } from '@/utils/markdown';
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
  const [errorBook, setErrorBook] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useDidShow(() => {
    const fetchErrorBook = async () => {
      const userInfo = Taro.getStorageSync('userInfo');
      if (!userInfo || !userInfo.id) return;
      
      setLoading(true);
      try {
        const res = await Taro.request({
          url: `/api/get_errorbook?userId=${userInfo.id}`,
          method: 'GET'
        });
        if (res.data && res.data.success) {
          setErrorBook(res.data.data);
        }
      } catch (err) {
        Taro.showToast({ title: '获取错题本失败', icon: 'none' });
      } finally {
        setLoading(false);
      }
    };
    fetchErrorBook();
  });

  const filteredErrors = useMemo(() => {
    if (activeFilter === 'all') return errorBook;
    return errorBook.filter(e => e.subjectId === activeFilter);
  }, [activeFilter, errorBook]);

  const handleRedo = (subjectId: string) => {
    Taro.navigateTo({ url: `/pages/practice/index?subjectId=${subjectId}&mode=error_redo` });
  };

  const handleRemove = async (questionId: string) => {
    try {
      const userInfo = Taro.getStorageSync('userInfo');
      if (!userInfo || !userInfo.id) return;
      
      // 调用 submit_answer 接口，传入特殊状态：不再收藏，且重置其状态
      // 由于我们的需求是移除出错题本，可以传递 isBookmarked = false，并且重置 wrong_count。
      // 为保持后端通用性，我们专门加一个 remove_error 接口或复用现有接口，这里推荐新建一个接口保持逻辑清晰。
      await Taro.request({
        url: '/api/remove_error',
        method: 'POST',
        data: { userId: userInfo.id, questionId }
      });
      
      Taro.showToast({ title: '已移出错题本', icon: 'success' });
      // 乐观更新 UI
      setErrorBook(prev => prev.filter(e => e.questionId !== questionId));
    } catch (err) {
      Taro.showToast({ title: '移除失败', icon: 'none' });
    }
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
                        <View className={styles.stemText}>
                          <RichText nodes={renderMarkdown(record.stem)} />
                        </View>
                        <View className={styles.statsRow}>
                          {record.wrongCount > 0 && (
                            <Text className={classnames(styles.wrongCount, record.wrongCount >= 3 && styles.highWrongCount)}>
                              做错 {record.wrongCount} 次
                            </Text>
                          )}
                          {record.isBookmarked && (
                            <Text className={styles.bookmarkTag}>⭐ 已收藏</Text>
                          )}
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
