<script setup>
import { useUserStore } from "@/stores/user.js";
let userStore = useUserStore();
userStore.updateByStorage();

if (userStore.isLogin === true && Date.now() - userStore.updateTime > 1000 * 60 * 3) {//三分钟
  userStore.updateByCookie();
}
</script>

<template>
  <router-view v-slot="{ Component }">
    <keep-alive v-if="$route.meta.keepAlive">
      <component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive" />
    </keep-alive>
    <component :is="Component" :key="$route.name" v-else />
  </router-view>

</template>

<style scoped></style>
