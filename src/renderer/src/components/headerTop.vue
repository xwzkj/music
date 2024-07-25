<template>
    <div class="header">
        <span class="header-search">
            <n-icon size="2rem" style="transform: rotate(-90deg);"
                @click="api.windowBack"><i-hugeicons-arrow-up-01 /></n-icon>
            <n-input v-model:value="value" type="text" placeholder="搜索..." @keyup="search" :clearable="true" />
        </span>
        <n-avatar class="header-user" v-if="!userStore.isLogin" round
            @click="router.push({ name: 'login' })">登录</n-avatar>
        <n-avatar class="header-user" v-if="userStore.isLogin" round :src="userStore.avatar"
            @click="router.push({ name: 'account' })" />
    </div>
</template>
<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { useUserStore } from '@/stores/user.js'
import * as api from '@/modules/api.js';
const userStore = useUserStore();
let value = ref('');
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
</style>