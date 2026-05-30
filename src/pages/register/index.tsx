import React, { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from '../index/index.module.scss'; // 复用登录页样式

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !password) {
      Taro.showToast({ title: '请输入用户名和密码', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      const res = await Taro.request({
        url: '/api/register',
        method: 'POST',
        data: { username, password }
      });

      if (res.data && res.data.success) {
        Taro.showToast({ title: '注册成功', icon: 'success' });
        setTimeout(() => {
          Taro.navigateBack(); // 返回登录页
        }, 1500);
      } else {
        Taro.showToast({ title: res.data?.error || '注册失败', icon: 'none' });
      }
    } catch (err) {
      Taro.showToast({ title: '网络请求错误', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.container}>
      <View className={styles.card}>
        <Text className={styles.title}>创建账号</Text>
        
        <View className={styles.formGroup}>
          <Text className={styles.label}>用户名</Text>
          <Input
            className={styles.input}
            placeholder="请输入用户名"
            value={username}
            onInput={(e) => setUsername(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>密码</Text>
          <Input
            className={styles.input}
            password
            placeholder="请输入密码"
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
          />
        </View>

        <Button
          className={classnames(styles.button, styles.primaryButton)}
          onClick={handleRegister}
          loading={loading}
          disabled={loading}
        >
          注册
        </Button>

        <View className={styles.footer}>
          <Text className={styles.footerText}>已有账号？</Text>
          <Text className={styles.linkText} onClick={goToLogin}>直接登录</Text>
        </View>
      </View>
    </View>
  );
}
