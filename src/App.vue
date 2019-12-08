<template>
  <div id="app">
    <!-- 一级路由对应组件显示容器 -->
    <keep-alive>
      <!--组件缓存，这个时候所有组件都被缓存！（阅读记忆），这个时候只需要按需缓存-->
      <!--什么时候不被缓存：外面没有keep-alive就不被缓存了 -->
      <!-- 去判断当前访问的组件，如果是首页和文章详情就放keep-alive中，反之不放 -->
      <!-- 按需缓存 -->
      <!-- 这种老办法可以解决二级路由嵌套问题 -->
      <router-view v-if="$route.meta.iskeepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.iskeepAlive"></router-view>
  </div>
</template>

<style lang="less"></style>
