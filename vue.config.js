// vue-cli的配置文件
module.exports = {
  lintOnSave: true,
  devServer: {
    open: true,
    port: 10086
  },
  // 配置
  css: {
    loaderOptions: {
      less: {
        // less-loader的配置
        modifyVars: {
          // key 变量名  value 修改的值
          'blue': '#3296fa'
        }
      }
    }
  },
  publicPath: './'// 默认手机端，必须设置，否则找不到根目录
}
