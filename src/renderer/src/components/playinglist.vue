<template>
    <div class="playinglist">
        <n-scrollbar class="playinglist-scrollbar" ref="playinglistScrollbarRef">
            <ul>
                <li v-for="(item, index) in playStore.playlist" :key="item.id" @click="play(index)"
                    class="playinglist-item" ref="playinglistItemRef">
                    <img class="playinglist-img" :src="item.picurl + '?param=80y80'" :alt="item.name" loading="lazy" />
                    <div class="text">
                        <div class="name text1">
                            <n-tag v-if="item.fee == 1" type="warning" size="small" :bordered="false">VIP</n-tag>
                            <n-tag v-if="item.fee == 4" type="info" size="small" :bordered="false">数字专辑</n-tag>
                            {{ item.name }}
                        </div>
                        <div class="tns text3">{{ item.tns }}</div>
                        <div class="artist text2">
                            {{ item.artist }}
                        </div>
                    </div>
                </li>
            </ul>
        </n-scrollbar>
    </div>
</template>

<script setup name="playinglist">
import { usePlayStore } from '@/stores/play';
import { useThemeStore } from '@/stores/theme';
const playStore = usePlayStore();
const themeStore = useThemeStore();
let playinglistScrollbarRef = ref(null);
let playinglistItemRef = ref([]);
function play(index) {
    playStore.playlistIndex = index;
    playStore.play(true);
}
onMounted(() => {
    scrollToCurrent(false);
})

watch(() => playStore.playlistIndex, (value) => {
    scrollToCurrent();
})

function scrollToCurrent(smooth = true) {
    playinglistScrollbarRef.value.scrollTo({ top: playinglistItemRef.value?.[playStore.playlistIndex]?.offsetTop - 80, behavior: smooth ? 'smooth' : 'auto' });
}
</script>

<style scoped>
.playinglist {
    height: 100%;
    width: 100%;
}

ul {
    list-style: none;
    padding: 0;
}

.playinglist-item {
    padding: 0.5rem;
    margin: 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    box-shadow: 0 0 2px v-bind('themeStore.mainColors[4] + `a0`');
    display: flex;
    background-color: v-bind('themeStore.mainColors[0] + `80`');
}

.playinglist-img {
    height: 2.5rem;
    width: 2.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 0 0.2rem v-bind('themeStore.mainColors[4] + `a0`');
    margin-right: 0.5rem;
}


.text {
    width: calc(100% - 3rem)
}

.name,
.tns,
.artist {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 100%;
}
</style>