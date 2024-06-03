<template>
    <div>
        <n-table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>歌曲</th>
                    <th>&nbsp;</th>
                    <th v-if="screenIsWide">专辑</th>
                </tr>
            </thead>
            <tbody>
                <!-- 每一项 -->
                <tr v-for="(item, index) in props.value" :key="index">
                    <!-- 序号 -->
                    <td class="td-num">{{ index + 1 }}</td>
                    <!-- 音乐图片 名称 翻译名 艺术家 -->
                    <td class="td-music" @click="props.nameOnClick(item.id)">
                        <img class="td-music-img result" :src="item.al.picUrl + '?param=80y80'" :alt="item.al.name"
                            loading="lazy" />
                        <div class="td-music-detail">
                            <span class="td-music-name result">
                                <span>{{ item.name }}</span>
                                <n-tag v-if="item.fee == 1" type="warning" size="small" :bordered="false">VIP</n-tag>
                                <n-tag v-if="item.fee == 4" type="info" size="small" :bordered="false">数字专辑</n-tag>
                            </span>
                            <span style="color: #b3b3b3;">{{ api.parseArray(item.tns) }}</span>
                            <span class="td-music-ar result">{{ api.parseArtist(item.ar) }}</span>
                        </div>
                    </td>
                    <!-- 动作 比如收藏 -->
                    <td class="td-action">
                        <n-icon size="1.3rem">
                            <i-ant-design-heart-outlined v-show="!userStore.likedSongs.includes(Number(item.id))" />
                            <i-ant-design-heart-filled v-show="userStore.likedSongs.includes(Number(item.id))" />
                        </n-icon>
                    </td>
                    <!-- 专辑 -->
                    <td class="td-album">
                        <span class="td-album-al result" v-if="screenIsWide">
                            <span>{{ item.al.name }}</span>
                        </span>
                    </td>
                </tr>
            </tbody>
        </n-table>
    </div>
</template>

<script setup name="musicList">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import * as api from '@/modules/api';
let props = defineProps(['value', 'nameOnClick']);
let userStore = useUserStore();
let windowWidth = ref(window.innerWidth);
window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth;
})
let screenIsWide = computed(() => {
    return windowWidth.value > 700;
})

console.log(userStore.likedSongs.includes(34509838))
</script>

<style scoped>
.td-music-detail {
    display: flex;
    flex-direction: column;
}

.td-music {
    display: flex;
    cursor: pointer;
}

.td-music-img {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 0 0.2rem rgba(0, 0, 0, 0.2);
    margin-right: 1rem;
}
</style>