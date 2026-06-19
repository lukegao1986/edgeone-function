import type { UserConfigExport } from '@tarojs/cli';
export default {
  mini: {},
  h5: {
    devServer: {
      proxy: {
        '/api': {
          target: 'http://10.0.0.3:3000', // 指向未来部署在轻量应用服务器上的 Node.js 后端内网地址
          changeOrigin: true,
        },
      },
    },
  },
} satisfies UserConfigExport<'webpack5'>;
