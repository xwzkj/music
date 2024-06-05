<template>
    <div>
        <div class="list-head-div">
            <n-card class="list-head-card" content-style="padding-top:0;padding-bottom:0;">
                <div class="list-head-card-content">
                    <div class="head-num">#</div>
                    <div class="head-music">歌曲</div>
                    <div class="head-action">&nbsp;</div>
                    <div class="head-album" v-if="screenIsWide">专辑</div>
                </div>
            </n-card>
        </div>
        <div class="list-items">
            <!-- 每一项 -->
            <div v-for="(item, index) in props.value" :key="index" class="list-item-div">
                <n-card class="list-item-card">
                    <div class="list-item-card-content">
                        <!-- 序号 -->
                        <div class="item-num">{{ index + 1 }}</div>
                        <!-- 音乐图片 名称 翻译名 艺术家 -->
                        <div class="item-music" @click="props.nameOnClick(item.id)">
                            <img class="item-music-img" :src="item.al.picUrl + '?param=80y80'" :alt="item.al.name"
                                loading="lazy" />
                            <div class="item-music-detail">
                                <div class="item-music-name">
                                    <span class="item-music-text">{{ item.name }}</span>
                                    <span class="item-music-text" style="color: #b3b3b3;"
                                        v-if="api.parseArray(item.tns) != ''">&nbsp;({{ api.parseArray(item.tns)
                                        }})</span>
                                </div>

                                <div class="item-music-ar">
                                    <n-tag v-if="item.fee == 1" type="warning" size="small"
                                        :bordered="false">VIP</n-tag>
                                    <n-tag v-if="item.fee == 4" type="info" size="small" :bordered="false">数字专辑</n-tag>
                                    <span class="item-music-text" style="color: #8b968d;">{{ api.parseArtist(item.ar)
                                        }}</span>
                                </div>
                            </div>
                        </div>
                        <!-- 动作 比如收藏 -->
                        <div class="item-action">
                            <n-icon size="1.3rem" class="like-button">
                                <i-ant-design-heart-outlined v-show="!isLiked[index]"
                                    @click="api.likeAndUpdateLikelist(item.id, true)" />
                                <i-ant-design-heart-filled v-show="isLiked[index]"
                                    @click="api.likeAndUpdateLikelist(item.id, false)" />
                            </n-icon>
                        </div>
                        <!-- 专辑 -->
                        <div class="item-album" v-if="screenIsWide">
                            <span class="item-album-al">
                                <span>{{ item.al.name }}</span>
                            </span>
                        </div>
                    </div>
                </n-card>
            </div>
        </div>

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
let isLiked = computed(() => {
    let isLikedList = []
    for (let i = 0; i < props.value.length; i++) {
        isLikedList[i] = userStore.likedSongs.includes(Number(props.value[i].id))
    }
    return isLikedList
})

console.log(userStore.likedSongs.includes(34509838))
</script>

<style scoped>
.head-num,
.item-num {
    width: 2rem;
}

.head-music,
.item-music {
    flex: 2;
    width: 60%;
}

.item-music-name,
.item-music-ar,
.item-music-text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.head-action,
.item-action {
    width: 1.5rem;
}

.head-album,
.item-album {
    flex: 1;
    padding-left: 1rem;
}

.list-head-card {
    border: none;
    padding: 0;
}

.list-head-div,
.list-item-div {
    margin: 0.5rem;
    margin-bottom: 0;
}

.list-item-card-content,
.list-head-card-content {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.item-music-detail {
    display: flex;
    justify-content: center;
    flex-direction: column;
    width:calc(100% - 6rem);
}

.item-music {
    display: flex;
    cursor: pointer;
}

.item-music-img {
    width: 2.8rem;
    height: 2.8rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(0, 0, 0, 0.2);
    margin-right: 1rem;
}

.like-button {
    cursor: pointer;
}
</style>