<template>
    <div>
        <div class="account-user-detail">
            <img class="account-user-avatar" :src="userStore.avatar" @load="getImgMainColor"
                crossorigin="anonymous">
            <div class="account-user-data-info">
                <span class="account-user-name text1">{{ userStore.name }}</span>
                <img class="account-userVIP" :src="`${userStore.vipIcon}`">
            <span class="account-user-area text2">地区：{{ Area }}</span>
            </div>
        </div>
        <div class="account-user-playlists-div">
            <div class="account-user-playlists-title">我的歌单</div>
            <ul class="account-user-playlists-ul">
                <li v-for="item in userStore.playlists" class="user-playlist-li">
                    <itemCard :imgurl="item.coverImgUrl" :text="item.name"
                        @click="router.push({ name: 'playlist', query: { id: item.id } })" />
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user.js';
import { useThemeStore } from '@/stores/theme';
import itemCard from '@/components/itemCard.vue';
import * as api from '@/modules/api';
const userStore = useUserStore();
const themeStore = useThemeStore();
const router = useRouter();
let Area = ref('未知');
// let usrAvaColor = ref('#FFFFFF');
getArea(userStore.province, userStore.city);
async function getArea(province, city) {
    if (province in api.areaData.province && city in api.areaData.city) {
        Area.value = api.areaData.province[province] + ' ' + api.areaData.city[city];
    } else {
        Area.value = '未知';
    }
}
// function getImgMainColor() {
//     let color = api.getColorFromImg(document.getElementById('account-userAvatar'), true);
//     usrAvaColor.value = api.mixColor(color, [255, 255, 255], 0.35);
// }
</script>

<style scoped>
.account-user-detail {
    display: flex;
    padding: 2rem;
    margin: 1rem;
    border-radius: 2rem;
    /* background: v-bind('usrAvaColor'); */
    background: v-bind('themeStore.mainColors[1] + `80`');
}

.account-user-avatar {
    width: 10rem;
    border-radius: 0.8rem;
    margin: 1rem;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2);
}

.account-user-data-info {
    margin-left: 1rem;
    display: flex;
    flex-direction: column;
}

.account-userVIP {
    width: 3.5rem;
    height: auto;
}

.account-user-name {
    font-size: 1.5rem;
    padding-top: 1rem;
    font-weight: 500;
}

.account-user-area {
    color: gray;
}

.account-user-playlists-title {
    font-size: 1.2rem;
    padding-left: 1rem;
}

.account-user-playlists-ul {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
}

li {
    list-style: none;
}

ul {
    padding: 0;
}
</style>