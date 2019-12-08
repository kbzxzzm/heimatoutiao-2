<template>
  <div class="container">
    <van-nav-bar title="搜索结果" left-arrow @click-left="$router.back()" />
    <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
      <!--van-list自带onload事件，组件初始化加载-->
      <van-cell-group>
        <van-cell
          :to="'/article/'+item.art_id.toString()"
          v-for="item in articles"
          :key="item.art_id.toString()"
        >
          <!--遍历-->
          <div class="article_item">
            <h3 class="van-ellipsis">{{item.title}}</h3>
            <!-- 如果为三图，则显示。逻辑运算 -->
            <div class="img_box" v-if="item.cover.type===3">
              <van-image class="w33" fit="cover" :src="item.cover.images[0]" />
              <!--这是图片中的第1张-->
              <van-image class="w33" fit="cover" :src="item.cover.images[1]" />
              <!--这是图片中的第2张-->
              <van-image class="w33" fit="cover" :src="item.cover.images[2]" />
              <!--这是图片中的第3张-->
            </div>
            <div class="img_box" v-if="item.cover.type===1">
              <van-image class="w100" fit="cover" :src="item.cover.images[0]" />
            </div>
            <div class="info_box">
              <span>{{item.aut_name}}</span>
              <span>{{item.comm_count}}评论</span>
              <span>{{item.pubdate|relTime}}</span>
            </div>
          </div>
        </van-cell>
      </van-cell-group>
    </van-list>
  </div>
</template>

<script>
import { searchArticles } from '@/api/article'
export default {
  name: 'search-result',
  data () {
    return {
      loading: false,
      finished: false,
      reqParams: {
        // 查询条件
        page: 1,
        q: this.$route.query.q
      },
      articles: [] // 文章列表
    }
  },
  methods: {
    async onLoad () {
      // 下拉加载数据
      const data = await searchArticles(this.reqParams)
      this.articles.push(...data.results)
      this.loading = false // 结束加载效果
      if (data.results.length) {
        this.reqParams.page++ // 加载下一页，自增+1即可
      } else {
        this.finished = true // 如果下面没数据了，则关闭finished
      }
    }
  }
}
</script>

<style scoped lang='less'>
.container {
  // padding-top: 46px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
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
      height: 180px;
      width: 100%;
    }
  }
  .info_box {
    color: #999;
    line-height: 2;
    position: relative;
    span {
      padding-right: 10px;
    }
  }
}
</style>
