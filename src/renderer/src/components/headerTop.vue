<template>
    <div class="header">
        <n-icon class="header-menu" size="2rem"
            @click="switchNavShow(true)"><i-hugeicons-right-to-left-list-dash /></n-icon>
        <span class="header-search">
            <n-icon size="2rem" style="transform: rotate(-90deg);"
                @click="api.windowBack"><i-hugeicons-arrow-up-01 /></n-icon>
            <n-input v-model:value="value" type="text" placeholder="搜索..." @keyup="search" :clearable="true" />
        </span>
        <div class="header-window-ctrl flex items-center">
            <n-avatar class="header-user text2" v-if="!userStore.isLogin" round
                @click="router.push({ name: 'login' })">登录</n-avatar>
            <n-avatar class="header-user" v-if="userStore.isLogin" round :src="userStore.avatar"
                @click="router.push({ name: 'account' })" />
            <n-icon class="cursor-pointer" size="1.5rem" @click="closeWindow"><i-solar-close-circle-outline /></n-icon>
        </div>
        <div class="header-nav bg" @click="switchNavShow(false)">
            <navigation v-show="showNavVIf" />
        </div>
    </div>
</template>
<script setup>
import { useRouter } from 'vue-router';
import anime from 'animejs';
import { ref } from 'vue';
import { useUserStore } from '@/stores/user'
import * as api from '@/modules/api';
import navigation from './navigation.vue';
const userStore = useUserStore();
let value = ref('');
let showNav = false;
let showNavVIf = ref(false);
const router = useRouter();

function closeWindow() {
    window.api.windowClose();
}

function search(event) {
    if (event.keyCode == 13) {
        router.push({ name: 'search', query: { keyword: value.value } })
    }
}

function switchNavShow(isShow = 'auto') {
    if (isShow === 'auto') {
        showNav = !showNav;
    } else if (typeof isShow === 'boolean') {
        showNav = isShow;
    } else {
        throw new Error('nav动画 参数错误');
    }
    console.log(showNav);
    anime({
        targets: '.header-nav',
        translateX: showNav ? '100%' : '0%',
        duration: 500,
        easing: 'easeInOutQuad',
        begin: () => {
            if (showNav == true) {
                showNavVIf.value = showNav;
            }
        },
        complete: () => {
            showNavVIf.value = showNav;
        }
    })
}
</script>
<style lang="less">
span {
    margin: 0;
}

.header {
    padding: 0.5rem;
    padding-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    -webkit-app-region: drag;
    user-select: none;

    * {
        -webkit-app-region: no-drag;
    }
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
    left: -100%;
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

    .header-search {
        margin-left: 0;
    }
}
</style>