import React, { useState, useEffect } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { apiBase } from '@/utils/api';
import styles from './index.module.scss';

export interface AuthModalProps {
  visible: boolean;
  defaultMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess: (userInfo: any) => void;
}

export default function AuthModal({ visible, defaultMode = 'login', onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setMode(defaultMode);
      setUsername('');
      setPassword('');
      setInviteCode('');
    }
  }, [visible, defaultMode]);

  if (!visible) return null;

  const handleSubmit = async () => {
    if (!username || !password) {
      Taro.showToast({ title: '请输入用户名和密码', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await Taro.request({
          url: `${apiBase}/api/login`,
          method: 'POST',
          data: { username, password }
        });

        if (res.data && res.data.success) {
          Taro.setStorageSync('userInfo', res.data.data);
          Taro.showToast({ title: '登录成功', icon: 'success' });
          onSuccess(res.data.data);
        } else {
          Taro.showToast({ title: res.data?.error || '登录失败', icon: 'none' });
        }
      } else {
        // Register mode
        const res = await Taro.request({
          url: `${apiBase}/api/register`,
          method: 'POST',
          data: { username, password, inviteCode }
        });

        if (res.data && res.data.success) {
          Taro.showToast({ title: '注册成功，请登录', icon: 'success' });
          setMode('login');
          setPassword('');
        } else {
          Taro.showToast({ title: res.data?.error || '注册失败', icon: 'none' });
        }
      }
    } catch (err) {
      Taro.showToast({ title: '网络请求错误', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={styles.modalOverlay} onClick={onClose}>
      <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <Text className={styles.closeBtn} onClick={onClose}>×</Text>
        
        <View className={styles.modalBody}>
          <Text className={styles.title}>{mode === 'login' ? '欢迎回来' : '创建账号'}</Text>
          <Text className={styles.subtitle}>
            {mode === 'login' ? '登录 EJU Pro 开启高效刷题之旅' : '加入 EJU Pro，科学备考日本留学'}
          </Text>

          <View className={styles.formGroup}>
            <Input
              className={styles.input}
              placeholder="请输入用户名"
              value={username}
              onInput={(e) => setUsername(e.detail.value)}
            />
          </View>

          <View className={styles.formGroup}>
            <Input
              className={styles.input}
              password
              placeholder="请输入密码"
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
            />
          </View>

          {mode === 'register' && (
            <View className={styles.formGroup}>
              <Input
                className={styles.input}
                placeholder="邀请码 (选填)"
                value={inviteCode}
                onInput={(e) => setInviteCode(e.detail.value)}
              />
            </View>
          )}

          <Button
            className={classnames(styles.submitBtn, loading && styles.submitBtnDisabled)}
            onClick={handleSubmit}
            disabled={loading}
          >
            <Text>{loading ? '处理中...' : (mode === 'login' ? '登 录' : '注 册')}</Text>
          </Button>

          <View className={styles.footer}>
            {mode === 'login' ? (
              <>
                <Text className={styles.footerText}>还没有账号？</Text>
                <Text className={styles.linkText} onClick={() => setMode('register')}>立即注册</Text>
              </>
            ) : (
              <>
                <Text className={styles.footerText}>已有账号？</Text>
                <Text className={styles.linkText} onClick={() => setMode('login')}>直接登录</Text>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}