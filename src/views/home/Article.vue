<template>
  <div class="container" @scroll="remember($event)" ref="container">
    <van-nav-bar fixed title="文章详情" left-arrow @click-left="$router.back()" />
    <div class="detail" v-if="article">
      <h3 class="title">{{article.title}}</h3>
      <div class="author">
        <van-image round width="1rem" height="1rem" fit="fill" :src="article.aut_photo" />
        <div class="text">
          <p class="name">{{article.aut_name}}</p>
          <p class="time">{{article.pubdate|relTime}}</p>
        </div>
        <!-- 三元运算，如果article.is_followed为true，则为已关注，反之未关注，切换对作者关注状态 -->
        <van-button round size="small" type="info" @click="followed()">{{article.is_followed?'已关注':'+ 关注'}}</van-button>
      </div>
      <div class="content">
        <p>文章的内容</p>
      </div>
      <div class="zan">
        <van-button round size="small"  @click="toggleAttitude(1)" :class="{active:article.attitude===1}" plain icon="like-o">点赞</van-button>&nbsp;&nbsp;&nbsp;&nbsp;
        <van-button round size="small" @click="toggleAttitude(0)"  :class="{active:article.attitude===0}" plain icon="delete">不喜欢</van-button>
      </div>
      <!-- 评论视图 -->
    <comment></comment>
    </div>
  </div>
</template>

<script>
import Comment from './components/comment'
// 点赞，同时取消点赞。不喜欢，取消不喜欢。同时依赖的同一个状态
// 1接口有四个。2绑定点赞按钮（传参1），不喜欢按钮（传参0），同一个处理函数 3，在函数中判断点击的是哪一个按钮
import { getArticle, likings, unLikings, unDisLikes, disLikes } from '@/api/article'
import { followed, unFollowed } from '@/api/user'// 关注||取消关注
export default {
  components: {
    Comment
  },
  name: 'home-article',
  data () {
    return {
      // 文章详情
      article: {
        art_id: ''
      },
      // 阅读位置
      scrollTop: 0
    }
  },
  activated () {
    // 当前文章ID：this.$route.params.id  (类型：字符串)
    // 之前文章ID：this.article.art_id.toString()  (art_id 有值)
    if (this.$route.params.id !== this.article.art_id.toString()) {
      // 重置阅读位置
      this.scrollTop = 0
      // 获取文章数据
      this.getArticle()
    } else {
      // 跳转阅读位置
      this.$refs['container'].scrollTop = this.scrollTop
    }
  },
  methods: {
    // 点赞 取消点赞  不喜欢  取消不喜欢  两个按钮，四个状态
    async toggleAttitude (btnType) {
      try {
        if (btnType === 1) { // 点赞
          if (this.article.attitude === 1) { // 取消点赞
            await unLikings(this.article.art_id)// 调用对应的接口
            this.article.attitude = -1 // 按钮状态的改变 不能=0，等于0就是不喜欢了
          } else { // 点赞
            await likings(this.article.art_id)
            this.article.attitude = 1
          }
        } else {
          if (this.article.attitude === 0) {
          // 取消不喜欢
            await unDisLikes(this.article.art_id)
            this.article.attitude = -1
          } else {
          // 不喜欢
            await disLikes(this.article.art_id)
            this.article.attitude = 0
          }
        }
        // 统一提示
        this.$toast.success('操作成功')
      } catch (e) {
        if (e.response.status !== 401) { // 捕获异常。想在用户未登录时提示
          this.$toast.fail('操作失败')
        }
      }
    },
    async followed () { // 添加关注取消关注事件
      try { // 根据关注状态，切换两个接口
        if (this.article.is_followed) { // 如果有值，说明已经关注了，则取消关注
          await unFollowed(this.article.aut_id)
          this.$toast.success('取消关注成功')
          this.article.is_followed = false // 按钮关闭
        } else { // 添加关注
          await followed(this.article.aut_id)// 传入用户id
          this.$toast.success('添加关注成功')
          this.article.is_followed = true // 按钮开启
        }
      } catch (e) {
        if (e.response.status !== 401) { // 捕获异常
          this.$toast.fail('操作失败')
        }
      }
    },
    remember (e) { // 记录阅读位置
      this.scrollTop = e.target.scrollTop
    },
    // 获取文章详情
    async getArticle () {
      const data = await getArticle(this.$route.params.id)
      this.article = data
    }
  }
}
</script>

<style scoped lang='less'>
.container {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
.detail {
  padding: 46px 10px 44px;
  height: 1000%;
  .title {
    font-size: 18px;
    line-height: 2;
  }
  .zan {
    text-align: center;
    padding: 10px 0;
    .active {
      border-color: red;
      color: red;
    }
  }
  .author {
    padding: 10px 0;
    display: flex;
    .text {
      flex: 1;
      padding-left: 10px;
      line-height: 1.5;
      .name {
        font-size: 14px;
        margin: 0;
      }
      .time {
        margin: 0;
        font-size: 12px;
        color: #999;
      }
    }
  }
  // 内容中包含：img 特别宽  code pre 不能换行
  .content {
    padding: 20px 0;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-all;
    /deep/ img {
      max-width: 100%;
      background: #f9f9f9;
    }
    /deep/ code {
      white-space: pre-wrap;
    }
    /deep/ pre {
      white-space: pre-wrap;
    }
  }
}
</style>
