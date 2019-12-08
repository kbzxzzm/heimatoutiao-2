<template>
  <div class="container">
    <!-- :lazy-render关闭默认加载       change 激活标签后触发-->
    <van-tabs swipeable v-model="activeIndex" :lazy-render="false" @change="changeChannel">
      <van-tab :key="channel.id" v-for="channel in myChannels" :title="channel.name">
        <!-- remenber记忆  位置   $event 自定义事件，传递的是数据。原生事件为事件对象 -->
        <div ref="scroll-wrapper" class="scroll-wrapper" @scroll="remember($event)">
          <!--产生滚动条的位置-->
          <van-pull-refresh
            v-model="channel.downLoading"
            @refresh="onRefresh"
            :success-text="refreshSuccessText"
          >
            <van-list
              v-model="channel.upLoading"
              :finished="channel.finished"
              finished-text="没有更多文章了"
              @load="onLoad"
            >
              <van-cell v-for="item in channel.articles" :key="item.art_id.toString()"    :to="'/article/'+item.art_id.toString()">
                <div class="article_item">
                  <h3 class="van-ellipsis">{{ item.title }}</h3>
                  <div class="img_box" v-if="item.cover.type === 3">
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[0]" />
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[1]" />
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[2]" />
                  </div>
                  <div class="img_box" v-if="item.cover.type === 1">
                    <!-- vant内置的插件，只要lazy-load属性即可懒加载 -->
                    <!-- img v-lazy=‘地址’ 普通图片使用这个即可-->
                    <van-image lazy-load class="w100" fit="cover" :src="item.cover.images[0]" />
                  </div>
                  <div class="info_box">
                    <span>{{ item.aut_name }}</span>
                    <span>{{ item.comm_count }}评论</span>
                    <span>{{ item.pubdate | relTime }}</span>
                    <!--时间过滤器-->
                    <!-- 传入文章id -->
                    <span
                      v-if="user.token"
                      class="close"
                      @click.stop="openMoreAction(item.art_id.toString())"
                    >
                      <!-- 打开更多选项 ↑ 是item而不是articles-->
                      <van-icon name="cross"></van-icon>
                    </span>
                  </div>
                </div>
              </van-cell>
            </van-list>
          </van-pull-refresh>
        </div>
      </van-tab>
    </van-tabs>
    <!-- 频道按钮 -->
    <span class="bar_btn" slot="nav-right" @click="openChannelEdit">
      <van-icon name="wap-nav"></van-icon>
    </span>
    <!-- v-model 是语法糖，简化:value和@input。绑定value传值  @input收值 -->
    <!-- <more-action v-if="user.token" v-model="showMoreAction" @input='showMoreAction=$event'></more-action> -->
    <more-action
      v-if="user.token"
      v-model="showMoreAction"
      :articleId="articleId"
      @on-disLikes="removeArticle()"
      @on-report="removeArticle()"
    ></more-action>
    <!-- 渲染我的频道 -->
    <channel-edit
      v-model="showChannelEdit"
      :myChannels="myChannels"
      :activeIndex.sync="activeIndex"
    ></channel-edit>
  </div>
</template>

