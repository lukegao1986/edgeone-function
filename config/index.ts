import { defineConfig, type UserConfigExport } from "@tarojs/cli";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import devConfig from "./dev";
import prodConfig from "./prod";
import path from "path";

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<"webpack5">(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport<"webpack5"> = {
    projectName: "taro_template",
    date: "2025-12-10",
    designWidth: 375,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: "src",
    outputRoot: process.env.TARO_OUTPUT_DIR || "dist",
    plugins: ["@tarojs/plugin-html"],
    alias: {
      "@": path.resolve(__dirname, "..", "src"),
    },
    defineConstants: {},
    copy: {
      patterns: [
        {
          // 博客静态站：blog/ 全量拷入产物根目录下的 blog/（构建期烘焙，页面零渲染 JS）
          from: "blog",
          to: path.join(process.env.TARO_OUTPUT_DIR || "dist", "blog"),
        },
        {
          // SEO：robots.txt 拷入产物根目录，供百度/谷歌爬虫读取
          from: "robots.txt",
          to: process.env.TARO_OUTPUT_DIR || "dist",
        },
        {
          // SEO：主站 sitemap 拷入产物根目录
          from: "sitemap.xml",
          to: process.env.TARO_OUTPUT_DIR || "dist",
        },
      ],
      options: {},
    },
    framework: "react",
    compiler: {
      type: "webpack5",
      prebundle: {
        enable: false,
      },
    },
    cache: {
      enable: true, // 开启 Webpack 持久化缓存，加速二次编译
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {
            selectorBlackList: ["nut-"],
          },
        },
        cssModules: {
          enable: true, // 开启 CSS Modules
          config: {
            namingPattern: "module", // 仅 *.module.scss 生效
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
      webpackChain(chain) {
        chain.resolve.plugin("tsconfig-paths").use(TsconfigPathsPlugin);
      },
    },
    h5: {
      publicPath: "/",
      staticDirectory: "static",
      output: {
        filename: "js/[name].[hash:8].js",
        chunkFilename: "js/[name].[chunkhash:8].js",
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: "css/[name].[hash].css",
        chunkFilename: "css/[name].[chunkhash].css",
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: true, // 开启 CSS Modules
          config: {
            namingPattern: "module", // 仅 *.module.scss 生效
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
        pxtransform: {
          enable: true,
          config: {
            selectorBlackList: ["body"],
            baseFontSize: 37.5,
            unitPrecision: 5,
          },
        },
      },
      webpackChain(chain) {
        chain.resolve.plugin("tsconfig-paths").use(TsconfigPathsPlugin);
      },
    },
    rn: {
      appName: "taroDemo",
      postcss: {
        cssModules: {
          enable: true,
        },
      },
    },
  };
  if (process.env.NODE_ENV === "development") {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig);
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig);
});
