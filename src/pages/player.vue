<script setup lang="js" name="player">
// import HugeiconsAtom02 from '~icons/hugeicons/atom-02';
import { onMounted, ref, watch } from 'vue'
import * as api from '@/modules/api'
let props = defineProps(['id'])
let music = ref({
  name: '',
  artist: '',
  audio: { url: '', duration: 100, paused: true },
  pic: { url: '' },
  lyric: []//{time:'',lrc:'',roma:'',tran:''}
})
let lyricActive = ref();
let progress = ref(0);
let background = ref('');
let id_clock1 = NaN;
//入口
onMounted(() => {
  let audio = document.getElementById('audio');
  loadMusic();
  id_clock1 = setInterval(() => {
    //进度条
    if (isNaN(audio.duration) == true) {
      music.value.audio.duration = 100;
    } else {
      music.value.audio.duration = audio.duration;
    }
    music.value.audio.paused = audio.paused;
    progress.value = audio.currentTime;
    //歌词滚动
    for (let i = 0; i < music.value.lyric.length; i++) {
      let next = false;
      if (i == music.value.lyric.length - 1) {
        next = true;
      } else if (music.value.lyric[i + 1].time > audio.currentTime * 1000) {
        next = true;
      }
      if (music.value.lyric[i].time <= audio.currentTime * 1000 && next == true) {
        lyricActive.value = i;
        break;
      }
    }
  }, 50)
})
function loadMusic() {
  getMusicDetail();
  getMusicLyric();
  getMusicUrl();
}
watch(lyricActive, (value) => {
  document.getElementById('container-lyric').scrollTo({ top: document.getElementById('lrc-' + value).offsetTop - 200, behavior: 'smooth' });
})

watch(props, () => {
  // console.log('[player] props被改变');
  loadMusic();
}, { deep: true })
async function getMusicDetail() {
  let res = await api.songDetail(props.id);
  music.value.name = res.data.songs[0].name;
  let artists = res.data.songs[0].ar.map(item => item.name);
  music.value.artist = artists.join('、');
  music.value.pic.url = res.data.songs[0].al.picUrl;
}
async function getMusicLyric() {
  let res = await api.lyricNew(props.id);
  music.value.lyric = [];
  let lrc = res.data.lrc.lyric.split('\n');
  for (let i = 0; i < lrc.length; i++) {
    music.value.lyric.push({
      time: lrcToMS(lrc[i]),
      lrc: lrcToLyric(lrc[i]),
      roma: '',
      tran: ''
    });
  }
  lrc = res.data.romalrc.lyric.split('\n');
  for (let i = 0; i < lrc.length; i++) {
    for (let j = 0; j < music.value.lyric.length; j++) {
      if (music.value.lyric[j].time == lrcToMS(lrc[i])) {
        music.value.lyric[j].roma = lrcToLyric(lrc[i]);
      }
    }
  }
  lrc = res.data.tlyric.lyric.split('\n');
  for (let i = 0; i < lrc.length; i++) {
    for (let j = 0; j < music.value.lyric.length; j++) {
      if (music.value.lyric[j].time == lrcToMS(lrc[i])) {
        music.value.lyric[j].tran = lrcToLyric(lrc[i]);
      }
    }
  }

}
async function getMusicUrl() {
  let res = await api.songUrlV1(props.id, 'jymaster');
  // console.log('获取歌曲播放地址/song/url/v1', res);
  music.value.audio.url = res.data.data[0].url;
  setTimeout(() => {
    audio.play();
  }, 200);
}

function setAudioProgress(value) {
  audio.currentTime = value;
  audio.play();
}
/**
获取一行lrc的第一个时间标签，并转换为毫秒
@param {string} lyricLine 一行歌词
@return {number}
*/
function lrcToMS(lyricLine) {
  let express = /\[(\d+):(\d+)[:.](\d+)\]/
  let lineTime = express.exec(lyricLine);
  if (lineTime == null) {
    return 0;
  }
  if (lineTime[3].length == 1) {
    lineTime[3] = '0' + lineTime[3];
  }
  return (parseInt(lineTime[1]) * 60 + parseInt(lineTime[2])) * 1000 + parseInt(lineTime[3].slice(0, 2)) * 10;
}
/**
 * 获取一行lrc中的歌词文本
 * @param {string} lyricLine 一行lrc
 * @return {string} 歌词文本
 */
function lrcToLyric(lyricLine) {
  let express = /\[\d+:\d+[:.]\d+\](.*)/
  let lineTime = express.exec(lyricLine);
  if (lineTime == null) {
    return '';
  }
  return lineTime[1];
}
function getImgMainColor() {
  let color = api.getColorsFromImg(document.getElementById('music-img'), 2);
  background.value = `linear-gradient(${color[0]}, ${color[1]})`;
}
/**
 * 设置audio元素的播放状态 传入一个布尔型参数，代表本次是继续播放还是暂停
 * @param {bool} value 
 */
function callBack_pause(value) {
  if (value == true) {
    audio.play();
  } else {
    audio.pause();
  }
}
</script>


<template>
  <audio :src="music.audio.url" id="audio" autoplay />
  <div id="outer">
    <div id="background">
    </div>

    <div class="column" id="column-player">
      <div id="container-player">
        <div id="music-name">{{ music.name }}</div>
        <div id="music-artist">{{ music.artist }}</div>
        <div id="player-centerblock">
          <img :alt="'专辑图片-' + music.name" :src="music.pic.url" id="music-img" @load="getImgMainColor"
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
                <el-icon size="3.5rem" class="icon"><i-hugeicons-arrow-left-01 /></el-icon>
              </div>
              <div id="btn-pause">
                <el-icon size="3.5rem" class="icon" v-if="music.audio.paused"
                  @click="callBack_pause(true)"><i-hugeicons-play /></el-icon>
                <el-icon size="3.5rem" class="icon" v-if="!music.audio.paused"
                  @click="callBack_pause(false)"><i-hugeicons-pause /></el-icon>
              </div>
              <div id="btn-next">
                <el-icon size="3.5rem" class="icon"><i-hugeicons-arrow-right-01 /></el-icon>
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
          <div v-for="(item, index) in music.lyric" :key="index" :class="{ 'lyric-active': lyricActive == index }">
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
