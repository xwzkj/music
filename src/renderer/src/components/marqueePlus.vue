<template>
    <div class="marquee-sizer" ref="sizerEle">
        <div class="marquee-outer" v-show="needScroll">
            <div class="marquee-container">
                <div class="marquee-text1 marquee-content" ref="text1Ele">
                    <div v-html="props.html" v-if="!props.lyricMode"></div>
                    <lyricLine v-else :line="props?.lineData?.line"
                        :current-word-index="props?.lineData?.currentWordIndex" :paused="props?.lineData?.paused"
                        :can-wrap="false" />
                </div>
                <div v-show="!props.lyricMode" class="marquee-text2 marquee-content" v-html="props.html"></div>
            </div>
        </div>
        <div v-show="!needScroll" class="marquee-static-text" ref="staticTextEle">
            <div v-html="props.html" v-if="!props.lyricMode"></div>
            <lyricLine v-else :line="props?.lineData?.line" :current-word-index="props?.lineData?.currentWordIndex"
                :paused="props?.lineData?.paused" :can-wrap="false" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { LyricWord } from '@/modules/types/lyric';
import lyricLine from './lyricLine.vue';
// 这个组件最好在外部包裹div来设定尺寸位置和字体信息
// speed 单位px/s
// lyricMode 是否是歌词模式 歌词模式将会只滚动一次
// 歌词模式需要line参数而不是html参数
let props = withDefaults(defineProps<{
    html?: string,
    lineData?: {
        line: LyricWord[] | undefined,
        currentWordIndex?: {
            wordDuration: number,
            wordIndex: number
        },
        paused?: boolean
    },
    speed?: number,
    lyricMode?: boolean
}>(), {
    lyricMode: false,
    speed: 80,
    lineData: () => {
        return {
            line: [
                {
                    text: '',
                    time: '0',
                    duration: '0'
                }
            ],
            currentWordIndex: {
                wordDuration: 0,
                wordIndex: 0
            },
            paused: false
        }
    }
})
let text1Ele = ref(null)
let sizerEle = ref(null)
let staticTextEle = ref(null)
let needScroll = ref(false)
let marqueeAnimation = ref({
    loop: 'infinite',
    name: 'marquee',
    duration: '5s',
    delay: '0.3s',
    lyricDistance: '-50%'
})

const resizeObserver = new ResizeObserver(() => {
    updateIfNeedScroll();
});
onMounted(() => {
    updateIfNeedScroll()
    if (sizerEle.value) {
        resizeObserver.observe(sizerEle.value);
    }
})

let limit = true;// 避免重复计算
let lineUpdated = () => {
    marqueeAnimation.value.name = '';// 清除动画
    limit = false;
    // console.log('marquee 更新');
}
watch(() => props.html, lineUpdated)
watch(() => props.lineData.line, lineUpdated)

onUpdated(() => {
    if (!limit) {
        updateIfNeedScroll()
    }
    limit = true;
})

onUnmounted(() => {
    resizeObserver.disconnect();
})
function updateIfNeedScroll() {
    if (text1Ele.value != null && sizerEle.value != null && staticTextEle.value != null) {
        let widthValue = Math.max(text1Ele.value.offsetWidth, staticTextEle.value.offsetWidth)//取目前显示的那个元素的宽度
        needScroll.value = widthValue > sizerEle.value.offsetWidth
        if (needScroll.value) {
            marqueeAnimation.value.name = props.lyricMode ? 'marquee-lyric' : 'marquee'
            marqueeAnimation.value.duration = ((props.lyricMode ? widthValue - sizerEle.value.offsetWidth : widthValue) / props.speed) + 's'
            marqueeAnimation.value.loop = props.lyricMode ? '1' : 'infinite'
            marqueeAnimation.value.lyricDistance = '-' + (widthValue - sizerEle.value.offsetWidth) + 'px'
        }
        // console.log('marquee 判断', widthValue, sizerEle.value.offsetWidth);
        // console.log(text1Ele.value, staticTextEle.value, sizerEle.value);
    } else {
        needScroll.value = false
        // console.log('marquee 判断 未挂载', text1Ele.value, sizerEle.value);
    }
}
</script>

<style scoped>
* {
    box-sizing: border-box;
    margin: 0;
}

.marquee-sizer {
    --marquee-duration: 5s;

    overflow: hidden;
    white-space: nowrap;
    height: 100%;
    width: 100%;
}

.marquee-outer {
    display: inline-block;
}

.marquee-container {
    display: inline-block;
    height: 100%;
    position: relative;
    animation: v-bind('marqueeAnimation.name') v-bind('marqueeAnimation.duration') linear v-bind('marqueeAnimation.delay') v-bind('marqueeAnimation.loop') forwards;
}

.marquee-content {
    display: inline-block;
}

.marquee-text2 {
    padding-left: 2.5em;
    padding-right: 2.5em;
}

.marquee-static-text {
    display: inline-block;
}
</style>

<style>
@keyframes marquee {
    0% {
        transform: translateX(0%);
    }

    100% {
        transform: translateX(-50%);
    }
}

@keyframes marquee-lyric {
    0% {
        transform: translateX(0%);
    }

    100% {
        transform: translateX(v-bind('marqueeAnimation.lyricDistance'));
    }
}
</style>