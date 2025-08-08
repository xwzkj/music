<script setup lang="ts" name="player">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import emitter from "@/utils/mitt";
import anime from 'animejs/lib/anime.es.js';
import * as api from '@/modules/api'
import { useRouter } from 'vue-router'
import { usePlayStore } from '@/stores/play'
import { useThemeStore } from '@/stores/theme'
import { useSettingStore } from '@/stores/setting';
import playinglist from '@/components/playinglist.vue'
import MarqueePlus from '@/components/marqueePlus.vue'
import lyricLine from '@/components/lyricLine.vue';

let themeStore = useThemeStore();
let playStore = usePlayStore();
let settingStore = useSettingStore();
let router = useRouter()
let { currentMusic } = storeToRefs(playStore);
let lyricScrollbarRef = ref();
let background = ref('rgb(255,255,255)');//背景渐变色数据
let id_clock1 = NaN;//定时器id
let displayList = ref(false);
let displayLyricWhenScreenIsNotWide = ref(false);

function scrollToCurrentLyric(noSmooth: boolean = false) {
  // console.log('滚动到当前歌词');
  let index = currentMusic.value.currentLyricIndex.lineIndex
  lyricScrollbarRef.value?.scrollTo({ top: document.getElementById('lrc-' + index)?.offsetTop - 200, behavior: noSmooth ? 'auto' : 'smooth' });
}
function showList(isShow: boolean) {
  // console.log('showList', isShow);

  if (isShow == true) {
    displayList.value = isShow;
  }
  anime({
    targets: '.player-playinglist-box',
    translateY: isShow ? '-100%' : '0%',
    duration: 700,
    easing: 'easeInOutQuad',
    begin: () => {
      //如果显示播放列表，则发消息给列表滚动到当前
      if (isShow) {
        emitter.emit('playinglist-scroll')
      }
    },
    complete: () => {
      displayList.value = isShow;
    }
  })
}
//挂载
onMounted(() => {
  //监听歌词滚动
  watch(() => currentMusic.value.currentLyricIndex.lineIndex, (value) => {
    scrollToCurrentLyric();
  }, { deep: true })

  watch(displayLyricWhenScreenIsNotWide, (value) => {
    if (value && window.innerWidth <= 500) {
      nextTick(() => {
        scrollToCurrentLyric();
      })
    }
  })

  emitter.on('player-show', () => {
    scrollToCurrentLyric();
  })

  scrollToCurrentLyric();
})
//卸载前
onBeforeUnmount(() => {
  clearInterval(id_clock1);
})

function switchShowPlayer() {
  emitter.emit('switchShowPlayer');
}

function openComments() {
  emitter.emit('switchShowPlayer', false)
  router.push({ name: 'comments', query: { id: playStore.currentMusic.id } })
}
//获取图片主色
function getImgMainColor() {
  let color = api.getColorsFromImg(document.querySelector('.music-img'), 2);
  background.value = `linear-gradient(${color[0]}, ${color[1]})`;
}
</script>


