import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface SubtopicFrequencyItem {
  subtopic_id: number;
  subtopic_code: string;
  subtopic_name: string;
  topic_id: number;
  topic_name: string;
  frequency: number;
}

interface SubtopicFrequencyBarProps {
  subtopics: SubtopicFrequencyItem[];
  selectedSubtopicIds: number[];
  onSubtopicToggle: (subtopicId: number) => void;
  onClearAll: () => void;
}

export default function SubtopicFrequencyBar({
  subtopics,
  selectedSubtopicIds,
  onSubtopicToggle,
  onClearAll
}: SubtopicFrequencyBarProps) {
  if (!subtopics || subtopics.length === 0) return null;

  const totalQuestions = subtopics.reduce((sum, st) => sum + st.frequency, 0);

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>分考点筛选（本题库共涉及 {subtopics.length} 个分考点）</Text>
      </View>
      
      <View className={styles.chipsWrapper}>
        {subtopics.map(st => {
          const isSelected = selectedSubtopicIds.includes(st.subtopic_id);
          return (
            <View 
              key={st.subtopic_id}
              className={classnames(styles.chip, isSelected && styles.chipActive)}
              onClick={() => onSubtopicToggle(st.subtopic_id)}
            >
              <Text className={styles.chipName}>{st.subtopic_name}</Text>
              <Text className={styles.chipCount}>({st.frequency})</Text>
            </View>
          );
        })}
      </View>

      {selectedSubtopicIds.length > 0 && (
        <View className={styles.footer}>
          <View className={styles.selectedList}>
            <Text className={styles.selectedLabel}>已选：</Text>
            {selectedSubtopicIds.map(id => {
              const st = subtopics.find(s => s.subtopic_id === id);
              if (!st) return null;
              return (
                <View key={id} className={styles.selectedTag} onClick={() => onSubtopicToggle(id)}>
                  <Text>{st.subtopic_name}</Text>
                  <Text className={styles.closeIcon}>×</Text>
                </View>
              );
            })}
          </View>
          <View className={styles.clearBtn} onClick={onClearAll}>
            <Text className={styles.clearBtnText}>[清除全部选择]</Text>
          </View>
        </View>
      )}
    </View>
  );
}
