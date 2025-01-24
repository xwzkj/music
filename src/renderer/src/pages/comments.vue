<template>
    <div>
        <div class="comment-title text-1.5rem mb-1rem">歌曲评论</div>
        <div v-if="data">
            <div class="comment-top">
                <!-- 顶部区域 -->
                <div class="song-info flex items-center mb-1rem">
                    <img :src="data?.songInfo?.picUrl" class="cover size-3rem rounded-25%"
                        crossorigin="anonymous" />
                    <div class="song-info-right">
                        <div class="name text-1.3rem ml-0.5rem text1">{{ data?.songInfo?.name }}</div>
                        <div class="artist ml-0.5rem text2">{{ data?.songInfo?.artists }}</div>
                    </div>
                </div>
            </div>
            <div class="comment-list">
                <div class="comment-item" v-for="item in data?.comments" :key="item.commentId">
                    <commentItem :item="item" :songId="songId" :isFloor="false" />
                </div>
            </div>
        </div>
        <n-spin v-else class="loading-center" />
    </div>
</template>
<script setup lang="ts">
import * as api from '@/modules/api';
import emitter from '@/utils/mitt'
import commentItem from '@/components/commentItem.vue'

let props = defineProps<{ id: string }>();
let data = ref<any>({})
let songId: string | number

watch(props, (value) => {
    getComments();
}, { deep: true })
onMounted(getComments);
async function getComments() {
    try {
        data.value = null;
        // 隐藏播放器
        emitter.emit('switchShowPlayer', false)
        // 获取歌曲id
        songId = props.id;
        // 获取评论
        let res = await api.commentNew(songId, 0, 1, 45, 1)
        if (res.data.code == 200) {
            data.value = res.data.data
        } else {
            throw new Error(res.data)
        }

        // 获取歌曲信息
        let res1 = await api.songDetail(songId)
        if (res1.data.code == 200) {
            data.value.songInfo = {
                picUrl: res1.data.songs[0].al.picUrl,
                name: res1.data.songs[0].name,
                artists: api.parseArtist(res1.data.songs[0].ar)
            }
        } else {
            throw new Error(res1.data)
        }

        if (!data.value?.comments?.length) {
            throw new Error('暂无评论')
        }
        if (!data.value) {
            throw new Error('获取内容为空')
        }
    } catch (e) {
        api.error(e.message, '获取评论失败')
        data.value = '这是试图防止一直转圈的字符串'
    }
}


</script>
<style scoped></style>