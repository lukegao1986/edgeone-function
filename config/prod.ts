import type { UserConfigExport } from '@tarojs/cli';
export default {
  mini: {},
  h5: {
    devServer: {
      proxy: {
        '/api': {
          target: 'https://edgeone-function-dp2cjredqrrk.edgeone.cool',
          changeOrigin: true,
        },
      },
    },
  },
} satisfies UserConfigExport<'webpack5'>;
