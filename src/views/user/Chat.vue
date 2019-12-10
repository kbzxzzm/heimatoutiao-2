<template>
  <div class="container">
    <van-nav-bar fixed left-arrow @click-left="$router.back()" title="小智同学"></van-nav-bar>
    <!-- 控制滚到最底部 -->
    <div class="chat-list" ref="list">
      <!--聊天记录列表-->
      <div
        class="chat-item"
        :class="{left:item.name==='xz',right:item.name==='self'}"
        v-for="(item,i) in list"
        :key="i"
      >
        <!--小智同学说的，左边头像-->
        <van-image fit="cover" v-if="item.name==='xz'" round :src="xzAvatar" />
        <div class="chat-pao">{{item.msg}}</div>
        <van-image v-if="item.name==='self'" fit="cover" round :src="photo" />
      </div>

      <!-- <div class="chat-item right">
        <div class="chat-pao">ewqewq</div>

        <van-image fit="cover" round :src="photo||'https://img.yzcdn.cn/vant/cat.jpeg'" />
      </div>-->
    </div>
    <div class="reply-container van-hairline--top">
      <!--输入框-->
      <van-field v-model="value" placeholder="说点什么...">
        <span @click="send()" slot="button" style="font-size:12px;color:#999">提交</span>
      </van-field>
    </div>
  </div>
</template>
<script>
// 引入npm i --save vue-socket.io
// web打包img的静态src指定图片。不满足就不会打包图片。而网络图片是请求
import xzAvatar from '../../assets/images/xz.png' // 凡是用imort导入的东西，webpack都会去打包
import { mapState } from 'vuex'
import io from 'socket.io-client' // 导入
export default {
  computed: {
    ...mapState(['photo', 'user']) // 映射属性,将来聊天需要token身份认证
  },
  created () {
    this.socket = io('http://ttapi.research.itcast.cn', {
      // 使用socket客户端
      query: {
        // 连接时的传参
        token: this.user.token
      }
    })
    this.socket.on('connect', () => {
      // 建了链接后默认  小智给你打招呼
      this.list.push({ name: 'xz', msg: '你好' })
    })
    this.socket.on('message', data => {
      this.list.push({ name: 'xz', msg: data.msg })
      this.scrollBottom()
    })
  },
  beforeDestroy () { // 组件销毁前
    this.socket.close() // 关闭连接
  },
  data () {
    return {
      list: [], // 聊天记录列表，要区分你说还是自己说的，约定{name:'xz',msg:''} {name:'self',msg:''}
      value: '', // 输入框内容
      xzAvatar, // 模板中使用，必须在data中声明
      socket: null
    }
  },
  methods: {
    scrollBottom () {
      this.$nextTick(() => {
        this.$refs.list.scrollTop = this.$refs.list.scrollHeight
      })
    },
    send () {
      this.socket.emit('message', { msg: this.value, timestamp: Date.now() })
      this.list.push({ name: 'self', msg: this.value })
      this.value = ''
      this.scrollBottom()
    }
  }
}
</script>

<style scoped lang='less'>
.container {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  background: #fafafa;
  padding: 46px 0 50px 0;
  .chat-list {
    height: 100%;
    overflow-y: scroll;
    .chat-item {
      padding: 10px;
      .van-image {
        vertical-align: top;
        width: 40px;
        height: 40px;
      }
      .chat-pao {
        //聊天气泡
        vertical-align: top;
        display: inline-block;
        min-width: 40px;
        max-width: 70%;
        min-height: 40px;
        line-height: 38px;
        border: 0.5px solid #c2d9ea;
        border-radius: 4px;
        position: relative;
        padding: 0 10px;
        background-color: #e0effb;
        word-break: break-all;
        font-size: 14px;
        color: #333;
        &::before {
          content: "";
          width: 10px;
          height: 10px;
          position: absolute;
          top: 12px;
          border-top: 0.5px solid #c2d9ea;
          border-right: 0.5px solid #c2d9ea;
          background: #e0effb;
        }
      }
    }
  }
}
.chat-item.right {
  text-align: right;
  .chat-pao {
    margin-left: 0;
    margin-right: 15px;
    &::before {
      right: -6px;
      transform: rotate(45deg);
    }
  }
}
.chat-item.left {
  text-align: left;
  .chat-pao {
    margin-left: 15px;
    margin-right: 0;
    &::before {
      left: -5px;
      transform: rotate(-135deg);
    }
  }
}
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 44px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
}
</style>
