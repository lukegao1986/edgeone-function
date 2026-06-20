import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { SUBJECTS } from '@/data/subjects';
import styles from './index.module.scss';

interface SidebarProps {
  activePage: string;
  activeSubject?: string | null;
  onSubjectClick?: (subjectId: string) => void;
}

export default function Sidebar({ activePage, activeSubject, onSubjectClick }: SidebarProps) {

  const navigateTo = (url: string) => {
    const tabPages = ['/pages/dashboard/index', '/pages/errorbook/index', '/pages/profile/index'];
    if (tabPages.includes(url)) {
      Taro.switchTab({ url });
    } else {
      Taro.navigateTo({ url });
    }
  };

  const handleSubjectClick = (id: string) => {
    if (onSubjectClick) {
      onSubjectClick(id);
    } else {
      if (id === 'science') {
        Taro.navigateTo({ url: `/pages/science/index` });
      } else {
        Taro.navigateTo({ url: `/pages/practice/index?subjectId=${id}` });
      }
    }
  };

  return (
    <View className={styles.sidebar}>
      <View className={styles.navGroup}>
        <View 
          className={classnames(styles.navItem, activePage === 'dashboard' && styles.activeItem)}
          onClick={() => navigateTo('/pages/dashboard/index')}
        >
          <Text className={styles.icon}>📊</Text>
          <Text className={styles.label}>学习大厅</Text>
        </View>

        <View className={styles.divider}>
          <Text className={styles.dividerText}>科目导航</Text>
        </View>

        {SUBJECTS.map((s) => (
          <View
            key={s.id}
            className={classnames(styles.navItem, activeSubject === s.id && styles.activeItem)}
            onClick={() => handleSubjectClick(s.id)}
          >
            <View className={styles.iconBox}>
              <Text className={styles.icon}>{s.icon}</Text>
            </View>
            <Text className={styles.label}>{s.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
