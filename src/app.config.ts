export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/register/index',
    'pages/dashboard/index',
    'pages/errorbook/index',
    'pages/profile/index',
    'pages/practice/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'EJU 刷题系统',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#9CA3B0',
    selectedColor: '#3B6EC9',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/dashboard/index',
        text: '学习大厅'
      },
      {
        pagePath: 'pages/errorbook/index',
        text: '错题本'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
