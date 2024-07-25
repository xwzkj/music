<template>
    <div class="nav-outer">
        <div class="header-title" @click="router.push({ name: 'home' })">奶酪音乐</div>
        <div>
            <n-menu :options="menuData" v-model:value="activeNow" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { useRouter, RouterLink, useRoute, RouterLinkProps } from 'vue-router';
import type { Component } from 'vue';
import type { MenuOption } from 'naive-ui';
import { NIcon } from 'naive-ui';
import { useUserStore } from '@/stores/user.js'
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
function renderIcon(icon: Component) {
    return () => h(NIcon, { size: '1.2rem' }, { default: () => h(icon) })
}
function renderLink(name: string, text: string, props?: object) {
    return () => h(RouterLink, { to: { name, query: props } } as RouterLinkProps, () => text)
}
let activeNow = ref('home');
// 监听路由 自动更新选中项
watch(
    () => route,
    (val) => {
        updateActiveItem(val.name, val.query);
    },
    { deep: true });
function updateActiveItem(key: any, query: any) {
    if (key == 'playlist' && query.id == userStore.playlists?.[0]?.id) {
        //喜欢的歌单
        activeNow.value = 'likedList';
    } else {
        activeNow.value = key;
    }
}

let menuData = computed<MenuOption[]>(() => {
    return [
        {
            label: renderLink('home', '首页'),
            key: 'home'
        },
        {
            show: !userStore.isLogin,
            label: renderLink('login', '登录'),
            key: 'login'
        },
        {
            show: userStore.isLogin,
            label: renderLink('account', '我的'),
            key: 'account'
        },
        {
            show: userStore.isLogin,
            label: renderLink('playlist', '我喜欢的音乐', { id: userStore.playlists?.[0]?.id }),
            key: 'likedList'
        }
    ]
}
);
</script>
<style scoped>
.header-title {
    font-size: 1.5rem;
    cursor: pointer;
    font-weight: 600;
    padding: 1rem;
}
</style>