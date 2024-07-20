<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { usePlayStore } from '@/stores/play'
import MessageApi from "@/modules/messageApi.vue";
import Container from "./pages/container.vue";
import emitter from "@/utils/mitt";
import * as api from "@/modules/api";
let themeOverrides = ref({
  common: {
    borderRadius: "10px",
    borderRadiusSmall: "7px"
  }
});
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
  api.objDeepMerge(themeOverrides.value, theme)
  console.log(themeOverrides.value);
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
