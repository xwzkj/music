<template>
    <div v-loading.fullscreen="!result.tracks|loading">
        <div id="playlistDetail">
            <img id="playlistImg" :src="result.coverImgUrl" v-if="result.coverImgUrl">
            <div id="playlistInfo">
                <div id="playlistName">{{ result.name }}</div>
                <div id="playlistAuthor" v-if="result.creator">
                    <img id="playlistAuthorAvatar" :src="result.creator.avatarUrl">
                    <div id="playlistAuthorName">{{ result.creator.nickname }}</div>
                    <span id="playlistTagContainer">
                        <el-tag v-for="item in result.tags" type="success" size="small" class="playlistTag">{{ item
                            }}</el-tag>
                    </span>
                </div>
                <div id="playlistDesc">{{ result.description }}</div>
                <div id="playlistControler">
                    <el-button @click="playAll">播放全部</el-button>
                </div>
            </div>
        </div>
        <div id="playlistMusicList">
            <musicList :value="result.tracks" :nameOnClick="play" />
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
            tracks:res.data.data.dailySongs,
            name:`${d.getMonth() + 1}/${d.getDate()} 每日推荐`,
            description:`根据你的音乐口味生成，每天06:00更新`,
            coverImgUrl:res.data.data.dailySongs[0].al.picUrl,
            tags:['每日推荐']
        }
        
    } else {
        let res = await api.playlistDetail(props.id);
        // console.log(res.data);
        result.value = res.data.playlist;
    }
}

async function playAll(){
    loading.value = true;
    await playStore.playlistInit(result.value.tracks.map(item => item.id))
    loading.value = false;
    router.push({ name: 'player'})
}
async function play(id) {
    loading.value = true;
    let list = playStore.playlistIds
    let index = playStore.playlistIndex
    list.splice(index,0,id)
    console.log('单独插入播放',list,id,index);
    await playStore.playlistInit(list)
    playStore.playlistIndex = index
    loading.value = false;
    router.push({ name: 'player'})
}
</script>

<style scoped>
/* .loading-center {
    width: 100%;
    height: 70vh;
    display: flex;
    justify-content: center;
    align-items: center;
} */

.playlistTag {
    margin-left: 0.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

#playlistDetail {
    display: flex;
    width: 100%;
}

#playlistImg {
    width: 10rem;
    border-radius: 0.8rem;
    margin: 1rem;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2);
}

#playlistInfo {
    margin-left: 1rem;
    display: flex;
    flex-direction: column;
    width: 100%;
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
    font-weight: bold;
}

#playlistDesc {
    color: gray;
}
</style>