<script>
// 渲染文章列表
// 1. 封装API// 2. 上拉加载 获取数据// 3. 渲染文章// 4. 下拉刷新 获取数据
import ChannelEdit from './components/channel-edit'
import { getMyChannels } from '@/api/channel'
import { getArticles } from '@/api/article'
import { mapState } from 'vuex' // 非父子传值用vuex传值比较方便
import MoreAction from './components/more-action'
export default {
  name: 'home-index',
  data () {
    return {
      // upLoading: false,
      // finished: false,
      // downLoading: false,
      refreshSuccessText: '',
      // articles: [],
      myChannels: [], // 我的频道列表
      activeIndex: 0, // 当前激活的频道索引
      showMoreAction: false, // 控制弹出对话框
      articleId: null,
      showChannelEdit: false
    }
  },
  watch: {
    'user.refresh_token': function () {
      // 监听用户登录或未登录或刷新token//监听user中的refresh_token变化，去更新频道数据
      this.activeIndex = 0 // 只有推荐才是登录和未登录看到的频道
      this.getMyChannels()
      // 加载频道数据，还要加载数据
      this.onLoad() // 文章是依赖频道数据执行，依赖时间戳和id
    }
  },
  components: {
    MoreAction,
    ChannelEdit
  },
  computed: {
    ...mapState(['user']),
    activeChannel () {
      return this.myChannels[this.activeIndex]
    },
    ...mapState(['user']) // 映射计算属性。用户信息
  },
  created () {
    this.getMyChannels()
  },
  activated () {
    // 组件激活钩子 ，激活时候触发，初始化也会触发
    // 获取当前激活的频道滚动容器
    if (this.$refs['scroll-wrapper']) {
      const dom = this.$refs['scroll-wrapper'][this.activeIndex] // 所有的容器，对应的容器
      // 给容器scrollTop赋值，当前激活频道的阅读位置
      dom.scrollTop = this.activeChannel.scrollTop // 这个时候tab切换不能阅读记忆
    }
  },
  methods: {
    openChannelEdit () {
      this.showChannelEdit = true
    },
    removeArticle () {
      const articles = this.activeChannel.articles
      const index = articles.findIndex(item => item.art_id === this.articleId)
      articles.splice(index, 1)
    },
    openMoreAction (id) {
      this.showMoreAction = true // 控制对话框打开
      this.articleId = id // 传入当前不感兴趣文章id
    },
    close (id) {
      this.showMoreAction = true
      this.articleId = id
    },
    remember (e) {
      // 记录当前频道滚动的位置     target是滚动容器中的scrolltop
      this.activeChannel.scrollTop = e.target.scrollTop
    },
    changeChannel () {
      // 手动加载
      // 当你下方没有内容时执行加载，有文章不加载
      if (!this.activeChannel.articles.length) {
        this.activeChannel.upLoading = true
        this.activeChannel.finished = false // 没文章关闭提示文案
        this.onLoad()
      } else {
        // 有数据时候，根据频道记录的阅读位置进行滚动
        // 现在情况是切换频道，tab默认执行滚动顶部操作
        // 要保证自己的操作逻辑在tab组件逻辑之后进行
        // $nextTick是vue提供的。下一帧执行，延时一会儿执行代码。浏览器也有刷新频率的，一秒钟60帧
        this.$nextTick(() => {
          // 这段代码是在默认代码之前执行，我们应该让自己代码在之后执行
          const dom = this.$refs['scroll-wrapper'][this.activeIndex] // 该dom为 <div ref="scroll-wrapper"   $refs['scroll-wrapper']
          dom.scrollTop = this.activeChannel.scrollTop
        }) // 不推荐写定时器让这段代码最后执行
      }
    },
    // 获取我的频道数据
    async getMyChannels () {
      const data = await getMyChannels()
      // map函数作用得到新数组：遍历数组，回调函数，回调函数的返回值，做为新数组的每一个项。
      this.myChannels = [] // 现在还是下面代码有效，必须用延时执行
      this.$nextTick(() => {
        // 频道的顺序
        this.myChannels = data.channels.map(item => {
          return {
            id: item.id,
            name: item.name,
            upLoading: false,
            downLoading: false,
            finished: false,
            articles: [],
            timestamp: Date.now(), // 时间戳
            scrollTop: 0 // 记录阅读位置数据
          }
        })
      })
    },
    // 下拉刷新
    async onRefresh () {
      await this.$sleep()
      // // 模拟获取数据
      // window.setTimeout(() => {
      //   // 获取数据成功
      //   const data = [1, 2, 3, 4]
      //   // 结束刷新效果
      //   this.downLoading = false
      //   if (data.length) {
      //     // 替换数据
      //     this.articles = data
      //     // 提示文案
      //     this.refreshSuccessText = '更新成功'
      //     // 防止不足一屏数据
      //     this.onLoad()
      //     // 重置是否加载完毕
      //     this.finished = false
      //   } else {
      //     // 提示文案
      //     this.refreshSuccessText = '暂无更新'
      //   }
      // }, 1500)

      // 把当前激活频道的时间戳改成当前时间
      this.activeChannel.timestamp = Date.now()
      // 获取数据
      const data = await getArticles(
        this.activeChannel.id,
        this.activeChannel.timestamp
      )
      // 关闭刷新
      this.activeChannel.downLoading = false
      // 判断是否获取数据
      if (data.results.length) {
        // 替换
        this.activeChannel.articles = data.results
        // 文案
        this.refreshSuccessText = '更新成功'
        // 加载下一页数据前  时间戳使用后台给的
        this.activeChannel.timestamp = data.pre_timestamp
        // 主动加载下一页数据
        this.onLoad()
        // 重置是否加载完毕
        this.activeChannel.finished = false
      } else {
        this.refreshSuccessText = '暂无更新'
      }
    },
    // 上拉加载
    async onLoad () {
      if (!this.activeChannel) return false // 严谨 onload没频道不加载，不往下执行
      await this.$sleep()
      // // 模拟获取数据
      // window.setTimeout(() => {
      //   // 获取数据成功
      //   const data = []
      //   for (let i = this.articles.length; i < this.articles.length + 10; i++) {
      //     data.push(i + 1)
      //   }
      //   // 追加数据
      //   this.articles.push(...data)
      //   // 结束加载中效果
      //   this.upLoading = false
      //   // 考虑：是否全部数据加载完毕   假设超过40就没有数据了
      //   if (this.articles.length >= 40) {
      //     this.finished = true
      //   }
      // }, 1500)

      // 当前激活频道的ID和时间戳
      // this.myChannels[this.activeIndex] === this.activeChannel  当前激活的频道
      const data = await getArticles(
        this.activeChannel.id,
        this.activeChannel.timestamp
      )
      // 往当前激活频道下的文章列表中去追加
      this.activeChannel.articles.push(...data.results)
      // 结束当前激活频道的加载效果
      this.activeChannel.upLoading = false
      // 判断是否有数据
      if (data.pre_timestamp) {
        // 存入时间戳，当前激活的频道
        this.activeChannel.timestamp = data.pre_timestamp
      } else {
        this.activeChannel.finished = true
      }
    }
  }
}
</script>
<style scoped lang="less">
.van-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  /deep/ .van-tabs__wrap {
    height: 36px;
    padding-right: 36px;
    .van-tab {
      line-height: 36px;
    }
    .van-tabs__line {
      background-color: #3296fa;
      height: 2px;
    }
  }
  /deep/ .van-tabs__content {
    flex: 1;
    overflow: hidden;
  }
  /deep/ .van-tab__pane {
    height: 100%;
    .scroll-wrapper {
      height: 100%;
      overflow-y: auto; //产生滚动条
    }
  }
}
// 按钮
.bar_btn {
  width: 36px;
  height: 35px;
  position: absolute;
  top: 0;
  right: 0;
  &::before {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 999;
    box-shadow: 0 0 10px #999;
    transform: scale(1, 0.6);
  }
  .van-icon-wap-nav {
    width: 100%;
    height: 100%;
    background: #fff;
    text-align: center;
    line-height: 35px;
    position: relative;
    z-index: 1000;
    &::before {
      font-size: 20px;
    }
  }
}
// 文章列表
.article_item {
  h3 {
    font-weight: normal;
    line-height: 2;
  }
  .img_box {
    display: flex;
    justify-content: space-between;
    .w33 {
      width: 33%;
      height: 90px;
    }
    .w100 {
      width: 100%;
      height: 180px;
    }
  }
  .info_box {
    color: #999;
    line-height: 2;
    position: relative;
    font-size: 12px;
    span {
      padding-right: 10px;
      &.close {
        border: 1px solid #ddd;
        border-radius: 2px;
        line-height: 15px;
        height: 12px;
        width: 16px;
        text-align: center;
        padding-right: 0;
        font-size: 8px;
        position: absolute;
        right: 0;
        top: 7px;
      }
    }
  }
}
</style>
