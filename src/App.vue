<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { usePlayStore } from '@/stores/play'
import MessageApi from "@/modules/messageApi.vue";
import Container from "./pages/container.vue";
import emitter from "@/utils/mitt";
let themeOverrides = ref({});
let userStore = useUserStore();
let playStore = usePlayStore();
userStore.updateByStorage();
onMounted(() => {
  //更新用户信息
  if (userStore.isLogin === true && Date.now() - userStore.updateTime > 1000 * 60 * 3) {//三分钟
    userStore.updateByCookie();
  }
  //播放列表初始化
  if (localStorage.getItem('playlist') != null) {
    playStore.playlistInit()
  }
})
emitter.on('changeTheme', (theme) => {
  themeOverrides.value = { ...themeOverrides.value, ...theme }
  console.log(theme,themeOverrides);
})


</script>

<template>
  <div>
    <n-config-provider :theme-overrides="themeOverrides">
      <Container />
      <n-message-provider>
        <messageApi />
      </n-message-provider>
    </n-config-provider>
  </div>
</template>

<style scoped></style>
