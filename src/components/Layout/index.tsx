import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

interface LayoutProps {
  children: React.ReactNode;
  activePage: 'dashboard' | 'practice' | 'errorbook' | 'profile';
  title?: string;
  hideSidebar?: boolean;
}

export default function Layout({ children, activePage, title = 'EJU 刷题系统', hideSidebar = false }: LayoutProps) {
  const handleLogout = () => {
    Taro.reLaunch({ url: '/pages/index/index' });
  };

  const navTo = (page: string) => {
    if (activePage === page) return;
    const urlMap = {
      dashboard: '/pages/user/index',
      errorbook: '/pages/error-book/index',
      profile: '/pages/profile/index'
    };
    Taro.redirectTo({ url: urlMap[page as keyof typeof urlMap] });
  };

  return (
    <View className={styles.layout}>
      {/* 顶部导航栏 */}
      <View className={styles.navbar}>
        <View className={styles.navLeft}>
          <Text className={styles.logoText}>{title}</Text>
        </View>
        <View className={styles.navRight}>
          <Text className={styles.navLink} onClick={() => navTo('errorbook')}>错题本</Text>
          <View className={styles.avatarWrapper} onClick={handleLogout}>
            <Text className={styles.avatarText}>退出</Text>
          </View>
        </View>
      </View>

      <View className={styles.body}>
        {/* 左侧边栏 (PC端宽屏优先) */}
        {!hideSidebar && (
          <View className={styles.sidebar}>
            <View className={styles.menuList}>
              <View 
                className={classnames(styles.menuItem, activePage === 'dashboard' && styles.active)}
                onClick={() => navTo('dashboard')}
              >
                <Text className={styles.menuIcon}>🏠</Text>
                <Text className={styles.menuText}>学习大厅</Text>
              </View>
              <View 
                className={classnames(styles.menuItem, activePage === 'errorbook' && styles.active)}
                onClick={() => navTo('errorbook')}
              >
                <Text className={styles.menuIcon}>📖</Text>
                <Text className={styles.menuText}>错题本</Text>
              </View>
              <View 
                className={classnames(styles.menuItem, activePage === 'profile' && styles.active)}
                onClick={() => navTo('profile')}
              >
                <Text className={styles.menuIcon}>👤</Text>
                <Text className={styles.menuText}>个人中心</Text>
              </View>
            </View>
          </View>
        )}

        {/* 右侧主内容区 */}
        <View className={styles.main}>
          {children}
        </View>
      </View>
    </View>
  );
}