<template>
  <div class="player-outer-outer">
    <div class="player-outer">
      <div class="player-background"></div>
      <div class="player-content">
        <!-- 关闭按钮 -->
        <div style="position:absolute;top:1rem;left:calc(100vw - 1rem - 2rem);z-index: 1000;">
          <n-icon size="2rem" style="transform: rotate(-180deg);" @click="switchShowPlayer">
            <i-hugeicons-arrow-up-01 />
          </n-icon>
        </div>
        <div class="column column-player">
          <div class="container-player">
            <!-- 标题部分 -->
            <div>
              <div class="music-name">
                <MarqueePlus :html="playStore.nameWithTns ?? `暂未播放~~`" />
              </div>
              <div class="music-artist text2">{{ currentMusic.artist ?? `` }}</div>
            </div>
            <div class="player-centerblock">
              <div class="music-img-container" @click="displayLyricWhenScreenIsNotWide = true">
                <img :alt="'专辑图片-' + currentMusic.name" :src="currentMusic.picurl ?? '/icon.png'" class="music-img"
                  @load="getImgMainColor" crossorigin="anonymous">
              </div>
              <!-- 图片之下的内容 控制部分 -->
              <div class="player-ctrl">
                <div class="player-ctrl-top">
                  <div class="btn-like button" title="收藏">
                    <n-icon size="2.5rem" class="icon">
                      <i-ant-design-heart-outlined v-if="!currentMusic?.isLiked"
                        @click="api.likeAndUpdateLikelist(currentMusic.id, true)" />
                      <i-ant-design-heart-filled v-if="currentMusic?.isLiked"
                        @click="api.likeAndUpdateLikelist(currentMusic.id, false)" />
                    </n-icon>
                  </div>
                  <div class="btn-comments button" @click="openComments" title="查看歌曲评论">
                    <n-icon size="2.5rem" class="icon"><i-hugeicons-message-01 /></n-icon>
                  </div>
                </div>
                <!-- 进度条 -->
                <div class="music-progress">
                  <n-slider v-model:value="playStore.musicStatus.currentTime" :max="playStore.musicStatus.duration"
                    :tooltip="false" :show-tooltip="false" @update:value="(value) => playStore.seek(value)" />
                </div>
                <!-- 播放控制按钮 -->
                <div class="btn-control">
                  <div class="btn-loop button">
                    <n-icon size="2.5rem" class="icon">
                      <i-hugeicons-exchange-01 v-if="playStore.playMode == 0" @click="() => playStore.setPlayMode(1)" />
                      <i-hugeicons-magic-wand-01 v-else @click="() => playStore.setPlayMode(0)" />
                    </n-icon>
                  </div>
                  <div class="btn-play-control">
                    <div class="btn-prev button">
                      <n-icon size="4rem" class="icon" @click="playStore.prev"><i-hugeicons-arrow-left-01 /></n-icon>
                    </div>
                    <div class="btn-pause button">
                      <n-icon size="4rem" class="icon" v-if="playStore.musicStatus.paused"
                        @click="() => playStore.play()"><i-hugeicons-play /></n-icon>
                      <n-icon size="4rem" class="icon" v-if="!playStore.musicStatus.paused"
                        @click="() => playStore.pause()"><i-hugeicons-pause /></n-icon>
                    </div>
                    <div class="btn-next button">
                      <n-icon size="4rem" class="icon" @click="playStore.next"><i-hugeicons-arrow-right-01 /></n-icon>
                    </div>
                  </div>
                  <div class="btn-list button">
                    <n-icon size="2.5rem" class="icon"
                      @click="() => { showList(true) }"><i-hugeicons-playlist-03 /></n-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="column column-lyric" @click="displayLyricWhenScreenIsNotWide = false">
          <n-scrollbar class="container-lyric" ref="lyricScrollbarRef">
            <ul class="lyric-list">
              <li v-for="(item, index) in currentMusic.lyric" :key="index"
                :class="{ 'lyric-active color9': currentMusic.currentLyricIndex.lineIndex == index }"
                class="lyric-item transition-transform duration-700 ease-out transform-origin-left"
                :id="'lrc-' + index">
                <lyricLine :line="item.lrc"
                  :current-word-index="currentMusic.currentLyricIndex.lineIndex == index ? currentMusic.currentLyricIndex : { wordIndex: -1, wordDuration: 0 }"
                  :paused="playStore.musicStatus.paused" class="lyric-lrc" />
                <div class="lyric-roma">{{ item.roma }}</div>
                <div class="lyric-tran">{{ item.tran }}</div>
              </li>
            </ul>
          </n-scrollbar>
        </div>
      </div>
    </div>
    <div class="player-playinglist-box" @click="() => { showList(false) }" v-show="displayList">
      <div class="player-playinglist" @click.stop>
        <playinglist />
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.player-outer {

  position: absolute;
  z-index: 10;

  left: 0;
  top: 0;
  width: 100%;
  height: 100%;


  display: flex;

  /* 配合下面content的最大宽度 实现居中 */
  justify-content: center;
  /* 背景渐变 */
  background-image: v-bind('background');

}

