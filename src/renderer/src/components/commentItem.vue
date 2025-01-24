<template name="commentItem">
    <div class="comment-item rounded-0.5rem border-1px border-#e0e0e0 border-solid p-0.5rem mb-0.5rem">
        <div class="top mb-0.5rem flex items-center justify-between">
            <div class="user flex items-center">
                <img class="avatar size-2.2rem mr-0.5rem rounded-25% border-1px border-#e0e0e0 border-solid"
                    :src="item.user.avatarUrl" crossorigin="anonymous" />
                <div class="name text2">{{ item.user.nickname }}</div>
            </div>
            <div class="right flex flex-col items-end">
                <div class="time text3">{{ item.timeStr }}</div>
                <div class="ctrl flex items-center">
                    <div class="reply flex items-center mr-0.5rem" v-if="!isFloor" cursor="pointer" @click="openFloor(item.commentId)">
                        <n-icon size="1.5rem">
                            <i-hugeicons-message-01 />
                        </n-icon>
                        <div class="reply-count w-3em ml-0.2rem mr-0.5rem text-0.7rem text3">{{
                            formatCount(item.replyCount) }}</div>
                    </div>

                    <div class="like flex items-center mr-0.5rem">
                        <n-icon size="1.5rem">
                            <i-iconamoon-like-duotone />
                        </n-icon>
                        <div class="like-count w-3em ml-0.2rem text-0.7rem text3">{{
                            formatCount(item.likedCount) }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="comment-item-content text1">
            <span class="reply-to text2" v-if="isFloor && replyTo">回复 @{{ item.beReplied?.[0].user.nickname }}</span>
            {{ item.content }}
        </div>
        <!-- 回复列表 -->
        <div class="reply-list ml-2.5rem" v-if="(!isFloor) && replyData">
            <commentItem v-for="i in replyData" :item="i" :songId="songId" :isFloor="true"
                :replyTo="i.beReplied?.[0].beRepliedCommentId != item.commentId ? i.beReplied?.[0] : false" />
            <!-- 不直接传入true，防止此数据是空的导致出现问题 -->

        </div>
    </div>
</template>
<script setup lang="ts">
import * as api from '@/modules/api'
import commentItem from '@/components/commentItem.vue'
const props = defineProps<{
    item: any,
    songId: string | number,
    isFloor?: boolean,
    replyTo?: boolean | any//是否显示 回复@xx 字样,只有当isFloor为true时才需要传入,传入true false来判断是否读取comments.beReplied?.[0]
}>()
const formatCount = api.formatCount
let replyData = ref()
async function openFloor(parentCommentId: number | string) {
    try {
        // 如果有数据那么清空，以收起回复
        if (replyData.value) {
            replyData.value = null
            return
        }

        let res = await api.commentFloor(parentCommentId, props.songId, 0, 25)
        if (res.data.code == 200) {
            replyData.value = res.data.data.comments
        }
        console.log(replyData.value, 'replyData', res.data, 'res')
    } catch (error) {
        api.error(error, '获取评论回复失败')
    }
}
</script>
<style scoped></style>