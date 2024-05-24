<script setup lang="js" name="player">
// import HugeiconsAtom02 from '~icons/hugeicons/atom-02';
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import * as api from '@/modules/api'
import { usePlayStore } from '@/stores/play'
let playStore = usePlayStore();
let { playlist, playlistIndex, lyric, currentMusic } = storeToRefs(playStore);

let audio = playStore.player;
let music = ref({
  audio: {
    duration: 0,
    paused: true
  }
})

let lyricActive = ref();
let progress = ref(0);
let background = ref('');
let id_clock1 = NaN;
//挂载
onMounted(async () => {
  //监听歌词滚动
  watch(lyricActive, (value) => {
    document.getElementById('container-lyric').scrollTo({ top: document.getElementById('lrc-' + value).offsetTop - 200, behavior: 'smooth' });
  })

  id_clock1 = setInterval(() => {
    try {
      //进度条
      if (isNaN(audio.duration) == true) {
        music.value.audio.duration = 100;
      } else {
        music.value.audio.duration = audio.duration;

        music.value.audio.paused = audio.paused;
        progress.value = audio.currentTime;
        //歌词滚动
        for (let i = 0; i < playStore.lyric.length; i++) {
          let next = false;
          if (i == playStore.lyric.length - 1) {
            next = true;
          } else if (playStore.lyric[i + 1].time > audio.currentTime * 1000) {
            next = true;
          }
          if (playStore.lyric[i].time <= audio.currentTime * 1000 && next == true) {
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






//设置audio元素的播放进度
function setAudioProgress(value) {
  audio.currentTime = value;
  audio.play();
}
//获取图片主色
function getImgMainColor() {
  let color = api.getColorsFromImg(document.getElementById('music-img'), 2);
  background.value = `linear-gradient(${color[0]}, ${color[1]})`;
}
function callBack_pause(value) {
  if (value == true) {
    playStore.play();
  } else {
    playStore.pause();
  }
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
          <img :alt="'专辑图片-' + currentMusic.name" :src="currentMusic.picurl" id="music-img" @load="getImgMainColor"
            crossorigin="anonymous">
          <div id="music-progress">
            <el-slider v-model="progress" :max="music.audio.duration" :show-tooltip="false" @input="setAudioProgress" />
          </div>
          <div id="btn-control">
            <div id="btn-like">
              <el-icon size="3.5rem" class="icon"><i-hugeicons-favourite-square /></el-icon>
            </div>
            <div id="btn-play-control">
              <div id="btn-prev">
                <el-icon size="3.5rem" class="icon" @click="playStore.prev"><i-hugeicons-arrow-left-01 /></el-icon>
              </div>
              <div id="btn-pause">
                <el-icon size="3.5rem" class="icon" v-if="playStore.paused"
                  @click="callBack_pause(true)"><i-hugeicons-play /></el-icon>
                <el-icon size="3.5rem" class="icon" v-if="!playStore.paused"
                  @click="callBack_pause(false)"><i-hugeicons-pause /></el-icon>
              </div>
              <div id="btn-next">
                <el-icon size="3.5rem" class="icon" @click="playStore.next"><i-hugeicons-arrow-right-01 /></el-icon>
              </div>
            </div>
            <div id="btn-list">
              <el-icon size="3.5rem" class="icon"><i-hugeicons-playlist-02 /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="column" id="column-lyric">
      <div id="container-lyric">
        <ul>
          <div v-for="(item, index) in lyric" :key="index" :class="{ 'lyric-active': lyricActive == index }">
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
  position: relative;
  display: flex;
  flex-wrap: wrap;
  background-color: rgba(255, 255, 255, 0.7)
}

#background {
  position: absolute;
  z-index: -1;
  display: block;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  background-image: v-bind('background');
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
  font-weight: bold;
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

  #music-name {
    font-size: 2rem;
  }

  #btn-control {
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;

    #btn-play-control {
      display: flex;
    }
  }
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
  padding: 20%;
}

#container-player {
  width: 80%;
}

#player-centerblock {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#music-img {
  margin-top: 1rem;
  margin-bottom: 1rem;
  width: 80%;
  border-radius: 1rem;
}

#music-progress {
  width: 90%;
}

ul {
  list-style: none;
}
</style>
