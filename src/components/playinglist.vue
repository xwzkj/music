<template>
    <div>
        <ul>
            <li v-for="(item, index) in playStore.playlist" :key="item.id" @click="play(index)">
                <img class="playinglist-img" :src="item.picurl + '?param=80y80'" :alt="item.name" loading="lazy"/>
                <div class="text">
                    <div class="name">
                        <el-tag v-if="item.fee == 1" type="warning" size="small" :bordered="false">VIP</el-tag>
                        <el-tag v-if="item.fee == 4" type="info" size="small" :bordered="false">数字专辑</el-tag>
                        {{ item.name }}
                    </div>
                    <!-- 播放列表里的tns是解析好的字符串 -->
                    <div class="tns">{{ item.tns }}</div>
                    <div class="artist">
                        {{ item.artist }}
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup name="playinglist">
import { usePlayStore } from '@/stores/play';
const playStore = usePlayStore();
function play(index) {
    playStore.playlistIndex = index;
    playStore.play(true);
}
</script>

<style scoped>
ul {
    list-style: none;
    padding: 0;
}

li {
    border: 0.1rem solid rgba(0, 0, 0, 0);
    padding: 0.5rem;
    margin: 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.233);
    display: flex;

}

.playinglist-img {
    height: 2.5rem;
    width: 2.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 0 0.2rem rgba(0, 0, 0, 0.2);
    margin-right: 0.5rem;
}

.tns {
    color: #b3b3b3;
}

.artist {
    color: #8b8b8b;
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