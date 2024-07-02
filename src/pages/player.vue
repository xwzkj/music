<script setup lang="js" name="player">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import * as api from '@/modules/api'
import { usePlayStore } from '@/stores/play'
import { useUserStore } from '@/stores/user'
import playinglist from '@/components/playinglist.vue'
let userStore = useUserStore();
let playStore = usePlayStore();
let { currentMusic } = storeToRefs(playStore);//这样要.value
let lyricScrollbarRef = ref();
let isLiked = computed(() => {
  return userStore.likedSongs.includes(currentMusic.value.id);
})

let showPlayingList = ref(false);//是否展示播放列表
let lyricActive = ref();//当前的歌词序号
let background = ref('');//背景渐变色数据
let id_clock1 = NaN;//定时器id
//挂载
onMounted(async () => {
  //监听歌词滚动
  watch(lyricActive, (value) => {
    lyricScrollbarRef.value.scrollTo({ top: document.getElementById('lrc-' + value).offsetTop - 200, behavior: 'smooth' });
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
    <div id="background"></div>
    <div id="content">

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
                <n-icon size="3.5rem" class="icon">
                  <i-ant-design-heart-outlined v-show="!isLiked" @click="api.likeAndUpdateLikelist(currentMusic.id,true)"/>
                  <i-ant-design-heart-filled v-show="isLiked" @click="api.likeAndUpdateLikelist(currentMusic.id,false)" />
                </n-icon>
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
                  @click="() => { showPlayingList = !showPlayingList }"><i-hugeicons-playlist-03 /></n-icon>
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
        <n-scrollbar id="container-lyric" ref="lyricScrollbarRef">
          <ul class="lyric-list">
            <div v-for="(item, index) in currentMusic.lyric" :key="index"
              :class="{ 'lyric-active': lyricActive == index }">
              <li class="lyric-lrc" :id="'lrc-' + index">{{ item.lrc }}</li>
              <li class="lyric-roma">{{ item.roma }}</li>
              <li class="lyric-tran">{{ item.tran }}</li>
            </div>
          </ul>
        </n-scrollbar>
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
  /* 覆盖下层元素 */
  z-index: 1;

  left: 0;
  top: 0;
  width: calc(var(--vw) * 100);
  height: calc(var(--vh) * 100);

  display: flex;

  /* 配合下面content的最大宽度 实现居中 */
  justify-content: center;
  /* 背景渐变 */
  background-image: v-bind('background');

}

#content {
  display: flex;
  height: 100%;
  min-width: 400px;
  width: 100%;
  max-width: calc(100vh/9*16);
}

#background {
  /* 半透明遮罩 */
  position: absolute;
  display: block;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.7);

}

/************************歌词部分**********************************************************************/
.lyric-lrc {
  /* 歌词原文 */
  color: rgba(68, 68, 68, 0.8);
  font-size: 1.5rem;
  margin-top: 0.5rem;
}

.lyric-roma {
  /* 歌词罗马音 */
  color: rgba(87, 87, 87, 0.8);
  font-size: 1.2rem;
}

.lyric-tran {
  /* 歌词翻译 */
  color: rgba(87, 87, 87, 0.8);
  font-size: 1.4rem;
}

.lyric-active {
  /* 当前歌词 */
  font-weight: 500;
}

.lyric-active .lyric-lrc {
  /* 当前歌词原文 */
  color: black;
  font-size: 1.6rem;
}

.lyric-active .lyric-roma {
  /* 当前歌词罗马音 */
  color: rgb(50, 50, 50);
  font-size: 1.3rem;
}

.lyric-active .lyric-tran {
  /* 当前歌词翻译 */
  color: rgb(45, 45, 45);
  font-size: 1.5rem;
}

#column-lyric {
  position: relative;
  display: flex;
  flex: 50%;
  height: 100%;
  padding: 2em 0 2em 1em;
}

#container-lyric {
  width: 100%;
  height: 100%;
  /* overflow-y: scroll; */
}

.lyric-list {
  padding-top: 50%;
  padding-bottom: 50%;
}

/********************************播放控件**********************************************************/
#column-player {
  display: flex;
  flex: 50%;
  height: 100%;
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
  justify-content: space-around;
  align-items: center;
}

#btn-play-control {
  /* 上一曲 暂停 下一曲 按钮 */
  display: flex;
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

@media (max-width: 500px) {

  /* 0-500px 竖屏设备 */
  #column-lyric {
    display: none;
  }

  #column-player {
    flex: 100%;
  }
}
</style>
