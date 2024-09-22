<template>
    <div class="ctrl-outer-outer">
        <div class="ctrl-outer" ref="outerEle">
            <div class="ctrl-box">
                <div class="ctrl-left" @click="switchShowPlayer">
                    <div class="ctrl-img-box">
                        <img class="ctrl-img" :src="playStore.currentMusic.picurl ?? '/icon.png'"></img>
                    </div>
                    <div class="ctrl-info-box">
                        <div class="ctrl-info-title text1">
                            <MarqueePlus :html="playStore.nameWithTns ?? '奶酪音乐'" :speed="40" />
                        </div>
                        <div class="ctrl-info-artist text2">
                            <MarqueePlus :html="playStore.currentMusic.artist ?? ''" :speed="40" />
                        </div>
                        <div class="ctrl-info-lyric color4">
                            <marqueePlus :line-data="lyricNow" :speed="60" :lyricMode="true" />
                        </div>
                    </div>
                </div>
                <div class="ctrl-center">
                    <!-- 播放控制按钮 -->
                    <div class="btn-control">
                        <div class="btn-like button">
                            <n-icon size="1.5rem" class="icon">
                                <i-ant-design-heart-outlined v-if="!playStore.currentMusic?.isLiked"
                                    @click="api.likeAndUpdateLikelist(playStore.currentMusic.id, true)" />
                                <i-ant-design-heart-filled v-else
                                    @click="api.likeAndUpdateLikelist(playStore.currentMusic.id, false)" />
                            </n-icon>
                        </div>
                        <div class="btn-play-control">
                            <div class="btn-prev button">
                                <n-icon size="2.5rem" class="icon"
                                    @click="playStore.prev"><i-hugeicons-arrow-left-01 /></n-icon>
                            </div>
                            <div class="btn-pause button">
                                <n-icon size="2.5rem" class="icon" v-if="playStore.musicStatus.paused"
                                    @click="() => playStore.play()"><i-hugeicons-play /></n-icon>
                                <n-icon size="2.5rem" class="icon" v-if="!playStore.musicStatus.paused"
                                    @click="() => playStore.pause()"><i-hugeicons-pause /></n-icon>
                            </div>
                            <div class="btn-next button">
                                <n-icon size="2.5rem" class="icon"
                                    @click="playStore.next"><i-hugeicons-arrow-right-01 /></n-icon>
                            </div>
                        </div>
                        <div class="btn-loop button">
                            <n-icon size="1.5rem" class="icon">
                                <i-hugeicons-exchange-01 v-if="playStore.playMode == 0"
                                    @click="() => playStore.setPlayMode(1)" />
                                <i-hugeicons-magic-wand-01 v-else @click="() => playStore.setPlayMode(0)" />
                            </n-icon>
                        </div>
                    </div>
                    <div class="ctrl-progress-box">
                        <n-slider v-model:value="playStore.musicStatus.currentTime"
                            :max="playStore.musicStatus.duration" :tooltip="false" :show-tooltip="false"
                            @update:value="(value) => playStore.seek(value)" />
                    </div>
                </div>
                <div class="ctrl-right">
                    <div class="btn-desktop-lyric button icon" v-if="isElectron"
                        :class="{ 'btn-desktop-lyric-active': settingStore.showLyricWindow }"
                        @click="() => settingStore.setLyricWindowShow(!settingStore.showLyricWindow)" title="桌面歌词">
                        词
                    </div>
                    <div class="btn-sound button" title="音效 目前未制作">
                        <n-icon size="1.5rem" class="icon">
                            <i-solar-soundwave-square-outline />
                        </n-icon>
                    </div>
                    <div class="btn-list button" title="播放列表" style="padding-top:0.2rem;">
                        <n-icon size="1.5rem" class="icon"
                            @click="switchShowPlaylist"><i-hugeicons-playlist-03 /></n-icon>
                    </div>
                </div>
            </div>
            <!-- 播放列表 -->
            <div class="ctrl-playinglist" @click.stop v-show="showPlayingListVIf">
                <playinglist />
            </div>
        </div>
        <!-- 播放器 -->
        <div class="ctrl-player">
            <player v-show="showPlayerVIf" />
        </div>
    </div>
</template>

