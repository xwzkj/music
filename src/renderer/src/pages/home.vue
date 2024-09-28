<template>
    <div id="home">
        <div class="home-sub-title">精选歌单</div>
        <itemCardList :data="personalizedPlaylist.result" :needDaily="userStore.isLogin" />
    </div>
</template>

<script setup name="home">
import itemCardList from '@/components/itemCardList';
import * as api from '@/modules/api';
import { useUserStore } from '@/stores/user';
let userStore = useUserStore();
let personalizedPlaylist = ref({ result: [] });
api.getPersonalizedPlaylist().then(res => {
    personalizedPlaylist.value = res.data;
    // console.log(res);
});
</script>

<style scoped>
.home-sub-title {
    margin:1rem;
    font-size: 1.5rem;
    font-weight: 500;
}
</style>