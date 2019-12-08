<template>
    <!-- 只有把控制隐藏数据传给父组件，才能改 -->
    <!-- input $event是当前组件想改的值。想改false，但这个值应该交给父组件 -->
  <van-popup :value="value" @input="$emit('input',$event)" @open="isReport=false">
    <van-cell-group v-if="!isReport">
      <van-cell icon="closed-eye" @click="disLikes()">不感兴趣</van-cell>
      <van-cell is-link @click="isReport=true">反馈垃圾内容</van-cell>
      <van-cell>拉黑作者</van-cell>
    </van-cell-group>
    <van-cell-group v-else>
      <van-cell icon="arrow-left" @click="isReport=false">返回</van-cell>
   <van-cell icon="info-o" v-for="item in reports" :key="item.value" @click="report(item.value)">
  {{item.label}}
</van-cell>
    </van-cell-group>
  </van-popup>
  <!-- van-popup已经是根容器了 -->
</template>

<script>
import { report } from '@/api/article'// 举报文章api
import { reports } from '@/api/constants'// 举报类型api
// 不感兴趣，1，封装一个不感兴趣api接口 2，导入进来使用 3 点击不感兴趣单元格，调用接口
// 获取当前点击文章的id
// 4 如果是成功，则提示+关闭对话框+移除当前频道的文章列表对应的文章
// 5 失败错误提示即可
export default {
  name: 'more-action',
  props: {
    value: {// 父给子传的数据，只读，不可修改，因为是单向的
      type: Boolean,
      default: false// 控制对话框状态（举报状态或未举报）
    },
    articleId: { // 不感兴趣的当前文章id
      type: String,
      default: null
    }
  },
  data () {
    return {
      isReport: false,
      reports// 举报类型

    }
  },
  methods: {
    async report (type) {
      try {
        await report(this.articleId, type)
        // 提示
        this.$toast({ type: 'success', message: '举报成功' })
        // 关闭
        this.$emit('input', false)
        // 删除文章
        this.$emit('on-report')
      } catch (e) {
        if (e.response.status === 409) {
          return this.$toast({ message: '已举报过' })
        }
        this.$toast({ type: 'fail', message: '举报失败' })
      }
    },
    async disLikes () {
      try {
        // 提示
        this.$toast({ type: 'success', message: '操作成功' })
        // 关闭
        this.$emit('input', false)
        // 删除文章
        this.$emit('on-dislike')
      } catch (e) {
        this.$toast({ type: 'fail', message: '操作失败' })
      }
    }
  }
}
</script>

<style scoped lang='less'>
.van-popup {
  width: 80%;
  border-radius: 4px;
}
</style>
