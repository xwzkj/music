<template>
    <div class="outer">
        <div>
            <div class="ctrl">
                <div class="ctrl-box">
                    <n-icon size="2rem" class="drag none-after-lock"><i-hugeicons-drag-drop /></n-icon>

                    <n-icon size="2rem" class="lock" @click="switchLock"><i-hugeicons-square-lock-02 /></n-icon>
                </div>
            </div>
            <div class="lyric-lrc marquee lyric">
                <marqueePlus :line-data="lyric?.lrc" :speed="160" :lyricMode="true" />
            </div>
            <div class="lyric-sec marquee lyric">
                <marqueePlus :line-data="lyric?.tran" :speed="140" :lyricMode="true" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import MarqueePlus from '@/components/marqueePlus.vue';
// import type { LyricLine, LyricWord } from '@/modules/types/lyric';
let isLocked = ref<boolean>(false);
let needLockWhenMouseLeave = false;//鼠标离开锁定按钮时是否需要锁定
let displayCtrl = ref<boolean>(false);//是否显示控制按钮 当鼠标进入outer后显示
let mainColors = ref<Array<string>>(["#fffdf0", "#fffbe3", "#fff4ba", "#f7e28d", "#ebca60", "#deb237", "#b88c25", "#916816", "#6b480b", "#452c06"])
let lyric = ref<any>({});
window?.getLyric(changeLyric);
window?.getThemeColors(changeTheme);
function changeLyric(event: Event, lrc: string) {
    let received = JSON.parse(lrc);
    //这个if是防止直接整体替换导致地址全部改变，以至于每次逐字进度更新时，marquee都会重新计算是否需要滚动
    if (lyric.value?.lrc?.currentWordIndex?.lineIndex !== received?.lrc?.currentWordIndex?.lineIndex) {
        lyric.value = received;
    } else {
        if (lyric.value.hasOwnProperty('lrc')) {
            lyric.value.lrc.currentWordIndex = received?.lrc?.currentWordIndex;
            lyric.value.lrc.paused = received?.lrc?.paused;
        }
    }
    console.log(lrc, lyric.value);
    updateIsLocked();
}
function changeTheme(event: Event, theme: string) {
    console.log(theme);
    mainColors.value = JSON.parse(theme)?.mainColors;
}
async function switchLock() {
    window.lyricWindowLock(!isLocked.value);
    needLockWhenMouseLeave = false;
    isLocked.value = await updateIsLocked();
}
async function updateIsLocked() {
    isLocked.value = await window.isLyricWindowLocked()
    return isLocked.value;
}
onMounted(() => {
    updateIsLocked();
    let outer = document.querySelector('.outer') as HTMLElement;
    let lockEle = document.querySelector('.lock') as HTMLElement;
    lockEle.addEventListener("mouseenter", async () => {
        console.log('lock mouse enter');
        if (await updateIsLocked()) {
            window.lyricWindowLock(false)
            needLockWhenMouseLeave = true;
        }
    })
    lockEle.addEventListener("mouseleave", async () => {
        console.log('lock mouse leave');
        if (needLockWhenMouseLeave) {
            window.lyricWindowLock(true)
            updateIsLocked()
        }
    })
    let flag: any;

    outer.addEventListener("mouseenter", async () => {
        console.log('outer mouse enter');
        clearTimeout(flag);
        displayCtrl.value = true;
    })

    outer.addEventListener("mouseleave", async () => {
        console.log('outer mouse leave');

        clearTimeout(flag)
        flag = setTimeout(() => {
            displayCtrl.value = false;
        }, 1000)
    })
})
</script>
<style lang="less">
.outer {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    border-radius: 1rem;
    transition: all 0.5s;
    border: 1px solid transparent;
}

.outer:hover {
    background: v-bind('!isLocked ? mainColors[0] + `80` : `transparent`');
    border: 1px solid v-bind('!isLocked ? mainColors[7] : `transparent`');
}

.none-after-lock {
    display: v-bind('isLocked ? `none` : `block`');
}

.ctrl {
    height: 2.2rem;
    color: v-bind('mainColors[7]');
}

.ctrl-box {
    display: v-bind('displayCtrl ? `flex` : `none`');
    justify-content: space-around;
}

.drag {
    cursor: move;
    -webkit-app-region: drag;
}

.lock {
    border-radius: 10%;
    cursor: pointer;
    transition: all 0.5s;
}

.lock:hover {
    background-color: v-bind('isLocked ? mainColors[0] + `80` : `none`');
}

.lyric {
    padding-left: 10px;
    padding-right: 10px;
    width: 100%;
    height: 100%;
    user-select: none;
    /* -webkit-text-stroke: 1px v-bind('mainColors[7]'); */
}

.lyric :not(.lyric-word-top) {
    color: white;
    --color: v-bind('mainColors[6] + `dd`');
    text-shadow: 1px 1px var(--color),
        -1px -1px var(--color),
        -1px 1px var(--color),
        1px -1px var(--color),
        2px 2px 0.5px v-bind('mainColors[3]');
}

.lyric-word-top {
    color: v-bind('mainColors[2]');
    // --color: v-bind('mainColors[2]');
    // text-shadow: 2px 2px var(--color),
    //     -2px -2px var(--color),
    //     -2px 2px var(--color),
    //     2px -2px var(--color),
    //     -1px -1px var(--color),
    //     1px 1px var(--color),
    //     -1px 1px var(--color),
    //     1px -1px var(--color);
}

.lyric-lrc {
    font-size: 3rem;
    font-weight: 500;
}

.lyric-sec {
    font-size: 2rem;
    font-weight: 400;
}
</style>