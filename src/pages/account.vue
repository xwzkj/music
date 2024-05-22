<template>
    <div>
        <div id="accountUserDetail">
            <img id="accountUserAvatar" :src="`${userStore.avatar}?param=200y200`" @load="getImgMainColor"
                crossorigin="anonymous">
            <div id="accountUserDataInfo">
                <span id="accountUserName">{{ userStore.name }}</span>
                <img id="accountUserVIP" :src="`${userStore.vipIcon}`">
                <span id="accountUserArea">地区：{{ Area }}</span>
            </div>
        </div>
        <div id="accountUserPlaylistsDiv">
            <div id="accountUserPlaylistsTitle">我的歌单</div>
            <ul id="accountUserPlaylistsUl">
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
import itemCard from '@/components/itemCard.vue';
import * as api from '@/modules/api';
const userStore = useUserStore();
const router = useRouter();
let Area = ref('未知');
let usrAvaColor = ref('#FFFFFF');
getArea(userStore.province, userStore.city);
async function getArea(province, city) {
    if (province in api.areaData.province && city in api.areaData.city) {
        Area.value = api.areaData.province[province] + ' ' + api.areaData.city[city];
    } else {
        Area.value = '未知';
    }
}
function getImgMainColor() {
    let color = api.getColorFromImg(document.getElementById('accountUserAvatar'), true);
    usrAvaColor.value = api.mixColor(color, [255, 255, 255], 0.5);
}
</script>

<style scoped>
#accountUserDetail {
    display: flex;
    padding: 2rem;
    margin: 1rem;
    border-radius: 2rem;
    background: v-bind('usrAvaColor');
}

#accountUserAvatar {
    width: 10rem;
    border-radius: 0.8rem;
    margin: 1rem;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2);
}

#accountUserDataInfo {
    margin-left: 1rem;
    display: flex;
    flex-direction: column;
}

#accountUserVIP {
    width: 3.5rem;
    height: auto;
}

#accountUserName {
    font-size: 1.5rem;
    padding-top: 1rem;
    font-weight: bold;
}

#accountUserArea {
    color: gray;
}

#accountUserPlaylistsTitle {
    font-size: 1.2rem;
    padding-left: 1rem;
}

#accountUserPlaylistsUl {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12.5rem, 1fr));
}

li {
    list-style: none;
}

ul {
    padding: 0;
}
</style>