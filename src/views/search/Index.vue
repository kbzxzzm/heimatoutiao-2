<template>
  <div class="container">
    <!-- 搜索框： -->
    <van-nav-bar title="搜索中心" left-arrow @click-left="$router.back()" />
    <van-search v-model.trim="q" placeholder="请输入搜索关键词" shape="round" @search="onSearch" />
    <!-- 联想框 -->
    <van-cell-group class="suggest-box" v-if="q">
      <van-cell icon="search" v-for="sug in suggestList" :key="sug">
        <p v-html="sug" @click="onSearch(sug.replace(`<span>${q}</span>`,q))">
        </p>
      </van-cell>
    </van-cell-group>
    <!--历史记录：有数据才显示-->
    <div class="history-box" v-else-if="historyList.length">
      <div class="head">
        <span>历史记录</span>
        <van-icon name="delete" @click="clearHistory()"></van-icon>
      </div>
      <van-cell-group>
        <van-cell  v-for="key in historyList" :key="key">
          <a class="word_btn" @click="toSearch(key)">{{key}}</a>
          <van-icon class="close_btn" slot="right-icon" name="cross"  @click="delHistory(key)" />
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>
<script>
import { suggest } from '@/api/article'
const KEY = 'hm-toutiao-85-history-key'// 约定KEY,本地存储中的值必须是双引号，否则报错
export default {
  name: 'search-index',
  data () {
    return {
      suggestList: [], // 声明搜索内容
      q: '',
      historyList: JSON.parse(window.localStorage.getItem(KEY) || '[]')// 获取本地存储有值为true，无值为false
    }
  },
  watch: {
    q () { // 监听q的变化
      window.clearTimeout(this.timer)// 函数防抖。在规定时间内再次执行，清除上一次执行，重新执行
      this.timer = window.setTimeout(async () => { // 函数节流一般用于发送短信，轮播图，必须等上一次执行完毕，再执行下一个事件
        if (!this.q) {
          this.suggestList = []
          return// 不再往下执行
        }
        const data = await suggest(this.q)
        this.suggestList = data.options.map(item => item.toLowerCase().replace(this.q, `<span>${this.q}</span>`))
      }, 200)
    }
  },
  methods: {
    clearHistory () {
      this.historyList = []
      window.localStorage.setItem(KEY, JSON.stringify(this.historyList))
    },
    toSearch (key) {
      this.$router.push({ path: '/search/result', query: { q: key } })
    },
    onSearch (key) { // 进行搜索，根据历史去搜索 触发条件：PC端按下回车键触发，手机上按下虚拟键盘（输入法）中的enter键|搜索键
      if (!key.trim()) return false // 终止下面操作
      const keySet = new Set(this.historyList)// new Set(数组)具有不允许数组中出现重复内容
      keySet.add(key)
      this.historyList = Array.from(keySet)// 存在本地，需要数组格式
      window.localStorage.setItem(KEY, JSON.stringify(this.historyList))// 存入
      this.$router.push({ path: 'search/result', query: { q: key } })
    },
    delHistory (key) { // 删除历史
      const index = this.historyList.findIndex(item => item === key)
      this.historyList.splice(index, 1)
      window.localStorage.setItem(KEY, JSON.stringify(this.historyList))
    }
  }
}
</script>

<style scoped lang='less'>
.history-box {
  padding: 0 20px;
  .head {
    line-height: 36px;
    color: #999;
    .van-icon {
      font-size: 16px;
      float: right;
      margin-top: 10px;
    }
  }
  .van-cell {
    padding: 10px 0;
  }
  .word_btn {
    color: #3296fa;
  }
  .close_btn {
    margin-top: 5px;
    color: #999;
  }
}
.suggest-box {
  /deep/ .van-cell {
    padding: 10px 20px;
    color: #999;
    p {
      span {
        color: red;
      }
    }
  }
}
</style>
