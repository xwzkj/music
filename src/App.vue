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
  //获取audio元素并保存到pinia
  playStore.player = audio.value
  audio.value.addEventListener('play', () => { playStore.paused = false })
  audio.value.addEventListener('pause', () => { playStore.paused = true })
  audio.value.addEventListener('ended', () => { playStore.paused = true })
  setInterval(() => {
    try{
    if ("mediaSession" in navigator && !isNaN(audio.value.currentTime) && !isNaN(audio.value.duration)) {
      navigator.mediaSession.setPositionState({
        duration: audio.value.duration,
        position: audio.value.currentTime
      });
    }}catch(e){
      api.error(`出错了！ \n位置：app.vue onMounted mediaSession \n${e}`)
    }
  }, 1000)
  if (localStorage.getItem('playlist') != null) {
    playStore.playlistInit()
  }
  watch(currentMusic, (value) => {
    console.log(`[app.vue监测playStore]当前音乐改变`);

    playStore.parseLyric(value.id)//解析这首歌的歌词
    playStore.player.src = value.url//将audio元素的源地址设置为这首歌

    //保存当前播放的音乐索引
    let storage = JSON.parse(localStorage.getItem('playlist'))
    storage.current = playStore.playlistIndex
    localStorage.setItem('playlist', JSON.stringify(storage))
  })
})


</script>

<template>
  <div>
    <audio ref="audio"></audio>
    <router-view v-slot="{ Component }">
      <keep-alive v-if="$route.meta.keepAlive">
        <component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive" />
      </keep-alive>
      <component :is="Component" :key="$route.name" v-else />
    </router-view>
  </div>
</template>

<style scoped></style>
