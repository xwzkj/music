<template>
  <headerTop />

  <router-view v-slot="{ Component }">
    <keep-alive v-if="$route.meta.keepAlive">
      <component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive" />
    </keep-alive>
    <component :is="Component" :key="$route.name" v-else/>
  </router-view>
</template>
<script setup lang="js">
import headerTop from '@/components/headerTop.vue'
</script>
<style></style>