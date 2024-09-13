<template>
    <div>
        <div class="lyric-lrc flex flex-wrap">
            <div v-for="(word, wIndex) in item.lrc" :id="'lrc-' + index + '-word-' + wIndex" class="relative" :class="{
                'lyric-word-end-with-space': word.text.slice(-1) == ' '
            }">

                <span class="select-none">{{ word.text }}</span>
                <span class="select-none absolute left-0 top-0 bottom-0 z-1 lyric-word-top text3" :class="{
                    'lyric-word-active': currentMusic.currentLyricIndex.wordIndex == wIndex && currentMusic.currentLyricIndex.lineIndex == index,
                    'lyric-word-done': currentMusic.currentLyricIndex.wordIndex > wIndex && currentMusic.currentLyricIndex.lineIndex == index
                }">
                    {{ word.text }}
                </span>

            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
let props = defineProps({
    line: Object,
    currentIndex: Object
})
</script>
<style lang="less"></style>