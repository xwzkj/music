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
let mainColors = ref<Array<string>>(['#fff9db', '#fff3bf', '#ffec99', '#ffe066', '#ffd43b', '#fcc419', '#fab005', '#f59f00', '#f08c00', '#e67700'])
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
}

.lyric :not(.lyric-word-top) {
    color: rgb(238, 238, 238);
    /* -webkit-text-stroke: 1px v-bind('mainColors[7]'); */
    text-shadow:
        v-bind('mainColors[6] + `a0`') 0 0 0.3rem,
        v-bind('mainColors[6] + `a0`') 0 0 0.3rem,
        v-bind('mainColors[6] + `a0`') 0 0 0.3rem,
        v-bind('mainColors[6] + `a0`') 0 0 0.3rem;
}

.lyric-word-top {
    text-shadow:
        v-bind('mainColors[6] + `ff`') 0 0 0.3rem,
        v-bind('mainColors[6] + `ee`') 0 0 0.3rem,
        v-bind('mainColors[6] + `cc`') 0 0 0.3rem,
        v-bind('mainColors[6] + `bb`') 0 0 0.3rem;
}

.lyric-lrc {
    font-size: 3rem;
    font-weight: 500;
}

.lyric-sec {
    font-size: 2rem;
    font-weight: 400;
}

.text3 {
    color: v-bind('mainColors[2]');
}
</style>