.player-content {
  display: flex;
  height: 100%;
  min-width: 400px;
  width: 100%;
  max-width: calc(100 * var(--vh, 1vh) / 4 * 6);
  /* max-width: calc(100vh/9*16); */
}

.player-background {
  /* 半透明遮罩 */
  position: absolute;
  display: block;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  background-color: v-bind('themeStore.mainColors[0] + `90`');

}

/************************歌词部分**********************************************************************/

.lyric-item {
  transform: scale(0.95);
}

.lyric-lrc {
  /* 歌词原文 */
  color: rgba(68, 68, 68, 0.8);
  font-size: v-bind('settingStore.lyricFontSize');
  margin-top: 0.5rem;
}

.lyric-roma {
  /* 歌词罗马音 */
  color: rgba(87, 87, 87, 0.8);
  font-size: calc(v-bind('settingStore.lyricFontSize') - 0.3rem);
}

.lyric-tran {
  /* 歌词翻译 */
  color: rgba(87, 87, 87, 0.8);
  font-size: calc(v-bind('settingStore.lyricFontSize') - 0.2rem);
}

.lyric-active {
  /* 当前歌词 */
  font-weight: 500;
  transform: scale(1);
}

.lyric-active .lyric-roma {
  /* 当前歌词罗马音 */
  color: rgb(50, 50, 50);
  /* font-size: 1.3rem; */
}

.lyric-active .lyric-tran {
  /* 当前歌词翻译 */
  color: rgb(45, 45, 45);
  /* font-size: 1.5rem; */
}

.column-lyric {
  position: relative;
  display: flex;
  flex: 50%;
  height: 100%;
  padding: 2rem;
}

.container-lyric {
  width: 100%;
  height: 100%;
  /* overflow-y: scroll; */
}

.lyric-list {
  padding-top: 50%;
  padding-bottom: 50%;
}

/********************************播放控件**********************************************************/
.column-player {
  display: flex;
  flex: 50%;
  height: 100%;
  align-items: center;
  justify-content: center;
  min-width: 300px;
  position: relative;
}

.music-name {
  font-size: 2rem;
}

.button {
  cursor: pointer;
}

.player-ctrl-top {
  display: flex;
  margin-bottom: 1rem;
  margin-top: 2rem;
}

.btn-like,
.btn-comments {
  margin-left: 0.5rem;
}

.btn-control {
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.btn-play-control {
  /* 上一曲 暂停 下一曲 按钮 */
  display: flex;
}

.container-player {
  margin-left: 10%;
  margin-right: 10%;
  width: 80%;
}

.player-centerblock {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.music-img-container {
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

.music-img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.music-progress {
  width: 100%;
}

.player-ctrl {
  width: 90%;
}

ul {
  list-style: none;
  padding: 0;
}

.player-playinglist-box {
  position: fixed;
  will-change: transform;
  left: 0;
  top: 100%;
  height: 100%;
  background: none;
  width: 100%;
  z-index: 11;
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

@media (max-width: 600px) {

  /* 0-600px 竖屏设备 */
  .column-lyric {
    display: v-bind('displayLyricWhenScreenIsNotWide ? `flex` : `none`');
    transition: all 0.7s ease-in-out;
  }

  .column-player {
    display: v-bind('displayLyricWhenScreenIsNotWide ? `none` : `flex`');
    transition: all 0.7s ease-in-out;
  }

  .container-player {
    height: calc(100% - 3rem);
    transform: translateY(3rem);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .player-centerblock {
    flex: 1;
    justify-content: space-around;
  }

  .player-ctrl-top {
    margin-top: 0;
  }
}
</style>
