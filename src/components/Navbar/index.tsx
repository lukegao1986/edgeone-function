import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

interface NavbarProps {
  simplified?: boolean;
  subjectName?: string;
}

export default function Navbar({ simplified = false, subjectName = '' }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigateTo = (url: string) => {
    Taro.switchTab({ url }).catch(() => Taro.navigateTo({ url }));
    setMenuOpen(false);
  };

  const handleLogout = () => {
    Taro.removeStorageSync('userInfo');
    Taro.reLaunch({ url: '/pages/index/index' });
  };

  const userInfo = Taro.getStorageSync('userInfo');
  const userName = userInfo?.nickname || userInfo?.username || '留学小生';
  const targetExam = userInfo?.target_exam || '暂无目标';

  if (simplified) {
    return (
      <View className={styles.navbarSimplified}>
        <View className={styles.backBtn} onClick={() => Taro.navigateBack()}>
          <Text className={styles.backIcon}>‹</Text>
          <Text className={styles.backText}>返回</Text>
        </View>
        <Text className={styles.subjectTitle}>{subjectName}</Text>
        <View className={styles.placeholder} />
      </View>
    );
  }

  return (
    <View className={styles.navbar}>
      <View className={styles.navLeft}>
        <View className={styles.logoBox}>
          <Text className={styles.logoText}>E</Text>
        </View>
        <Text className={styles.brandName}>EJU Pro</Text>
      </View>
      <View className={styles.navRight}>
        <View className={styles.errorBookBtn} onClick={() => navigateTo('/pages/errorbook/index')}>
          <Text className={styles.errorBookIcon}>📖</Text>
          <Text className={styles.errorBookText}>错题本</Text>
        </View>
        
        <View className={styles.userMenuWrapper}>
          <View className={styles.avatarBtn} onClick={() => setMenuOpen(!menuOpen)}>
            <Text className={styles.avatarIcon}>👤</Text>
          </View>
          
          {menuOpen && (
            <View className={styles.dropdownMenu}>
              <View className={styles.userInfo}>
                <Text className={styles.userName}>{userName}</Text>
                <Text className={styles.userEmail}>{targetExam}</Text>
              </View>
              <View className={styles.menuItem} onClick={() => navigateTo('/pages/profile/index')}>
                <Text className={styles.menuItemText}>个人中心</Text>
              </View>
              <View className={classnames(styles.menuItem, styles.logoutItem)} onClick={handleLogout}>
                <Text className={styles.menuItemText}>退出登录</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
