import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { SCIENCE_SYLLABUS } from '@/data/scienceSyllabus';
import styles from './index.module.scss';

export default function ScienceHubPage() {
  // 左侧：当前选中的理科科目 (physics, chemistry, biology)
  const [activeSubject, setActiveSubject] = useState('physics');
  // 中间：当前选中科目的选中的大章节
  const [activeChapterId, setActiveChapterId] = useState('');

  const currentSubjectData = SCIENCE_SYLLABUS[activeSubject];

  useEffect(() => {
    if (currentSubjectData && currentSubjectData.chapters.length > 0) {
      setActiveChapterId(currentSubjectData.chapters[0].id);
    }
  }, [activeSubject, currentSubjectData]);

  const currentChapter = currentSubjectData?.chapters.find(c => c.id === activeChapterId);

  const handleStartPractice = (subTopicId: string, subTopicTitle: string) => {
    // 携带 subjectId 和 topic 信息跳转到 practice 页面
    Taro.navigateTo({
      url: `/pages/practice/index?subjectId=${activeSubject}&topicId=${subTopicId}&topicTitle=${encodeURIComponent(subTopicTitle)}`
    });
  };

  return (
    <View className={styles.pageContainer}>
      <Navbar />
      <View className={styles.layoutBody}>
        {/* 这里让 Sidebar 的 activeSubject 保持为 null 或者特别处理，因为我们在一个聚合页 */}
        <Sidebar activePage="dashboard" />
        
        <View className={styles.mainContent}>
          <View className={styles.header}>
            <Text className={styles.title}>理科综合知识图谱</Text>
            <Text className={styles.subtitle}>选择科目与章节，开始针对性专项训练</Text>
          </View>

          <View className={styles.threeColumnLayout}>
            
            {/* 左列：科目标签 */}
            <View className={styles.colLeft}>
              {Object.values(SCIENCE_SYLLABUS).map(subject => (
                <View 
                  key={subject.id}
                  className={classnames(styles.subjectTab, activeSubject === subject.id && styles.subjectTabActive)}
                  onClick={() => setActiveSubject(subject.id)}
                >
                  <Text className={styles.subjectIcon}>
                    {subject.id === 'physics' ? '⚡' : subject.id === 'chemistry' ? '⚗' : '🧬'}
                  </Text>
                  <Text className={styles.subjectName}>{subject.name}</Text>
                </View>
              ))}
            </View>

            {/* 中列：一级目录 (Chapter) */}
            <ScrollView className={styles.colMiddle} scrollY>
              {currentSubjectData?.chapters.map(chapter => (
                <View 
                  key={chapter.id}
                  className={classnames(styles.chapterItem, activeChapterId === chapter.id && styles.chapterItemActive)}
                  onClick={() => setActiveChapterId(chapter.id)}
                >
                  <Text className={styles.chapterTitle}>{chapter.title}</Text>
                </View>
              ))}
            </ScrollView>

            {/* 右列：二级与三级目录 (Section & SubTopic) */}
            <ScrollView className={styles.colRight} scrollY>
              {currentChapter ? (
                <View className={styles.sectionsWrapper}>
                  {currentChapter.sections.map(section => (
                    <View key={section.id} className={styles.sectionBlock}>
                      <Text className={styles.sectionTitle}>{section.title}</Text>
                      
                      <View className={styles.subTopicGrid}>
                        {section.subTopics.map(sub => (
                          <View 
                            key={sub.id} 
                            className={styles.subTopicCard}
                            onClick={() => handleStartPractice(sub.id, sub.title)}
                          >
                            <View className={styles.subTopicHeader}>
                              <Text className={styles.subTopicTitle}>{sub.title}</Text>
                            </View>
                            <Text className={styles.subTopicContent}>{sub.content}</Text>
                            <View className={styles.startBtn}>
                              <Text className={styles.startBtnText}>开始练习 ›</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className={styles.emptyState}>请选择章节</View>
              )}
            </ScrollView>

          </View>
        </View>
      </View>
    </View>
  );
}