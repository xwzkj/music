<template>
    <div>
        <div v-if="result.tracks && !loading" key="playlst-content">
            <div id="playlistDetail">
                <img id="playlistImg" :src="result.coverImgUrl" v-if="result.coverImgUrl">
                <div id="playlistInfo">
                    <div id="playlistName">{{ result.name }}</div>
                    <div id="playlistAuthor" v-if="result.creator">
                        <img id="playlistAuthorAvatar" :src="result.creator.avatarUrl">
                        <div id="playlistAuthorName">{{ result.creator.nickname }}</div>
                        <span id="playlistTagContainer">
                            <n-tag v-for="item in result.tags" type="success" size="small" class="playlistTag">{{ item
                                }}</n-tag>
                        </span>
                    </div>
                    <div class="playlist-desc">
                        <n-ellipsis :line-clamp="3">{{ result.description }}</n-ellipsis>
                    </div>
                    <div id="playlistControler">
                        <n-button @click="playAll">播放全部</n-button>
                    </div>
                </div>
            </div>
            <div id="playlistMusicList">
                <musicList :value="result.tracks" :nameOnClick="play" />
            </div>
        </div>
        <div class="playlist-spin" key="playlst-spin" v-if="!result.tracks || loading">
            <n-spin size="large" />
        </div>
    </div>
</template>

<script setup name="playlist">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import * as api from '@/modules/api';
import musicList from '@/components/musicList.vue';
import { usePlayStore } from '@/stores/play';
const playStore = usePlayStore();
const router = useRouter();
let loading = ref(false);//点击播放后 解析播放列表的loading
let result = ref([]);
let props = defineProps(['id', 'isDailySongs']);
watch(props, () => {
    console.log('playlist组件props被更新');
    result.value = {};
    parsePlayList();
}, { deep: true })
onMounted(() => {
    console.log('playlist组件被挂载');
    parsePlayList();
})
async function parsePlayList() {
    if (props.isDailySongs) {
        let res = await api.recommendSongs();
        let d = new Date;
        result.value = {
            tracks: res.data.data.dailySongs,
            name: `${d.getMonth() + 1}/${d.getDate()} 每日推荐`,
            description: `根据你的音乐口味生成，每天06:00更新`,
            coverImgUrl: res.data.data.dailySongs[0].al.picUrl,
            tags: ['每日推荐']
        }

    } else {
        let res = await api.playlistDetail(props.id);
        // console.log(res.data);
        result.value = res.data.playlist;
    }
}

async function playAll() {
    loading.value = true;
    await playStore.playlistInit(null, result.value.tracks)
    playStore.play(true);
    router.push({ name: 'player' })
    loading.value = false;
}
async function play(id) {
    loading.value = true;
    await playStore.addMusic([id], 0, true);
    playStore.play(true);
    router.push({ name: 'player' })
    loading.value = false;
}
</script>

<style scoped>
.playlist-spin {
    width: 100%;
    height: 70vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.playlistTag {
    margin-left: 0.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

#playlistDetail {
    display: flex;
    width: calc(var(--vw, 1vw)*100);
}

#playlistImg {
    width: 10rem;
    min-width: 10rem;
    height: 10rem;
    border-radius: 0.8rem;
    margin: 1rem;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2);
}

#playlistInfo {
    margin-left: 1rem;
    display: flex;
    flex: 1;
    flex-direction: column;
}

#playlistAuthor {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 0.5rem;
}

#playlistTagContainer {
    display: flex;
    flex-wrap: wrap;
}

#playlistAuthorName {
    margin-left: 0.5rem;
}

#playlistAuthorAvatar {
    width: 2rem;
    border-radius: 1rem;
    height: auto;
}

#playlistName {
    font-size: 1.5rem;
    padding-top: 1rem;
    font-weight: 500;
}

.playlist-desc {
    color: gray;
    word-break: break-all;
    overflow-wrap: break-word;
    width: 100%;
    white-space: inherit;
}
</style>