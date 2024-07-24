<template>
    <div class="header-title" @click="router.push({ name: 'home' })">奶酪音乐</div>
    <div>
        画饼的导航栏
    </div>
</template>
<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>
<style scoped>
.header-title {
    font-size: 1.5rem;
    cursor: pointer;
    font-weight: 600;
}
</style>