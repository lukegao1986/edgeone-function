import React, { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Taro.showToast({ title: '请输入用户名和密码', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      // 在 H5 环境中，这会请求当前域名的 /api/login，会被 EdgeOne Pages 的 cloud-functions 捕获
      const res = await Taro.request({
        url: '/api/login',
        method: 'POST',
        data: { username, password }
      });

      if (res.data && res.data.success) {
        Taro.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => {
          Taro.navigateTo({ url: '/pages/user/index' });
        }, 1000);
      } else {
        Taro.showToast({ title: res.data?.error || '登录失败', icon: 'none' });
      }
    } catch (err) {
      Taro.showToast({ title: '网络请求错误', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    Taro.navigateTo({ url: '/pages/register/index' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.card}>
        <Text className={styles.title}>欢迎登录</Text>
        
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
          onClick={handleLogin}
          loading={loading}
          disabled={loading}
        >
          登录
        </Button>

        <View className={styles.footer}>
          <Text className={styles.footerText}>还没有账号？</Text>
          <Text className={styles.linkText} onClick={goToRegister}>立即注册</Text>
        </View>
      </View>
    </View>
  );
}
