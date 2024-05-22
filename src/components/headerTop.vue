<template>
    <div id="header">
        <div id="header-title" @click="router.push({ name: 'home' })">小丸子音乐</div>
        <span id="header-search">
            <el-input v-model="value" type="text" placeholder="回车开始搜索..." @keyup="search" clearable />
        </span>
        <el-avatar class="header-user" v-if="!userStore.isLogin" @click="router.push({ name: 'login' })">登录</el-avatar>
        <el-avatar class="header-user" v-if="userStore.isLogin" :src="userStore.avatar"
            @click="router.push({name:'account'})"></el-avatar>
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