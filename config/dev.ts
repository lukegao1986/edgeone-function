import type { UserConfigExport } from "@tarojs/cli";
import path from "path";

export default {
  logger: {
    quiet: false,
    stats: true,
  },
  mini: {},
  h5: {
    devServer: {
      port: 10087,
      open: false, //禁止自动打开浏览器
      // 本地开发时同时托管 blog/ 静态站（讲师风采、博客页与线上一致）
      static: {
        directory: path.resolve(__dirname, "..", "blog"),
        publicPath: "/blog/",
        watch: true,
      },
    },
  },
} satisfies UserConfigExport<"webpack5">;
