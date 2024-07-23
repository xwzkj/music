<template>
    <div class="ctrl-outer">
        <div class="ctrl-left" @click="()=>router.push({name: 'player'})">
            <div class="ctrl-img-box">
                <img class="ctrl-img" :src="playStore.currentMusic.picurl"></img>
            </div>
            <div class="ctrl-info-box">
                <div class="ctrl-info-title">
                    <MarqueePlus :html="playStore.nameWithTns" />
                </div>
                <div class="ctrl-info-artist">
                    <MarqueePlus :html="playStore.currentMusic.artist" />
                </div>
                <div class="ctrl-info-lyric">
                    <marqueePlus :html="lyricNow" />
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
                <div class="btn-list button">
                    <n-icon size="1.5rem" class="icon"
                        @click="() => { showPlayingList = !showPlayingList }"><i-hugeicons-playlist-03 /></n-icon>
                </div>
            </div>
            <div class="ctrl-progress-box">
                <n-slider v-model:value="playStore.musicStatus.currentTime" :max="playStore.musicStatus.duration"
                    :tooltip="false" :show-tooltip="false" @update:value="(value) => playStore.seek(value)" />
            </div>
        </div>
        <div class="ctrl-right">此部分还未制作</div>
    </div>
</template>

<script setup>
import MarqueePlus from '@/components/marqueePlus.vue';
import { usePlayStore } from '@/stores/play';
import * as api from '@/modules/api.js'
import {useRouter} from 'vue-router';
let router = useRouter();
let playStore = usePlayStore();

let lyricNow = computed(() => {
    if (!Array.isArray(playStore.currentMusic.lyric) || playStore.currentMusic?.lyric.length < playStore.currentMusic.currentLyricIndex) {
        return ''
    }
    return playStore.currentMusic?.lyric[playStore.currentMusic.currentLyricIndex]?.lrc
})
</script>

<style scoped>
* {
    box-sizing: border-box;
}

.ctrl-outer {
    width: 100%;
    height: 7rem;
    border: 1px solid grey;
    border-radius: 1rem 1rem 0 0;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
}

.ctrl-left {
    display: flex;
    width: calc(100% / 3.5);
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
    width: calc(100% / 3.5);
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
    width: calc(100% / 3.5);
    display: flex;
    justify-content: flex-end;
}
</style>