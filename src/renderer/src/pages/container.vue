<template>
  <div id="container">
    <div class="container-main">
      <div class="container-nav">
        <navigation />
      </div>
      <div class="container-content">
        <headerTop />
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
    <div class="container-ctrl-bar">
      <MusicController />
    </div>
  </div>
</template>
<script setup lang="js">
import headerTop from '@/components/headerTop.vue'
import navigation from '@/components/navigation.vue';
import MusicController from '@/components/musicController.vue';
</script>
<style scoped>
.container-main {
  display: flex;
}

.container-nav {
  flex: 0 0 auto;
  width: 12rem;
}

.container-content {
  flex: 1;
  height: calc(var(--vh, 1vh) * 100 - 11.5rem);
  display: flex;
  flex-direction: column;
}

.container-router-view {
  overflow-y: scroll;
  flex: 1;
}
</style>