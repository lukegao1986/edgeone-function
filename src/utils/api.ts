// 在 EdgeOne Pages 中，前端静态文件和云函数部署在同一个域名下
// 所以无论是本地开发（走 webpack proxy）还是线上环境，直接使用相对路径即可
export const apiBase = '';