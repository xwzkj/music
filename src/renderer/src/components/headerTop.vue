<template>
    <div class="header">
        <n-icon class="header-menu" size="2rem" @click="showNav = true"><i-hugeicons-right-to-left-list-dash /></n-icon>
        <span class="header-search">
            <n-icon size="2rem" style="transform: rotate(-90deg);"
                @click="api.windowBack"><i-hugeicons-arrow-up-01 /></n-icon>
            <n-input v-model:value="value" type="text" placeholder="搜索..." @keyup="search" :clearable="true" />
        </span>
        <n-avatar class="header-user text2" v-if="!userStore.isLogin" round
            @click="router.push({ name: 'login' })">登录</n-avatar>
        <n-avatar class="header-user" v-if="userStore.isLogin" round :src="userStore.avatar"
            @click="router.push({ name: 'account' })" />

        <div class="header-nav bg" v-if="showNav" @click="showNav = false">
            <navigation />
        </div>
    </div>
</template>
<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { useUserStore } from '@/stores/user.js'
import * as api from '@/modules/api.js';
import navigation from './navigation.vue';
const userStore = useUserStore();
let value = ref('');
let showNav = ref(false);
const router = useRouter();
function search(event) {
    if (event.keyCode == 13) {
        router.push({ name: 'search', query: { keyword: value.value } })
    }
}
</script>
<style>
span {
    margin: 0;
}

.header {
    padding: 0.5rem;
    padding-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-search {
    margin-left: 2rem;
    display: flex;
}

.header-user {
    margin-right: 2rem;
    cursor: pointer;
}

.header-nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: calc(var(--vh, 1vh) * 100);
    z-index: 10;
}

@media screen and (min-width: 600px) {
    .header-menu {
        display: none;
    }
}

@media screen and (max-width: 600px) {
    .header-user {
        margin-right: 0;
    }
    .header-search{
        margin-left: 0;
    }
}
</style>