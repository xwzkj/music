<template>
    <div id="home">
        <div class="home-sub-title">精选歌单</div>
        <ul id="homeRecommendPlaylist">
            <li v-if="userStore.isLogin"><itemCard :isDailySongs="true" /></li>
            <li v-for="(item, index) in personalizedPlaylist.result" :key="item.id">
                <itemCard :imgurl="item?.picUrl" :text="item?.name"
                :click="() => router.push(`/playlist?id=${item.id}`)" />
            </li>
        </ul>
        <div>播放页<a href="/#/player">点我</a></div>
        <div>登录页面<a href="/#/login">点我</a></div>
        <div>设置<a href="/#/setting">点我</a></div>
        <br>
        音乐控件卡片预览：
        <MusicController />
    </div>
</template>

<script setup name="home">
import itemCard from '@/components/itemCard.vue';
import MusicController from '@/components/musicController.vue';
import * as api from '@/modules/api';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
let userStore = useUserStore();
let personalizedPlaylist = ref({ result: [] });
let router = useRouter();
api.getPersonalizedPlaylist().then(res => {
    personalizedPlaylist.value = res.data;
    console.log(res.data);
});
</script>

<style scoped>
li {
    list-style: none;
}

ul {
    padding: 0;
}

#homeRecommendPlaylist {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12.5rem, 1fr));
}
.home-sub-title {
    margin:1rem;
    font-size: 1.5rem;
    font-weight: 500;
}
</style>