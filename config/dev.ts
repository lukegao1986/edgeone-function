import type { UserConfigExport } from '@tarojs/cli';
export default {
  logger: {
    quiet: false,
    stats: true,
  },
  mini: {},
  h5: {
    devServer: {
      open: false, //禁止自动打开浏览器
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
        },
      },
    },
  },
} satisfies UserConfigExport<'webpack5'>;
