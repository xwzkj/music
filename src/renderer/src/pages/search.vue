<template>
    <div class="h-100%">
        <div class="text1 font-medium" style="font-size: 1.3rem;">“{{ props.keyword }}” 的搜索结果：</div>
        <n-tabs animated @update:value="tabChange" v-model:value="currentTab">
            <n-tab-pane name="song" tab="单曲">
                <musicList v-if="result?.song" :value="result.song" :nameOnClick="play" />
                <n-spin v-else class="loading-center" />
            </n-tab-pane>
            <n-tab-pane name="playlist" tab="歌单">
                <ItemCardList v-if="result?.playlist" :data="result.playlist" />
                <n-spin v-else class="loading-center" />
            </n-tab-pane>
        </n-tabs>
    </div>

</template>
<script setup name="search">
import * as api from '@/modules/api'
import { ref, onMounted, watch } from 'vue'
import musicList from '@/components/musicList.vue'
import ItemCardList from '@/components/itemCardList.vue';
import { usePlayStore } from '@/stores/play'
let playStore = usePlayStore();
let props = defineProps(['keyword']);
let currentTab = ref('song');
let result = ref({});
watch(props, (value) => {
    search();
}, { deep: true })
onMounted(() => {
    search();
})

let tabChange = async (value) => {
    // console.log(value);
    switch (value) {
        case 'playlist':
            let res = await api.cloudsearch(props.keyword, 1000);
            result.value.playlist = res.data.result.playlists;
            break;
    }
}

async function search() {
    result.value = {};
    currentTab.value = 'song';
    let res = await api.cloudsearch(props.keyword)
    result.value.song = res.data.result.songs;
}
async function play(id) {
    await playStore.addMusic([id], 'now', true);
    playStore.play(true);
}
</script>
<style scoped>
.loading-center {
    width: 100%;
    height: calc(70 * var(--vh, 1vh));
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>