import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { setupMock } from './utils/mock';
// 全局样式
import './app.scss';

// 本地 H5 预览时启用 mock 数据层（生产构建自动跳过）
setupMock();

function App(props) {
  // 可以使用所有的 React Hooks
  useEffect(() => {});

  // 对应 onShow
  useDidShow(() => {});

  // 对应 onHide
  useDidHide(() => {});

  return props.children;
}

export default App;
