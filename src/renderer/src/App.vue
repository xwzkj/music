<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { usePlayStore } from '@/stores/play'
import { useThemeStore } from "@/stores/theme";
import { useSettingStore } from "@/stores/setting";
import messageApi from "@/modules/messageApi.vue";
import notificationApi from "@/modules/notificationApi.vue";
import Container from "./pages/container.vue";
import emitter from "@/utils/mitt";
import * as api from "@/modules/api";
let settingStore = useSettingStore();
settingStore.init();
if (!window.hasOwnProperty('isElectron')) {
  window.isElectron = false
}else{
  settingStore.setLyricWindowShow('auto')
}

let themeOverrides = ref({
  common: {
    borderRadius: "10px",
    borderRadiusSmall: "7px"
  }
});
let userStore = useUserStore();
let playStore = usePlayStore();
let themeStore = useThemeStore();

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
  // console.log(themeOverrides.value);
})

// 解决移动端vh包含导航栏问题
let setRealVhVw = () => {
  let realVh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${realVh}px`);
  let realVw = window.innerWidth * 0.01;
  document.documentElement.style.setProperty('--vw', `${realVw}px`);
}
setRealVhVw = api.debounce(setRealVhVw, 100, 1)

window.addEventListener('resize', setRealVhVw);
window.addEventListener('orientationchange', setRealVhVw);
document.addEventListener('DOMContentLoaded', setRealVhVw);


</script>

<template>
  <div class="app">
    <n-config-provider :theme-overrides="themeOverrides">
      <Container />
      <n-message-provider>
        <messageApi />
      </n-message-provider>
      <n-notification-provider>
        <notificationApi />
      </n-notification-provider>
    </n-config-provider>
  </div>
</template>

<style>
.app,
.bg {
  background-color: v-bind('themeStore.mainColors[0]');
}


.icon,
.n-icon {
  color: v-bind('themeStore.mainColors[8]');
}

.text1 {
  color: v-bind('themeStore.mainColors[9]');
}

.text2 {
  color: v-bind('themeStore.mainColors[7]');
}

.text3 {
  color: v-bind('themeStore.mainColors[6]');
}


/* 主题色 */
.color0 {
  color: v-bind('themeStore.mainColors[0]');
}

.color1 {
  color: v-bind('themeStore.mainColors[1]');
}

.color2 {
  color: v-bind('themeStore.mainColors[2]');
}

.color3 {
  color: v-bind('themeStore.mainColors[3]');
}

.color4 {
  color: v-bind('themeStore.mainColors[4]');
}

.color5 {
  color: v-bind('themeStore.mainColors[5]');
}

.color6 {
  color: v-bind('themeStore.mainColors[6]');
}

.color7 {
  color: v-bind('themeStore.mainColors[7]');
}

.color8 {
  color: v-bind('themeStore.mainColors[8]');
}

.color9 {
  color: v-bind('themeStore.mainColors[9]');
}
</style>
