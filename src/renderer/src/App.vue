<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { usePlayStore } from '@/stores/play'
import { useThemeStore } from "@/stores/theme";
import { useSettingStore } from "@/stores/setting";
import messageApi from "@/modules/messageApi.vue";
import notificationApi from "@/modules/notificationApi.vue";
import modalApi from "@/modules/modalApi.vue";
import Container from "./pages/container.vue";
import emitter from "@/utils/mitt";
import * as api from "@/modules/api";
import axios from "axios";
let settingStore = useSettingStore();
settingStore.init();
if (!window.hasOwnProperty('isElectron')) {
  window.isElectron = false
} else {
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
let showUpdate = ref(false);// 显示更新信息 如果是客户端的话
let updateData = ref({
  newVersion: '',
  description: '',
  userDown: []
})
userStore.updateByStorage();
onMounted(async () => {
  // 更新用户信息
  if (userStore.isLogin === true && Date.now() - userStore.updateTime > 1000 * 60 * 3) {//三分钟
    userStore.updateByCookie();
  }
  // 播放列表初始化
  if (localStorage.getItem('playlist') != null) {
    playStore.playlistInit()
  }
  // 主题初始化
  themeStore.initByLocalStorage()
  // 检查更新相关
  if (window.isElectron) {
    try {
      let res = await axios.get('https://api.xwzkj.top/api/update?platform=windows');
      if (res.data.code === 200 && res.data.data.apiVersion == '1') {
        res = res.data.data;
        console.log(`%c检查更新 当前：${window.api.appVersion} 服务器：${res.version}`,' background-color: lightcyan; padding: 0.5rem; border-radius: 0.5rem');
        if (res.version > window.api.appVersion) {
          updateData.value = {
            newVersion: res?.version,
            description: res?.description ?? '检测到新版本',
            userDown: res?.userDown.map((item) => { return { label: item.name, key: item.url } })
          }
          showUpdate.value = true
        }
      }
    } catch (err) {
      api.error(JSON.stringify(err), '检查更新失败')
    }
  }
})

function openUrl(url) {
  window.api.openUrl(url)
}

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
      <n-modal v-model:show="showUpdate">
        <n-card style="width: 600px" :title="`新版本：${updateData.newVersion}`" :bordered="false" size="huge" role="dialog"
          aria-modal="true">
          <div style="white-space: pre-wrap;" class="overflow-y-auto max-h-300px">
            {{ updateData.description }}
          </div>
          <template #footer>
            <n-dropdown :options="updateData.userDown" @select="openUrl" trigger="click">
              <n-button type="primary">下载</n-button>
            </n-dropdown>
          </template>
        </n-card>
      </n-modal>
      <n-message-provider>
        <messageApi />
      </n-message-provider>
      <n-notification-provider>
        <notificationApi />
      </n-notification-provider>
      <n-modal-provider>
        <modalApi />
      </n-modal-provider>
    </n-config-provider>
  </div>
</template>

<style>
.app,
.bg {
  background-color: v-bind('themeStore.mainColors[0]');
}

*{
  --color-0: v-bind('themeStore.mainColors[0]');
  --color-1: v-bind('themeStore.mainColors[1]');
  --color-2: v-bind('themeStore.mainColors[2]');
  --color-3: v-bind('themeStore.mainColors[3]');
  --color-4: v-bind('themeStore.mainColors[4]');
  --color-5: v-bind('themeStore.mainColors[5]');
  --color-6: v-bind('themeStore.mainColors[6]');
  --color-7: v-bind('themeStore.mainColors[7]');
  --color-8: v-bind('themeStore.mainColors[8]');
  --color-9: v-bind('themeStore.mainColors[9]');
}

.icon,
.n-icon {
  color: var(--color-8);
}

.text1 {
  color: var(--color-9);
}

.text2 {
  color: var(--color-7);
}

.text3 {
  color: var(--color-6);
}


/* 主题色 */
.color0 {
  color: var(--color-0);
}

.color1 {
  color: var(--color-1);
}

.color2 {
  color: var(--color-2);
}

.color3 {
  color: var(--color-3);
}

.color4 {
  color: var(--color-4);
}

.color5 {
  color: var(--color-5);
}

.color6 {
  color: var(--color-6);
}

.color7 {
  color: var(--color-7);
}

.color8 {
  color: var(--color-8);
}

.color9 {
  color: var(--color-9);
}
</style>
