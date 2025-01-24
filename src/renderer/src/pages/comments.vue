<template>
    <div>
        <div class="comment-top">
            <!-- 顶部区域 -->
             <img src="" class="comment-song-cover" crossorigin="anonymous"/>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router';
import * as api from '@/modules/api';
import emitter from '@/utils/mitt'

const route = useRoute();

onMounted(async () => {
    emitter.emit('switchShowPlayer', false)
    let songId = route.query.id as string;
    let res = await api.commentNew(songId, 0, 1, 20, 1)
    console.log(res);
});
</script>
<style>
    
</style>