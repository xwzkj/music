<template>
  <div class="container">
    <!-- 上半部分 -->
    <div class="container-main">
      <!-- 左边导航栏 -->
      <div class="container-nav">
        <navigation />
      </div>
      <!-- 右侧的一整块 -->
      <div class="container-content">
        <!-- 头部 -->
        <headerTop />
        <!-- router-view -->
        <div class="container-router-view">
          <router-view v-slot="{ Component }">
            <keep-alive v-if="$route.meta.keepAlive">
              <component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive" />
            </keep-alive>
            <component :is="Component" :key="$route.name" v-if="!$route.meta.keepAlive" />
          </router-view>
        </div>
      </div>
    </div>
    <!-- 控制条 -->
    <MusicController />
  </div>
</template>
<script setup lang="js">
import headerTop from '@/components/headerTop.vue'
import navigation from '@/components/navigation.vue';
import MusicController from '@/components/musicController.vue';
</script>
<style scoped>
.container {
  height: calc(var(--vh, 1vh) * 100);
  width: calc(var(--vw, 1vw) * 100);
  max-width: calc(var(--vw, 1vw) * 100);
  overflow: hidden;
}

.container-main {
  display: flex;
  height: calc(var(--vh, 1vh) * 100 - 7rem);
}

.container-nav {
  flex: 0 0 auto;
  width: 12rem;
}

.container-content {
  flex: 1;
  max-width: calc(var(--vw, 1vw) * 100 - 12rem);
  display: flex;
  flex-direction: column;
}

.container-router-view {
  max-width: 100%;
  overflow-y: scroll;
  flex: 1;
}
</style>