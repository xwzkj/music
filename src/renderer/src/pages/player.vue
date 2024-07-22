<script setup lang="js" name="player">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import * as api from '@/modules/api'
import { usePlayStore } from '@/stores/play'
import { useUserStore } from '@/stores/user'
import playinglist from '@/components/playinglist.vue'
import MarqueePlus from '@/components/marqueePlus.vue'
let userStore = useUserStore();
let playStore = usePlayStore();
let { currentMusic } = storeToRefs(playStore);
let lyricScrollbarRef = ref();
// let showPlayingList = ref(false);//是否展示播放列表
// let lyricActive = ref();//当前的歌词序号 现在用playstore里的currentMusic中的currentLyricIndex
let background = ref('');//背景渐变色数据
let id_clock1 = NaN;//定时器id
let displayList = ref(false);
let playingListTop = computed(() => {
  return displayList.value ? '0%' : '100%';
})
//挂载
onMounted(async () => {
  //监听歌词滚动
  watch(() => currentMusic.value.currentLyricIndex, (value) => {
    console.log('当前歌词改变');
    lyricScrollbarRef.value.scrollTo({ top: document.getElementById('lrc-' + value)?.offsetTop - 200, behavior: 'smooth' });
  }, { deep: true })
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
  <div id="playerOoouter">
    <div id="playerOuter">
      <div id="playerBackground"></div>
      <div id="playerContent">
        <div style="position:absolute;top:1rem;left:1rem;z-index: 1000;">
          <n-icon size="2rem" style="transform: rotate(-90deg);" @click="api.windowBack">
            <i-hugeicons-arrow-up-01 />
          </n-icon>
        </div>
        <div class="column" id="column-player">
          <div id="container-player">
            <div id="music-name">
              <MarqueePlus :html="playStore.nameWithTns" />
            </div>
            <div id="music-artist">{{ currentMusic.artist }}</div>
            <div id="player-centerblock">
              <div id="music-img-container">
                <img :alt="'专辑图片-' + currentMusic.name" :src="currentMusic.picurl" id="music-img"
                  @load="getImgMainColor" crossorigin="anonymous">
              </div>
              <!-- 进度条 -->
              <div id="music-progress">
                <n-slider v-model:value="playStore.musicStatus.currentTime" :max="playStore.musicStatus.duration"
                  :tooltip="false" :show-tooltip="false" @update:value="(value) => playStore.seek(value)" />
              </div>
              <!-- 播放控制按钮 -->
              <div id="btn-control">
                <div id="btn-like" class="button">
                  <n-icon size="2.5rem" class="icon">
                    <i-ant-design-heart-outlined v-if="!currentMusic?.isLiked"
                      @click="api.likeAndUpdateLikelist(currentMusic.id, true)" />
                    <i-ant-design-heart-filled v-if="currentMusic?.isLiked"
                      @click="api.likeAndUpdateLikelist(currentMusic.id, false)" />
                  </n-icon>
                </div>
                <div id="btn-play-control">
                  <div id="btn-prev" class="button">
                    <n-icon size="4rem" class="icon" @click="playStore.prev"><i-hugeicons-arrow-left-01 /></n-icon>
                  </div>
                  <div id="btn-pause" class="button">
                    <n-icon size="4rem" class="icon" v-if="playStore.musicStatus.paused"
                      @click="() => playStore.play()"><i-hugeicons-play /></n-icon>
                    <n-icon size="4rem" class="icon" v-if="!playStore.musicStatus.paused"
                      @click="() => playStore.pause()"><i-hugeicons-pause /></n-icon>
                  </div>
                  <div id="btn-next" class="button">
                    <n-icon size="4rem" class="icon" @click="playStore.next"><i-hugeicons-arrow-right-01 /></n-icon>
                  </div>
                </div>
                <div id="btn-list" class="button">
                  <n-icon size="2.5rem" class="icon"
                    @click="() => { displayList = !displayList; return; }"><i-hugeicons-playlist-03 /></n-icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="column" id="column-lyric">
          <n-scrollbar id="container-lyric" ref="lyricScrollbarRef">
            <ul class="lyric-list">
              <div v-for="(item, index) in currentMusic.lyric" :key="index"
                :class="{ 'lyric-active': currentMusic.currentLyricIndex == index }">
                <li class="lyric-lrc" :id="'lrc-' + index">{{ item.lrc }}</li>
                <li class="lyric-roma">{{ item.roma }}</li>
                <li class="lyric-tran">{{ item.tran }}</li>
              </div>
            </ul>
          </n-scrollbar>
        </div>
      </div>
    </div>
    <div class="player-playinglist-box" @click="() => { displayList = false; }">
      <div class="player-playinglist">
        <playinglist />
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

#playerOuter {
  position: fixed;
  /* 覆盖下层元素 */
  z-index: 1;

  left: 0;
  top: 0;
  width: calc(var(--vw, 1vw) * 100);
  height: calc(var(--vh, 1vh) * 100);

  display: flex;

  /* 配合下面content的最大宽度 实现居中 */
  justify-content: center;
  /* 背景渐变 */
  background-image: v-bind('background');

}

#playerContent {
  display: flex;
  height: 100%;
  min-width: 400px;
  width: 100%;
  max-width: calc(100vh/9*16);
}

#playerBackground {
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

.player-playinglist-box {
  position: fixed;
  top: v-bind(playingListTop);
  height: 100%;
  width: 100%;
  background: none;
  z-index: 2;
  transition: all 0.7s ease-in-out;
}

.player-playinglist {
  position: absolute;
  top: 20%;
  left: 5%;
  width: 90%;
  height: 80%;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 0.8rem;
  overflow: hidden;
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
