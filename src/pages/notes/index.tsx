import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { SUBJECTS } from '@/data/subjects';
import styles from './index.module.scss';

interface NoteItem {
  id: number;
  questionId: string;
  subjectId: string;
  category: string;
  stem: string;
  content: string;
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const userInfo = Taro.getStorageSync('userInfo');
      const userId = userInfo ? userInfo.id : '';

      const apiUrl = process.env.NODE_ENV === 'production'
        ? `http://115.159.64.224:3000/api/get_notes_list?userId=${userId}`
        : `/api/get_notes_list?userId=${userId}`;

      const res = await Taro.request({
        url: apiUrl,
        method: 'GET'
      });

      if (res.data && res.data.success) {
        setNotes(res.data.data);
      } else {
        Taro.showToast({ title: '加载笔记失败', icon: 'none' });
      }
    } catch (err) {
      Taro.showToast({ title: '网络请求错误', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useDidShow(() => {
    fetchNotes();
  });

  const handleDeleteNote = async (questionId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条笔记吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const userInfo = Taro.getStorageSync('userInfo');
            const userId = userInfo ? userInfo.id : 1;

            const apiUrl = process.env.NODE_ENV === 'production'
              ? 'http://115.159.64.224:3000/api/submit_note'
              : '/api/submit_note';

            await Taro.request({
              url: apiUrl,
              method: 'POST',
              data: {
                userId,
                questionId,
                subjectId: 'dummy', // just need something, content is empty so it deletes
                content: ''
              }
            });

            Taro.showToast({ title: '已删除', icon: 'success' });
            fetchNotes(); // 重新拉取
          } catch (err) {
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  };

  const handleViewQuestion = (subjectId: string, questionId: string) => {
    // 实际项目中可以携带 questionId 参数跳过去并高亮，目前先跳到对应科目练习页
    Taro.navigateTo({
      url: `/pages/practice/index?subjectId=${subjectId}`
    });
  };

  const filteredAndSortedNotes = useMemo(() => {
    let result = notes;

    // 1. 科目筛选
    if (selectedSubject !== 'all') {
      result = result.filter(n => n.subjectId === selectedSubject);
    }

    // 2. 关键字搜索 (搜笔记内容或题干)
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(n => 
        n.content.toLowerCase().includes(kw) || 
        (n.stem && n.stem.toLowerCase().includes(kw))
      );
    }

    // 3. 排序
    result = [...result].sort((a, b) => {
      const timeA = new Date(a.updatedAt).getTime();
      const timeB = new Date(b.updatedAt).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [notes, selectedSubject, searchKeyword, sortOrder]);

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <View className={styles.pageContainer}>
      <Navbar />
      
      <View className={styles.layoutBody}>
        <Sidebar activePage="notes" />
        
        <View className={styles.mainContent}>
          <View className={styles.headerSection}>
            <View className={styles.titleRow}>
              <Text className={styles.pageTitle}>我的学习笔记</Text>
            </View>

            <ScrollView className={styles.subjectFilters} scrollX>
              <View 
                className={classnames(styles.filterTag, selectedSubject === 'all' && styles.filterTagActive)}
                onClick={() => setSelectedSubject('all')}
              >
                全部科目
              </View>
              {SUBJECTS.map(s => (
                <View 
                  key={s.id}
                  className={classnames(styles.filterTag, selectedSubject === s.id && styles.filterTagActive)}
                  onClick={() => setSelectedSubject(s.id)}
                >
                  {s.name}
                </View>
              ))}
            </ScrollView>

            <View className={styles.controlsRow}>
              <View className={styles.searchBox}>
                <Text className={styles.searchIcon}>🔍</Text>
                <Input 
                  className={styles.searchInput}
                  placeholder="搜索笔记内容或题目..."
                  value={searchKeyword}
                  onInput={(e) => setSearchKeyword(e.detail.value)}
                />
              </View>
              
              <View className={styles.sortBtn} onClick={toggleSort}>
                <Text className={styles.sortText}>
                  {sortOrder === 'desc' ? '⬇️ 最新修改' : '⬆️ 最早修改'}
                </Text>
              </View>
            </View>
          </View>

          {loading ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>加载中...</Text>
            </View>
          ) : filteredAndSortedNotes.length > 0 ? (
            <View className={styles.notesGrid}>
              {filteredAndSortedNotes.map(note => {
                const subject = SUBJECTS.find(s => s.id === note.subjectId);
                return (
                  <View key={note.id} className={styles.noteCard}>
                    <View className={styles.cardHeader}>
                      <View className={styles.cardMeta}>
                        <View className={styles.cardTags}>
                          <Text className={styles.subjectBadge}>{subject?.name || '未知科目'}</Text>
                          <Text className={styles.categoryText}>{note.category}</Text>
                        </View>
                        <Text className={styles.timeText}>{new Date(note.updatedAt).toLocaleString()}</Text>
                      </View>
                      <Text className={styles.deleteBtn} onClick={() => handleDeleteNote(note.questionId)}>删除</Text>
                    </View>
                    
                    <View className={styles.cardContent}>
                      <Text>{note.content}</Text>
                    </View>

                    <View className={styles.cardFooter}>
                      <Text className={styles.questionIdText}>题目ID: {note.questionId}</Text>
                      <View className={styles.viewBtn} onClick={() => handleViewQuestion(note.subjectId, note.questionId)}>
                        去复习题目 ›
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📝</Text>
              <Text className={styles.emptyText}>没有找到符合条件的笔记</Text>
            </View>
          )}

        </View>
      </View>
    </View>
  );
}