<template>
    <div id="header">
        <div id="header-title" @click="router.push({ name: 'home' })">小丸子音乐</div>
        <span id="header-search">
            <n-input v-model:value="value" type="text" placeholder="搜索..." @keyup="search" :clearable="true" />
        </span>
        <n-avatar class="header-user" v-if="!userStore.isLogin" round @click="router.push({ name: 'login' })">登录</n-avatar>
        <n-avatar class="header-user" v-if="userStore.isLogin" round :src="userStore.avatar"
            @click="router.push({name:'account'})" />
    </div>
</template>
<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { useUserStore } from '@/stores/user.js'
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

#header {
    display: flex;
    justify-content: space-around;
    align-items: center;
}

#header-title {
    font-size: 1.5rem;
    cursor: pointer;
    font-weight: bold;
}

.header-user {
    cursor: pointer;
}
</style>