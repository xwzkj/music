<template>
    <div class="outer">
        <div class="lyric">
            <div class="ctrl">
                <div class="ctrl-box">
                    <n-icon size="2rem" class="drag none-after-lock"><i-hugeicons-drag-drop /></n-icon>

                    <n-icon size="2rem" class="lock" @click="switchLock"><i-hugeicons-square-lock-02 /></n-icon>
                </div>
            </div>
            <div class="lyric-lrc marquee">
                <marqueePlus :html="lyric.lrc" :speed="160" :lyricMode="true" />
            </div>
            <div class="lyric-sec marquee">
                <marqueePlus :html="lyric.tran" :speed="140" :lyricMode="true" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import MarqueePlus from '@/components/marqueePlus.vue';
interface Lyric {
    lrc?: string;
    tran?: string;
    time?: number;
    roma?: string;
}
let isLocked = ref<boolean>(false);
let needLockWhenMouseLeave = false;//鼠标离开锁定按钮时是否需要锁定
let displayCtrl = ref<boolean>(false);//是否显示控制按钮 当鼠标进入outer后显示
let mainColors = ref<Array<string>>(['#fff9db', '#fff3bf', '#ffec99', '#ffe066', '#ffd43b', '#fcc419', '#fab005', '#f59f00', '#f08c00', '#e67700'])
let lyricText = ref<Lyric>({});
let lyric = computed<Lyric>(() => {
    return {
        lrc: lyricText.value.lrc ?? '',
        tran: lyricText.value.tran ?? '',
        time: lyricText.value.time ?? 0,
        roma: lyricText.value.roma ?? ''
    }
});
window?.getLyric(changeLyric);
window?.getThemeColors(changeTheme);
function changeLyric(event: Event, lyric: string) {
    console.log(lyric);
    let lyricObj = JSON.parse(lyric) as Lyric;
    lyricText.value = lyricObj
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
<style>
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
    color: v-bind('mainColors[0]');
    text-shadow:
        v-bind('mainColors[5]') 0 0 0.3rem,
        v-bind('mainColors[5]') 0 0 0.3rem,
        v-bind('mainColors[5]') 0 0 0.3rem,
        v-bind('mainColors[5]') 0 0 0.3rem;
}

.lyric-lrc {
    font-size: 3rem;
    font-weight: bolder;
}

.lyric-sec {
    font-size: 2rem;
    font-weight: bold;
}
</style>