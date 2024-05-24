<script setup>
import { ref, onMounted, watch } from "vue";
import { storeToRefs } from 'pinia'
import { useUserStore } from "@/stores/user";
import { usePlayStore } from '@/stores/play'
import * as api from '@/modules/api'
let userStore = useUserStore();
let playStore = usePlayStore();
let { currentMusic } = storeToRefs(playStore)
userStore.updateByStorage();
let audio = ref(null);

//更新用户信息
if (userStore.isLogin === true && Date.now() - userStore.updateTime > 1000 * 60 * 3) {//三分钟
  userStore.updateByCookie();
}
onMounted(() => {

  if (localStorage.getItem('playlist') != null) {
    playStore.playlistInit()
  }

})


</script>

<template>
  <div>
    <router-view v-slot="{ Component }">
      <keep-alive v-if="$route.meta.keepAlive">
        <component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive" />
      </keep-alive>
      <component :is="Component" :key="$route.name" v-else />
    </router-view>
  </div>
</template>

<style scoped></style>