<script setup>
import MarqueePlus from '@/components/marqueePlus.vue';
import { usePlayStore } from '@/stores/play';
import { useSettingStore } from '@/stores/setting';
import * as api from '@/modules/api'
// import { useRouter } from 'vue-router';
import playinglist from './playinglist.vue';
import player from './player.vue';
import anime from 'animejs';
import emitter from '@/utils/mitt'
// 接收从player发出的隐藏player事件
emitter.on('switchShowPlayer', () => {
    // console.log('switchShowPlayer emit消息');
    switchShowPlayer()
});
// let router = useRouter();
let settingStore = useSettingStore();
let isElectron = ref(window.isElectron);
let playStore = usePlayStore();
let outerEle = ref(null);
let ctrlHeight = ref(7)
let showPlayingList = false;
let showPlayingListVIf = ref(false);
let showPlayer = false;
let showPlayerVIf = ref(false);
let lyricNow = computed(() => {
    if (!Array.isArray(playStore.currentMusic.lyric) || playStore.currentMusic?.lyric.length < playStore.currentMusic.currentLyricIndex.lineIndex) {
        return undefined
    }
    let line = playStore.currentMusic?.lyric[playStore.currentMusic.currentLyricIndex.lineIndex]?.lrc
    let currentWordIndex = playStore.currentMusic?.currentLyricIndex
    let paused = playStore.musicStatus.paused
    let res = {
        line,
        currentWordIndex,
        paused
    }
    if (window.isElectron && currentWordIndex.lineIndex >=0) {
        let tran = playStore.currentMusic?.lyric[playStore.currentMusic.currentLyricIndex.lineIndex]?.tran
        tran = api.textToParsedYrcLine(tran)
        window.api.sendLyric(JSON.stringify({ lrc: res, tran }))
    }
    return res
})
function switchShowPlaylist() {
    showPlayingList = !showPlayingList
    // console.log(showPlayingList);
    let a = -window.innerHeight + ctrlHeight.value * 16
    anime({
        targets: outerEle.value,
        translateY: showPlayingList ? `${a}px` : '0px',
        duration: 700,
        easing: 'easeInOutCubic',
        begin: () => {
            if (showPlayingList == true) {
                showPlayingListVIf.value = showPlayingList
            }
        },
        complete: () => {
            showPlayingListVIf.value = showPlayingList
        }
    })
}

function switchShowPlayer() {
    showPlayer = !showPlayer
    // console.log(showPlayer);
    anime({
        targets: '.ctrl-player',
        translateY: showPlayer ? `-100%` : '0%',
        duration: 700,
        easing: 'easeInOutCubic',
        begin: () => {
            if (showPlayer == true) {
                showPlayerVIf.value = showPlayer
            }
        },
        complete: () => {
            showPlayerVIf.value = showPlayer
            if (showPlayer == true) {
                emitter.emit('player-show')
            }
        }
    })
}
</script>

<style scoped>
* {
    box-sizing: border-box;
}

.ctrl-outer-outer {
    position: relative;
}

.ctrl-outer {
    position: fixed;
    z-index: 1;
    top: calc(var(--vh, 1vh) * 100 - v-bind('ctrlHeight + `rem`'));
    width: 100%;
    height: calc(var(--vh, 1vh) * 100);
    overflow: hidden;
    /* border: 1px solid grey; */
    box-shadow: 0 0 0.2rem grey;
    border-radius: 1rem 1rem 0 0;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    background-color: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(20px);
    /* transition: all 0.5s ease-in-out; */
}

.ctrl-box {
    flex: 0 0 auto;
    display: flex;
    justify-content: space-between;
}

.ctrl-left {
    flex: 1;
    display: flex;
    max-width: calc(100% / 3.5);
    cursor: pointer;
}

.ctrl-img-box {
    position: relative;
    border-radius: 1rem;
    box-shadow: 0 0 0.2rem grey;
    width: 5rem;
    /* 宽度等于父元素宽度 */
    height: 0;
    /* 初始高度为0 */
    padding-bottom: 5rem;
    /* 高度被撑开为宽度的100% */
    overflow: hidden;
    /* 隐藏溢出部分 */
}

.ctrl-img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.ctrl-info-box {
    padding-left: 1rem;
    width: 70%;
}

.ctrl-info-title {
    font-size: 1.3rem;
}

/* 
center--------------------------------------------------------
 */
.ctrl-center {
    flex: 1;
    padding-top: 0.8rem;
    max-width: calc(100% / 3.5);
}

.button {
    cursor: pointer;
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

/* 
right---------------------------------------------------------
*/
.ctrl-right {
    flex: 1;
    max-width: calc(100% / 3.5);
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.btn-desktop-lyric,
.btn-sound {
    margin-right: 1rem;
}

.btn-desktop-lyric {
    font-weight: 400;
    font-size: 1.2rem;
    vertical-align: text-top;
    padding-bottom: 0.35rem;
    transition: all 0.2s linear;
}

.btn-desktop-lyric-active {
    font-weight: 800 !important;
}

/*************************************************************
播放列表-------------------------------------------------------------------===================
************************************************/
.ctrl-playinglist {
    margin-top: 1rem;
    width: 100%;
    height: calc(var(--vh, 1vh) * 100 - v-bind('ctrlHeight + `rem`'));
    flex: 1;
}

/* ***************************************************************
播放器-------------------------------------------------------------------===================
*****************************************************************/
.ctrl-player {
    position: fixed;
    top: calc(var(--vh, 1vh) * 100);
    left: 0;
    height: calc(var(--vh, 1vh) * 100);
    width: 100vw;

    z-index: 10;
}

@media screen and (max-width: 600px) {
    .ctrl-info-box {
        display: none;
    }

    .btn-like,
    .btn-loop {
        display: none;
    }
}
</style>