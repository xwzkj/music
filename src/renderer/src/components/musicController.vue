<template>
    <div class="ctrl-outer">
        <div class="ctrl-left" @click="() => router.push({ name: 'player' })">
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
                <svg t="1721825346602" class="icon" height="1.5rem" width="1.5rem" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="1884" viewBox="0 0 1024 1024">
                    <path
                        d="M947.272501 612.228749 825.290309 733.259266c-7.582699 7.520277-17.575284 11.282974-27.495214 11.282974-9.925047 0-19.97903-3.762697-27.561729-11.282974l-122.213459-121.030517c-15.193027-15.083533-15.770172-39.570227-0.624217-54.69674 15.145955-15.125489 38.659485-15.172561 53.862745-0.084934l53.514821 55.255465L754.773256 357.13591 413.993872 357.13591c-21.451568 0-38.845727-17.486256-38.845727-38.844703 0-21.357424 17.393135-38.844703 38.845727-38.844703l383.937322 0c21.452591 0 34.530444 16.276708 34.530444 37.634132l0 295.623951 57.83215-55.257511c15.198144-15.069207 41.948391-15.036461 57.098439 0.084934C962.53716 572.662615 962.466552 597.145216 947.272501 612.228749zM609.997941 667.890466 269.218558 667.890466 269.218558 410.253688l53.519937 55.257511c7.582699 7.525394 16.424064 11.282974 26.349111 11.282974 9.962909 0 19.382443-3.791349 26.973328-11.367909 15.145955-15.130605 14.838963-39.613206-0.354064-54.69674L253.623371 289.701055c-15.163351-15.040555-39.757492-15.040555-54.921867 0L76.719312 410.730549c-15.19405 15.083533-15.248286 39.566134-0.103354 54.69674 15.156188 15.125489 41.896202 15.159258 57.08923 0.084934l57.824987-55.257511 0 295.623951c0 21.357424 13.077853 39.702234 34.530444 39.702234l383.937322 0c21.451568 0 38.845727-17.48728 38.845727-38.844703C648.842645 685.377746 631.449509 667.890466 609.997941 667.890466z"
                        p-id="1885"></path>
                </svg>
            </div>
            <div class="ctrl-progress-box">
                <n-slider v-model:value="playStore.musicStatus.currentTime" :max="playStore.musicStatus.duration"
                    :tooltip="false" :show-tooltip="false" @update:value="(value) => playStore.seek(value)" />
            </div>
        </div>
        <div class="ctrl-right">
            <div class="btn-list button">
                <n-icon size="1.5rem" class="icon"
                    @click="() => { showPlayingList = !showPlayingList }"><i-hugeicons-playlist-03 /></n-icon>
            </div>
        </div>
    </div>
</template>

<script setup>
import MarqueePlus from '@/components/marqueePlus.vue';
import { usePlayStore } from '@/stores/play';
import * as api from '@/modules/api.js'
import { useRouter } from 'vue-router';
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
    align-items: center;
}
</style>