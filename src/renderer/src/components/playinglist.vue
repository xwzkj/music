<template>
    <div class="playinglist">
        <n-virtual-list :items="playStore.playlist" :item-size="77" :item-resizable="true" key-field="id"
            ref="virtualListRef">
            <template #default="{ item, index }">
                <div @click="play(index)" class="playinglist-item"
                    :class="{ 'playinglist-item-current': item.id == playStore.currentMusic.id }" :key="item.id">
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
                </div>
            </template>
        </n-virtual-list>
    </div>
</template>

<script setup name="playinglist" lang="ts">
import { usePlayStore } from '@/stores/play';
import { useThemeStore } from '@/stores/theme';
import { NVirtualList } from 'naive-ui';
import emitter from '@/utils/mitt';
const playStore = usePlayStore();
const themeStore = useThemeStore();
let virtualListRef = ref<InstanceType<typeof NVirtualList>>();
function play(index: number) {
    playStore.playWithPlaylistIndex(index);
    scrollToCurrent();
}

emitter.on('playinglist-scroll', (smooth?: boolean) => {
    scrollToCurrent(smooth);
})

onMounted(() => {
    scrollToCurrent(false);
})

watch(() => playStore.playlistIndex, (value) => {
    scrollToCurrent();
})

//写得稀烂，建议以后改改
async function scrollToCurrent(smooth = true) {
    //延时函数
    function waitForScroll(time: number): Promise<void> {
        return new Promise(resolve => {
            setTimeout(resolve, time); // 等待滚动动画完成
        });
    }

    //边界函数
    function minmax(n: number) {
        return Math.max(Math.min(n, playStore.playlist.length - 1), 0)
    }
    let index = playStore.playlistIndex
    console.log('播放列表 滚动到:', index);

    //先滚到后面，防止直接滚动到当前太靠下显示不出来
    virtualListRef.value?.scrollTo({
        index: minmax(index + 3),
        behavior: smooth ? 'smooth' : 'instant',
    });
    await waitForScroll(200);
    //等待后如果没滚到或者因为这个破虚拟列表滚不到想去的位置
    //就直接立马滚到想去的位置
    virtualListRef.value?.scrollTo({
        index: minmax(index + 3),
        behavior: 'instant',
    });
    //再滚到前面，防止直接滚动到当前太靠上显示不出来
    virtualListRef.value?.scrollTo({
        index: minmax(index - 1),
        behavior: 'instant',
    });
    await waitForScroll(200);
    //同理
    virtualListRef.value?.scrollTo({
        index: minmax(index - 1),
        behavior: 'instant',
    });
    //最后立马滚到想去的位置
    virtualListRef.value?.scrollTo({
        index: index,
        behavior: 'instant',
    });

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

.playinglist-item.playinglist-item-current {
    padding: calc(0.5rem - 2px);
    border: 2px solid v-bind('themeStore.mainColors[4] + `ee`');
    background-color: v-bind('themeStore.mainColors[1] + `be`');
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