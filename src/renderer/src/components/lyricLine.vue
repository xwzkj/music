<template>
  <div>
    <div class="flex" :class="{
      'flex-wrap': props.canWrap,
      'flex-nowrap': !props.canWrap
    }">
      <span v-for="(word, wIndex) in props.line" class="relative" :class="[
        {
          'lyric-word-end-with-space': word?.text?.slice(-1) == ' '
        },
        'lrc-word-' + wIndex
      ]">

        <span class="select-none lyric-word">{{ word.text }}</span>
        <span class="select-none absolute left-0 top-0 bottom-0 z-1 lyric-word-top text3 lyric-word" :class="{
          'lyric-word-active': props.currentWordIndex?.wordIndex == wIndex,
          'lyric-word-done': props.currentWordIndex?.wordIndex > wIndex
        }">
          {{ word.text }}
        </span>

      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { LyricWord } from '@/modules/types/lyric';
let props = withDefaults(defineProps<{
  currentWordIndex: {
    wordDuration: number,
    wordIndex: number
  } | undefined,
  line: LyricWord[] | undefined,
  paused?: boolean,
  canWrap?: boolean
}>(),
  {
    canWrap: true
  })

let lyricWordNowDuration = computed(() => {
  let duration = props.currentWordIndex?.wordDuration / 1000
  // console.log(playStore.musicStatus.paused);

  return `${duration}s${props?.paused ? ' paused' : ''}`;
})
</script>
<style scoped>
.lyric-word-top {
  mask-image: linear-gradient(transparent, transparent);
}

.lyric-word-active {
  animation: lyric v-bind('lyricWordNowDuration') forwards linear;
  mask-image: linear-gradient(to right, black 40%, 45%, transparent 60% 100%);
  mask-size: 250%;
}

@keyframes lyric {
  from {
    mask-position: right;
  }

  to {
    mask-position: left;
  }
}

.lyric-word-done {
  mask-image: linear-gradient(black, black);
}

.lyric-word-end-with-space {
  margin-right: 0.25em;
}

/* .lyric-word {
  padding-left: 0.3rem;
  padding-right: 0.3rem；
} */
</style>