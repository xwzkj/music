<template>
    <div class="outer">
        <div class="lyric">
            <div class="ctrl">
                <n-icon size="2rem" class="drag"><i-hugeicons-drag-drop /></n-icon>

                <n-icon size="2rem"><i-hugeicons-square-lock-02 /></n-icon>
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
let bgColor = ref<string>('rgba(255,255,255,0)');
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
    // console.log(lyric);
    let lyricObj = JSON.parse(lyric) as Lyric;
    lyricText.value = lyricObj
}
function changeTheme(event: Event, theme: string) {
    console.log(theme);
    mainColors.value = JSON.parse(theme)?.mainColors;
}
onMounted(() => {
    let outer = document.querySelector('.outer') as HTMLElement;
    let lyricEle = document.querySelector('.lyric') as HTMLElement;
    outer.addEventListener("mousemove", event => {
        bgColor.value = 'rgba(255,255,255,0)';
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
}

.outer:hover {
    background: v-bind('mainColors[0] + 80');
    border: 1px solid v-bind('mainColors[7]');
}

.ctrl {
    display: flex;
    justify-content: space-around;
    color: v-bind('mainColors[7]');
}

.drag {
    cursor: move;
    -webkit-app-region: drag;
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