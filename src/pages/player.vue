<script setup lang="js" name="player">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import * as api from '@/modules/api'
import { usePlayStore } from '@/stores/play'
import playinglist from '@/components/playinglist.vue'

let playStore = usePlayStore();
let { currentMusic } = storeToRefs(playStore);//这样要.value
let showPlayingList = ref(false);//是否展示播放列表
let lyricActive = ref();//当前的歌词序号
let background = ref('');//背景渐变色数据
let id_clock1 = NaN;//定时器id
//挂载
onMounted(async () => {
  //监听歌词滚动
  watch(lyricActive, (value) => {
    document.getElementById('container-lyric').scrollTo({ top: document.getElementById('lrc-' + value).offsetTop - 200, behavior: 'smooth' });
  })
  //更新当前歌词
  id_clock1 = setInterval(() => {
    try {
      if (playStore.musicStatus.paused == false && 'lyric' in playStore.currentMusic) {
        //歌词滚动
        for (let i = 0; i < playStore.currentMusic.lyric.length; i++) {
          let next = false;
          if (i == playStore.currentMusic.lyric.length - 1) {
            next = true;
          } else if (playStore.currentMusic.lyric[i + 1].time > playStore.musicStatus.currentTime * 1000) {
            next = true;
          }
          if (playStore.currentMusic.lyric[i].time <= playStore.musicStatus.currentTime * 1000 && next == true) {
            lyricActive.value = i;
            break;
          }
        }
      }
    } catch (e) {
      api.error(`出错了！\n位置:player.vue onMounted setInterval\n错误信息:${e}`)
    }
  }, 50)
})
//卸载前
onBeforeUnmount(() => {
  clearInterval(id_clock1);
})


//获取图片主色
function getImgMainColor() {
  let color = api.getColorsFromImg(document.getElementById('music-img'), 2);
  background.value = `linear-gradient(${color[0]}, ${color[1]})`;
}
</script>


<template>
  <div id="outer">
    <div id="background">
    </div>

    <div class="column" id="column-player">
      <div id="container-player">
        <div id="music-name">{{ currentMusic.name }}</div>
        <div id="music-artist">{{ currentMusic.artist }}</div>
        <div id="player-centerblock">
          <div id="music-img-container">
            <img :alt="'专辑图片-' + currentMusic.name" :src="currentMusic.picurl" id="music-img" @load="getImgMainColor"
              crossorigin="anonymous">
          </div>
          <!-- 进度条 -->
          <div id="music-progress">
            <n-slider v-model:value="playStore.musicStatus.currentTime" :max="playStore.musicStatus.duration"
              :show-tooltip="false" @update:value="(value) => playStore.seek(value)" />
          </div>
          <!-- 播放控制按钮 -->
          <div id="btn-control">
            <div id="btn-like" class="button">
              <n-icon size="3.5rem" class="icon"><i-hugeicons-favourite-square /></n-icon>
            </div>
            <div id="btn-play-control">
              <div id="btn-prev" class="button">
                <n-icon size="3.5rem" class="icon" @click="playStore.prev"><i-hugeicons-arrow-left-01 /></n-icon>
              </div>
              <div id="btn-pause" class="button">
                <n-icon size="3.5rem" class="icon" v-if="playStore.musicStatus.paused"
                  @click="() => playStore.play()"><i-hugeicons-play /></n-icon>
                <n-icon size="3.5rem" class="icon" v-if="!playStore.musicStatus.paused"
                  @click="() => playStore.pause()"><i-hugeicons-pause /></n-icon>
              </div>
              <div id="btn-next" class="button">
                <n-icon size="3.5rem" class="icon" @click="playStore.next"><i-hugeicons-arrow-right-01 /></n-icon>
              </div>
            </div>
            <div id="btn-list" class="button">
              <n-icon size="3.5rem" class="icon"
                @click="() => { showPlayingList = !showPlayingList }"><i-hugeicons-playlist-02 /></n-icon>
            </div>
          </div>
        </div>
      </div>
      <div class="drawer">
        <n-drawer v-model:show="showPlayingList" placement="bottom" to="#column-player" height="70%"
          show-mask="transparent">
          <n-drawer-content :closable="true" :native-scrollbar="false" title="播放列表">
            <playinglist />
          </n-drawer-content>
        </n-drawer>
      </div>
    </div>

    <div class="column" id="column-lyric">
      <div id="container-lyric">
        <ul>
          <div v-for="(item, index) in currentMusic.lyric" :key="index"
            :class="{ 'lyric-active': lyricActive == index }">
            <li class="lyric-lrc" :id="'lrc-' + index">{{ item.lrc }}</li>
            <li class="lyric-roma">{{ item.roma }}</li>
            <li class="lyric-tran">{{ item.tran }}</li>
          </div>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

#outer {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-wrap: wrap;
  background-image: v-bind('background');

}

#background {
  position: absolute;
  z-index: -1;
  display: block;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.7);

}

/* .column {
  border-width: 2px;
  border-color: chocolate;
  border-style: solid;
} */
.lyric-lrc {
  color: black;
  font-size: 1.2rem;
  margin-top: 0.5rem;
}

.lyric-roma {
  color: rgb(68, 68, 68);
  font-size: 0.9rem;
}

.lyric-tran {
  color: rgb(68, 68, 68);
  font-size: 1.1rem;
}

.lyric-active {
  font-weight: 600;
}

.lyric-active .lyric-lrc {
  font-size: 1.4rem;
}

.lyric-active .lyric-roma {
  font-size: 1.1rem;
}

.lyric-active .lyric-tran {
  font-size: 1.2rem;
}

#column-player {
  display: flex;
  flex: 40%;
  height: 100vh;
  align-items: center;
  justify-content: center;
  min-width: 300px;
  position: relative;
}

#music-name {
  font-size: 2rem;
}

.button {
  cursor: pointer;
}

#btn-control {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

#btn-play-control {
  display: flex;
}

#column-lyric {
  position: relative;
  display: flex;
  flex: 60%;
  height: 100vh;
}

#container-lyric {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  padding: 10%;
}

ul {
  padding: 0;
}

#container-player {
  margin-left: 10%;
  margin-right: 10%;
  width: 80%;
}

#player-centerblock {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#music-img-container {
  margin-top: 1rem;
  margin-bottom: 1rem;
  position: relative;
  border-radius: 1rem;
  width: 80%;
  /* 宽度等于父元素宽度 */
  height: 0;
  /* 初始高度为0 */
  padding-bottom: 80%;
  /* 高度被撑开为宽度的100% */
  overflow: hidden;
  /* 隐藏溢出部分 */
}

#music-img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

#music-progress {
  width: 90%;
}

ul {
  list-style: none;
}
</style>
