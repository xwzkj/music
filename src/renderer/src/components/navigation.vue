<template>
    <div class="nav-outer">
        <div class="header-title text1">奶酪音乐</div>
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
import { useUserStore } from '@/stores/user'
//图标引入 用于jsx
import HugeiconsHome06 from '~icons/hugeicons/home-06';
import HugeiconsUserAccount from '~icons/hugeicons/user-account';
import HugeiconsLoginCircle02 from '~icons/hugeicons/login-circle-02';
import HugeiconsHeartCheck from '~icons/hugeicons/heart-check';
import HugeiconsSettings05 from '~icons/hugeicons/settings-05';
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
function renderIcon(icon: Component) {
    return () => h(NIcon, null, { default: () => h(icon) })
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

onMounted(() => {
    updateActiveItem(route.name, route.query);
});
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
            key: 'home',
            icon: renderIcon(HugeiconsHome06)
        },
        {
            show: !userStore.isLogin,
            label: renderLink('login', '登录'),
            key: 'login',
            icon: renderIcon(HugeiconsLoginCircle02)
        },
        {
            show: userStore.isLogin,
            label: renderLink('account', '我的'),
            key: 'account',
            icon: renderIcon(HugeiconsUserAccount)
        },
        {
            show: userStore.isLogin,
            label: renderLink('playlist', '我喜欢的音乐', { id: userStore.playlists?.[0]?.id }),
            key: 'likedList',
            icon: renderIcon(HugeiconsHeartCheck)
        },
        {
            label: renderLink('setting', '设置'),
            key: 'setting',
            icon: renderIcon(HugeiconsSettings05)
        }
    ]
}
);
</script>
<style scoped>
.nav-outer {
    width: 100%;
    height: 100%;
}

.header-title {
    font-size: 1.5rem;
    /* cursor: pointer; */
    font-weight: 500;
    padding: 1rem;
    -webkit-app-region: drag;
}
</style>