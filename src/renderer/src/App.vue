<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { usePlayStore } from '@/stores/play'
import { useThemeStore } from "@/stores/theme";
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
let themeStore = useThemeStore();
let textColor = computed(() => {
  return themeStore.styleColors.text
})
let bgcolor = computed(() => {
  return themeStore.styleColors.background
})

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
  //主题初始化
  themeStore.initByLocalStorage()
})
emitter.on('changeTheme', (theme) => {
  api.objDeepMerge(themeOverrides.value, theme)
  console.log(themeOverrides.value);
})


</script>

<template>
  <div class="app">
    <n-config-provider :theme-overrides="themeOverrides">
      <Container />
      <n-message-provider>
        <messageApi />
      </n-message-provider>
    </n-config-provider>
  </div>
</template>

<style>
.app{
  background-color: v-bind(bgcolor);
}
.icon,
.n-icon{
  color: v-bind(textColor);
}
div{
  color: v-bind(textColor);
}
</style>
