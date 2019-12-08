<template>
  <div class="comment">
  <!-- 评论列表  绑定加载事件-->
  <van-list v-model="loading" @load="loadComments()" :finished="finished" finished-text="没有更多了">
    <div
      class="item van-hairline--bottom van-hairline--top"
      v-for="item in comments"
      :key="item.id"
    >
      <van-image round width="1rem" height="1rem" fit="fill" :src="item.aut_photo" />
      <!--注意，src属性绑定不需要双花括号-->
      <div class="info">
        <p>
          <span class="name">{{item.aut_name}}</span>
          <span style="float:right">
            <span class="van-icon van-icon-good-job-o zan"></span>
            <span class="count">{{item.is_liking||''}}</span>
          </span>
        </p>
        <p>{{item.content}}</p>
        <p>
          <span class="time">{{item.pubdate|relTime}}</span>&nbsp;
          <van-tag plain @click="openReplyDialog(item.com_id.toString())">{{item.reply_count}} 回复</van-tag>
        </p>
      </div>
      <!-- 底部输入框 -->
      <div class="reply-container van-hairline--top">
        <van-field v-model.trim="value" :placeholder="showReply?'写回复...':'写评论...'">
          <van-loading v-if="commentLoading" slot="button" type="spinner" size="16px"></van-loading>
          <span class="submit" v-else slot="button" @click="submit()">提交</span>
        </van-field>
      </div>
      <!-- 回复 -->
<van-action-sheet @load="loadComments" v-model="showReply" class="reply_dailog" title="回复评论">
  <van-list @load="loadReplys()" :immediate-check="false"   v-model="reply.loading" :finished="reply.finished" finished-text="没有更多了">
    <div class="item van-hairline--bottom van-hairline--top" v-for="item in reply.list" :key="item.com_id.toString()">
      <van-image round width="1rem" height="1rem" fit="fill" :src="item.aut_photo" />
      <div class="info">
        <p><span class="name">{{item.aut_name}}</span></p>
        <p>{{item.content}}</p>
        <p><span class="time">{{item.pubdate|relTime}}</span></p>
      </div>
    </div>
  </van-list>
</van-action-sheet>
    </div>
  </van-list>
    </div>
</template>

<script>
import { getCommentsOrReplys, commentOrReply } from '@/api/article'
export default {
  data () {
    return {
      // 输入内容
      value: '',
      // 提交评论或回复内容 提交状态
      submiting: false,
      // ----------- 评论列表相关数据 --------------
      loading: false,
      finished: false,
      commentLoading: '',
      comments: [],
      // 显示回复对话框
      showReply: false,
      // 回复相关数据
      reply: {
        loading: false,
        finished: false,
        offset: '', // 每个回复列表都有自己的偏移量
        list: [] // 回复列表
      },
      commentId: null // 评论ID

    }
  },
  methods: {
    // 提交 评论或者回复
    async submit () {
      // 判断是否有输入内容
      if (!this.value) return false
      // 开启提交效果
      this.submiting = true
      await this.$sleep()
      try {
        if (this.showReply) {
        // 回复
          const data = await commentOrReply(this.commentId, this.value, this.$route.params.id)
          this.$toast.success('回复成功')
          // 在回复列表顶部追加一项数据 data.new_obj
          this.reply.list.unshift(data.new_obj)
          // 在当前回复的评论数据中 累加回复的数量
          const comment = this.comments.find(item => item.com_id.toString() === this.commentId)
          comment.reply_count++
        } else {
        // 评论
          const data = await commentOrReply(this.$route.params.id, this.value)
          this.$toast.success('评论成功')
          this.comments.unshift(data.new_obj)
        }
        // 关闭提交效果
        this.submiting = false
        // 清空内容
        this.value = ''
      } catch (e) {
        this.$toast.success('操作失败')
        this.submiting = false
      }
    },
    // 打开回复列表，打开就拿数据
    openReplyDialog (comId) { // 打开回复对话框
      this.showReply = true
      this.commentId = comId// 将传入的id赋值给data成员中的id
      // 清空 回复 列表
      this.reply.list = []
      // 开启加载效果
      this.reply.loading = true
      // 重置 没有更多数据
      this.reply.finished = false
      // 重置 偏移量
      this.reply.offset = null
      // 加载回复
      this.loadReplys()// 加载回复列表
    },
    async  loadReplys () { // 加载回复列表
      const data = await getCommentsOrReplys({
        type: 'c', // 传入 a为评论，c为回复
        source: this.commentId, // 传入data里面的id（好麻烦..左右传值）
        offset: this.reply.offset // 每个回复列表都有自己的ID
      })
      this.reply.list.push(...data.results)
      this.loading = false// 结束加载状态
      if (data.last_id > data.end_id) { // 此时还有数据
        this.reply.offset = data.last_id
      } else {
        this.reply.finished = true
      }
    },
    async loadComments () {
      // 组件激活时候加载
      const data = await getCommentsOrReplys({
        type: 'a', // 传入 a为评论，c为回复
        source: this.$route.params.id, // 传入链接上的文章id
        offset: this.offset // 偏移（拿到数据最后一个ID）当当前文章最后ID大于所有文章评论ID。则后面还有数据
      })
      this.comments.push(...data.results) // 追加到评论中
      this.loading = false // 结束加载状态
      if (data.last_id > data.end_id) {
        // 还有数据
        this.offset = data.last_id // 将最后ID赋值给偏移
      } else {
        // 没有数据了
        this.finished = true
      }
    }
  },
  activated () {
    // 组件初始化时
    this.comments = [] // 清空上一篇文章评论
    this.loading = true // 开启加载中效果
    this.finished = false // 重置是否完全加载完毕状态
    this.offset = null // 重置偏移
    this.loadComments() //
  }
}
</script>

<style lang="less" scoped>
.comment {
  margin-top: 10px;
  /deep/ .item {
    display: flex;
    padding: 10px 0;
    .info {
      flex: 1;
      padding-left: 10px;
      .name {
        color: #069;
      }
      .zan {
        vertical-align: middle;
        padding-right: 2px;
      }
      .count {
        vertical-align: middle;
        font-size: 10px;
        color: #666;
      }
      .time {
        color: #666;
      }
      p {
        padding: 5px 0;
        margin: 0;
      }
    }
  }
  /deep/ .van-button:active::before {
    background: transparent;
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
  .submit {
    font-size: 12px;
    color: #3296fa;
  }
}
.van-popup--bottom{
  &.van-popup--round{
    border-radius: 0;
  }
}
.reply_dailog {
  height: 100%;
  max-height: 100%;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  .van-action-sheet__header {
    background: #3296fa;
    color: #fff;
    .van-icon-close {
      color: #fff;
    }
  }
  .van-action-sheet__content{
    flex: 1;
    overflow-y: auto;
    padding: 0 10px 44px;
  }
}

</style>
