// 封装一个基于VUE的插件
// 插件中：挂载原型函数  注册组件  过滤器  自定义指令
// 定义插件的固定格式是：导出一个对象，对象中必须有install属性，指向一个函数
// 函数中默认传入 Vue 构造函数 ，基于 Vue 来扩展功能
// 保证main足够干净
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
dayjs.extend(relativeTime)
const sleep = () => {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      resolve()
    }, 1500)
  })
}

// value是使用过滤器，管道前js表达式执行结果
const relTime = (value) => {
// 对value日期数据进行转换
  // return 相对时间，‘使用插件转换时间’ moment.js可以转换，但是moment体积过大，所以用另外一个，day.js。较为轻量级体积
  return dayjs().locale('zh-cn').from(value)
}

export default {
  install (Vue) {
    // 基于 Vue 来扩展功能
    Vue.prototype.$sleep = sleep// vue构造函数内写过滤器
    // 过滤器名，后面是处理函数，形参，这个值作用是接收管道服务器前的值
    Vue.filter('relTime', relTime)// 不能简写，一个是过滤器名，一个是函数//不要去影响install大小，所以函数写在外面
  }
}
