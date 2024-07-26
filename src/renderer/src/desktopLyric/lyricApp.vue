<template>
    <div class="outer">
        <div class="lyric">
            <marqueePlus :html="lyric.lrc" :speed="160" :lyricMode="true" />
            <marqueePlus :html="lyric.tran" :speed="160" :lyricMode="true" />
        </div>
    </div>
</template>
<script setup lang="ts">
import MarqueePlus from '@/components/marqueePlus.vue';
interface StyleColors {
    text: string;
    background: string;
}
interface Lyric {
    lrc?: string;
    tran?: string;
    time?: number;
    roma?: string;
}
let background = ref<string>('transparent');
let styleColors = ref<StyleColors>({ text: '#000', background: '#fff' })
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
    styleColors.value = JSON.parse(theme)?.styleColors;
}
onMounted(() => {
    let outer = document.querySelector('.outer') as HTMLElement;
    let lyricEle = document.querySelector('.lyric') as HTMLElement;
    outer.addEventListener("mousemove", event => {
        let flag = event.target === outer;
        if (flag) {
            background.value = 'transparent';
        } else {
            background.value = styleColors.value.background;
        }
        console.log('outer',event);
    })
    lyricEle.addEventListener("mousemove", event => {
        let flag = event.target === lyricEle;
        if (flag) {
            background.value = styleColors.value.background;
        } else {
            background.value = 'transparent';
        }
        console.log('lyric',event);
    })
})
</script>
<style>
.outer {
    padding: 5px;
}

.lyric {
    -webkit-app-region: drag;

    user-select: none;
    font-size: 3rem;
    font-weight: bolder;
    color: v-bind('styleColors.background');
    text-shadow:
        v-bind('styleColors.text') 0 0 0.3rem,
        v-bind('styleColors.text') 0 0 0.3rem,
        v-bind('styleColors.text') 0 0 0.3rem,
        v-bind('styleColors.text') 0 0 0.3rem;
    background: v-bind('background');

}

.lyric:hover {
    background: aliceblue;
}
</style>