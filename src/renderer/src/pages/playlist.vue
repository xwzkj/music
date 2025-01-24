<template>
    <div>
        <div v-if="result.tracks && !loading" key="playlst-content">
            <div class="playlistDetail">
                <div v-if="result.coverImgUrl" class="playlistImg">
                    <img :src="result.coverImgUrl" />
                </div>
                <div class="playlistInfo">
                    <div class="playlistName playlist-info-item text1">{{ result.name }}</div>
                    <div class="playlistAuthor playlist-info-item" v-if="result.creator">
                        <img class="playlistAuthorAvatar" :src="result.creator.avatarUrl">
                        <div class="playlistAuthorName text2">{{ result.creator.nickname }}</div>
                        <span class="playlistTagContainer">
                            <n-tag v-for="item in result.tags" type="success" size="small" class="playlistTag">{{ item
                                }}</n-tag>
                        </span>
                    </div>
                    <div class="playlist-desc playlist-info-item text2">
                        <n-ellipsis style="max-width: 100%;" :line-clamp="3">{{ result.description }}</n-ellipsis>
                    </div>
                    <div class="playlistControler playlist-info-item flex">
                        <n-button @click="playAll" type="primary">播放全部</n-button>
                        <n-button @click="downAll" type="primary" secondary>下载全部</n-button>
                    </div>
                </div>
            </div>
            <div class="playlist-musiclist">
                <musicList :value="result.tracks" :nameOnClick="play" />
            </div>
        </div>
        <div class="playlist-spin loading-center" key="playlst-spin" v-if="!result.tracks || loading">
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
import { useDownloadStore } from '@/stores/download';
const playStore = usePlayStore();
const downloadStore = useDownloadStore();
let loading = ref(false);//点击播放后 解析播放列表的loading
let result = ref([]);
let props = defineProps(['id', 'isDailySongs', 'autoPlay']);
watch(props, () => {
    // console.log('playlist组件props被更新');
    result.value = {};
    parsePlayList();
}, { deep: true })
onMounted(() => {
    // console.log('playlist组件被挂载');
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
        let data = res.data.playlist;

        let ids = res.data.playlist.trackIds
        if (res.data.playlist.tracks.length != ids.length) { // 获取到的列表不完整
            res = await api.songDetail(ids.map(item => item.id).join(","));
            data.tracks = res.data.songs;
        }
        
        result.value = data;
    }
    if (props.autoPlay) {
        playAll();
    }
}

async function playAll() {
    loading.value = true;
    await playStore.playlistInit(null, result.value.tracks)
    playStore.play(true);
    loading.value = false;
}

function downAll() {
    downloadStore.addDownloadItemByIds(result.value.tracks.map(item => item.id))
}
async function play(id) {
    loading.value = true;
    await playStore.addMusic([id], "now", true);
    playStore.play(true);
    loading.value = false;
}
</script>

<style scoped>

.playlistTag {
    margin-left: 0.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

.playlistDetail {
    display: flex;
    width: 100%;
}

.playlistImg {
    margin: 1rem;
    flex: 1;
}

.playlistImg img {
    width: 100%;
    border-radius: 0.8rem;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2);
}

.playlistInfo {
    display: flex;
    /* width:calc(var(--vw,1vw)*100 - 12rem); */
    flex: 1;
    flex-direction: column;
    position: relative;
}

.playlistAuthor {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 0.5rem;
}

.playlistTagContainer {
    display: flex;
    flex-wrap: wrap;
}

.playlistAuthorName {
    margin-left: 0.5rem;
}

.playlistAuthorAvatar {
    width: 2rem;
    border-radius: 1rem;
    height: auto;
}

.playlistName {
    font-size: 1.5rem;
    padding-top: 1rem;
    font-weight: 500;
}

.playlist-info-item {
    max-width: 100%;
    /* display: none; */
}

.playlist-musiclist {
    max-width: 100%;
}

@media (min-width:620px) {
    .playlistImg {
        flex: none;
        width: 10rem;
        height: 10rem;
    }
}
</style>