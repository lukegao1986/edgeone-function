import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

export default function UserPage() {
  const handleLogout = () => {
    Taro.reLaunch({ url: '/pages/index/index' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.card}>
        <View className={styles.iconWrapper}>
          <Text className={styles.successIcon}>✓</Text>
        </View>
        <Text className={styles.title}>您已经登录成功</Text>
        <Text className={styles.subtitle}>欢迎来到用户中心</Text>
        
        <Button
          className={classnames(styles.button, styles.primaryButton)}
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </View>
    </View>
  );
}
