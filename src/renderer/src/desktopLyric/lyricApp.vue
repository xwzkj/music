<template>
    <div class="lyric">
        <marqueePlus :html="lyricText" />
    </div>
</template>
<script setup lang="ts">
import MarqueePlus from '@/components/marqueePlus.vue';
let lyricText = ref('这里将是歌词');
window?.lyric(changeLyric);
interface Lyric {
    lrc?: string;
    tran?: string;
    time?: number;
    roma?: string;
}
function changeLyric(event: Event, lyric: string) {
    console.log(lyric);
    let lyricObj = JSON.parse(lyric) as Lyric;
    lyricText.value = lyricObj.lrc ?? ''
}
</script>
<style>
.lyric {
    -webkit-app-region: drag;
    user-select: none;
    font-size: 3rem;
}
</style>