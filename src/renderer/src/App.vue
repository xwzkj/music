<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { usePlayStore } from '@/stores/play'
import { useThemeStore } from "@/stores/theme";
import MessageApi from "@/modules/messageApi.vue";
import Container from "./pages/container.vue";
import emitter from "@/utils/mitt";
import * as api from "@/modules/api";
//判断环境是否是electron
window.isElectron = window.hasOwnProperty("netease");

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
  background-color: v-bind('themeStore.mainColors[0]');
}


.icon,
.n-icon{
  color: v-bind('themeStore.mainColors[8]');
}

.text1{
  color: v-bind('themeStore.mainColors[9]');
}

.text2{
  color: v-bind('themeStore.mainColors[7]');
}

.text3{
  color: v-bind('themeStore.mainColors[6]');
}


/* 主题色 */
.color0{
  color: v-bind('themeStore.mainColors[0]');
}
.color1{
  color: v-bind('themeStore.mainColors[1]');
}
.color2{
  color: v-bind('themeStore.mainColors[2]');
}
.color3{
  color: v-bind('themeStore.mainColors[3]');
}
.color4{
  color: v-bind('themeStore.mainColors[4]');
}
.color5{
  color: v-bind('themeStore.mainColors[5]');
}
.color6{
  color: v-bind('themeStore.mainColors[6]');
}
.color7{
  color: v-bind('themeStore.mainColors[7]');
}
.color8{
  color: v-bind('themeStore.mainColors[8]');
}
.color9{
  color: v-bind('themeStore.mainColors[9]');
}
</style>
